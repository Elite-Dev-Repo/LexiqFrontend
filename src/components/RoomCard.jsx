import { Users, Clock } from "lucide-react";

export default function RoomCard({ room, onJoin }) {
  return (
    <div className="relative rounded-2xl border-2 border-border bg-surface p-5 shadow-neubrutal transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neubrutal-lg">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
            {room.host?.username || "Host"}
          </p>
          <h3 className="mt-0.5 font-mono text-lg font-bold tracking-tight text-text bg-primary/10 px-2 py-0.5 border border-border rounded w-fit">
            {room.code}
          </h3>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-primary px-3 py-1 text-xs font-bold text-text">
          <span className="h-2 w-2 rounded-full bg-text animate-pulse" />
          LOBBY
        </span>
      </div>

      <div className="mb-5 flex items-center gap-4 text-xs font-bold text-text-secondary">
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {room.member_count || 0} / 8 Players
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {room.time_limit}s Limit
        </span>
      </div>

      <button
        onClick={() => onJoin(room)}
        className="w-full rounded-xl border-2 border-border bg-primary/20 py-2.5 text-sm font-bold text-text transition-all hover:bg-primary hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neubrutal active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer"
      >
        Join Room
      </button>
    </div>
  );
}
