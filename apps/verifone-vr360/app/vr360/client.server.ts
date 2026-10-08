// SOAP 1.1 client for the Verifone VR360 ASMX service.
//
// A faithful port of the WooCommerce plugin's WC_VR360_Client: manual XML envelopes
// (namespace http://tempuri.org/), element order preserved, namespace-agnostic parsing,
// identical error hints, alternative operation names for the PDF call. No SOAP library.

import prisma from "../db.server";
import { env } from "../lib/env.server";
import { apiError, Vr360Error } from "./errors";
import { element, extractBlocks, extractTag, maskSecrets, type XmlObject } from "./xml";

export const SOAP_NS = "http://tempuri.org/";
const LOG_LIMIT = 20_000;

export interface Vr360Credentials {
  endpoint: string;
  chainId: number;
  username: string;
  password: string;
}

export interface CallContext {
  shop: string;
  /** Shopify order id, for log filtering. */
  orderId?: string;
}

export interface CallResult {
  /** Raw response body (XML). */
  body: string;
  request: string;
  httpStatus: number;
  durationMs: number;
}

export interface StockRow {
  sku: string;
  store: string;
  qty: string;
  reserved: string;
}

export interface InvoiceResult {
  invoiceNo: string;
  storeNo: string;
  customerNo: string;
  createDate: string;
  createTime: string;
  raw: string;
}

export class Vr360Client {
  constructor(
    private readonly credentials: Vr360Credentials,
    private readonly context: CallContext,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  /* ------------------------------------------------------------------ operations */

  /** CreateInvoice. `request` is the full CreateInvoiceRequest built by the invoice builder. */
  async createInvoice(request: XmlObject): Promise<InvoiceResult> {
    const body = element("Request", request);
    const { body: response } = await this.call("CreateInvoice", body);
    this.assertSuccess(response);
    return {
      invoiceNo: extractTag(response, "InvoiceNo"),
      storeNo: extractTag(response, "StoreNo"),
      customerNo: extractTag(response, "CustomerNo"),
      createDate: extractTag(response, "CreateDate"),
      createTime: extractTag(response, "CreateTime"),
      raw: response,
    };
  }

  /** GetCustomer ByEmail. Returns the customer number, 0 when not found. */
  async getCustomerByEmail(email: string): Promise<number> {
    const body = element("Request", { CustomerSearchType: "ByEmail", SingleSearchVal: email });
    const { body: response } = await this.call("GetCustomer", body);
    this.assertSuccess(response);
    // When the customer is not found VR360 answers success without Data (no CustomerNo tag).
    return Number.parseInt(extractTag(response, "CustomerNo"), 10) || 0;
  }

  /** GetCustomer by customer number (used by the connection test). Returns the raw XML. */
  async getCustomerByNo(customerNo: number): Promise<string> {
    const body = element("Request", { CustomerSearchType: "ByCustomerNo", SingleSearchVal: String(customerNo) });
    const { body: response } = await this.call("GetCustomer", body);
    this.assertSuccess(response);
    return response;
  }

  /** CreateOrUpdateCustomer. CustomerNo=0 in the request creates a new customer. */
  async createOrUpdateCustomer(customer: XmlObject): Promise<number> {
    const body = element("Request", { Customer: customer });
    const { body: response } = await this.call("CreateOrUpdateCustomer", body);
    this.assertSuccess(response);
    const customerNo = Number.parseInt(extractTag(response, "CustomerNo"), 10) || 0;
    if (customerNo <= 0) {
      throw new Vr360Error("parse", "הקמת הלקוח הצליחה לכאורה אך וריפון לא החזיר מספר לקוח.", { raw: response });
    }
    return customerNo;
  }

  /** GetStock for a store, optionally limited to SKUs and/or items changed since `fromDate` (yyyyMMdd). */
  async getStock(args: { storeNo: number; products?: string[]; fromDate?: string }): Promise<StockRow[]> {
    let inner = "";
    if (args.products?.length) {
      inner += `<ProductsList>${args.products.map((sku) => element("string", sku)).join("")}</ProductsList>`;
    }
    if (args.storeNo) {
      inner += element("FromStoreNo", args.storeNo) + element("ToStoreNo", args.storeNo);
    }
    if (args.fromDate) {
      inner += element("FromDate", args.fromDate);
    }
    inner += element("GetReservedStock", true);

    const { body: response } = await this.call("GetStock", `<Request>${inner}</Request>`);
    this.assertSuccess(response);

    return extractBlocks(response, "ProductStock").map((block) => ({
      sku: extractTag(block, "ProductCode"),
      store: extractTag(block, "StoreNo"),
      qty: extractTag(block, "Qty"),
      reserved: extractTag(block, "ReservedStock") || extractTag(block, "ReservedQty"),
    }));
  }

  /** GetInvoiceDetails (diagnostics): raw XML of an existing document. */
  async getInvoiceDetails(storeId: number, documentId: string): Promise<string> {
    const body = element("Request", {
      PagingInfo: { CurrentPage: 1, ItemsInPage: 200, TotalItems: 0, TotalPages: 0 },
      StoreID: storeId,
      DocumentID: documentId,
    });
    const { body: response } = await this.call("GetInvoiceDetails", body);
    this.assertSuccess(response);
    return response;
  }

  /**
   * PDF copy of a document. Tries GetCustomerInvoicePDF, then GetCustomerInvoice_PDF, then
   * falls back to GetSignedDocument with DoNotSignDoc=true.
   */
  async getInvoicePdf(storeId: number, documentId: string, documentType = 1): Promise<{ pdfBase64: string; raw: string }> {
    const body = element("Request", {
      StoreID: storeId,
      DocumentID: documentId,
      DocumentIType: documentType,
      DocumentType: documentType,
    });

    let response: string | undefined;
    let lastError: Vr360Error | undefined;
    for (const method of ["GetCustomerInvoicePDF", "GetCustomerInvoice_PDF"]) {
      try {
        response = (await this.call(method, body)).body;
        lastError = undefined;
        break;
      } catch (error) {
        if (error instanceof Vr360Error && error.isUnknownAction) {
          lastError = error;
          continue;
        }
        throw error;
      }
    }

    if (lastError) {
      response = (
        await this.call(
          "GetSignedDocument",
          element("Request", {
            StoreId: storeId,
            DocumentId: Number(documentId),
            DocumentType: documentType,
            DoNotSignDoc: true,
          }),
        )
      ).body;
    }

    this.assertSuccess(response!);
    return { pdfBase64: extractPdfBase64(response!), raw: response! };
  }

  /* ------------------------------------------------------------------ transport */

  /** Send one SOAP request. Throws Vr360Error for config, transport and HTTP failures. */
  async call(method: string, innerXml: string): Promise<CallResult> {
    const url = this.credentials.endpoint.trim();
    if (!url) {
      throw new Vr360Error("config", "לא הוגדרה כתובת שירות VR360 בהגדרות.");
    }

    const userXml = element("User", {
      ChainID: this.credentials.chainId,
      Username: this.credentials.username,
      Password: this.credentials.password,
    });

    const envelope =
      '<?xml version="1.0" encoding="utf-8"?>' +
      '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
      ' xmlns:xsd="http://www.w3.org/2001/XMLSchema"' +
      ' xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
      "<soap:Body>" +
      `<${method} xmlns="${SOAP_NS}">` +
      userXml +
      innerXml +
      `</${method}>` +
      "</soap:Body>" +
      "</soap:Envelope>";

    const started = Date.now();
    let httpStatus = 0;
    let body = "";
    try {
      const response = await this.fetchImpl(url, {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          SOAPAction: `"${SOAP_NS}${method}"`,
        },
        body: envelope,
        signal: AbortSignal.timeout(env.vr360TimeoutMs),
      });
      httpStatus = response.status;
      body = await response.text();
    } catch (error) {
      const durationMs = Date.now() - started;
      const message = error instanceof Error ? error.message : String(error);
      await this.log(method, envelope, "", 0, durationMs, `transport: ${message}`);
      throw new Vr360Error("transport", `שגיאת תקשורת מול VR360: ${message}`, { cause: error });
    }

    const durationMs = Date.now() - started;

    if (httpStatus !== 200) {
      const fault = extractTag(body, "faultstring");
      const message = `VR360 החזיר קוד ${httpStatus}${fault ? ` — ${fault}` : ""}`;
      await this.log(method, envelope, body, httpStatus, durationMs, message);
      throw new Vr360Error("http", message, { status: String(httpStatus), raw: body });
    }

    const isSuccess = extractTag(body, "IsSuccess").toLowerCase() === "true";
    const error = isSuccess
      ? undefined
      : `${extractTag(body, "Status") || "?"}: ${extractTag(body, "StatusDescription") || "ללא תיאור"}`;
    await this.log(method, envelope, body, httpStatus, durationMs, error);

    return { body, request: envelope, httpStatus, durationMs };
  }

