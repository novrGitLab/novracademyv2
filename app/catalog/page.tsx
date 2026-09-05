import { BookOpen, Search } from "lucide-react";
import { Badge, Card } from "@/components/DesignSystem";
import { formatPrice } from "@/lib/currency";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  priceCents: number;
  currency: string;
  status: string;
  _count: { lessons: number; enrollments: number };
}

async function getCourses(): Promise<Course[]> {
  try {
    const res = await fetch(`${API_URL}/courses/public`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.courses ?? [];
  } catch {
    return [];
  }
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const courses = await getCourses();
  const search = searchParams.q ?? "";

  const filteredCourses = courses.filter(
    (c) =>
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4451A2] via-[#5a4a9e] to-[#683290] py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="font-serif text-4xl font-bold">Course Catalog</h1>
          <p className="mt-3 max-w-xl text-lg text-white/80">
            Explore our cybersecurity courses and start learning today.
          </p>
          {/* Search */}
          <form className="mt-6 max-w-md" method="get">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="q"
                placeholder="Search courses..."
                defaultValue={search}
                className="w-full rounded-lg border-0 bg-white/10 py-3 pl-10 pr-4 text-white placeholder-white/60 backdrop-blur focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Course Grid */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        {filteredCourses.length === 0 ? (
          <div className="py-16 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No courses found</h3>
            <p className="mt-2 text-gray-500">
              {search ? "Try a different search term." : "Check back soon for new courses."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => {
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
                    {course.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={course.thumbnailUrl}
                        alt={`Thumbnail for ${course.title}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#4451A2] via-[#5a4a9e] to-[#683290]">
                        <BookOpen aria-hidden="true" className="h-8 w-8 text-white/70" />
                      </div>
                    )}
                    <span className="absolute left-3 top-3">
                      <Badge variant={isFree ? "blue" : "purple"}>
                        {isFree ? "Free" : "Premium"}
                      </Badge>
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <span className="text-xs font-medium text-[#767782]">
                      {course._count.lessons} {course._count.lessons === 1 ? "lesson" : "lessons"}
                    </span>

                    <h2 className="mt-3 font-serif text-xl font-semibold leading-snug text-[#1A1A2E] transition-colors group-hover:text-[#4451A2]">
                      {course.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#666666]">
                      {course.description ?? "No description available."}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-6">
                      <Badge variant={isFree ? "blue" : "purple"}>
                        {isFree ? "Free" : formatPrice(course.priceCents, course.currency)}
                      </Badge>
                      <a
                        href={`/dashboard/learn/${course.id}`}
                        className="rounded-lg bg-[#683290] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#542573]"
                      >
                        View Course
                      </a>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
