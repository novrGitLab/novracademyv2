import { Ticket } from "lucide-react";
import { apiFetchSafe } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";
import { deactivateEnrollmentCodeAction } from "./actions";
import { CreateCodeModal } from "./CreateCodeModal";

interface EnrollmentCodeRow {
  id: string;
  code: string;
  discountType: "FREE" | "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  course: { id: string; title: string };
}

interface Course {
  id: string;
  title: string;
}

function discountLabel(row: EnrollmentCodeRow) {
  if (row.discountType === "FREE") return "Free access";
  if (row.discountType === "PERCENTAGE") return `${row.discountValue}% off`;
  return `$${(row.discountValue / 100).toFixed(2)} off`;
}

export default async function EnrollmentCodesPage() {
  const [codes, { courses }] = await Promise.all([
    apiFetchSafe<EnrollmentCodeRow[]>("/enrollment-codes", []),
    apiFetchSafe<{ courses: Course[] }>("/courses", { courses: [] }),
  ]);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary">Enrollment codes</h1>
          <p className="mt-1 text-[15px] text-text-secondary">Free-access and discount codes learners can redeem.</p>
        </div>
        <CreateCodeModal courses={courses} />
      </div>

      {codes.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Ticket} title="No codes yet" description="Create a code to grant free or discounted access." />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-card border border-border">
          <table className="w-full text-left text-[15px]">
            <thead className="bg-surface text-[13px] text-text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium">Discount</th>
                <th className="px-4 py-3 font-medium">Uses</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {codes.map((row) => {
                const expired = row.expiresAt ? new Date(row.expiresAt) < new Date() : false;
                const exhausted = row.usedCount >= row.maxUses;
                const status = !row.isActive ? "Deactivated" : expired ? "Expired" : exhausted ? "Exhausted" : "Active";
                return (
                  <tr key={row.id} className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-text-primary">{row.code}</td>
                    <td className="px-4 py-3 text-text-secondary">{row.course.title}</td>
                    <td className="px-4 py-3 text-text-secondary">{discountLabel(row)}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {row.usedCount} / {row.maxUses}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {row.expiresAt ? new Date(row.expiresAt).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-pill px-2 py-1 text-[13px] ${
                          status === "Active" ? "bg-success-light text-success" : "bg-surface text-text-secondary"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.isActive && (
                        <form action={deactivateEnrollmentCodeAction.bind(null, row.id)}>
                          <button type="submit" className="text-[13px] font-medium text-red hover:underline">
                            Deactivate
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
