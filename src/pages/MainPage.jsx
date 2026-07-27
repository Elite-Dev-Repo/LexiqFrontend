import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import Layout from "../components/Layout";
import RoomCard from "../components/RoomCard";
import SEO from "../components/SEO";
import { toast } from "sonner";
import { Plus, RefreshCw, Search, Gamepad2, Layers, Clock } from "lucide-react";

export default function MainPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [decks, setDecks] = useState([]);
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [timeLimit, setTimeLimit] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  async function fetchRooms() {
    setLoading(true);
    try {
      const data = await api.getRooms();
      setRooms(data.results || data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const lobbyRooms = (Array.isArray(rooms) ? rooms : [])
    .filter((r) => r.status === "LOBBY")
    .filter((r) =>
      search
        ? r.code.toLowerCase().includes(search.toLowerCase()) ||
          r.host?.username?.toLowerCase().includes(search.toLowerCase())
        : true,
    );

  async function handleJoin(room) {
    navigate(`/room/${room.code}`);
  }

  const openCreateModal = useCallback(async () => {
    setShowCreate(true);
    setCreating(false);
    setTimeLimit(10);
    try {
      const data = await api.listDecks();
      const list = data.results || data || [];
      setDecks(list);
      if (list.length) setSelectedDeckId(list[0].id);
    } catch {
      setDecks([]);
      setSelectedDeckId(null);
    }
  }, []);

  async function handleCreate() {
    if (!selectedDeckId) {
      toast.error("Please select a question deck");
      return;
    }
    setCreating(true);
    try {
      const data = await api.createRoom({
        question_deck: selectedDeckId,
        time_limit: timeLimit,
      });
      setShowCreate(false);
      navigate(`/room/${data.code}`);
      return;
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <SEO title="Dashboard" />
      <Layout>
        <div className="mx-auto max-w-6xl px-4 py-6 pb-24 md:px-8 md:py-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text">
                Rooms
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                Join a quiz room or create your own
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchRooms}
                className="flex items-center gap-2 rounded-xl border-2 border-border bg-surface px-4 py-2.5 text-sm font-bold text-text transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neubrutal active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <button
                onClick={openCreateModal}
                disabled={creating}
                className="flex items-center gap-2 rounded-xl border-2 border-border bg-primary px-5 py-2.5 text-sm font-bold text-text shadow-neubrutal transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neubrutal-lg active:translate-x-0 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Create Room
              </button>
            </div>
          </div>

          <div className="relative mb-8">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code or host..."
              className="w-full rounded-xl border-2 border-border bg-surface py-2.5 pl-10 pr-4 text-sm font-bold text-text outline-none placeholder:text-text-tertiary transition-all shadow-neubrutal-sm focus:bg-surface-hover"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : lobbyRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface py-24 shadow-neubrutal">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-border bg-primary">
                <Gamepad2 className="h-6 w-6 text-text" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-text">
                No rooms available
              </h3>
              <p className="mt-1 text-sm font-medium text-text-secondary">
                {search
                  ? "No rooms match your search."
                  : "Create a room to get started."}
              </p>
              {!search && (
                <button
                  onClick={openCreateModal}
                  className="mt-5 rounded-xl border-2 border-border bg-primary px-5 py-2.5 text-sm font-bold text-text shadow-neubrutal transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neubrutal-lg active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer"
                >
                  Create Room
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {lobbyRooms.map((room) => (
                <RoomCard key={room.id} room={room} onJoin={handleJoin} />
              ))}
            </div>
          )}
        </div>

        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border-2 border-border bg-surface p-6 shadow-neubrutal-lg">
              <h2 className="text-xl font-bold text-text">Create a Room</h2>
              <p className="mt-1 text-sm font-medium text-text-secondary">
                Pick a question deck and time limit.
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
                    className="w-full rounded-xl border-2 border-border bg-surface py-2.5 px-4 text-sm font-bold text-text outline-none transition-colors shadow-neubrutal-sm focus:bg-surface-hover"
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
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 rounded-xl border-2 border-border bg-surface py-2.5 text-sm font-bold text-text shadow-neubrutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neubrutal active:translate-x-0 active:translate-y-0 active:shadow-none transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !selectedDeckId}
                  className="flex-1 rounded-xl border-2 border-border bg-primary py-2.5 text-sm font-bold text-text shadow-neubrutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neubrutal active:translate-x-0 active:translate-y-0 active:shadow-none transition-all disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {creating ? "Creating..." : "Create Room"}
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
}
