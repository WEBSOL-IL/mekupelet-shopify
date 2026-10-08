// Settings document schema. Mirrors the WooCommerce plugin's option keys one to one,
// plus the Shopify-specific additions (location, payment gateway mapping, auto credit).
// Defaults are the values of the live WooCommerce installation (plan §9a).

import { z } from "zod";

export const PAYMENT_TYPES = {
  1: "מזומן (1)",
  2: "שיק (2)",
  3: "כרטיס אשראי (3)",
  4: "מימוש זיכוי/שובר (4)",
} as const;

export type PaymentType = keyof typeof PAYMENT_TYPES;

const paymentType = z.coerce.number().int().min(1).max(4) as unknown as z.ZodType<PaymentType>;

const bool = z.coerce.boolean();
const intField = (def: number) => z.coerce.number().int().nonnegative().default(def);
const textField = (def = "") => z.string().trim().default(def);

export const connectionSchema = z.object({
  endpoint: textField("http://62.219.182.125/R360.Server.IIS/Services/Services.asmx"),
  chainId: intField(5652),
  username: textField("BO_5652"),
  // Stored encrypted; `loadSettings` returns it decrypted.
  password: textField(""),
});

export const documentSchema = z.object({
  storeNo: intField(20),
  supplyStoreNo: intField(11),
  docType: intField(1),
  docNoSource: z.enum(["numerator", "order"]).default("numerator"),
  notebookId: textField("2"),
  priceList: textField("1"),
  vatPercent: z.coerce.number().min(0).max(100).default(18),
  published: bool.default(false),
  sendDocByMail: bool.default(true),
  autoIssue: bool.default(true),
  autoCreditOnCancel: bool.default(true),
  autoCreditOnRefund: bool.default(true),
  shippingSku: textField("555"),
  feeSku: textField("973"),
});

export const customerSchema = z.object({
  lookupByEmail: bool.default(true),
  defaultCustomerNo: intField(1),
  sendUnidentified: bool.default(true),
});

export const stockSchema = z.object({
  enabled: bool.default(true),
  storeNo: intField(0), // 0 = use supplyStoreNo (then storeNo), like the plugin
  onProductUpdate: bool.default(true),
  today: bool.default(true),
  todayIntervalMinutes: z.coerce.number().int().min(5).default(20),
  month: bool.default(true),
  monthIntervalHours: z.coerce.number().int().min(1).default(8),
  minusReserved: bool.default(false),
  // Shopify location gid that represents the web warehouse (chosen in settings).
  locationId: textField(""),
  // Token for the external trigger URLs; generated on first save.
  triggerToken: textField(""),
});

export const paymentsSchema = z.object({
  // gateway name (as it appears on OrderTransaction.gateway) -> VR360 payment type
  map: z.record(z.string(), paymentType).default({
    tranzila: 3,
    paypal: 3,
    gift_card: 4,
    manual: 1,
    bogus: 3,
  }),
  // Discount codes starting with this prefix are BuyMe vouchers (until the BuyMe app
  // integration is confirmed with a real order).
  voucherDiscountPrefix: textField("BUYME"),
  // Transactions on this gateway are BuyMe vouchers.
  voucherGateway: textField(""),
});

export const notificationsSchema = z.object({
  email: textField(""),
  onAutoIssueFailure: bool.default(true),
});

export const settingsSchema = z.object({
  connection: connectionSchema.default(connectionSchema.parse({})),
  document: documentSchema.default(documentSchema.parse({})),
  customer: customerSchema.default(customerSchema.parse({})),
  stock: stockSchema.default(stockSchema.parse({})),
  payments: paymentsSchema.default(paymentsSchema.parse({})),
  notifications: notificationsSchema.default(notificationsSchema.parse({})),
});

export type Settings = z.infer<typeof settingsSchema>;

export const DEFAULT_SETTINGS: Settings = settingsSchema.parse({});

/** Payment type for a gateway, with the same guesses the plugin used as fallback. */
export function paymentTypeForGateway(settings: Settings, gateway: string): PaymentType {
  const id = gateway.toLowerCase();
  const mapped = settings.payments.map[id] ?? settings.payments.map[gateway];
  if (mapped) return mapped;
  if (id.includes("gift_card") || id.includes("buyme") || id.includes("multipass")) return 4;
  if (id.includes("cheque") || id.includes("check")) return 2;
  if (id === "manual" || id === "cash" || id === "cash_on_delivery" || id === "bank_deposit") return 1;
  return 3;
}

/** Store used for stock sync: stock.storeNo, else supplyStoreNo, else storeNo. */
export function stockStoreNo(settings: Settings): number {
  return settings.stock.storeNo || settings.document.supplyStoreNo || settings.document.storeNo;
}
