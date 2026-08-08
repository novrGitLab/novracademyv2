import { BookOpen, Clock3, Layers3 } from "lucide-react";
import { Badge, Button, Card, EmptyState, PageHeader } from "@/components/DesignSystem";
import { apiFetchSafe } from "@/lib/api";

interface Course {
  id: string;
  title: string;
  description: string | null;
  priceCents: number;
  currency: string;
  status: string;
  _count: { lessons: number; enrollments: number };
}

export default async function LearnPage() {
  const { courses } = await apiFetchSafe<{ courses: Course[] }>("/courses", { courses: [] });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Browse Courses"
        description="Explore cybersecurity courses to build your skills and earn certificates."
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses available yet"
          description="Check back soon — new content is on the way."
          className="mt-8"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, index) => {
            const isFree = course.priceCents === 0;
            const accent = index % 2 === 0 ? "blue" : "purple";

            return (
              <Card
                key={course.id}
                padding="none"
                hover
                className="group flex h-full flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-1"
              >
                <div
                  aria-hidden="true"
                  className={
                    accent === "blue"
                      ? "h-2 bg-gradient-to-r from-[#4451A2] to-[#6874c4]"
                      : "h-2 bg-gradient-to-r from-[#683290] to-[#9863bc]"
                  }
                />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <Badge variant={isFree ? "blue" : "purple"}>
                      {isFree ? "Free" : "Premium"}
                    </Badge>
                    <span className="text-xs font-medium text-[#767782]">
                      {course._count.lessons} {course._count.lessons === 1 ? "lesson" : "lessons"}
                    </span>
                  </div>

                  <h2 className="mt-4 font-serif text-xl font-semibold leading-snug text-[#1A1A2E] transition-colors group-hover:text-[#4451A2]">
                    {course.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#666666]">
                    {course.description ?? "No description available."}
                  </p>

                  <div className="mt-5 flex items-center gap-4 text-xs text-[#767782]">
                    <span className="inline-flex items-center gap-1.5">
                      <Layers3 aria-hidden="true" className="h-3.5 w-3.5 text-[#683290]" />
                      Certificate included
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 aria-hidden="true" className="h-3.5 w-3.5 text-[#4451A2]" />
                      Self-paced
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-4 pt-6">
                    <Badge variant={isFree ? "blue" : "purple"}>
                      {isFree ? "Free" : `${(course.priceCents / 100).toFixed(2)} ${course.currency}`}
                    </Badge>
                    <Button
                      href={`/dashboard/learn/${course.id}`}
                    >
                      View Course
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
