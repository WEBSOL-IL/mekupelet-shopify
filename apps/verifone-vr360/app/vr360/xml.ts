// Minimal XML helpers that reproduce the WooCommerce plugin's behaviour exactly:
// ordered element building (ASMX cares about element order) and namespace-agnostic
// tag extraction with regular expressions. Pure functions, no I/O.

export type XmlValue = string | number | boolean | null | undefined | XmlObject | XmlList;
export interface XmlObject {
  [key: string]: XmlValue;
}
/** A list renders each item as an element named by its `_tag` key. */
export type XmlList = Array<XmlObject & { _tag: string }>;

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function unescapeXml(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;/g, "&");
}

/**
 * Build `<tag>…</tag>` from a value, preserving key order. `null`/`undefined` values are
 * skipped entirely (the element is not emitted), booleans become "true"/"false".
 */
export function element(tag: string, value: XmlValue): string {
  if (value === null || value === undefined) return "";

  if (Array.isArray(value)) {
    let inner = "";
    for (const item of value) {
      const { _tag, ...rest } = item;
      inner += element(_tag, rest);
    }
    return `<${tag}>${inner}</${tag}>`;
  }

  if (typeof value === "object") {
    let inner = "";
    for (const [key, sub] of Object.entries(value)) {
      inner += element(key, sub);
    }
    return `<${tag}>${inner}</${tag}>`;
  }

  if (typeof value === "boolean") {
    return `<${tag}>${value ? "true" : "false"}</${tag}>`;
  }

  return `<${tag}>${escapeXml(String(value))}</${tag}>`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** First `<tag>` value in the XML, ignoring namespace prefixes and attributes. "" if absent. */
export function extractTag(xml: string, tag: string): string {
  const t = escapeRegExp(tag);
  const re = new RegExp(`<(?:\\w+:)?${t}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:\\w+:)?${t}>`);
  const match = re.exec(xml);
  return match ? unescapeXml(match[1].trim()) : "";
}

/** Inner XML of every `<tag>` block (used for repeated nodes such as ProductStock). */
export function extractBlocks(xml: string, tag: string): string[] {
  const t = escapeRegExp(tag);
  const re = new RegExp(`<(?:\\w+:)?${t}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:\\w+:)?${t}>`, "g");
  const blocks: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml)) !== null) {
    blocks.push(match[1]);
  }
  return blocks;
}

/** Pretty-print a compact XML fragment (one element per line) for diagnostics output. */
export function prettyXml(xml: string): string {
  return xml.replace(/>\s*</g, ">\n<").trim();
}

/** Mask secrets before anything is logged or stored. */
export function maskSecrets(xml: string): string {
  return xml
    .replace(/(<(?:\w+:)?Password(?:\s[^>]*)?>)[\s\S]*?(<\/(?:\w+:)?Password>)/g, "$1***$2")
    .replace(/(<(?:\w+:)?CardNumber(?:\s[^>]*)?>)[\s\S]*?(<\/(?:\w+:)?CardNumber>)/g, "$1****$2");
}
