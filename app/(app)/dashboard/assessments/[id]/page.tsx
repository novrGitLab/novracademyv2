import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { AssessmentTaker, type AssessmentQuestionForLearner } from "./AssessmentTaker";

interface AssessmentDetail {
  id: string;
  title: string;
  type: "BASELINE" | "MONTHLY" | "CLOSING";
  questions: {
    id: string;
    prompt: string;
    type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
    options: string[] | null;
    // correctAnswer intentionally not read into this type — never forwarded to the client.
  }[];
}

export default async function TakeAssessmentPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { as?: string };
}) {
  const assessment = await apiFetch<AssessmentDetail>(`/assessments/${params.id}`).catch(() => null);
  if (!assessment) notFound();

  const as = (searchParams.as as "BASELINE" | "MONTHLY" | "CLOSING") ?? assessment.type;

  // Strips correctAnswer before this ever reaches client-side props — the
  // client component only receives what learners are allowed to see.
  const questions: AssessmentQuestionForLearner[] = assessment.questions.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    type: q.type,
    options: q.options,
  }));

  return (
    <div className="mx-auto max-w-xl py-6">
      <Link
        href="/dashboard/assessments"
        className="mb-4 inline-flex items-center gap-1.5 text-[14px] text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to assessments
      </Link>

      <h1 className="mb-4 text-[22px] font-semibold text-text-primary">{assessment.title}</h1>

      {questions.length === 0 ? (
        <p className="text-[15px] text-text-secondary">This assessment has no questions yet.</p>
      ) : (
        <AssessmentTaker assessmentId={assessment.id} as={as} questions={questions} />
      )}
    </div>
  );
}
