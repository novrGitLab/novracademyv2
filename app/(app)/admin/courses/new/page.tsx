import { createCourseAction } from "../actions";

export default function NewCoursePage() {
  return (
    <div className="max-w-xl">
      <h1 className="text-[24px] font-semibold text-text-primary">New course</h1>

      <form action={createCourseAction} className="mt-6 space-y-4">
        <Field label="Title" name="title" required />
        <Field label="Description" name="description" textarea />
        <Field label="Thumbnail image URL" name="thumbnailUrl" placeholder="https://…" />

        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (cents)" name="priceCents" type="number" defaultValue="0" />
          <Field label="Currency" name="currency" defaultValue="USD" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Pass mark %" name="passMarkPct" type="number" defaultValue="70" />
          <Field label="Default validity (days)" name="defaultValidityDays" type="number" placeholder="Lifetime" />
        </div>

        <label className="flex items-center gap-2 text-[15px] text-text-primary">
          <input type="checkbox" name="allowForwardScrub" className="h-4 w-4 rounded border-border" />
          Allow forward-scrubbing on video
        </label>

        <button
          type="submit"
          className="rounded-card bg-blue px-4 py-2 text-[15px] font-medium text-white hover:bg-blue/90"
        >
          Create course
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
  textarea,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-[13px] font-medium text-text-secondary">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          rows={3}
          className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
        />
      )}
    </div>
  );
}
