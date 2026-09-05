import Link from "next/link";
import { Award, Tag, ArrowRight, FlaskConical } from "lucide-react";
import { PreviewBanner } from "@/components/preview/PreviewBanner";
import { PreviewOverlay, PreviewSectionWrapper } from "@/components/preview/PreviewOverlay";

const MOCK_LABS = [
  { id: "1", name: "SQL Injection — Login Bypass", category: "Web", description: "Exploit a vulnerable login form to bypass authentication and extract the flag.", points: 100, solved: false },
  { id: "2", name: "Phishing Analysis Lab", category: "Forensics", description: "Analyze a suspicious email header and payload to identify the attack vector.", points: 75, solved: false },
  { id: "3", name: "Network Recon Challenge", category: "Network", description: "Use nmap and custom scripts to discover hidden services and capture the flag.", points: 150, solved: true },
  { id: "4", name: "XSS Stored Challenge", category: "Web", description: "Inject a persistent payload and demonstrate impact in a sandboxed browser.", points: 120, solved: false },
  { id: "5", name: "Crypto — Weak RSA", category: "Crypto", description: "Factor a weak RSA key and decrypt the captured ciphertext.", points: 200, solved: false },
  { id: "6", name: "Privilege Escalation", category: "System", description: "Exploit a misconfigured SUID binary to gain root in a live VM.", points: 180, solved: false },
];

export default function PreviewLabsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PreviewBanner />
      <div>
        <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">Labs</h1>
        <p className="mt-1 text-[14px] text-[#6B7280]">Hands-on cybersecurity challenges. Sign in to spin up a lab environment.</p>
      </div>

      <PreviewSectionWrapper
        overlay={
          <PreviewOverlay
            title="Sign in to access labs"
            description="Spin up live VMs, capture flags, and earn XP. You're viewing example labs — sign in to start one."
          />
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_LABS.map((lab) => (
            <div
              key={lab.id}
              className="group flex h-full flex-col overflow-hidden rounded-[8px] border border-[#E5E5E5] bg-white"
            >
              <div aria-hidden="true" className={lab.solved ? "h-2 bg-gradient-to-r from-green-500 to-emerald-400" : "h-2 bg-gradient-to-r from-[#683290] to-[#9863bc]"} />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F4ECF8] px-2.5 py-0.5 text-[11px] font-medium text-[#683290]">
                    <Tag className="h-3 w-3" /> {lab.category}
                  </span>
                  {lab.solved && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-medium text-green-700">
                      <Award className="h-3 w-3" /> Solved
                    </span>
                  )}
                </div>
                <h2 className="mt-4 font-serif text-xl font-semibold leading-snug text-[#1A1A2E]">{lab.name}</h2>
                <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#666666]">{lab.description}</p>
                <div className="mt-auto flex items-center justify-between gap-4 pt-6">
                  <span className="text-[13px] font-semibold text-[#683290]">{lab.points} pts</span>
                  <span className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white">
                    {lab.solved ? "Review" : "Start Lab"} <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PreviewSectionWrapper>

      <p className="text-center text-xs text-text-secondary">
        <Link href="/login" className="font-bold text-auth-primary hover:underline">
          Sign in
        </Link>{" "}
        to launch a lab and earn XP.
      </p>
    </div>
  );
}
