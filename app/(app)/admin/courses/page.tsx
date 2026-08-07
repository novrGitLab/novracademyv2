import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import CourseDetailPageClient from "./CourseDetailPageClient";

export default async function CourseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let course = null;

  try {
    course = await apiFetch(`/courses/${params.id}`);
  } catch (error) {
    console.error("Failed to fetch course details:", error);
  }

  if (!course) {
    notFound();
  }

  return <CourseDetailPageClient course={course} />;
}