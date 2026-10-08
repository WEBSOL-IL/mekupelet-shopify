// Translate the settings form (FormData from native <form>) into a Settings object.
// Unchecked checkboxes contribute no key, so every boolean is read explicitly.

import { z } from "zod";
import {
  connectionSchema,
  customerSchema,
  documentSchema,
  notificationsSchema,
  paymentsSchema,
  settingsSchema,
  stockSchema,
  type Settings,
} from "./settings.schema";

export interface SettingsFormResult {
  settings?: Settings;
  keepPassword: boolean;
  errors?: Record<string, string>;
}

function str(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function bool(form: FormData, key: string): boolean {
  const value = form.get(key);
  return value !== null && value !== "" && value !== "false" && value !== "off";
}

/** Payment rows are posted as `payment_gateway[]` + `payment_type[]` pairs. */
function paymentMap(form: FormData): Record<string, number> {
  const gateways = form.getAll("payment_gateway").map(String);
  const types = form.getAll("payment_type").map(String);
  const map: Record<string, number> = {};
  gateways.forEach((gateway, index) => {
    const id = gateway.trim().toLowerCase();
    const type = Number(types[index]);
    if (id && type >= 1 && type <= 4) map[id] = type;
  });
  return map;
}

export function parseSettingsForm(form: FormData, current: Settings): SettingsFormResult {
  const password = str(form, "connection.password");
  const keepPassword = password === "";

  const candidate = {
    connection: {
      endpoint: str(form, "connection.endpoint"),
      chainId: str(form, "connection.chainId"),
      username: str(form, "connection.username"),
      password: keepPassword ? current.connection.password : password,
    },
    document: {
      storeNo: str(form, "document.storeNo"),
      supplyStoreNo: str(form, "document.supplyStoreNo"),
      docType: str(form, "document.docType"),
      docNoSource: str(form, "document.docNoSource") || "numerator",
      notebookId: str(form, "document.notebookId"),
      priceList: str(form, "document.priceList"),
      vatPercent: str(form, "document.vatPercent"),
      published: bool(form, "document.published"),
      sendDocByMail: bool(form, "document.sendDocByMail"),
      autoIssue: bool(form, "document.autoIssue"),
      autoCreditOnCancel: bool(form, "document.autoCreditOnCancel"),
      autoCreditOnRefund: bool(form, "document.autoCreditOnRefund"),
      shippingSku: str(form, "document.shippingSku"),
      feeSku: str(form, "document.feeSku"),
    },
    customer: {
      lookupByEmail: bool(form, "customer.lookupByEmail"),
      defaultCustomerNo: str(form, "customer.defaultCustomerNo"),
      sendUnidentified: bool(form, "customer.sendUnidentified"),
    },
    stock: {
      enabled: bool(form, "stock.enabled"),
      storeNo: str(form, "stock.storeNo") || "0",
      onProductUpdate: bool(form, "stock.onProductUpdate"),
      today: bool(form, "stock.today"),
      todayIntervalMinutes: str(form, "stock.todayIntervalMinutes"),
      month: bool(form, "stock.month"),
      monthIntervalHours: str(form, "stock.monthIntervalHours"),
      minusReserved: bool(form, "stock.minusReserved"),
      locationId: str(form, "stock.locationId"),
      triggerToken: bool(form, "stock.rotateToken") ? "" : current.stock.triggerToken,
    },
    payments: {
      map: paymentMap(form),
      voucherDiscountPrefix: str(form, "payments.voucherDiscountPrefix"),
      voucherGateway: str(form, "payments.voucherGateway"),
    },
    notifications: {
      email: str(form, "notifications.email"),
      onAutoIssueFailure: bool(form, "notifications.onAutoIssueFailure"),
    },
  };

  const schema = z.object({
    connection: connectionSchema,
    document: documentSchema,
    customer: customerSchema,
    stock: stockSchema,
    payments: paymentsSchema,
    notifications: notificationsSchema,
  });
  const parsed = schema.safeParse(candidate);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[issue.path.join(".")] = issue.message;
    }
    return { keepPassword, errors };
  }

  return { settings: settingsSchema.parse(parsed.data), keepPassword };
}
