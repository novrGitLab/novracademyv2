"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { BackLink } from "@/components/DesignSystem";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Search,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface Course {
  id: string;
  title: string;
  description: string;
  lessons: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  status: string;
}

/* -------------------------------------------------------------------------- */
/*  Static data                                                                */
/* -------------------------------------------------------------------------- */

const courses: Course[] = [
  { id: "c1", title: "Security Basics", description: "Introduction to cybersecurity principles and best practices for all employees.", lessons: 8, status: "PUBLISHED" },
  { id: "c2", title: "Data Privacy Fundamentals", description: "Understanding GDPR, data handling, and privacy compliance requirements.", lessons: 6, status: "PUBLISHED" },
  { id: "c3", title: "Incident Response 101", description: "How to identify, report, and respond to security incidents effectively.", lessons: 5, status: "PUBLISHED" },
  { id: "c4", title: "Phishing Awareness", description: "Recognizing and avoiding phishing attempts in email, chat, and web.", lessons: 4, status: "PUBLISHED" },
  { id: "c5", title: "Password Security", description: "Creating and managing strong passwords, MFA setup, and credential hygiene.", lessons: 3, status: "DRAFT" },
];

const employees: Employee[] = [
  { id: "1", name: "Sarah Jenkins", email: "sarah@acme.com", department: "Engineering", status: "ACTIVE" },
  { id: "2", name: "Marcus Chen", email: "marcus@acme.com", department: "Sales", status: "ACTIVE" },
  { id: "3", name: "Elena Rostova", email: "elena@acme.com", department: "HR", status: "ACTIVE" },
  { id: "4", name: "Amina Yusuf", email: "amina@acme.com", department: "Marketing", status: "ACTIVE" },
  { id: "5", name: "Tunde Bakare", email: "tunde@acme.com", department: "Operations", status: "ACTIVE" },
  { id: "6", name: "Fatima Bello", email: "fatima@acme.com", department: "Finance", status: "ACTIVE" },
  { id: "7", name: "Chidi Eze", email: "chidi@acme.com", department: "Engineering", status: "ACTIVE" },
  { id: "8", name: "Ngozi Okafor", email: "ngozi@acme.com", department: "Legal", status: "ACTIVE" },
];

