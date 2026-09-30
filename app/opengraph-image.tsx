import { ImageResponse } from "next/og";

export const alt = "WeFounders — the launchpad for Nepal's startups";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px", background: "#F2F3F5", color: "#17181B", fontFamily: "Arial, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "18px", fontSize: 32, fontWeight: 700 }}>
          <div style={{ width: 54, height: 54, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 14, background: "#FF4B3E", color: "white" }}>W</div>
          WeFounders<span style={{ color: "#FF4B3E" }}>.dev</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ color: "#E83A30", fontSize: 20, fontWeight: 700, letterSpacing: 4 }}>NEPAL&apos;S STARTUP LAUNCH PLATFORM</div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000, fontSize: 68, lineHeight: 1.05, fontWeight: 700 }}><span>Built in Nepal.</span><span>Ready for the world.</span></div>
          <div style={{ color: "#52525B", fontSize: 27 }}>Meet the founders. Try the products. Help them grow.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#666A73", fontSize: 20 }}>Discover launches <span style={{ color: "#FF4B3E" }}>·</span> Join the builder community <span style={{ color: "#FF4B3E" }}>·</span> 🇳🇵</div>
      </div>
    ),
    { ...size },
  );
}
