"use client";

import { useState } from "react";
import { PdfUploader } from "./PdfUploader";
import { SlidesGeneratorModal } from "./SlidesGeneratorModal";

interface LessonDetailClientProps {
  courseId: string;
  lessonId: string;
  hasFile: boolean;
  allowDownload: boolean;
}

export function LessonDetailClient({ courseId, lessonId, hasFile, allowDownload }: LessonDetailClientProps) {
  const [showSlidesModal, setShowSlidesModal] = useState(false);

  return (
    <>
      <PdfUploader
        courseId={courseId}
        lessonId={lessonId}
        hasFile={hasFile}
        allowDownload={allowDownload}
        onGenerateSlides={() => setShowSlidesModal(true)}
      />
      {showSlidesModal && (
        <SlidesGeneratorModal
          courseId={courseId}
          lessonId={lessonId}
          onClose={() => setShowSlidesModal(false)}
          onGenerated={() => window.location.reload()}
        />
      )}
    </>
  );
}
