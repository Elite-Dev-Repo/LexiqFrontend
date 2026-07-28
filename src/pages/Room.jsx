import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useRoomSocket from "../hooks/useRoomSocket";
import QuestionCard from "../components/QuestionCard";
import ScoreBoard from "../components/ScoreBoard";
import SEO from "../components/SEO";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { toast } from "sonner";
import {
  Zap,
  Copy,
  Check,
  Users,
  LogOut,
  Play,
  Crown,
  ArrowLeft,
  RefreshCw,
  Layers,
  Clock,
  Gamepad2,
} from "lucide-react";

export default function Room() {
  const { code: roomCodeFromUrl } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state, createRoom, startGame, submitAnswer, leaveRoom } =
    useRoomSocket(roomCodeFromUrl);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [decks, setDecks] = useState([]);
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [timeLimit, setTimeLimit] = useState(10);

  useEffect(() => {
    let active = true;
    api.getDecks().then(
      (data) => {
        if (!active) return;
        const list = data.results || data || [];
        setDecks(list);
        if (list.length) setSelectedDeckId(list[0].id);
      },
      () => {
        if (!active) return;
        setDecks([]);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (state.error) {
      const t = setTimeout(() => navigate("/", { replace: true }), 2000);
      return () => clearTimeout(t);
    }
  }, [state.error, navigate]);

  function handleCopy() {
    if (state.code) {
      navigator.clipboard.writeText(state.code);
      setCopied(true);
      toast.success("Room code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleCreateRoom() {
    if (!selectedDeckId) {
      toast.error("Please select a question deck");
      return;
    }
    setCreating(true);
    createRoom(selectedDeckId, timeLimit);
  }

  const waitingForPlayers = state.members.filter((m) => !m.is_host);

  if (state.phase === "connecting" && !roomCodeFromUrl && !state.code) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-x-4 border-y-4 border-y-transparent border-border bg-none rotate-45 ">
              <Gamepad2 className="h-5 w-5 text-text" />
            </div>
            <span className="text-xl font-bold text-text">Lexiq</span>
          </div>

          <div className="rounded-2xl border-2 border-border bg-surface p-6 shadow-neubrutal-lg">
            <h2 className="text-xl font-bold text-text">Create a Room</h2>
            <p className="mt-1 text-sm font-medium text-text-secondary">
              Pick a deck and set the time limit.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-bold text-text">
                  <Layers className="h-4 w-4" />
                  Question Deck
                </label>
                <select
                  value={selectedDeckId ?? ""}
                  onChange={(e) => setSelectedDeckId(Number(e.target.value))}
                  className="w-full rounded-xl border-2 border-border bg-surface py-2.5 px-4 text-sm font-bold text-text outline-none shadow-neubrutal-sm focus:border-border transition-colors focus:bg-surface-hover"
                >
                  {decks.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-bold text-text">
                  <Clock className="h-4 w-4" />
                  Time per Question
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    className="flex-1 accent-primary h-3 rounded-full bg-border appearance-none cursor-pointer"
                  />
                  <span className="font-mono text-sm font-bold text-text w-8 text-right bg-primary/20 px-2 py-0.5 border border-border rounded">
                    {timeLimit}s
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={creating || !selectedDeckId}
              className="mt-6 w-full rounded-xl border-2 border-border bg-primary py-3 text-sm font-bold text-text shadow-neubrutal transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neubrutal-lg active:translate-x-0 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {creating ? "Creating..." : "Create Room"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state.phase === "connecting") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-bold text-text-secondary">
            Connecting to room...
          </p>
        </div>
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg gap-4">
        <div className="rounded-2xl border-2 border-border bg-surface p-8 text-center max-w-sm shadow-neubrutal-lg">
          <p className="text-lg font-bold text-error mb-2">Error</p>
          <p className="text-sm font-medium text-text-secondary mb-6">
            {state.error}
          </p>
          <button
            onClick={() => navigate("/", { replace: true })}
            className="rounded-xl border-2 border-border bg-primary px-6 py-2.5 text-sm font-bold text-text shadow-neubrutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neubrutal-lg active:translate-x-0 active:translate-y-0 active:shadow-none transition-all cursor-pointer"
          >
            Back to Rooms
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "disconnected") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg gap-4 px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-text-secondary">
            Connection lost. Reconnecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title={state.code ? `Room ${state.code}` : "Room"} />
      <div className="min-h-screen bg-bg">
        <header className="flex items-center justify-between border-b-2 border-border bg-surface px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                leaveRoom();
                navigate("/", { replace: true });
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-border bg-surface text-text hover:bg-surface-hover hover:text-primary transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md border-2 border-border bg-primary">
                <Zap className="h-3.5 w-3.5 text-text" />
              </div>
              <span className="text-sm font-bold text-text">Lexiq</span>
            </div>
          </div>

          {state.code && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 rounded-xl border-2 border-border bg-surface px-4 py-2 text-sm font-mono font-bold text-text shadow-neubrutal-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neubrutal active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer"
            >
              {state.code}
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          )}

          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-bold text-text-secondary md:block">
              {user?.username}
            </span>
            <span className="h-3.5 w-3.5 rounded-full border-2 border-border bg-success animate-pulse" />
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
          {state.phase === "lobby" && (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-text">Game Lobby</h1>
                  <p className="mt-1 text-sm font-medium text-text-secondary">
                    Share the room code with friends to join the game.
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-border bg-surface p-6 shadow-neubrutal">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-sm font-bold text-text flex items-center gap-2 uppercase tracking-wider">
                      <Users className="h-4 w-4" />
                      Players ({state.members.length})
                    </h2>
                    {state.isHost && waitingForPlayers.length > 0 && (
                      <span className="text-xs font-bold text-text-tertiary">
                        {waitingForPlayers.length} waiting
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {state.members.map((m) => (
                      <div
                        key={m.user_id}
                        className={`flex items-center justify-between rounded-xl px-4 py-3 border-2 border-border shadow-neubrutal-sm transition-all ${
                          m.is_host
                            ? "bg-primary text-text font-bold"
                            : "bg-surface hover:bg-surface-hover font-semibold text-text-secondary"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold border-2 border-border ${
                              m.is_host
                                ? "bg-bg text-text"
                                : "bg-primary text-text"
                            }`}
                          >
                            {m.username?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-text">
                              {m.username}
                            </p>
                            {m.is_host && (
                              <p className="text-[10px] text-text-secondary font-bold flex items-center gap-1 uppercase tracking-wider mt-0.5">
                                <Crown className="h-3 w-3 text-text" /> Host
                              </p>
                            )}
                          </div>
                        </div>
                        {m.user_id === user?.id && (
                          <span className="text-[10px] font-bold text-text-secondary border-2 border-border bg-bg/50 rounded-md px-2 py-0.5 uppercase tracking-wider">
                            You
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border-2 border-border bg-surface p-6 text-center shadow-neubrutal">
                  <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-2">
                    Minimum players to start
                  </p>
                  <p className="text-3xl font-extrabold text-text">
                    {state.members.length}{" "}
                    <span className="text-lg font-bold text-text-secondary">
                      / 2
                    </span>
                  </p>
                </div>

                {state.isHost ? (
                  <button
                    onClick={startGame}
                    disabled={state.members.length < 1}
                    className="w-full rounded-xl border-2 border-border bg-primary py-3.5 text-sm font-bold text-text shadow-neubrutal transition-all enabled:hover:-translate-x-0.5 enabled:hover:-translate-y-0.5 enabled:hover:shadow-neubrutal-lg enabled:active:translate-x-0 enabled:active:translate-y-0 enabled:active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="h-4 w-4" />
                    Start Game
                  </button>
                ) : (
                  <div className="rounded-xl border-2 border-border bg-primary/20 p-4 text-center font-bold">
                    <p className="text-sm text-text font-bold uppercase tracking-wider">
                      Waiting for the host to start...
                    </p>
                  </div>
                )}

                <button
                  onClick={() => {
                    leaveRoom();
                    navigate("/", { replace: true });
                  }}
                  className="w-full rounded-xl border-2 border-border bg-surface py-2.5 text-sm font-bold text-text-secondary shadow-neubrutal transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neubrutal hover:text-text active:translate-x-0 active:translate-y-0 active:shadow-none flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Leave Room
                </button>
              </div>
            </div>
          )}

          {state.phase === "question" && (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <QuestionCard
                  question={state.question}
                  timeLimit={state.timeLimit}
                  questionIndex={state.questionIndex}
                  total={state.totalQuestions}
                  onAnswer={submitAnswer}
                  answerResult={state.answerResult}
                />
              </div>
              <div className="lg:col-span-1">
                <ScoreBoard scores={state.scores} currentUserId={user?.id} />
              </div>
            </div>
          )}

          {state.phase === "answered" && state.answerResult && (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <QuestionCard
                  question={state.question}
                  timeLimit={state.timeLimit}
                  questionIndex={state.questionIndex}
                  total={state.totalQuestions}
                  onAnswer={submitAnswer}
                  answerResult={state.answerResult}
                />
                <div className="mt-6 flex items-center justify-center">
                  <div className="flex items-center gap-2.5 text-sm font-bold text-text-secondary bg-primary/10 border-2 border-border px-5 py-2.5 rounded-xl shadow-neubrutal-sm">
                    <div className="h-2 w-2 animate-ping rounded-full bg-text border border-border" />
                    Waiting for other players...
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <ScoreBoard scores={state.scores} currentUserId={user?.id} />
              </div>
            </div>
          )}

          {state.phase === "results" && (
            <div className="mx-auto max-w-2xl">
              <div className="text-center mb-8 flex flex-col items-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl border-4 border-border bg-primary shadow-neubrutal mb-4">
                  <Crown className="h-8 w-8 text-text" />
                </div>
                <h1 className="text-3xl font-extrabold text-text uppercase tracking-tight">
                  Game Over!
                </h1>
                <p className="mt-2 text-sm font-bold text-text-secondary">
                  Here are the final results
                </p>
              </div>

              <div className="rounded-2xl border-2 border-border bg-surface overflow-hidden shadow-neubrutal-lg">
                {state.results.map((r, i) => (
                  <div
                    key={r.user.id}
                    className={`flex items-center justify-between px-6 py-4 border-b-2 border-border last:border-b-0 ${
                      r.user.id === user?.id
                        ? "bg-primary font-bold text-text"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border-2 border-border text-sm font-extrabold shadow-neubrutal-sm ${
                          i === 0
                            ? "bg-primary text-text"
                            : i === 1
                              ? "bg-bg text-text-secondary"
                              : i === 2
                                ? "bg-amber-100 text-amber-700"
                                : "bg-surface text-text-tertiary"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-text">
                          {r.user.username}
                          {r.user.id === user?.id && (
                            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider border border-border bg-bg/50 px-1.5 py-0.5 rounded ml-1.5 inline-block">
                              You
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg font-bold text-text bg-surface/50 border border-border px-2.5 py-0.5 rounded inline-block">
                        {r.score}
                      </p>
                      <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mt-1">
                        points
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate("/", { replace: true })}
                className="mt-8 w-full rounded-xl border-2 border-border bg-primary py-3 text-sm font-bold text-text shadow-neubrutal transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neubrutal-lg active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer"
              >
                Back to Rooms
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
