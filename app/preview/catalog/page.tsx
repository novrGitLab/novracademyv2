import Link from "next/link";
import { BookOpen, Search } from "lucide-react";
import { Badge, Card } from "@/components/DesignSystem";
import { formatPrice } from "@/lib/currency";

const MOCK_COURSES = [
  {
    id: "preview-1",
    title: "Cybersecurity Fundamentals",
    description: "Learn the basics of cybersecurity, including threats, vulnerabilities, and protective measures.",
    priceCents: 0,
    currency: "USD",
    lessons: 8,
    thumbnail: null,
  },
  {
    id: "preview-2",
    title: "Network Defense Essentials",
    description: "Master network security concepts including firewalls, IDS/IPS, and secure architecture.",
    priceCents: 4999,
    currency: "USD",
    lessons: 12,
    thumbnail: null,
  },
  {
    id: "preview-3",
    title: "Ethical Hacking Basics",
    description: "Introduction to ethical hacking methodology, penetration testing, and vulnerability assessment.",
    priceCents: 7999,
    currency: "USD",
    lessons: 15,
    thumbnail: null,
  },
  {
    id: "preview-4",
    title: "Phishing Awareness",
    description: "Learn to identify and prevent phishing attacks in your organization.",
    priceCents: 0,
    currency: "USD",
    lessons: 5,
    thumbnail: null,
  },
  {
    id: "preview-5",
    title: "Incident Response Fundamentals",
    description: "How to prepare for, detect, and respond to security incidents effectively.",
    priceCents: 5999,
    currency: "USD",
    lessons: 10,
    thumbnail: null,
  },
  {
    id: "preview-6",
    title: "Compliance & Data Protection",
    description: "Understanding GDPR, SOC2, HIPAA, and other compliance frameworks.",
    priceCents: 6999,
    currency: "USD",
    lessons: 9,
    thumbnail: null,
  },
];

export default function PreviewCatalogPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4451A2] via-[#5a4a9e] to-[#683290] px-4 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <Link href="/preview/dashboard" className="mb-4 inline-block text-white/70 hover:text-white">
            ← Back to Dashboard
          </Link>
          <h1 className="font-serif text-4xl font-bold">Course Catalog</h1>
          <p className="mt-3 max-w-xl text-lg text-white/80">
            Preview our cybersecurity courses and training programs.
          </p>
        </div>
      </div>

      {/* Course Grid */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_COURSES.map((course) => {
            const isFree = course.priceCents === 0;
            return (
              <Card
                key={course.id}
                padding="none"
                hover
                className="group flex h-full flex-col overflow-hidden border-[#E5E5E5] transition-transform duration-200 hover:-translate-y-1 hover:border-[#683290]/50"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface">
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#4451A2] via-[#5a4a9e] to-[#683290]">
                    <BookOpen aria-hidden="true" className="h-8 w-8 text-white/70" />
                  </div>
                  <span className="absolute left-3 top-3">
                    <Badge variant={isFree ? "blue" : "purple"}>
                      {isFree ? "Free" : "Premium"}
                    </Badge>
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <span className="text-xs font-medium text-[#767782]">
                    {course.lessons} lessons
                  </span>

                  <h2 className="mt-3 font-serif text-xl font-semibold leading-snug text-[#1A1A2E] transition-colors group-hover:text-[#4451A2]">
                    {course.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#666666]">
                    {course.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-6">
                    <Badge variant={isFree ? "blue" : "purple"}>
                      {isFree ? "Free" : formatPrice(course.priceCents, course.currency)}
                    </Badge>
                    <Link
                      href={`/dashboard/learn/${course.id}`}
                      className="rounded-lg bg-[#683290] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#542573]"
                    >
                      Preview
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-[#4451A2] to-[#683290] p-8 text-center text-white">
          <h3 className="font-serif text-2xl font-bold">Ready to enroll?</h3>
          <p className="mt-2 text-white/80">Create a free account to access all courses and track your progress.</p>
          <Link
            href="/register"
            className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-medium text-[#683290] transition hover:bg-white/90"
          >
            Create free account
          </Link>
        </div>
      </div>
    </div>
  );
}
