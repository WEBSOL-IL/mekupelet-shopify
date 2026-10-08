import { describe, expect, it } from "vitest";
import { formatWsdlReport, parseWsdl } from "../app/vr360/wsdl.server";

const WSDL = `<?xml version="1.0" encoding="utf-8"?>
<wsdl:definitions xmlns:s="http://www.w3.org/2001/XMLSchema" xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" xmlns:tns="http://tempuri.org/">
  <wsdl:types>
    <s:schema targetNamespace="http://tempuri.org/">
      <s:complexType name="CreateInvoiceRequest">
        <s:complexContent>
          <s:extension base="tns:BaseRequest">
            <s:sequence>
              <s:element minOccurs="0" maxOccurs="1" name="Document" type="tns:Document" />
              <s:element minOccurs="1" maxOccurs="1" name="Published" type="s:boolean" />
            </s:sequence>
          </s:extension>
        </s:complexContent>
      </s:complexType>
      <s:complexType name="BaseRequest">
        <s:sequence>
          <s:element minOccurs="0" maxOccurs="1" name="User" type="tns:User" />
        </s:sequence>
      </s:complexType>
      <s:complexType name="VoucherRedeeming">
        <s:sequence>
          <s:element minOccurs="0" maxOccurs="1" name="CreditVoucher" type="tns:CreditVoucher" />
        </s:sequence>
      </s:complexType>
      <s:complexType name="Unrelated"><s:sequence /></s:complexType>
      <s:simpleType name="PaymentType">
        <s:restriction base="s:string">
          <s:enumeration value="Cash" />
          <s:enumeration value="CreditCard" />
        </s:restriction>
      </s:simpleType>
    </s:schema>
  </wsdl:types>
  <wsdl:portType name="ServicesSoap">
    <wsdl:operation name="GetStock" />
    <wsdl:operation name="CreateInvoice" />
    <wsdl:operation name="GetCustomerInvoicePDF" />
  </wsdl:portType>
  <wsdl:portType name="ServicesSoap12">
    <wsdl:operation name="CreateInvoice" />
  </wsdl:portType>
</wsdl:definitions>`;

describe("parseWsdl", () => {
  it("lists operations once, sorted, and the wanted types with their bases", () => {
    const report = parseWsdl(WSDL);
    expect(report.operations).toEqual(["CreateInvoice", "GetCustomerInvoicePDF", "GetStock"]);
    const names = report.types.map((t) => t.name);
    expect(names).toContain("CreateInvoiceRequest");
    expect(names).toContain("VoucherRedeeming");
    expect(names).toContain("BaseRequest"); // discovered through the extension base
    expect(names).not.toContain("Unrelated");

    const cir = report.types.find((t) => t.name === "CreateInvoiceRequest")!;
    expect(cir.base).toBe("BaseRequest");
    expect(cir.elements).toEqual([
      { name: "Document", type: "Document", optional: true },
      { name: "Published", type: "boolean", optional: false },
    ]);
    expect(report.enums).toEqual([{ name: "PaymentType", values: ["Cash", "CreditCard"] }]);
  });

  it("formats the plugin-style report", () => {
    const text = formatWsdlReport(parseWsdl(WSDL), "0.1.0");
    expect(text).toContain("app version: 0.1.0");
    expect(text).toContain("Operations (3):\n  CreateInvoice\n  GetCustomerInvoicePDF\n  GetStock");
    expect(text).toContain("CreateInvoiceRequest (extends BaseRequest)\n  Document? : Document\n  Published : boolean");
    expect(text).toContain("PaymentType (enum)\n  Cash, CreditCard");
  });

  it("rejects non-XML", () => {
    expect(() => parseWsdl("<definitions><unclosed")).toThrow();
  });
});
