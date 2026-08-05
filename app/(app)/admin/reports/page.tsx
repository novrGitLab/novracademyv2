const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const reports = [
  { label: "Quiz results", path: "/reports/quiz-results", description: "Score, attempts, pass/fail per learner per quiz." },
  { label: "Course completion", path: "/reports/course-completion", description: "Who completed, when, and their certificate ID." },
  { label: "Enrollments", path: "/reports/enrollments", description: "All enrollments — active, expired, pending." },
  { label: "Time spent", path: "/reports/time-spent", description: "Total hours per learner across all lessons." },
  { label: "Revenue", path: "/reports/revenue", description: "Successful payments by learner, course, and provider." },
  { label: "Community engagement", path: "/reports/community-engagement", description: "Posts, reactions, events, and mentoring per member." },
];

export default function ReportsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-[24px] font-semibold text-text-primary">Reports</h1>
      <p className="mt-1 text-[15px] text-text-secondary">
        Exportable as CSV. PDF export isn't built yet — CSV covers the data-export need for now.
      </p>

      <div className="mt-6 space-y-2">
        {reports.map((r) => (
          <div key={r.path} className="flex items-center justify-between rounded-card border border-border bg-background px-4 py-3">
            <div>
              <p className="text-[15px] font-medium text-text-primary">{r.label}</p>
              <p className="text-[13px] text-text-secondary">{r.description}</p>
            </div>
            <a
              href={`${API_URL}${r.path}`}
              className="rounded-card bg-blue px-3 py-1.5 text-[13px] font-medium text-white hover:bg-blue/90"
            >
              Download CSV
            </a>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-card border border-dashed border-border p-4">
        <p className="text-[13px] font-medium text-text-secondary">Learner progress report</p>
        <form action={`${API_URL}/reports/learner-progress`} method="get" className="mt-3 flex gap-2">
          <input
            name="userId"
            required
            placeholder="Learner user ID"
            className="flex-1 rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
          />
          <button type="submit" className="rounded-card bg-blue px-4 py-2 text-[13px] font-medium text-white hover:bg-blue/90">
            Download
          </button>
        </form>
      </div>
    </div>
  );
}
