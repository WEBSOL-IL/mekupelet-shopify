// WSDL inspector: fetches `<endpoint>?wsdl` and reports the operations and the complex
// types that matter for invoicing, exactly like the plugin's "בדיקת מבנה שירות" tool.

import { XMLParser } from "fast-xml-parser";
import { env } from "../lib/env.server";
import { Vr360Error } from "./errors";

const WANTED_TYPES = [
  "CreateInvoiceRequest", "Document", "DocumentLines", "Receipt", "ReceiptLines",
  "Checks", "CreditCard", "CreditVoucher", "VoucherRedeeming", "VoucherPrinting",
  "GiftCard", "ShipmentDetails", "Club", "UnidentifiedCustomer", "GreenInvoice", "SignedPdf",
  "GetCustomerRequest", "CreateOrUpdateCustomerRequest", "Customer",
  "ByUserNameAndPassword", "ByIdentityAndClubMemberCard",
  "GetCustomerInvoice_PDF_Request", "GetCustomerInvoicePDFRequest",
  "PrintDocumentRequest", "GetInvoiceDetailsRequest", "GetStockRequest", "ProductStock",
];
const WANTED_ENUMS = ["PaymentType", "CustomerSearchType"];

interface XsdElement {
  name: string;
  type: string;
  optional: boolean;
}
export interface WsdlType {
  name: string;
  base?: string;
  elements: XsdElement[];
}
export interface WsdlReport {
  operations: string[];
  types: WsdlType[];
  enums: Array<{ name: string; values: string[] }>;
}

export async function fetchWsdl(endpoint: string, fetchImpl: typeof fetch = fetch): Promise<string> {
  const url = endpoint.trim();
  if (!url) throw new Vr360Error("config", "לא הוגדרה כתובת שירות.");
  const wsdlUrl = url.includes("?") ? `${url}&wsdl` : `${url}?wsdl`;

  let response: Response;
  try {
    response = await fetchImpl(wsdlUrl, { signal: AbortSignal.timeout(env.vr360TimeoutMs) });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Vr360Error("transport", `שגיאת תקשורת: ${message}`, { cause: error });
  }
  const body = await response.text();
  if (!body || !/definitions/i.test(body)) {
    throw new Vr360Error("http", `לא התקבל WSDL תקין (HTTP ${response.status}).`, { status: String(response.status) });
  }
  return body;
}

type Node = Record<string, unknown>;

function stripNs(name: string): string {
  return name.replace(/^\w+:/, "");
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/** Depth-first search for nodes whose local tag name matches. */
function findAll(node: unknown, localName: string, out: Node[] = []): Node[] {
  if (Array.isArray(node)) {
    for (const item of node) findAll(item, localName, out);
    return out;
  }
  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node as Node)) {
      if (key.startsWith("@_")) continue;
      if (stripNs(key) === localName) {
        for (const item of asArray(value)) out.push(item as Node);
      }
      findAll(value, localName, out);
    }
  }
  return out;
}

export function parseWsdl(xml: string): WsdlReport {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", removeNSPrefix: true });
  let doc: Node;
  try {
    doc = parser.parse(xml) as Node;
  } catch (error) {
    throw new Vr360Error("parse", "ה-WSDL אינו XML תקין.", { cause: error });
  }

  const operations = Array.from(
    new Set(
      findAll(doc, "portType")
        .flatMap((pt) => asArray(pt.operation as Node | Node[]))
        .map((op) => String(op["@_name"] ?? ""))
        .filter(Boolean),
    ),
  ).sort();

  const typesByName = new Map<string, Node>();
  for (const ct of findAll(doc, "complexType")) {
    const name = ct["@_name"];
    if (typeof name === "string") typesByName.set(name, ct);
  }

  // Follow extension bases so inherited header fields are listed too.
  const wanted = [...WANTED_TYPES];
  const queue = [...wanted];
  while (queue.length) {
    const name = queue.shift()!;
    const type = typesByName.get(name);
    if (!type) continue;
    for (const ext of findAll(type, "extension")) {
      const base = stripNs(String(ext["@_base"] ?? ""));
      if (base && !wanted.includes(base)) {
        wanted.push(base);
        queue.push(base);
      }
    }
  }

  const types: WsdlType[] = [];
  for (const name of wanted) {
    const type = typesByName.get(name);
    if (!type) continue;
    const ext = findAll(type, "extension")[0];
    const elements: XsdElement[] = findAll(type, "element").map((el) => ({
      name: String(el["@_name"] ?? ""),
      type: stripNs(String(el["@_type"] ?? "")),
      optional: String(el["@_minOccurs"] ?? "") === "0",
    }));
    types.push({ name, base: ext ? stripNs(String(ext["@_base"] ?? "")) : undefined, elements });
  }

  const enums = findAll(doc, "simpleType")
    .filter((st) => WANTED_ENUMS.includes(String(st["@_name"] ?? "")))
    .map((st) => ({
      name: String(st["@_name"]),
      values: findAll(st, "enumeration").map((en) => String(en["@_value"] ?? "")),
    }));

  if (!types.length && !operations.length) {
    throw new Vr360Error(
      "parse",
      "לא נמצאו המבנים המבוקשים ב-WSDL. ייתכן שהסכמה בקובץ import נפרד — שלחו את ה-WSDL לבדיקה ידנית.",
    );
  }

  return { operations, types, enums };
}

/** Plain-text report in the same layout the plugin printed. */
export function formatWsdlReport(report: WsdlReport, version: string): string {
  const parts: string[] = [`app version: ${version}`];
  if (report.operations.length) {
    parts.push(`Operations (${report.operations.length}):\n  ${report.operations.join("\n  ")}`);
  }
  for (const type of report.types) {
    const header = type.base ? `${type.name} (extends ${type.base})` : type.name;
    const fields = type.elements.map((el) => `${el.name}${el.optional ? "?" : ""} : ${el.type}`);
    parts.push(`${header}\n  ${fields.length ? fields.join("\n  ") : "(ללא שדות)"}`);
  }
  for (const en of report.enums) {
    parts.push(`${en.name} (enum)\n  ${en.values.join(", ")}`);
  }
  return parts.join("\n\n");
}
