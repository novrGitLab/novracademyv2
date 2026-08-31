"use client";

import { PdfUploader } from "./PdfUploader";

interface LessonDetailClientProps {
  courseId: string;
  lessonId: string;
  hasFile: boolean;
  allowDownload: boolean;
}

export function LessonDetailClient({ courseId, lessonId, hasFile, allowDownload }: LessonDetailClientProps) {
  return (
    <PdfUploader
      courseId={courseId}
      lessonId={lessonId}
      hasFile={hasFile}
      allowDownload={allowDownload}
    />
  );
}
