"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BackLink } from "@/components/DesignSystem";
import { Award, Calendar, CheckCircle2, ExternalLink, FileText, Send, Upload, User } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Mock Data (mirrors scholarships page)                                      */
/* -------------------------------------------------------------------------- */

const scholarshipData: Record<string, {
  title: string;
  provider: string;
  description: string;
  amount: string;
  deadline: string;
  eligibility: string[];
  category: string;
  requirements: string[];
  benefits: string[];
  applicationSteps: string[];
}> = {
  "1": {
    title: "Cybersecurity Women in Tech Scholarship",
    provider: "CyberNovr Foundation",
    description: "Full scholarship covering the complete CEAP certification track for women pursuing careers in cybersecurity. Includes mentorship and career placement support.",
    amount: "Full Tuition",
    deadline: "2026-09-30",
    eligibility: ["Women in tech", "Nigerian residents", "Entry to intermediate level"],
    category: "Women in Tech",
    requirements: ["Valid government ID", "Resume/CV", "Statement of purpose (500 words)", "Proof of enrollment or employment"],
    benefits: ["Full tuition coverage", "1-on-1 mentorship", "Career placement support", "Industry networking events", "Certificate upon completion"],
    applicationSteps: [
      "Fill out the application form below",
      "Upload required documents",
      "Submit your statement of purpose",
      "Applications reviewed within 2 weeks",
      "Interview shortlisted candidates",
      "Winners announced via email",
    ],
  },
  "2": {
    title: "NDPC Data Protection Compliance Scholarship",
    provider: "Nigeria Data Protection Commission",
    description: "Covers the cost of NDPR compliance training for employees of SMEs with less than 50 staff. Aimed at improving data protection awareness across small businesses.",
    amount: "₦250,000",
    deadline: "2026-08-25",
    eligibility: ["SME employees (< 50 staff)", "Nigerian-registered business", "Data handling roles"],
    category: "Compliance",
    requirements: ["Company registration document", "Employee verification letter", "Resume/CV", "Brief description of data handling role"],
    benefits: ["Full training coverage", "NDPR compliance toolkit", "Post-training support", "Compliance certificate"],
    applicationSteps: [
      "Verify your company eligibility",
      "Submit company and personal details",
      "Upload supporting documents",
      "Employer verification",
      "Approval notification",
    ],
  },
  "3": {
    title: "Africa Cyber Defense Initiative Scholarship",
    provider: "African Union / ITU",
    description: "Pan-African scholarship for cybersecurity professionals. Covers advanced threat intelligence and incident response training with hands-on lab access.",
    amount: "$2,000",
    deadline: "2026-10-15",
    eligibility: ["African nationals", "2+ years in security roles", "Employer recommendation"],
    category: "Professional Development",
    requirements: ["Employer recommendation letter", "2+ years work experience proof", "Current role description", "Professional references (2)"],
    benefits: ["Training grant", "Lab environment access", "International certification", "Pan-African network membership"],
    applicationSteps: [
      "Submit professional profile",
      "Upload employer recommendation",
      "Provide work experience documentation",
      "Review committee assessment",
      "Notification of award",
    ],
  },
  "4": {
    title: "NYSC Cybersecurity Skills Bootcamp",
    provider: "Federal Ministry of Communications",
    description: "Free 12-week intensive cybersecurity bootcamp for NYSC corps members. Covers ethical hacking, network security, and SOC analyst fundamentals.",
    amount: "Free",
    deadline: "2026-08-20",
    eligibility: ["Current NYSC corps members", "STEM-related degree", "Lagos or Abuja"],
    category: "Bootcamp",
    requirements: ["NYSC call-up letter", "Degree certificate", "State of residence proof", "Passport photograph"],
    benefits: ["Free 12-week training", "Laptop loan program", "Job placement assistance", "Industry certification"],
    applicationSteps: [
      "Verify NYSC status",
      "Submit personal details",
      "Upload required documents",
      "Selection test (online)",
      "Bootcamp placement",
    ],
  },
  "5": {
    title: "CompTIA Security+ Exam Voucher Scholarship",
    provider: "CompTIA Africa",
    description: "Covers the full cost of the CompTIA Security+ exam voucher plus 3 months of study materials for qualifying candidates.",
    amount: "$400",
    deadline: "2026-11-01",
    eligibility: ["Passed any Novr Academy course", "Scored 80%+ on practice exams", "Nigerian resident"],
    category: "Certification",
    requirements: ["Novr Academy course completion record", "Practice exam score screenshot", "Valid ID"],
    benefits: ["Exam voucher ($400 value)", "3 months study materials", "Practice exam access", "Study group membership"],
    applicationSteps: [
      "Connect your Novr Academy account",
      "Verify course completion",
      "Submit exam readiness declaration",
      "Automatic qualification check",
      "Voucher issued via email",
    ],
  },
};

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function ApplyScholarshipPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const scholarship = scholarshipData[id];

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    role: "",
    statement: "",
  });
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!scholarship) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 lg:py-8">
        <BackLink href="/dashboard/community/scholarships" label="Scholarships" className="mb-4" />
        <div className="py-12 text-center">
          <Award className="mx-auto h-10 w-10 text-[#E5E7EB]" />
          <p className="mt-3 text-[14px] text-[#6B7280]">Scholarship not found.</p>
        </div>
      </main>
    );
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files || []).map((f) => ({
      name: f.name,
      size: `${(f.size / 1024).toFixed(1)} KB`,
    }));
    setFiles([...files, ...newFiles]);
    e.target.value = "";
  }

  function removeFile(index: number) {
    setFiles(files.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // Simulate submission
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 lg:py-8">
        <BackLink href="/dashboard/community/scholarships" label="Scholarships" className="mb-4" />
        <div className="rounded-[12px] border border-[#BBF7D0] bg-[#F0FDF4] p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-[#16A34A]" />
          <h2 className="mt-4 font-serif text-[20px] font-semibold text-[#1A1A2E]">Application Submitted!</h2>
          <p className="mt-2 text-[14px] text-[#6B7280]">
            Your application for <span className="font-medium text-[#1A1A2E]">{scholarship.title}</span> has been received.
            You&apos;ll hear back within 2 weeks.
          </p>
          <div className="mt-6 space-y-2">
            {scholarship.applicationSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-3 text-left">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${i <= 3 ? "bg-[#16A34A] text-white" : "bg-[#F1F3F5] text-[#9CA3AF]"}`}>
                  {i < 3 ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className={`text-[13px] ${i <= 3 ? "text-[#1A1A2E]" : "text-[#9CA3AF]"}`}>{step}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push("/dashboard/community/scholarships")}
            className="mt-6 rounded-[8px] bg-[#683290] px-6 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573]"
          >
            Back to Scholarships
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 lg:py-8">
      <BackLink href="/dashboard/community/scholarships" label="Scholarships" className="mb-4" />

      {/* Scholarship Header */}
      <div className="mb-6 rounded-[12px] border border-[#E5E7EB] bg-gradient-to-r from-[#683290] to-[#4451A2] p-6 text-white">
        <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold backdrop-blur">{scholarship.category}</span>
        <h1 className="mt-3 font-serif text-[22px] font-semibold leading-tight">{scholarship.title}</h1>
        <p className="mt-1 text-[13px] text-white/70">{scholarship.provider}</p>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-[13px] text-white/80">
          <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5" /> {scholarship.amount}</span>
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Deadline: {new Date(scholarship.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.06)]">
            <h2 className="font-serif text-[16px] font-semibold text-[#1A1A2E]">Application Form</h2>
            <p className="mt-1 text-[13px] text-[#6B7280]">Fill in your details to apply for this scholarship.</p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">FULL NAME *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Jane Doe"
                  className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">EMAIL *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@company.com"
                    className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">PHONE</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+234 800 000 0000"
                    className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">ORGANIZATION</label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Company name"
                    className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">CURRENT ROLE</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Security Analyst"
                    className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">STATEMENT OF PURPOSE *</label>
                <p className="mt-0.5 text-[12px] text-[#6B7280]">Why do you deserve this scholarship? (Max 500 words)</p>
                <textarea
                  required
                  value={formData.statement}
                  onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                  placeholder="Tell us about your background, career goals, and how this scholarship will help you..."
                  rows={6}
                  className="mt-1.5 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#1A1A2E] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10 resize-y"
                />
                <p className="mt-1 text-right text-[11px] text-[#9CA3AF]">{formData.statement.split(/\s+/).filter(Boolean).length}/500 words</p>
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.06)]">
            <h2 className="font-serif text-[16px] font-semibold text-[#1A1A2E]">Supporting Documents</h2>
            <p className="mt-1 text-[13px] text-[#6B7280]">Upload the required documents for this scholarship.</p>

            <div className="mt-4 space-y-2">
              {scholarship.requirements.map((req, i) => (
                <div key={i} className="flex items-center gap-2 text-[13px] text-[#6B7280]">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-[#683290]" />
                  {req}
                </div>
              ))}
            </div>

            <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-[8px] border-2 border-dashed border-[#E5E7EB] bg-[#F8F9FB] px-4 py-6 text-[13px] text-[#6B7280] transition hover:border-[#683290]/30 hover:bg-[#F4ECF8]/30">
              <Upload className="h-4 w-4" />
              Click to upload documents
              <input type="file" multiple accept=".pdf,.doc,.docx,.jpg,.png" onChange={handleFileUpload} className="hidden" />
            </label>

            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between rounded-[6px] border border-[#E5E7EB] bg-[#F8F9FB] px-3 py-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-[#683290]" />
                      <span className="text-[13px] text-[#1A1A2E]">{f.name}</span>
                      <span className="text-[11px] text-[#9CA3AF]">({f.size})</span>
                    </div>
                    <button type="button" onClick={() => removeFile(i)} className="text-[12px] text-[#DC2626] hover:underline">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-[8px] border border-[#E5E7EB] px-5 py-2.5 text-[13px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.fullName || !formData.email || !formData.statement}
              className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-6 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573] disabled:opacity-60"
            >
              <Send className="h-3.5 w-3.5" />
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Benefits */}
          <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.06)]">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">What You Get</h3>
            <div className="mt-3 space-y-2">
              {scholarship.benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#16A34A]" />
                  <span className="text-[13px] text-[#1A1A2E]">{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.06)]">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Application Process</h3>
            <div className="mt-3 space-y-3">
              {scholarship.applicationSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F4ECF8] text-[10px] font-semibold text-[#683290]">
                    {i + 1}
                  </span>
                  <span className="text-[13px] text-[#6B7280]">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Eligibility Reminder */}
          <div className="rounded-[12px] border border-[#FFF7ED] bg-[#FFFBEB] p-5">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#92400E]">Eligibility Criteria</h3>
            <div className="mt-2 space-y-1.5">
              {scholarship.eligibility.map((e, i) => (
                <div key={i} className="flex items-center gap-2 text-[13px] text-[#92400E]">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-[#EA580C]" />
                  {e}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