const departments = [...new Set(employees.map((e) => e.department))].sort();

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
  const published = courses.filter((c) => c.status === "PUBLISHED");
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif text-[20px] font-semibold text-[#1A1A2E]">Select a Course</h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">Choose which course to assign to your employees.</p>
      </div>
      <div className="space-y-3">
        {published.map((course) => (
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
                  <p className="text-[14px] font-medium text-[#1A1A2E]">{course.title}</p>
                  <p className="mt-0.5 text-[13px] text-[#6B7280]">{course.description}</p>
                </div>
              </div>
              <span className="shrink-0 text-[12px] text-[#9CA3AF]">{course.lessons} lessons</span>
            </div>
          </button>
        ))}
      </div>
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
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("ALL");

  const filtered = employees.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = dept === "ALL" || e.department === dept;
    return matchSearch && matchDept;
  });

  const allVisibleSelected = filtered.length > 0 && filtered.every((e) => selected.has(e.id));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif text-[20px] font-semibold text-[#1A1A2E]">Select Employees</h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Pick which employees to assign this course to. {selected.size} selected.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[8px] border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-4 text-[13px] text-[#1A1A2E] outline-none transition focus:border-[#683290]"
          />
        </div>
        <select
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          className="h-10 rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none transition focus:border-[#683290]"
        >
          <option value="ALL">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Select all */}
      <label className="flex items-center gap-2 text-[13px] text-[#6B7280]">
        <input
          type="checkbox"
          checked={allVisibleSelected}
          onChange={onToggleAll}
          className="h-4 w-4 rounded border-[#E5E7EB] accent-[#683290]"
        />
        Select all ({filtered.length})
      </label>

      {/* Employee list */}
      <div className="max-h-[400px] overflow-y-auto rounded-[8px] border border-[#E5E7EB] bg-white">
        {filtered.map((emp) => (
          <label
            key={emp.id}
            className="flex items-center gap-3 border-b border-[#E5E7EB] px-4 py-3 last:border-b-0 transition hover:bg-[#F8F9FB]"
          >
            <input
              type="checkbox"
              checked={selected.has(emp.id)}
              onChange={() => onToggle(emp.id)}
              className="h-4 w-4 rounded border-[#E5E7EB] accent-[#683290]"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-[#1A1A2E]">{emp.name}</p>
              <p className="text-[12px] text-[#6B7280]">{emp.email}</p>
            </div>
            <span className="rounded-full bg-[#F8F9FB] px-2 py-0.5 text-[11px] text-[#6B7280]">{emp.department}</span>
          </label>
        ))}
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-[13px] text-[#9CA3AF]">No employees match your filters.</p>
        )}
      </div>

      {/* Nav buttons */}
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
  onBack,
  onAssign,
  assigning,
}: {
  courseId: string;
  employeeIds: Set<string>;
  onBack: () => void;
  onAssign: () => void;
  assigning: boolean;
}) {
  const [dueDate, setDueDate] = useState("");
  const [mandatory, setMandatory] = useState(true);

  const course = courses.find((c) => c.id === courseId);
  const selectedEmployees = employees.filter((e) => employeeIds.has(e.id));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif text-[20px] font-semibold text-[#1A1A2E]">Confirm & Assign</h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">Review and finalize the assignment.</p>
      </div>

      {/* Summary */}
      <div className="rounded-[8px] border border-[#E5E7EB] bg-[#F8F9FB] p-5">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-[#683290]" />
            <div>
              <p className="text-[13px] font-semibold text-[#1A1A2E]">{course?.title}</p>
              <p className="text-[12px] text-[#6B7280]">{course?.lessons} lessons</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-[#683290]" />
            <div>
              <p className="text-[13px] font-semibold text-[#1A1A2E]">{employeeIds.size} employees</p>
              <p className="text-[12px] text-[#6B7280]">
                {selectedEmployees.slice(0, 3).map((e) => e.name).join(", ")}
                {employeeIds.size > 3 && ` +${employeeIds.size - 3} more`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-4 rounded-[8px] border border-[#E5E7EB] bg-white p-5">
        <div>
          <label htmlFor="dueDate" className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">DUE DATE (OPTIONAL)</label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none transition focus:border-[#683290]"
          />
        </div>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={mandatory}
            onChange={(e) => setMandatory(e.target.checked)}
            className="h-4 w-4 rounded border-[#E5E7EB] accent-[#683290]"
          />
          <div>
            <p className="text-[13px] font-medium text-[#1A1A2E]">Mark as mandatory</p>
            <p className="text-[12px] text-[#6B7280]">Employees must complete this course by the due date.</p>
          </div>
        </label>
      </div>

      {/* Nav buttons */}
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
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [assigning, setAssigning] = useState(false);

  function toggleEmployee(id: string) {
    setSelectedEmployees((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAllEmployees() {
    setSelectedEmployees((prev) => {
      if (prev.size === employees.length) return new Set();
      return new Set(employees.map((e) => e.id));
    });
  }

  async function handleAssign() {
    setAssigning(true);
    // TODO: Replace with actual API call
    console.log("Assigning course:", {
      courseId: selectedCourse,
      employeeIds: Array.from(selectedEmployees),
    });
    await new Promise((r) => setTimeout(r, 1000));
    router.push("/admin/courses");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BackLink href="/admin/courses" label="Back to Courses" />

      <div>
        <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">Assign Course</h1>
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
            onToggleAll={toggleAllEmployees}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <Step3
            courseId={selectedCourse!}
            employeeIds={selectedEmployees}
            onBack={() => setStep(2)}
            onAssign={handleAssign}
            assigning={assigning}
          />
        )}
      </div>
    </div>
  );
}
