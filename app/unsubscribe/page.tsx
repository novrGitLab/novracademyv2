import { apiFetch } from "@/lib/api";

export default async function UnsubscribePage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token;
  let ok = false;

  if (token) {
    ok = await apiFetch(`/newsletter/unsubscribe?token=${encodeURIComponent(token)}`, { method: "DELETE" })
      .then(() => true)
      .catch(() => false);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-12">
      <div className="w-full rounded-card border border-border bg-background p-8 text-center shadow-card">
        <p className="text-[13px] font-medium uppercase tracking-widest text-text-secondary">Novr Academy</p>
        {ok ? (
          <>
            <h1 className="mt-4 text-[22px] font-semibold text-text-primary">You&apos;re unsubscribed</h1>
            <p className="mt-2 text-[15px] text-text-secondary">
              You won&apos;t receive any more newsletter emails from us. You can re-subscribe any time.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-4 text-[22px] font-semibold text-text-primary">Link expired or invalid</h1>
            <p className="mt-2 text-[15px] text-text-secondary">
              We couldn&apos;t find a matching subscription for this link.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
