import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface CertificateVerification {
  learnerName: string;
  courseTitle: string | null;
}

export default async function OgImage({ params }: { params: { certUid: string } }) {
  const certificate = await fetch(`${API_URL}/certificates/${params.certUid}`, { cache: "no-store" })
    .then((res) => (res.ok ? (res.json() as Promise<CertificateVerification>) : null))
    .catch(() => null);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFFFFF",
          border: "16px solid #2563EB",
        }}
      >
        <div style={{ fontSize: 24, color: "#6B7280", letterSpacing: 4, textTransform: "uppercase" }}>
          Novr Academy
        </div>
        <div style={{ fontSize: 40, color: "#111827", fontWeight: 700, marginTop: 28 }}>
          Certificate of Completion
        </div>
        {certificate ? (
          <>
            <div style={{ fontSize: 56, color: "#2563EB", fontWeight: 700, marginTop: 24 }}>
              {certificate.learnerName}
            </div>
            <div style={{ fontSize: 28, color: "#374151", marginTop: 16 }}>
              {certificate.courseTitle ?? ""}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 28, color: "#EF4444", marginTop: 24 }}>Certificate not found</div>
        )}
      </div>
    ),
    { ...size }
  );
}
