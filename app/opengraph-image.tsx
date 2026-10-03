import { ImageResponse } from "next/og";

import { BRAND_MARK_PATH, BRAND_MARK_VIEWBOX } from "@/components/brand/mark-path";

export const alt = "WeFounders — Global Startup Launch & Beta Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Brand mark as an inline data URI — satori rasterises SVG sources directly. */
const BRAND_MARK_URI = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${BRAND_MARK_VIEWBOX}" fill="#17181B"><path d="${BRAND_MARK_PATH.replace(/\n\s*/g, "")}"/></svg>`
)}`;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px", background: "#F2F3F5", color: "#17181B", fontFamily: "Arial, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "18px", fontSize: 32, fontWeight: 700 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- satori has no next/image */}
          <img src={BRAND_MARK_URI} alt="" width={54} height={43} />
          wefounders<span style={{ color: "#FF4B3E" }}>.global</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ color: "#E83A30", fontSize: 20, fontWeight: 700, letterSpacing: 4 }}>GLOBAL STARTUP LAUNCH PLATFORM</div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000, fontSize: 68, lineHeight: 1.05, fontWeight: 700 }}><span>Built by Founders.</span><span>Ready for the world.</span></div>
          <div style={{ color: "#52525B", fontSize: 27 }}>Meet the founders. Try the products. Help them grow.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#666A73", fontSize: 20 }}>Discover launches <span style={{ color: "#FF4B3E" }}>·</span> Join the builder community <span style={{ color: "#FF4B3E" }}>·</span> Worldwide</div>
      </div>
    ),
    { ...size },
  );
}
