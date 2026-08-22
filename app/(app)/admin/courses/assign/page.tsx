"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BackLink } from "@/components/DesignSystem";
import { Toast } from "@/components/ui/Toast";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Search,
  Send,
  Users,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface Course {
  id: string;
  title: string;
  description: string | null;
  _count: { lessons: number };
  status: string;
}

interface Employee {
  id: string;
  name: string | null;
  email: string;
  department?: string;
  status: string;
}

/* -------------------------------------------------------------------------- */
/*  Step indicators                                                            */
/* -------------------------------------------------------------------------- */

function StepIndicator({ current }: { current: number }) {
  const steps = ["Select Course", "Select Employees", "Confirm & Assign"];
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold ${
              i + 1 <= current
                ? "bg-[#683290] text-white"
                : "bg-[#F1F3F5] text-[#9CA3AF]"
            }`}
          >
            {i + 1 < current ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
          </div>
          <span
            className={`hidden text-[13px] sm:inline ${
              i + 1 <= current ? "font-medium text-[#1A1A2E]" : "text-[#9CA3AF]"
            }`}
          >
            {label}
          </span>
          {i < steps.length - 1 && (
            <ChevronRight className="h-4 w-4 text-[#D1D5DB]" />
          )}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step 1: Select Course                                                      */
/* -------------------------------------------------------------------------- */

function Step1({
  selected,
  onSelect,
  onNext,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
}) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/proxy/courses?status=PUBLISHED", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setCourses(d.courses ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-[20px] font-semibold text-[#1A1A2E]">
        Select a Course
      </h2>
      <p className="text-[14px] text-[#6B7280]">
        Choose which course to assign to your employees.
      </p>

      {loading ? (
        <div className="py-8 text-center">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-4 border-[#F1F3F5] border-t-[#683290]" />
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => onSelect(course.id)}
              className={`w-full rounded-[8px] border p-4 text-left transition ${
                selected === course.id
                  ? "border-[#683290] bg-[#F4ECF8] shadow-[0_0_0_1px_#683290]"
                  : "border-[#E5E7EB] bg-white hover:border-[#683290]/30 hover:shadow-[0_1px_3px_rgba(26,26,46,0.08)]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#E5E7EB]">
                    {selected === course.id && (
                      <div className="h-2.5 w-2.5 rounded-full bg-[#683290]" />
                    )}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-[#1A1A2E]">
                      {course.title}
                    </p>
                    <p className="mt-0.5 text-[13px] text-[#6B7280]">
                      {course.description || "No description"}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-[12px] text-[#9CA3AF]">
                  {course._count.lessons} lessons
                </span>
              </div>
            </button>
          ))}
          {courses.length === 0 && (
            <p className="py-8 text-center text-[14px] text-[#9CA3AF]">
              No published courses available.
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          disabled={!selected}
          className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-6 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573] disabled:opacity-50"
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step 2: Select Employees                                                   */
/* -------------------------------------------------------------------------- */

function Step2({
  selected,
  onToggle,
  onToggleAll,
  onBack,
  onNext,
}: {
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("ALL");

  useEffect(() => {
    fetch("/api/proxy/users?pageSize=100", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setEmployees(d.users ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const departments = [
    ...new Set(employees.map((e) => e.department).filter(Boolean)),
  ].sort();

  const filtered = employees.filter((e) => {
    const matchSearch =
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = dept === "ALL" || e.department === dept;
    return matchSearch && matchDept;
  });

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((e) => selected.has(e.id));

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-[20px] font-semibold text-[#1A1A2E]">
        Select Employees
      </h2>
      <p className="text-[14px] text-[#6B7280]">
        Pick which employees to assign this course to. {selected.size} selected.
      </p>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-[6px] border border-[#E5E7EB] bg-[#F8F9FB] pl-8 pr-3 text-[13px] text-[#1A1A2E] outline-none focus:border-[#683290] focus:bg-white"
          />
        </div>
        <select
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          className="h-9 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none focus:border-[#683290]"
        >
          <option value="ALL">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-[13px] text-[#6B7280]">
        <input
          type="checkbox"
          checked={allVisibleSelected}
          onChange={onToggleAll}
          className="h-4 w-4 rounded accent-[#683290]"
        />
        Select all ({filtered.length})
      </label>

      {/* Employee list */}
      {loading ? (
        <div className="py-8 text-center">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-4 border-[#F1F3F5] border-t-[#683290]" />
        </div>
      ) : (
        <div className="max-h-[350px] overflow-y-auto rounded-[8px] border border-[#E5E7EB] bg-white">
          {filtered.map((emp) => (
            <label
              key={emp.id}
              className="flex items-center gap-3 border-b border-[#E5E7EB] px-4 py-3 last:border-b-0 transition hover:bg-[#F8F9FB]"
            >
              <input
                type="checkbox"
                checked={selected.has(emp.id)}
                onChange={() => onToggle(emp.id)}
                className="h-4 w-4 rounded accent-[#683290]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-[#1A1A2E]">
                  {emp.name}
                </p>
                <p className="text-[12px] text-[#6B7280]">{emp.email}</p>
              </div>
              {emp.department && (
                <span className="rounded-full bg-[#F8F9FB] px-2 py-0.5 text-[11px] text-[#6B7280]">
                  {emp.department}
                </span>
              )}
            </label>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-[13px] text-[#9CA3AF]">
              No employees match your filters.
            </p>
          )}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="rounded-[8px] border border-[#E5E7EB] px-6 py-2.5 text-[13px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={selected.size === 0}
          className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-6 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573] disabled:opacity-50"
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step 3: Confirm & Assign                                                   */
/* -------------------------------------------------------------------------- */

function Step3({
  courseId,
  employeeIds,
  courses,
  employees,
  onBack,
  onAssign,
  assigning,
}: {
  courseId: string;
  employeeIds: Set<string>;
  courses: Course[];
  employees: Employee[];
  onBack: () => void;
  onAssign: () => void;
  assigning: boolean;
}) {
  const [dueDate, setDueDate] = useState("");
  const course = courses.find((c) => c.id === courseId);
  const selectedEmps = employees.filter((e) => employeeIds.has(e.id));

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-[20px] font-semibold text-[#1A1A2E]">
        Confirm & Assign
      </h2>
      <p className="text-[14px] text-[#6B7280]">
        Review and finalize the assignment.
      </p>

      {/* Summary */}
      <div className="rounded-[8px] border border-[#E5E7EB] bg-[#F8F9FB] p-5">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-[#683290]" />
            <div>
              <p className="text-[13px] font-semibold text-[#1A1A2E]">
                {course?.title}
              </p>
              <p className="text-[12px] text-[#6B7280]">
                {course?._count.lessons ?? 0} lessons
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-[#683290]" />
            <div>
              <p className="text-[13px] font-semibold text-[#1A1A2E]">
                {employeeIds.size} employees
              </p>
              <p className="text-[12px] text-[#6B7280]">
                {selectedEmps
                  .slice(0, 3)
                  .map((e) => e.name)
                  .join(", ")}
                {employeeIds.size > 3 && ` +${employeeIds.size - 3} more`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5">
        <label
          htmlFor="dueDate"
          className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]"
        >
          DUE DATE (OPTIONAL)
        </label>
        <input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none focus:border-[#683290]"
        />
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="rounded-[8px] border border-[#E5E7EB] px-6 py-2.5 text-[13px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]"
        >
          Back
        </button>
        <button
          onClick={onAssign}
          disabled={assigning}
          className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-6 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573] disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          {assigning ? "Assigning..." : "Assign Course"}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Page                                                                  */
/* -------------------------------------------------------------------------- */

export default function AssignCoursePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(
    new Set()
  );
  const [assigning, setAssigning] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Fetch data for Step 3 summary
  const [courses, setCourses] = useState<Course[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    if (step === 3) {
      fetch("/api/proxy/courses?status=PUBLISHED", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setCourses(d.courses ?? []))
        .catch(() => {});
      fetch("/api/proxy/users?pageSize=100", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setEmployees(d.users ?? []))
        .catch(() => {});
    }
  }, [step]);

  function toggleEmployee(id: string) {
    setSelectedEmployees((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAllEmployees() {
    // This is handled in Step2 component
  }

  async function handleAssign() {
    setAssigning(true);
    try {
      // Assign each selected employee to the course
      const promises = Array.from(selectedEmployees).map((empId) => {
        const emp = employees.find((e) => e.id === empId);
        if (!emp) return Promise.resolve();
        return fetch(`/api/proxy/courses/${selectedCourse}/enroll/assign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emp.email }),
        });
      });
      await Promise.all(promises);
      setToast({
        message: `Course assigned to ${selectedEmployees.size} employees`,
        type: "success",
      });
      setTimeout(() => router.push("/admin/compliance"), 1500);
    } catch (err) {
      setToast({
        message: `Failed to assign: ${(err as Error).message}`,
        type: "error",
      });
      setAssigning(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BackLink href="/admin/compliance" label="Back to Compliance" />

      <div>
        <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">
          Assign Course
        </h1>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Assign a mandatory or optional course to your employees.
        </p>
      </div>

      <StepIndicator current={step} />

      <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
        {step === 1 && (
          <Step1
            selected={selectedCourse}
            onSelect={setSelectedCourse}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <Step2
            selected={selectedEmployees}
            onToggle={toggleEmployee}
            onToggleAll={() => {
              // Handled inside Step2
            }}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <Step3
            courseId={selectedCourse!}
            employeeIds={selectedEmployees}
            courses={courses}
            employees={employees}
            onBack={() => setStep(2)}
            onAssign={handleAssign}
            assigning={assigning}
          />
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
