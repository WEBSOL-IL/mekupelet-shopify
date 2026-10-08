// Error types for VR360 calls. Business errors (RequestResult.IsSuccess=false) carry the
// VR360 status code and the same operator hints the WooCommerce plugin showed.

export type Vr360ErrorKind = "config" | "http" | "transport" | "api" | "parse";

/** Hints per VR360 status code (verbatim from the plugin, merchant-facing Hebrew). */
export const STATUS_HINTS: Record<string, string> = {
  "315":
    'השרת לא זיהה את אובייקט השובר בשורת הקבלה. ודאו שגרסת האפליקציה המעודכנת פעילה, והריצו "בדיקת מבנה שירות (WSDL)" בהגדרות כדי לוודא את שם האלמנט המדויק.',
  "408":
    "מסמך עם מספר זה כבר רשום בוריפון (ייתכן מנסיון קודם שנכשל באמצע). בדקו בוריפון אם החשבונית קיימת ותקינה לפני ניסיון חוזר — ייתכן שצריך לבטלה במרכז הרשת.",
  "421":
    'וריפון לא הצליח לשלוף נומרטור (רצף מספור) לחשבונית. יש לוודא מול וריפון שמוגדר לחנות (StoreNo שבהגדרות) נומרטור/פנקס לחשבוניות מס-קבלה עבור ממשק אתר הסחר, ולוודא את ההגדרה "מקור מספר מסמך" (אוטומטי מול מספר הזמנה) בהתאם לאופן שהרשת מוגדרת.',
  "431": "סך הפריטים בכותרת אינו תואם את סכום הכמויות בשורות.",
  "432": "מספר השורות בכותרת אינו תואם את כמות השורות בפועל.",
  "433": 'סכום המע"מ בכותרת אינו תואם את חילוץ המע"מ מהשורות (דגל 4221 בוריפון).',
  "434": "מספר האסמכתא (Reference) כבר קיים במסמך אחר בוריפון (דגל 4222).",
  "452": "המסמך לא נמצא בוריפון (בדקו חנות, מספר מסמך וסוג מסמך).",
};

export class Vr360Error extends Error {
  readonly kind: Vr360ErrorKind;
  /** VR360 status code for `api` errors, HTTP status for `http` errors. */
  readonly status?: string;
  readonly hint?: string;
  /** Raw response body when one was received. */
  readonly raw?: string;

  constructor(
    kind: Vr360ErrorKind,
    message: string,
    options: { status?: string; hint?: string; raw?: string; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "Vr360Error";
    this.kind = kind;
    this.status = options.status;
    this.hint = options.hint;
    this.raw = options.raw;
  }

  /** Transport and 5xx errors may be retried; VR360 business errors must not. */
  get retryable(): boolean {
    if (this.kind === "transport") return true;
    if (this.kind === "http") return Number(this.status) >= 500;
    return false;
  }

  /** Message plus hint, the way the plugin displayed it. */
  get fullMessage(): string {
    return this.hint ? `${this.message}\n${this.hint}` : this.message;
  }

  /** "Unknown SOAPAction" from ASMX: used to try alternative operation names. */
  get isUnknownAction(): boolean {
    return this.kind === "http" && /SOAPAction/i.test(this.message);
  }
}

export function apiError(status: string, description: string, raw?: string): Vr360Error {
  const message = `VR360 החזיר שגיאה (קוד ${status || "?"}): ${description || "ללא תיאור"}`;
  return new Vr360Error("api", message, { status, hint: STATUS_HINTS[status], raw });
}
