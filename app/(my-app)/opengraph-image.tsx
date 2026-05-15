import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #f7efdd 0%, #fff0d0 60%, #e3dece 100%)",
          color: "#183228",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: 42,
              fontWeight: 700,
              letterSpacing: "-0.04em",
            }}
          >
            EPYC
          </div>
          <div
            style={{
              fontSize: 22,
              opacity: 0.65,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Design Studio
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: 920,
          }}
        >
          <h1
            style={{
              fontSize: 80,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              margin: 0,
              fontWeight: 500,
            }}
          >
            Great Companies Deserve Great Websites &amp; Digital Products.
          </h1>
          <p
            style={{
              fontSize: 28,
              opacity: 0.75,
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            SaaS · AI · E-Commerce · Finance · Education · HealthTech · Web3
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            opacity: 0.7,
          }}
        >
          <span style={{ display: "flex" }}>epyc.in</span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "#b91646",
              color: "#fff0d0",
              padding: "12px 24px",
              borderRadius: 999,
            }}
          >
            See Our Work →
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
