// Settings-page diagnostics: WSDL structure, connection test, existing-document lookup.

import type { Settings } from "../lib/settings.schema";
import { Vr360Client } from "./client.server";
import { Vr360Error } from "./errors";
import { fetchWsdl, formatWsdlReport, parseWsdl } from "./wsdl.server";
import { extractBlocks, extractTag, prettyXml } from "./xml";

export const APP_VERSION = "0.1.0";

export interface DiagnosticResult {
  ok: boolean;
  report: string;
}

function describeError(error: unknown): string {
  if (error instanceof Vr360Error) return error.fullMessage;
  return error instanceof Error ? error.message : String(error);
}

export function clientFor(shop: string, settings: Settings, orderId?: string): Vr360Client {
  return new Vr360Client(settings.connection, { shop, orderId });
}

/** "בדיקת מבנה שירות (WSDL)" */
export async function wsdlCheck(settings: Settings): Promise<DiagnosticResult> {
  try {
    const xml = await fetchWsdl(settings.connection.endpoint);
    const report = parseWsdl(xml);
    return { ok: true, report: formatWsdlReport(report, APP_VERSION) };
  } catch (error) {
    return { ok: false, report: describeError(error) };
  }
}

/** "בדיקת חיבור": GetCustomer on the default customer with the stored credentials. */
export async function connectionTest(shop: string, settings: Settings): Promise<DiagnosticResult> {
  const customerNo = settings.customer.defaultCustomerNo || 1;
  try {
    const client = clientFor(shop, settings);
    const xml = await client.getCustomerByNo(customerNo);
    const lines = [
      `החיבור תקין. GetCustomer ללקוח ${customerNo} הצליח.`,
      `CustomerNo: ${extractTag(xml, "CustomerNo") || "(ריק)"}`,
      `שם: ${[extractTag(xml, "FirstName"), extractTag(xml, "LastName")].filter(Boolean).join(" ") || extractTag(xml, "CustomerName") || "(ריק)"}`,
      `אימייל: ${extractTag(xml, "Email") || "(ריק)"}`,
    ];
    return { ok: true, report: lines.join("\n") };
  } catch (error) {
    return { ok: false, report: describeError(error) };
  }
}

/** "בדיקת חשבונית קיימת": header fields + receipt lines of a document issued by another interface. */
export async function documentCheck(
  shop: string,
  settings: Settings,
  storeNo: number,
  docNo: string,
): Promise<DiagnosticResult> {
  if (!storeNo || !docNo.trim()) {
    return { ok: false, report: "יש להזין מספר חנות ומספר חשבונית." };
  }
  try {
    const client = clientFor(shop, settings);
    const xml = await client.getInvoiceDetails(storeNo, docNo.trim());
    const fields: Array<[string, string]> = [
      ["NotebookID (מספר פנקס)", "NotebookID"],
      ["PriceList (מחירון)", "PriceList"],
      ["DocType", "DocType"],
      ["CustomerNo", "CustomerNo"],
      ["CustomerName", "CustomerName"],
      ["Reference (אסמכתא)", "Reference"],
      ["Published", "Published"],
      ["Seller", "Seller"],
      ["Cashier", "Cashier"],
      ["CreateDate", "CreateDate"],
      ["TotalPriceIncludeVAT", "TotalPriceIncludeVAT"],
    ];
    const report = fields.map(([label, tag]) => `${label}: ${extractTag(xml, tag) || "(ריק)"}`);
    const receiptLines = extractBlocks(xml, "receiptLines")[0] ?? extractBlocks(xml, "ReceiptLines")[0];
    if (receiptLines) {
      report.push(`\n--- receiptLines ---\n${prettyXml(receiptLines)}`);
    }
    return { ok: true, report: report.join("\n") };
  } catch (error) {
    return { ok: false, report: describeError(error) };
  }
}