  /** Throw a Vr360Error("api") when RequestResult.IsSuccess is not true. */
  assertSuccess(xml: string): void {
    const isSuccess = extractTag(xml, "IsSuccess").toLowerCase();
    if (isSuccess === "true") return;
    throw apiError(extractTag(xml, "Status"), extractTag(xml, "StatusDescription"), xml);
  }

  private async log(
    method: string,
    request: string,
    response: string,
    httpStatus: number,
    durationMs: number,
    error?: string,
  ): Promise<void> {
    try {
      await prisma.requestLog.create({
        data: {
          shop: this.context.shop,
          orderId: this.context.orderId,
          method,
          ok: !error,
          httpStatus: httpStatus || null,
          durationMs,
          error: error ?? null,
          request: truncate(maskSecrets(request)),
          response: truncate(response),
        },
      });
    } catch (logError) {
      // Logging must never break the business call.
      console.error("[vr360] failed to write RequestLog", logError);
    }
  }
}

function truncate(value: string): string {
  if (value.length <= LOG_LIMIT) return value;
  return `${value.slice(0, LOG_LIMIT)}\n... [truncated — full length: ${value.length} chars]`;
}

/** Base64 PDF from any of the response shapes seen across server versions. */
export function extractPdfBase64(xml: string): string {
  for (const tag of ["PdfFile", "pdfFile", "Value", "value"]) {
    const candidate = extractTag(xml, tag);
    if (looksLikePdfBase64(candidate)) return candidate;
  }
  const blobs = xml.match(/[A-Za-z0-9+/=\r\n]{500,}/g) ?? [];
  for (const blob of blobs) {
    const trimmed = blob.trim();
    if (looksLikePdfBase64(trimmed)) return trimmed;
  }
  return "";
}

export function looksLikePdfBase64(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 100) return false;
  if (trimmed.startsWith("JVBERi")) return true; // "%PDF" in base64
  try {
    return Buffer.from(trimmed.slice(0, 100), "base64").toString("latin1").startsWith("%PDF");
  } catch {
    return false;
  }
}
