import { Trophy, Medal } from "lucide-react";

export default function ScoreBoard({ scores, currentUserId }) {
  if (!scores?.length) return null;

  const sorted = [...scores].sort((a, b) => b.score - a.score);

  const icons = [
    <Trophy key="1" className="h-4 w-4 text-text" />,
    <Medal key="2" className="h-4 w-4 text-text-secondary" />,
    <Medal key="3" className="h-4 w-4 text-amber-700" />,
  ];

  return (
    <div className="rounded-2xl border-2 border-border bg-surface p-5 shadow-neubrutal">
      <h3 className="mb-4 text-sm font-bold text-text-secondary uppercase tracking-wider">
        Scoreboard
      </h3>
      <div className="space-y-3">
        {sorted.map((entry, i) => (
          <div
            key={entry.user.id}
            className={`flex items-center justify-between rounded-xl px-4 py-2.5 border-2 border-border transition-all ${
              entry.user.id === currentUserId
                ? "bg-primary shadow-neubrutal-sm font-bold text-text"
                : "bg-surface hover:bg-surface-hover font-semibold text-text-secondary"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-7 w-7 items-center justify-center text-sm font-bold rounded-lg border border-border ${
                  i === 0 ? "bg-primary" : "bg-surface/50"
                }`}
              >
                {i < 3 ? icons[i] : `#${i + 1}`}
              </span>
              <div>
                <p className="text-sm text-text">{entry.user.username}</p>
                {entry.user.id === currentUserId && (
                  <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                    You
                  </p>
                )}
              </div>
            </div>
            <span className="font-mono text-sm font-bold bg-surface/50 px-2 py-0.5 border border-border rounded">
              {entry.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
