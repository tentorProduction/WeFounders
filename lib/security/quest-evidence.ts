export const MAX_EVIDENCE_BYTES = 2 * 1024 * 1024;
export const MAX_EVIDENCE_COUNT = 5;

export function evidenceFileId(path: string): string | null {
  return /^\/api\/quest-evidence\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.exec(path)?.[1] ?? null;
}

/** Identify a bounded raster image from its bytes, never the supplied MIME or filename. */
export function evidenceImageType(bytes: Uint8Array): "image/png" | "image/jpeg" | null {
  if (!bytes.length || bytes.length > MAX_EVIDENCE_BYTES) return null;
  const data = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const dimensions = (width: number, height: number) => width > 0 && height > 0 && width <= 12000 && height <= 12000 && width * height <= 40_000_000;
  if (bytes.length >= 45 && bytes.slice(0, 8).every((value, i) => value === [137,80,78,71,13,10,26,10][i])) {
    let offset = 8;
    let imageData = false;
    while (offset + 12 <= bytes.length) {
      const length = data.getUint32(offset);
      if (length > bytes.length - offset - 12) return null;
      const type = String.fromCharCode(...bytes.slice(offset + 4, offset + 8));
      if (offset === 8 && (type !== "IHDR" || length !== 13 || !dimensions(data.getUint32(16), data.getUint32(20)))) return null;
      if (type === "IDAT") imageData = true;
      if (type === "IEND") return imageData && length === 0 && offset + 12 === bytes.length ? "image/png" : null;
      offset += length + 12;
    }
  }
  if (bytes.length >= 12 && bytes[0] === 255 && bytes[1] === 216 && bytes.at(-2) === 255 && bytes.at(-1) === 217) {
    let offset = 2;
    while (offset + 4 <= bytes.length && bytes[offset] === 255) {
      while (bytes[offset] === 255) offset++;
      const marker = bytes[offset++];
      if (marker === 218 || marker === 217) return null;
      if (marker === 1 || (marker >= 208 && marker <= 215)) continue;
      if (offset + 2 > bytes.length) return null;
      const length = data.getUint16(offset);
      if (length < 2 || offset + length > bytes.length) return null;
      if ([192,193,194].includes(marker)) return length >= 8 && dimensions(data.getUint16(offset + 5), data.getUint16(offset + 3)) ? "image/jpeg" : null;
      offset += length;
    }
  }
  return null;
}
