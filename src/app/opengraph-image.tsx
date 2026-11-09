import { ImageResponse } from "next/og";
import { BRAND, LOGO } from "@/lib/logo";

export const alt = "Ahem Corporation — Building Infrastructure. Engineering Tomorrow.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: BRAND.navy, padding: 72, color: "white" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg width="96" height="96" viewBox="0 0 64 64">
            <path d={LOGO.beamLeft} fill={BRAND.gold} />
            <path d={LOGO.beamRight} fill="#ffffff" />
            <path d={LOGO.towerLeft} fill="#ffffff" />
            <path d={LOGO.towerCentre} fill={BRAND.gold} />
            <path d={LOGO.towerRight} fill="#ffffff" />
            <path d={LOGO.ground} fill={BRAND.gold} />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", marginLeft: 28 }}>
            <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: 10 }}>AHEM</div>
            <div style={{ fontSize: 18, letterSpacing: 9, color: BRAND.gold }}>CORPORATION</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>Building Infrastructure.</div>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, color: BRAND.gold }}>Engineering Tomorrow.</div>
          <div style={{ display: "flex", marginTop: 36, fontSize: 26, color: "#b9c8d7" }}>Construction · Civil Engineering · Infrastructure · Project Management</div>
        </div>
      </div>
    ),
    size,
  );
}
