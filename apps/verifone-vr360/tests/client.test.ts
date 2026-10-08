// The SOAP client against an in-process mock of the VR360 ASMX service.
// Prisma is mocked so the RequestLog write is captured instead of hitting a database.

import { beforeEach, describe, expect, it, vi } from "vitest";

const logs: Array<Record<string, unknown>> = [];
vi.mock("../app/db.server", () => ({
  default: {
    requestLog: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        logs.push(data);
        return data;
      },
    },
  },
}));

import { Vr360Client } from "../app/vr360/client.server";
import { Vr360Error } from "../app/vr360/errors";

const credentials = { endpoint: "http://vr360.test/services.asmx", chainId: 5652, username: "BO_5652", password: "pw" };

function soapResponse(method: string, inner: string): string {
  return (
    '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>' +
    `<${method}Response xmlns="http://tempuri.org/"><${method}Result>${inner}</${method}Result></${method}Response>` +
    "</soap:Body></soap:Envelope>"
  );
}

function mockFetch(handler: (method: string, body: string) => { status?: number; body: string }): typeof fetch {
  return (async (_url: string | URL | Request, init?: RequestInit) => {
    const action = String((init?.headers as Record<string, string>)["SOAPAction"] ?? "");
    const method = action.replace(/"/g, "").replace("http://tempuri.org/", "");
    const result = handler(method, String(init?.body));
    return new Response(result.body, { status: result.status ?? 200, headers: { "Content-Type": "text/xml" } });
  }) as typeof fetch;
}

beforeEach(() => {
  logs.length = 0;
});

describe("Vr360Client", () => {
  it("builds a SOAP 1.1 envelope with User first and logs the masked request", async () => {
    let captured = "";
    const client = new Vr360Client(
      credentials,
      { shop: "test.myshopify.com", orderId: "1001" },
      mockFetch((method, body) => {
        captured = body;
        return { body: soapResponse(method, "<RequestResult><IsSuccess>true</IsSuccess></RequestResult><Data><CustomerNo>77</CustomerNo></Data>") };
      }),
    );

    const customerNo = await client.getCustomerByEmail("a@b.co.il");
    expect(customerNo).toBe(77);
    expect(captured).toContain('<GetCustomer xmlns="http://tempuri.org/"><User><ChainID>5652</ChainID><Username>BO_5652</Username><Password>pw</Password></User>');
    expect(captured).toContain("<Request><CustomerSearchType>ByEmail</CustomerSearchType><SingleSearchVal>a@b.co.il</SingleSearchVal></Request>");

    expect(logs).toHaveLength(1);
    expect(logs[0].method).toBe("GetCustomer");
    expect(logs[0].ok).toBe(true);
    expect(logs[0].orderId).toBe("1001");
    expect(String(logs[0].request)).toContain("<Password>***</Password>");
    expect(String(logs[0].request)).not.toContain("pw</Password>");
  });

  it("returns 0 when the customer is not found (success without Data)", async () => {
    const client = new Vr360Client(credentials, { shop: "s" }, mockFetch((m) => ({ body: soapResponse(m, "<RequestResult><IsSuccess>true</IsSuccess></RequestResult>") })));
    expect(await client.getCustomerByEmail("none@x.il")).toBe(0);
  });

  it("maps business errors to Vr360Error with the plugin's hints", async () => {
    const client = new Vr360Client(
      credentials,
      { shop: "s" },
      mockFetch((m) => ({
        body: soapResponse(m, "<RequestResult><IsSuccess>false</IsSuccess><Status>421</Status><StatusDescription>No numerator</StatusDescription></RequestResult>"),
      })),
    );
    const error = await client.createInvoice({ Document: { StoreNo: 20 } }).catch((e) => e);
    expect(error).toBeInstanceOf(Vr360Error);
    expect(error.kind).toBe("api");
    expect(error.status).toBe("421");
    expect(error.message).toContain("קוד 421");
    expect(error.hint).toContain("נומרטור");
    expect(error.retryable).toBe(false);
    expect(logs[0].ok).toBe(false);
    expect(logs[0].error).toBe("421: No numerator");
  });

  it("maps HTTP faults and marks 5xx as retryable", async () => {
    const client = new Vr360Client(
      credentials,
      { shop: "s" },
      mockFetch(() => ({ status: 500, body: "<soap:Fault><faultstring>Server was unable to process request.</faultstring></soap:Fault>" })),
    );
    const error = await client.getStock({ storeNo: 11 }).catch((e) => e);
    expect(error.kind).toBe("http");
    expect(error.status).toBe("500");
    expect(error.message).toContain("Server was unable to process request.");
    expect(error.retryable).toBe(true);
  });

  it("parses GetStock rows and keeps the GetStockRequest element order", async () => {
    let captured = "";
    const client = new Vr360Client(
      credentials,
      { shop: "s" },
      mockFetch((m, body) => {
        captured = body;
        return {
          body: soapResponse(
            m,
            "<RequestResult><IsSuccess>true</IsSuccess></RequestResult><Data>" +
              "<ProductStock><ProductCode>100</ProductCode><StoreNo>11</StoreNo><Qty>5</Qty><ReservedStock>1</ReservedStock></ProductStock>" +
              "<ProductStock><ProductCode>200</ProductCode><StoreNo>11</StoreNo><Qty>-2</Qty><ReservedQty>0</ReservedQty></ProductStock></Data>",
          ),
        };
      }),
    );
    const rows = await client.getStock({ storeNo: 11, products: ["100", "200"], fromDate: "20261008" });
    expect(captured).toContain(
      "<Request><ProductsList><string>100</string><string>200</string></ProductsList><FromStoreNo>11</FromStoreNo><ToStoreNo>11</ToStoreNo><FromDate>20261008</FromDate><GetReservedStock>true</GetReservedStock></Request>",
    );
    expect(rows).toEqual([
      { sku: "100", store: "11", qty: "5", reserved: "1" },
      { sku: "200", store: "11", qty: "-2", reserved: "0" },
    ]);
  });

  it("falls back through the PDF operation names when the server does not know the action", async () => {
    const calls: string[] = [];
    const pdf = Buffer.from("%PDF-1.4 " + "x".repeat(200)).toString("base64");
    const client = new Vr360Client(
      credentials,
      { shop: "s" },
      mockFetch((method) => {
        calls.push(method);
        if (method !== "GetSignedDocument") {
          return { status: 500, body: "<faultstring>Server did not recognize the value of HTTP Header SOAPAction</faultstring>" };
        }
        return { body: soapResponse(method, `<RequestResult><IsSuccess>true</IsSuccess></RequestResult><Data><PdfFile>${pdf}</PdfFile></Data>`) };
      }),
    );
    const result = await client.getInvoicePdf(20, "149729");
    expect(calls).toEqual(["GetCustomerInvoicePDF", "GetCustomerInvoice_PDF", "GetSignedDocument"]);
    expect(result.pdfBase64).toBe(pdf);
  });

  it("reports transport failures as retryable", async () => {
    const client = new Vr360Client(credentials, { shop: "s" }, (async () => {
      throw new Error("ECONNREFUSED");
    }) as typeof fetch);
    const error = await client.getCustomerByNo(1).catch((e) => e);
    expect(error.kind).toBe("transport");
    expect(error.retryable).toBe(true);
    expect(logs[0].error).toContain("ECONNREFUSED");
  });

  it("refuses to call without an endpoint", async () => {
    const client = new Vr360Client({ ...credentials, endpoint: " " }, { shop: "s" });
    await expect(client.getCustomerByNo(1)).rejects.toMatchObject({ kind: "config" });
  });
});
