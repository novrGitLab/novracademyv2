/**
 * HTML mirror of the PDF layout rendered server-side in
 * novracademyv2-backend/services/certificateDocument.tsx — used for
 * in-app previews (admin template settings, learner certificate page).
 * The actual downloadable artifact is always the server-rendered PDF.
 */
export interface CertificateTemplateProps {
  learnerName: string;
  courseName: string;
  completionDate: string;
  certId: string;
  orgName?: string | null;
  orgLogoUrl?: string | null;
  orgPrimaryColor?: string | null;
}

const DEFAULT_COLOR = "#2563EB";

export function CertificateTemplate({
  learnerName,
  courseName,
  completionDate,
  certId,
  orgName,
  orgLogoUrl,
  orgPrimaryColor,
}: CertificateTemplateProps) {
  const color = orgPrimaryColor || DEFAULT_COLOR;
  const issuedByOrg = Boolean(orgName);

  return (
    <div className="aspect-[297/210] w-full overflow-hidden rounded-card" style={{ border: `6px solid ${color}`, background: "#FFFFFF" }}>
      <div className="flex h-full flex-col p-6">
        <div className="flex items-center justify-between">
          {orgLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={orgLogoUrl} alt="Org logo" className="h-8 max-w-[100px] object-contain" />
          ) : (
            <div className="h-8 w-[100px]" />
          )}
          <p className="text-[15px] font-bold text-[#111827]">Certificate of Completion</p>
          <p className="whitespace-pre-line text-right text-[9px] text-[#6B7280]">{"Issued via\nNovr Academy"}</p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-[11px] italic text-[#4B5563]">This is to certify that</p>
          <p className="my-2 text-[30px] font-bold text-[#111827]">{learnerName}</p>
          <p className="text-[11px] text-[#4B5563]">has successfully completed</p>
          <p className="mt-1 text-[17px] font-bold text-[#111827]">{courseName}</p>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-[7px] uppercase tracking-wide text-[#9CA3AF]">Date completed</p>
            <p className="text-[9px] text-[#374151]">{completionDate}</p>
          </div>
          <div className="text-center">
            <p className="text-[7px] uppercase tracking-wide text-[#9CA3AF]">Certificate ID</p>
            <p className="font-mono text-[8px] text-[#374151]">{certId}</p>
          </div>
          <div className="text-right">
            <p className="border-t border-[#9CA3AF] pt-1 text-[7px] uppercase tracking-wide text-[#9CA3AF]">
              {issuedByOrg ? `${orgName} Admin` : "Novr Academy"}
            </p>
          </div>
        </div>

        <div className="-mx-6 -mb-6 mt-3 flex items-center justify-between px-6 py-2" style={{ background: color }}>
          <p className="text-[9px] text-white">{orgName ?? "Novr Academy"}</p>
          <p className="text-[7px] text-white/85">{issuedByOrg ? "Powered by Novr Academy" : "novracademy.com"}</p>
        </div>
      </div>
    </div>
  );
}
