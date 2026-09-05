import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiFetchSafe } from "@/lib/api";
import { PageHeader } from "@/components/DesignSystem";
import { Trophy } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  xp: number;
  reputationLevel: string;
  badgeCount: number;
}

const LEVEL_LABELS: Record<string, string> = {
  NEWCOMER: "Newcomer",
  MEMBER: "Member",
  CONTRIBUTOR: "Contributor",
  MENTOR: "Mentor",
  LEGEND: "Legend",
};

function initials(name: string | null, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  const data = await apiFetchSafe<{ entries: LeaderboardEntry[]; total: number }>("/gamification/leaderboard?limit=50", {
    entries: [],
    total: 0,
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-1 pb-8 sm:px-2">
      <PageHeader title="Leaderboard" description="Global ranking of learners by XP." />

      {data.entries.length === 0 ? (
        <div className="rounded-card border border-dashed border-border bg-background p-10 text-center">
          <Trophy className="mx-auto h-8 w-8 text-text-secondary" />
          <p className="mt-3 text-sm font-medium text-text-primary">No leaderboard data yet</p>
          <p className="mt-1 text-xs text-text-secondary">Complete courses, quizzes, and labs to earn XP and climb the ranks.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-border bg-background shadow-card overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/50 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                <th className="px-4 py-3 text-center w-16">Rank</th>
                <th className="px-4 py-3">Learner</th>
                <th className="px-4 py-3 text-right">XP</th>
                <th className="px-4 py-3 text-right">Level</th>
                <th className="px-4 py-3 text-right hidden sm:table-cell">Badges</th>
              </tr>
            </thead>
            <tbody>
              {data.entries.map((entry) => {
                const isCurrentUser = entry.userId === currentUserId;
                return (
                  <tr
                    key={entry.userId}
                    className={`border-b border-border last:border-b-0 ${isCurrentUser ? "bg-[#683290]/5" : "hover:bg-surface/50"}`}
                  >
                    <td className="px-4 py-3 text-center">
                      {entry.rank <= 3 ? (
                        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                          entry.rank === 1 ? "bg-yellow-400 text-yellow-900" :
                          entry.rank === 2 ? "bg-gray-300 text-gray-700" :
                          "bg-orange-300 text-orange-700"
                        }`}>
                          {entry.rank}
                        </span>
                      ) : (
                        <span className="text-text-secondary">{entry.rank}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-purple text-xs font-semibold text-white">
                          {entry.avatarUrl ? (
                            <img src={entry.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                          ) : (
                            initials(entry.name, entry.email)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`truncate font-medium ${isCurrentUser ? "text-[#683290]" : "text-text-primary"}`}>
                            {entry.name ?? entry.email}
                            {isCurrentUser && <span className="ml-1 text-[10px] font-bold text-[#683290]">(you)</span>}
                          </p>
                          <p className="truncate text-xs text-text-secondary">{LEVEL_LABELS[entry.reputationLevel] ?? entry.reputationLevel}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-text-primary">
                      {entry.xp.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-block rounded-full bg-[#683290]/10 px-2 py-0.5 text-[10px] font-bold text-[#683290]">
                        {LEVEL_LABELS[entry.reputationLevel] ?? entry.reputationLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell text-text-secondary">
                      {entry.badgeCount}
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
