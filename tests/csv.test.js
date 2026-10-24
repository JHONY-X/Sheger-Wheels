import { describe, expect, it } from "vitest";
import { CSV_BOM, csvEscape, toCsv } from "../lib/csv.js";

describe("csvEscape", () => {
  it("leaves plain values alone", () => {
    expect(csvEscape("Bole")).toBe("Bole");
    expect(csvEscape(2400)).toBe("2400");
  });

  it("quotes commas, quotes and newlines", () => {
    expect(csvEscape("Bole, Addis Ababa")).toBe('"Bole, Addis Ababa"');
    expect(csvEscape('He said "go"')).toBe('"He said ""go"""');
    expect(csvEscape("line one\nline two")).toBe('"line one\nline two"');
  });

  it("renders null and undefined as empty cells", () => {
    expect(csvEscape(null)).toBe("");
    expect(csvEscape(undefined)).toBe("");
  });

  it("neutralises spreadsheet formulas", () => {
    expect(csvEscape("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvEscape("+251911")).toBe("'+251911");
    expect(csvEscape("@cmd")).toBe("'@cmd");
    expect(csvEscape("-2")).toBe("'-2");
  });
});

describe("toCsv", () => {
  const columns = [
    { key: "car", label: "Car" },
    { key: "total", label: "Total" },
  ];

  it("writes a BOM, a header and CRLF rows", () => {
    const csv = toCsv([{ car: "Toyota, Vitz", total: 2400 }], columns);
    expect(csv.startsWith(CSV_BOM)).toBe(true);
    expect(csv).toContain("Car,Total");
    expect(csv).toContain('"Toyota, Vitz",2400');
    expect(csv.endsWith("\r\n")).toBe(true);
  });

  it("can be produced without a BOM", () => {
    const csv = toCsv([], columns, { bom: false });
    expect(csv).toBe("Car,Total\r\n");
  });

  it("keeps a newline inside a single quoted cell", () => {
    const csv = toCsv([{ car: "a\nb", total: 1 }], columns, { bom: false });
    expect(csv).toBe('Car,Total\r\n"a\nb",1\r\n');
  });
});
