// @ts-check

/** Excel only treats a file as UTF-8 when it starts with this. */
export const CSV_BOM = "\uFEFF";

const RISKY_PREFIX = /^[=+\-@\t\r]/;

/**
 * RFC 4180 escaping plus spreadsheet-formula injection protection.
 * @param {unknown} value
 */
export function csvEscape(value) {
  let text = value === null || value === undefined ? "" : String(value);

  // A leading = + - @ makes Excel execute the cell. Prefix with a quote so it
  // is stored as text, then quote the field normally.
  if (RISKY_PREFIX.test(text)) text = `'${text}`;

  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/**
 * @param {Record<string, unknown>[]} rows
 * @param {{ key: string, label: string }[]} columns
 * @param {{ bom?: boolean }} [options]
 */
export function toCsv(rows, columns, options = {}) {
  const header = columns.map((c) => csvEscape(c.label)).join(",");
  const body = rows.map((row) =>
    columns.map((c) => csvEscape(row[c.key])).join(","),
  );
  const csv = [header, ...body].join("\r\n") + "\r\n";
  return options.bom === false ? csv : CSV_BOM + csv;
}

/** Trigger a download in the browser. No-ops during SSR. */
export function downloadCsv(filename, csv) {
  if (typeof document === "undefined") return;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
