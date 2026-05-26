// 디스플레이/문자열/CSV 헬퍼.

export function normalizeKey(s: string): string {
  return String(s ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "");
}

export function displayPrimaryName(v: { name_ko: string; name_ja: string; name_en: string }): string {
  return v.name_ko || v.name_ja || v.name_en || "(unknown)";
}

export function displaySecondaryName(v: { name_ko: string; name_ja: string; name_en: string }): string {
  const primary = displayPrimaryName(v);
  if (primary === v.name_ko) return v.name_ja || v.name_en;
  if (primary === v.name_ja) return v.name_ko || v.name_en;
  return v.name_ko || v.name_ja;
}

export function displayWorkLabel(ko: string, ja: string, en: string): string {
  const k = ko || "";
  const j = ja || "";
  const e = en || "";
  if (k && j) return `${k} / ${j}`;
  if (k && e) return `${k} / ${e}`;
  return k || j || e;
}

export function displayWorkPrimaryName(ko: string, ja: string, en: string): string {
  return ko || ja || en || "";
}

export function csvOrderOf(sourceLine: number | null): number {
  return typeof sourceLine === "number" && Number.isFinite(sourceLine)
    ? sourceLine
    : Number.POSITIVE_INFINITY;
}

export function displayKoLine(v: { name_ko: string; name_ja: string; name_en: string }): string {
  return v.name_ko || v.name_en || v.name_ja || "(unknown)";
}

function joinSubtitle(base: string, subtitle: string, separator: string): string {
  const b = base || "";
  const s = subtitle || "";
  if (!b) return s;
  if (!s) return b;
  if (b.includes(s)) return b;
  return `${b} ${separator} ${s}`;
}

export function displayWorkKoTitle(v: { name_ko: string; name_en: string }): string {
  return joinSubtitle(v.name_ko || "", v.name_en || "", "~");
}

export function displayWorkJaTitle(v: { name_ja: string; name_en: string }): string {
  return joinSubtitle(v.name_ja || "", v.name_en || "", "～");
}

export function displayJaLine(
  v: { name_ko: string; name_ja: string; name_en: string },
  primary: string
): string {
  const ja = v.name_ja || "";
  if (!ja) return "";
  return ja === primary ? "" : ja;
}

export function escapeCsvField(v: string): string {
  const s = String(v ?? "");
  if (/[\n\r",]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function formatDateYYYYMMDD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
