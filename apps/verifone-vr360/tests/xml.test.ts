import { describe, expect, it } from "vitest";
import { element, extractBlocks, extractTag, maskSecrets, prettyXml } from "../app/vr360/xml";

describe("element", () => {
  it("preserves key order and skips null/undefined", () => {
    const xml = element("Request", { B: 1, A: "x", Skip: null, Also: undefined, Flag: true, Off: false });
    expect(xml).toBe("<Request><B>1</B><A>x</A><Flag>true</Flag><Off>false</Off></Request>");
  });

  it("renders lists with _tag items", () => {
    const xml = element("DocumentLines", [
      { _tag: "DocumentLine", ProductCode: "555", Qty: 1 },
      { _tag: "DocumentLine", ProductCode: "973", Qty: 2 },
    ]);
    expect(xml).toBe(
      "<DocumentLines><DocumentLine><ProductCode>555</ProductCode><Qty>1</Qty></DocumentLine>" +
        "<DocumentLine><ProductCode>973</ProductCode><Qty>2</Qty></DocumentLine></DocumentLines>",
    );
  });

  it("escapes XML special characters like htmlspecialchars(ENT_XML1|ENT_COMPAT)", () => {
    expect(element("Name", `מק"ט <5> & 'x'`)).toBe("<Name>מק&quot;ט &lt;5&gt; &amp; 'x'</Name>");
  });
});

describe("extractTag", () => {
  const xml = `<?xml version="1.0"?><soap:Envelope><soap:Body><a:CreateInvoiceResponse>
    <RequestResult><IsSuccess>true</IsSuccess><Status>0</Status></RequestResult>
    <Data xsi:type="x"><InvoiceNo> 149729 </InvoiceNo><CustomerName>בן &amp; בת</CustomerName></Data>
  </a:CreateInvoiceResponse></soap:Body></soap:Envelope>`;

  it("ignores namespaces and attributes, trims and decodes entities", () => {
    expect(extractTag(xml, "IsSuccess")).toBe("true");
    expect(extractTag(xml, "InvoiceNo")).toBe("149729");
    expect(extractTag(xml, "CustomerName")).toBe("בן & בת");
    expect(extractTag(xml, "Missing")).toBe("");
  });

  it("does not match a longer tag with the same prefix", () => {
    expect(extractTag("<StoreNoX>9</StoreNoX><StoreNo>20</StoreNo>", "StoreNo")).toBe("20");
  });
});

describe("extractBlocks", () => {
  it("returns every ProductStock block", () => {
    const xml =
      "<Data><ProductStock><ProductCode>A</ProductCode><Qty>3</Qty></ProductStock>" +
      "<ns:ProductStock><ProductCode>B</ProductCode><Qty>-1</Qty></ns:ProductStock></Data>";
    const blocks = extractBlocks(xml, "ProductStock");
    expect(blocks).toHaveLength(2);
    expect(extractTag(blocks[1], "Qty")).toBe("-1");
  });
});

describe("maskSecrets / prettyXml", () => {
  it("masks passwords and card numbers", () => {
    const masked = maskSecrets("<User><Password>s3cret</Password></User><CardNumber>4580123412341234</CardNumber>");
    expect(masked).toBe("<User><Password>***</Password></User><CardNumber>****</CardNumber>");
  });

  it("pretty prints one element per line", () => {
    expect(prettyXml("<a><b>1</b> <c>2</c></a>")).toBe("<a>\n<b>1</b>\n<c>2</c>\n</a>");
  });
});
