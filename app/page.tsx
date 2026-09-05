import Link from "next/link";
import {
  BookOpen,
  Building2,
  Shield,
  ShieldCheck,
  GraduationCap,
  Users,
  Target,
  BarChart3,
  Award,
  CheckCircle2,
  ChevronRight,
  FlaskConical,
  FileCheck,
  TrendingUp,
} from "lucide-react";
import { MobileNav } from "./_components/MobileNav";

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const navLinks = [
  { label: "Platform", href: "#features" },
  { label: "Resources", href: "#how-it-works" },
  { label: "Company", href: "#testimonial" },
];

const features = [
  {
    icon: Building2,
    title: "Multi-Tenant Organization Training",
    description:
      "Deploy segmented environments for departments, subsidiaries, and partners — with controlled oversight and distinct branding.",
  },
  {
    icon: Shield,
    title: "Phishing Simulation Labs",
    description:
      "Safe, controlled environments that expose users to specific risks, designed to build resilience without disruption.",
  },
  {
    icon: GraduationCap,
    title: "CEAP Student Certification",
    description:
      "Accredited curriculum tracks that seamlessly integrate with institutional systems for formal student credentialing.",
  },
];

const complianceBadges = [
  "ISO 27001 CERTIFIED",
  "SOC 2 TYPE II",
  "GDPR COMPLIANT",
  "HIPAA READY",
];

const enterpriseFeatures = [
  {
    icon: FlaskConical,
    title: "Automated Phishing Simulations",
    description:
      "Continuously assess risk with dynamically generated, role-specific attack scenarios.",
  },
  {
    icon: BarChart3,
    title: "Executive Risk Analytics",
    description:
      "Clear reporting dashboards providing clear visibility into organizational vulnerability trends.",
  },
  {
    icon: FileCheck,
    title: "Departmental Compliance Scoring",
    description:
      "Measure and compare training completion and knowledge retention across business units.",
  },
];

const academicFeatures = [
  {
    icon: Award,
    title: "CEAP Certification Tracks",
    description:
      "Rigorous coursework culminating in the Certified Enterprise Authentication Professional designation.",
  },
  {
    icon: BookOpen,
    title: "LMS Integration (Canvas/Blackboard)",
    description:
      "Native integrations that preserve institutional syllabus integration and grade syncing.",
  },
  {
    icon: TrendingUp,
    title: "Student Progress Tracking",
    description:
      "Real-time dashboards for monitoring cohort performance and identifying struggling learners.",
  },
];

const steps = [
  {
    number: 1,
    title: "Onboard Tenant",
    description: "Sync directories and configure baseline settings.",
  },
  {
    number: 2,
    title: "Deploy Assessments",
    description: "Launch initial knowledge and vulnerability scans.",
  },
  {
    number: 3,
    title: "Analyze Risk",
    description: "Review gap analysis and tailor training paths.",
  },
  {
    number: 4,
    title: "Certify & Comply",
    description: "Achieve continuous compliance with verifiable credentials.",
  },
];

