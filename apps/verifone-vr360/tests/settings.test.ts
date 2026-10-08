import { describe, expect, it } from "vitest";
import { decrypt, encrypt, isEncrypted, safeEqual } from "../app/lib/crypto.server";
import { parseSettingsForm } from "../app/lib/settings.form";
import { DEFAULT_SETTINGS, paymentTypeForGateway, settingsSchema, stockStoreNo } from "../app/lib/settings.schema";

describe("settings defaults", () => {
  it("match the live WooCommerce configuration", () => {
    expect(DEFAULT_SETTINGS.connection.chainId).toBe(5652);
    expect(DEFAULT_SETTINGS.document).toMatchObject({
      storeNo: 20,
      supplyStoreNo: 11,
      docType: 1,
      docNoSource: "numerator",
      notebookId: "2",
      priceList: "1",
      vatPercent: 18,
      published: false,
      sendDocByMail: true,
      autoIssue: true,
      shippingSku: "555",
      feeSku: "973",
    });
    expect(DEFAULT_SETTINGS.customer).toEqual({ lookupByEmail: true, defaultCustomerNo: 1, sendUnidentified: true });
    expect(DEFAULT_SETTINGS.stock.todayIntervalMinutes).toBe(20);
    expect(DEFAULT_SETTINGS.stock.monthIntervalHours).toBe(8);
    expect(stockStoreNo(DEFAULT_SETTINGS)).toBe(11);
  });

  it("fills missing keys of a partial stored document", () => {
    const parsed = settingsSchema.parse({ document: { storeNo: 21 } });
    expect(parsed.document.storeNo).toBe(21);
    expect(parsed.document.supplyStoreNo).toBe(11);
    expect(parsed.stock.enabled).toBe(true);
  });

  it("maps gateways to VR360 payment types with the plugin's fallbacks", () => {
    expect(paymentTypeForGateway(DEFAULT_SETTINGS, "tranzila")).toBe(3);
    expect(paymentTypeForGateway(DEFAULT_SETTINGS, "paypal")).toBe(3);
    expect(paymentTypeForGateway(DEFAULT_SETTINGS, "gift_card")).toBe(4);
    expect(paymentTypeForGateway(DEFAULT_SETTINGS, "BuyMe Vouchers")).toBe(4);
    expect(paymentTypeForGateway(DEFAULT_SETTINGS, "manual")).toBe(1);
    expect(paymentTypeForGateway(DEFAULT_SETTINGS, "something-new")).toBe(3);
  });
});

describe("crypto", () => {
  it("round-trips and produces distinct ciphertexts", () => {
    const a = encrypt("secret");
    const b = encrypt("secret");
    expect(isEncrypted(a)).toBe(true);
    expect(a).not.toBe(b);
    expect(decrypt(a)).toBe("secret");
    expect(decrypt(b)).toBe("secret");
    expect(encrypt("")).toBe("");
    expect(decrypt("")).toBe("");
  });

  it("detects tampering", () => {
    const stored = encrypt("secret");
    const parts = stored.split(".");
    parts[3] = Buffer.from("tampered").toString("base64");
    expect(() => decrypt(parts.join("."))).toThrow();
  });

  it("compares tokens safely", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "ab")).toBe(false);
  });
});

describe("parseSettingsForm", () => {
  function form(entries: Array<[string, string]>): FormData {
    const fd = new FormData();
    for (const [k, v] of entries) fd.append(k, v);
    return fd;
  }

  it("treats missing checkboxes as false and keeps the password when the field is empty", () => {
    const current = { ...DEFAULT_SETTINGS, connection: { ...DEFAULT_SETTINGS.connection, password: "old" } };
    const result = parseSettingsForm(
      form([
        ["connection.endpoint", "http://host/services.asmx"],
        ["connection.chainId", "5652"],
        ["connection.username", "BO_5652"],
        ["connection.password", ""],
        ["document.storeNo", "20"],
        ["document.supplyStoreNo", "11"],
        ["document.docType", "1"],
        ["document.docNoSource", "order"],
        ["document.vatPercent", "17"],
        ["document.sendDocByMail", "on"],
        ["document.shippingSku", "555"],
        ["document.feeSku", "973"],
        ["customer.defaultCustomerNo", "1"],
        ["stock.enabled", "on"],
        ["stock.todayIntervalMinutes", "15"],
        ["stock.monthIntervalHours", "8"],
        ["stock.locationId", "gid://shopify/Location/1"],
        ["payment_gateway", "tranzila"],
        ["payment_type", "3"],
        ["payment_gateway", "gift_card"],
        ["payment_type", "4"],
        ["payment_gateway", ""],
        ["payment_type", "3"],
        ["payments.voucherDiscountPrefix", "BUYME"],
      ]),
      current,
    );
    expect(result.errors).toBeUndefined();
    expect(result.keepPassword).toBe(true);
    const s = result.settings!;
    expect(s.connection.password).toBe("old");
    expect(s.document.docNoSource).toBe("order");
    expect(s.document.vatPercent).toBe(17);
    expect(s.document.published).toBe(false);
    expect(s.document.sendDocByMail).toBe(true);
    expect(s.document.autoIssue).toBe(false);
    expect(s.stock.today).toBe(false);
    expect(s.stock.todayIntervalMinutes).toBe(15);
    expect(s.payments.map).toEqual({ tranzila: 3, gift_card: 4 });
  });

  it("reports validation errors by field path", () => {
    const result = parseSettingsForm(form([["stock.todayIntervalMinutes", "1"]]), DEFAULT_SETTINGS);
    expect(result.settings).toBeUndefined();
    expect(Object.keys(result.errors ?? {})).toContain("stock.todayIntervalMinutes");
  });
});
