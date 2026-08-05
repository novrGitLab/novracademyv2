import Link from "next/link";
import { Award, BookOpen, Cloud, Code, Shield, Sparkles, Users2 } from "lucide-react";
import { MobileNav } from "./_components/MobileNav";

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Courses", href: "#courses" },
  { label: "Community", href: "#community" },
];

const courses = [
  {
    icon: Shield,
    title: "Cybersecurity Fundamentals",
    description:
      "Learn the core principles of network security, threat detection, and incident response.",
  },
  {
    icon: Cloud,
    title: "Cloud Computing",
    description:
      "Master AWS, Azure, and GCP — from deployment to scaling and cost optimization.",
  },
  {
    icon: Code,
    title: "Full-Stack Development",
    description:
      "Build production-ready applications with React, Node.js, databases, and CI/CD pipelines.",
  },
];

const features = [
  {
    icon: BookOpen,
    title: "Structured courses",
    description:
      "From basics to advanced, our courses are built by industry experts and designed to take you from learning to doing.",
  },
  {
    icon: Users2,
    title: "Real community",
    description:
      "Connect with peers and mentors in a vibrant community — events, discussions, and a job board that keeps you moving forward.",
  },
  {
    icon: Award,
    title: "Verified certificates",
    description:
      "Earn certificates that verify instantly and showcase your skills to employers with a shareable credential link.",
  },
];

const stats = [
  { value: "500+", label: "Learners" },
  { value: "50+", label: "Courses" },
  { value: "100+", label: "Certificates issued" },
  { value: "25+", label: "Mentors" },
];

const footerLinks = [
  { label: "About", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
];

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ------------------------------------------------------------------ */}
      {/*  Navigation                                                         */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-white">
              <Sparkles className="h-4 w-4" strokeWidth={2.25} />
            </div>
            <span className="text-[17px] font-bold tracking-tight text-text-primary">
              Novr Academy
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-card px-3 py-2 text-[14px] font-medium text-text-secondary transition hover:bg-surface hover:text-text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className="rounded-card px-4 py-2 text-[14px] font-medium text-text-secondary transition hover:bg-surface hover:text-text-primary"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-card bg-blue px-4 py-2 text-[14px] font-medium text-white shadow-card transition hover:bg-blue/90 hover:shadow-card-hover"
            >
              Get started
            </Link>
          </div>

          {/* Mobile menu */}
          <MobileNav />
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/*  Hero                                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-gradient-brand">
        {/* Dot pattern overlay — matches login page */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center sm:py-32 lg:py-40">
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-white sm:text-[34px] lg:text-[38px]">
            Learning and community, in one place.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-white/85 sm:text-[16px]">
            Courses, certificates, mentorship, and a network that grows with you
            — all under one roof.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center rounded-card bg-white px-6 py-3 text-[15px] font-semibold text-blue shadow-card transition hover:bg-white/90 sm:w-auto"
            >
              Start learning
            </Link>
            <Link
              href="#features"
              className="inline-flex w-full items-center justify-center rounded-card border border-white/40 px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-white/10 sm:w-auto"
            >
              View courses
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Features                                                           */}
      {/* ------------------------------------------------------------------ */}
      <section id="features" className="bg-background py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-[24px] font-semibold tracking-tight text-text-primary sm:text-[28px]">
            Everything you need to grow
          </h2>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-card border border-border bg-background p-6 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-light">
                  <feature.icon
                    className="h-5 w-5 text-blue"
                    strokeWidth={2}
                  />
                </div>
                <h3 className="mt-4 text-[16px] font-semibold text-text-primary">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Courses                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section id="courses" className="bg-surface py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-[24px] font-semibold tracking-tight text-text-primary sm:text-[28px]">
            Explore our courses
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-[15px] text-text-secondary sm:text-[16px]">
            From cybersecurity to cloud computing — practical courses built by
            industry experts.
          </p>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link
                key={course.title}
                href="/signup"
                className="group rounded-card border border-border bg-background p-6 shadow-card transition hover:-translate-y-0.5 hover:border-blue/30 hover:shadow-card-hover"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-light">
                  <course.icon
                    className="h-5 w-5 text-blue"
                    strokeWidth={2}
                  />
                </div>
                <h3 className="mt-4 text-[16px] font-semibold text-text-primary">
                  {course.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">
                  {course.description}
                </p>
                <span className="mt-4 inline-block text-[14px] font-medium text-blue transition group-hover:underline">
                  Learn more →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Community                                                          */}
      {/* ------------------------------------------------------------------ */}
      <section id="community" className="bg-background py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-[24px] font-semibold tracking-tight text-text-primary sm:text-[28px]">
            Join a thriving community
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-[15px] text-text-secondary sm:text-[16px]">
            Learn alongside peers, get mentored by experts, and grow your career
            together.
          </p>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-card border border-border bg-background p-6 shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-light">
                <Users2
                  className="h-5 w-5 text-purple"
                  strokeWidth={2}
                />
              </div>
              <h3 className="mt-4 text-[16px] font-semibold text-text-primary">
                Mentorship
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">
                Get paired with experienced mentors who guide your learning
                journey and share real-world insights.
              </p>
            </div>
            <div className="rounded-card border border-border bg-background p-6 shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-light">
                <BookOpen
                  className="h-5 w-5 text-purple"
                  strokeWidth={2}
                />
              </div>
              <h3 className="mt-4 text-[16px] font-semibold text-text-primary">
                Discussions
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">
                Ask questions, share knowledge, and stay current with active
                community channels.
              </p>
            </div>
            <div className="rounded-card border border-border bg-background p-6 shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-light">
                <Award
                  className="h-5 w-5 text-purple"
                  strokeWidth={2}
                />
              </div>
              <h3 className="mt-4 text-[16px] font-semibold text-text-primary">
                Career growth
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">
                Access job boards, events, and networking opportunities designed
                for tech professionals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Stats / Social proof                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-surface py-16">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-[28px] font-bold text-blue sm:text-[32px]">
                {stat.value}
              </p>
              <p className="mt-1 text-[13px] font-medium text-text-secondary sm:text-[14px]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  CTA                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-[24px] font-semibold tracking-tight text-text-primary sm:text-[28px]">
            Ready to start your journey?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-text-secondary sm:text-[16px]">
            Join hundreds of learners already growing with Novr Academy.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center justify-center rounded-card bg-blue px-8 py-3 text-[15px] font-semibold text-white shadow-card transition hover:bg-blue/90 hover:shadow-card-hover"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Footer                                                             */}
      {/* ------------------------------------------------------------------ */}
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-brand text-white">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.25} />
            </div>
            <span className="text-[14px] font-semibold text-text-primary">
              Novr Academy
            </span>
            <span className="text-[13px] text-text-secondary">
              © {new Date().getFullYear()}
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-5">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[13px] text-text-secondary transition hover:text-text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