const footerColumns = [
  {
    title: "Platform",
    links: [
      { label: "Organizations", href: "#" },
      { label: "Institutions", href: "#" },
      { label: "Simulations", href: "#" },
      { label: "Analytics", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Threat Intelligence", href: "#" },
      { label: "Webinars", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Partners", href: "#" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ------------------------------------------------------------------ */}
      {/*  Navigation                                                         */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/novracademy-logo.png"
              alt="Novr Academy"
              className="h-16 w-auto object-contain"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[8px] px-3 py-2 text-[14px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB] hover:text-[#1A1A2E]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className="rounded-[8px] px-4 py-2 text-[14px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB] hover:text-[#1A1A2E]"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-[8px] bg-[#683290] px-4 py-2 text-[14px] font-medium text-white transition hover:bg-[#542573]"
            >
              Sign up
            </Link>
          </div>

          {/* Mobile menu */}
          <MobileNav />
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/*  Hero                                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="overflow-hidden bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:grid lg:grid-cols-2 lg:gap-12 lg:py-24">
          {/* Left: Copy */}
          <div className="flex flex-col justify-center">
            <h1 className="font-serif text-[36px] font-semibold leading-[1.15] tracking-tight text-[#1A1A2E] sm:text-[42px] lg:text-[48px]">
              Build a Security-First Culture
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-[#6B7280] sm:text-[16px]">
              Mandatory phishing simulations, compliance assessments, and
              certified cybersecurity training — multi-tenant and ready for your
              organization or institution.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-[8px] bg-[#683290] px-6 py-3 text-[15px] font-medium text-white shadow-[0_1px_3px_rgba(104,50,144,0.3)] transition hover:bg-[#542573]"
              >
                Get started
              </Link>
              <Link
                href="/preview/dashboard"
                className="inline-flex items-center justify-center rounded-[8px] border border-[#683290] px-6 py-3 text-[15px] font-medium text-[#683290] transition hover:bg-[#683290]/5"
              >
                Preview platform
              </Link>
            </div>

            {/* Compliance badges 
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {["ISO 27001", "SOC 2", "GDPR READY"].map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-[#E5E7EB] px-3 py-1 text-[11px] font-medium tracking-wide text-[#6B7280]"
                >
                  {badge}
                </span>
              ))}
            </div>*/}
          </div>

          {/* Right: Image */}
          <div className="mt-10 lg:mt-0">
            <div className="relative overflow-hidden rounded-[12px] bg-[#F8F9FB]">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop&crop=center"
                alt="Team collaborating in a modern office environment"
                className="h-[300px] w-full object-cover sm:h-[360px] lg:h-[420px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Features                                                           */}
      {/* ------------------------------------------------------------------ */}
      <section id="features" className="bg-[#F8F9FB] py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)] transition-shadow hover:shadow-[0_8px_24px_rgba(26,26,46,0.12)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#F4ECF8]">
                  <feature.icon
                    className="h-5 w-5 text-[#683290]"
                    strokeWidth={2}
                  />
                </div>
                <h3 className="mt-4 text-[16px] font-semibold text-[#1A1A2E]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#6B7280]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Compliance Bar                                                     */}
      {/* ------------------------------------------------------------------ */}
      {/* <section className="border-y border-[#E5E7EB] bg-white py-6">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {complianceBadges.map((badge, i) => (
              <div key={badge} className="flex items-center gap-3">
                <span className="text-[13px] font-medium tracking-wide text-[#6B7280]">
                  {badge}
                </span>
                {i < complianceBadges.length - 1 && (
                  <ChevronRight className="h-3 w-3 text-[#D1D5DB]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ------------------------------------------------------------------ */}
      {/*  Enterprise vs Academic — Two Column                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Enterprise */}
            <div>
              <h2 className="font-serif text-[28px] font-semibold leading-tight tracking-tight text-[#1A1A2E] sm:text-[32px]">
                Enterprise-Grade Resilience
              </h2>
              <div className="mt-6 overflow-hidden rounded-[12px] bg-[#F8F9FB]">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=340&fit=crop&crop=center"
                  alt="Enterprise team discussing security strategy"
                  className="h-[200px] w-full object-cover sm:h-[240px]"
                />
              </div>
              <div className="mt-6 space-y-4">
                {enterpriseFeatures.map((f) => (
                  <div key={f.title} className="flex gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
                      <CheckCircle2
                        className="h-5 w-5 text-[#683290]"
                        strokeWidth={2}
                      />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-semibold text-[#1A1A2E]">
                        {f.title}
                      </h4>
                      <p className="mt-0.5 text-[14px] leading-relaxed text-[#6B7280]">
                        {f.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Academic */}
            <div>
              <h2 className="font-serif text-[28px] font-semibold leading-tight tracking-tight text-[#1A1A2E] sm:text-[32px]">
                Academic Excellence &amp; Accreditation
              </h2>
              <div className="mt-6 overflow-hidden rounded-[12px] bg-[#F8F9FB]">
                <img
                  src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Students in an academic setting"
                  className="h-[200px] w-full object-cover sm:h-[240px]"
                />
              </div>
              <div className="mt-6 space-y-4">
                {academicFeatures.map((f) => (
                  <div key={f.title} className="flex gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
                      <CheckCircle2
                        className="h-5 w-5 text-[#683290]"
                        strokeWidth={2}
                      />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-semibold text-[#1A1A2E]">
                        {f.title}
                      </h4>
                      <p className="mt-0.5 text-[14px] leading-relaxed text-[#6B7280]">
                        {f.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  How it Works                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section id="how-it-works" className="bg-[#F8F9FB] py-16 lg:py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="font-serif text-[28px] font-semibold tracking-tight text-[#1A1A2E] sm:text-[32px]">
            How it Works
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[15px] text-[#6B7280] sm:text-[16px]">
            A streamlined path to comprehensive security awareness.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#683290] text-[18px] font-bold text-white">
                  {step.number}
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-[#1A1A2E]">
                  {step.title}
                </h3>
                <p className="mt-1 text-[14px] leading-relaxed text-[#6B7280]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Testimonial                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section id="testimonial" className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-5 lg:gap-12">
            {/* Photo */}
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-[12px] bg-[#F8F9FB]">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop&crop=center"
                  alt="Sarah Jenkins, Chief Information Security Officer"
                  className="h-[280px] w-full object-cover sm:h-[340px]"
                />
              </div>
            </div>

            {/* Quote */}
            <div className="lg:col-span-3">
              <div className="text-[40px] leading-none text-[#683290]">
                &ldquo;
              </div>
              <blockquote className="mt-2 font-serif text-[22px] font-semibold leading-snug tracking-tight text-[#1A1A2E] sm:text-[26px]">
                CyberIntel fundamentally shifted our approach from reactive
                training to a proactive, measurable culture of security. The
                distinction between organizational deployment and academic rigor
                is masterfully executed.
              </blockquote>
              <div className="mt-6">
                <p className="text-[15px] font-semibold text-[#1A1A2E]">
                  Sarah Jenkins
                </p>
                <p className="mt-0.5 text-[14px] text-[#6B7280]">
                  Chief Information Security Officer, GlobalTech Financial
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  CTA                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-t border-[#E5E7EB] bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-serif text-[32px] font-semibold tracking-tight text-[#1A1A2E] sm:text-[40px]">
            Secure Your Perimeter Today.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-[#6B7280] sm:text-[16px]">
            Deploy the definitive platform for building resilience across your
            workforce or student body.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center rounded-[8px] bg-[#683290] px-8 py-3 text-[15px] font-medium text-white transition hover:bg-[#542573] sm:w-auto"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-[8px] border border-[#E5E7EB] px-8 py-3 text-[15px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB] sm:w-auto"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Footer                                                             */}
      {/* ------------------------------------------------------------------ */}
      <footer className="border-t border-[#E5E7EB] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2">
                <img
                  src="/novracademy-logo.png"
                  alt="Novr Academy"
                  className="h-14 w-auto object-contain"
                />
              </div>
              <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-[#6B7280]">
                Secure by Design. Building resilient cultures through continuous
                assessment and accredited training.
              </p>
            </div>

            {/* Link columns */}
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#1A1A2E]">
                  {col.title}
                </h4>
                <ul className="mt-3 space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[13px] text-[#6B7280] transition hover:text-[#1A1A2E]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#E5E7EB] pt-6 sm:flex-row">
            <p className="text-[12px] text-[#9CA3AF]">
              &copy; {new Date().getFullYear()} Novr Academy. All rights
              reserved.
            </p>
            <nav className="flex items-center gap-5">
              <Link
                href="#"
                className="text-[12px] text-[#9CA3AF] transition hover:text-[#6B7280]"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-[12px] text-[#9CA3AF] transition hover:text-[#6B7280]"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-[12px] text-[#9CA3AF] transition hover:text-[#6B7280]"
              >
                Cookie Settings
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
