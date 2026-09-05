import { ClipboardCheck } from "lucide-react";
import { PreviewBanner } from "@/components/preview/PreviewBanner";
import { PreviewOverlay, PreviewSectionWrapper } from "@/components/preview/PreviewOverlay";

export default function PreviewAssessmentsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PreviewBanner />
      <div>
        <h1 className="text-[24px] font-semibold text-text-primary">Assessments</h1>
        <p className="mt-1 text-[15px] text-text-secondary">Baseline, monthly, and closing assessments track your growth over time. Sign in to see yours.</p>
      </div>

      <PreviewSectionWrapper
        overlay={<PreviewOverlay title="Assessments are locked" description="Baseline and monthly assessments appear here after you sign in. Complete them to measure your growth." />}
      >
        <div className="space-y-6 opacity-60">
          <section>
            <h2 className="mb-2 text-[13px] font-medium uppercase tracking-wide text-text-secondary">Baseline</h2>
            <div className="flex items-center justify-between rounded-card border border-border bg-background px-4 py-3">
              <div>
                <p className="text-[15px] font-medium text-text-primary">Baseline Assessment — Cybersecurity Fundamentals</p>
                <p className="text-[13px] text-text-secondary">25 questions</p>
              </div>
              <span className="rounded-pill bg-blue/10 px-3 py-1 text-[13px] font-medium text-blue">Start</span>
            </div>
          </section>
          <section>
            <h2 className="mb-2 text-[13px] font-medium uppercase tracking-wide text-text-secondary">Monthly assessments due</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-card border border-border bg-background px-4 py-3">
                <div>
                  <p className="text-[15px] font-medium text-text-primary">Monthly Check — October</p>
                  <p className="text-[13px] text-text-secondary">12 questions</p>
                </div>
                <span className="rounded-pill bg-blue/10 px-3 py-1 text-[13px] font-medium text-blue">Start</span>
              </div>
              <div className="flex items-center justify-between rounded-card border border-border bg-background px-4 py-3">
                <div>
                  <p className="text-[15px] font-medium text-text-primary">Monthly Check — November</p>
                  <p className="text-[13px] text-text-secondary">12 questions</p>
                </div>
                <span className="rounded-pill bg-blue/10 px-3 py-1 text-[13px] font-medium text-blue">Start</span>
              </div>
            </div>
          </section>
        </div>
      </PreviewSectionWrapper>
    </div>
  );
}
