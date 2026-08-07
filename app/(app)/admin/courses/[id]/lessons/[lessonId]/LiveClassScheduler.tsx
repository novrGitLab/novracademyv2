"use client";

import { scheduleLiveClassAction } from "../../../actions";

interface AttendanceRow {
  userId: string;
  rsvp: boolean;
  attended: boolean;
  joinedAt: string | null;
  user: { name: string | null; email: string } | null;
}

export function LiveClassScheduler({
  courseId,
  lessonId,
  liveScheduledAt,
  liveMeetingUrl,
  hasRecording,
  attendance,
}: {
  courseId: string;
  lessonId: string;
  liveScheduledAt: string | null;
  liveMeetingUrl: string | null;
  hasRecording: boolean;
  attendance: AttendanceRow[];
}) {
  const boundSchedule = scheduleLiveClassAction.bind(null, courseId, lessonId);

  // datetime-local inputs need "YYYY-MM-DDTHH:mm" with no timezone suffix.
  const defaultValue = liveScheduledAt ? new Date(liveScheduledAt).toISOString().slice(0, 16) : "";

  return (
    <div className="space-y-6">
      <div className="rounded-card border border-border bg-background p-5">
        <p className="text-[15px] font-medium text-text-primary">Schedule</p>
        <form action={boundSchedule} className="mt-3 flex items-end gap-3">
          <input
            type="datetime-local"
            name="liveScheduledAt"
            required
            defaultValue={defaultValue}
            className="rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-[#683290]"
          />
          <button
            type="submit"
            className="rounded-card bg-[#683290] px-4 py-2 text-[15px] font-medium text-white hover:bg-[#542573]"
          >
            {liveMeetingUrl ? "Reschedule" : "Create room"}
          </button>
        </form>

        {liveMeetingUrl && (
          <p className="mt-3 text-[13px] text-text-secondary">
            Room: <span className="font-mono">{liveMeetingUrl}</span>
          </p>
        )}
        {hasRecording && <p className="mt-1 text-[13px] text-success">Recording available</p>}
      </div>

      <div className="rounded-card border border-border bg-background p-5">
        <p className="text-[15px] font-medium text-text-primary">Attendance</p>
        <div className="mt-3 space-y-1.5">
          {attendance.map((row) => (
            <div key={row.userId} className="flex items-center justify-between text-[13px]">
              <span className="text-text-primary">{row.user?.name ?? row.user?.email ?? row.userId}</span>
              <span className={row.attended ? "text-success" : "text-text-secondary"}>
                {row.attended ? "Attended" : row.rsvp ? "RSVP'd" : "Not going"}
              </span>
            </div>
          ))}
          {attendance.length === 0 && <p className="text-[13px] text-text-secondary">No RSVPs yet.</p>}
        </div>
      </div>
    </div>
  );
}
