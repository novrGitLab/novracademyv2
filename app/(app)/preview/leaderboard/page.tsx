import { Trophy } from "lucide-react";
import { PageHeader } from "@/components/DesignSystem";
import { PreviewBanner } from "@/components/preview/PreviewBanner";
import { PreviewOverlay, PreviewSectionWrapper } from "@/components/preview/PreviewOverlay";

const MOCK_ENTRIES = [
  { rank: 1, name: "Alex Morgan", xp: 4850, level: "Legend", badges: 12 },
  { rank: 2, name: "Jamie Lee", xp: 4210, level: "Mentor", badges: 9 },
  { rank: 3, name: "Samir P.", xp: 3980, level: "Mentor", badges: 8 },
  { rank: 4, name: "Priya K.", xp: 3650, level: "Contributor", badges: 6 },
  { rank: 5, name: "You", xp: 0, level: "Newcomer", badges: 0, isCurrentUser: true },
];

export default function PreviewLeaderboardPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PreviewBanner />
      <PageHeader title="Leaderboard" description="Global ranking of learners by XP — sign in to see your rank." />

      <PreviewSectionWrapper
        overlay={<PreviewOverlay title="Sign in to climb the leaderboard" description="You're viewing example rankings. Sign in to earn XP from courses, labs, and challenges and see your real position." />}
      >
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
              {MOCK_ENTRIES.map((entry) => (
                <tr key={entry.rank} className={`border-b border-border last:border-b-0 ${entry.isCurrentUser ? "bg-[#683290]/5" : ""}`}>
                  <td className="px-4 py-3 text-center">
                    {entry.rank <= 3 ? (
                      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${entry.rank === 1 ? "bg-yellow-400 text-yellow-900" : entry.rank === 2 ? "bg-gray-300 text-gray-700" : "bg-orange-300 text-orange-700"}`}>{entry.rank}</span>
                    ) : (
                      <span className="text-text-secondary">{entry.rank}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-purple text-xs font-semibold text-white">{entry.name[0]}</div>
                      <div>
                        <p className={`truncate font-medium ${entry.isCurrentUser ? "text-[#683290]" : "text-text-primary"}`}>
                          {entry.name} {entry.isCurrentUser && <span className="ml-1 text-[10px] font-bold text-[#683290]">(you)</span>}
                        </p>
                        <p className="text-xs text-text-secondary">{entry.level}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{entry.xp.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right"><span className="inline-block rounded-full bg-[#683290]/10 px-2 py-0.5 text-[10px] font-bold text-[#683290]">{entry.level}</span></td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell text-text-secondary">{entry.badges}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PreviewSectionWrapper>
    </div>
  );
}
