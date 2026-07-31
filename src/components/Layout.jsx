import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, Gamepad2, MessageCircle } from "lucide-react";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isGlobalChat = location.pathname === "/global-chat";

  function handleLogout() {
    logout();
    navigate("/auth", { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="hidden md:flex md:w-64 flex-col border-r-2 border-border bg-bg">
        <div className="flex items-center gap-3 border-b-2 border-border px-6 py-5 bg-primary/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-x-4 border-y-4 border-y-transparent border-border bg-none rotate-45 ">
            <Gamepad2 className="h-5 w-5 text-text" />
          </div>
          <span className="text-lg font-bold text-text">Lexiq</span>
        </div>

        <nav className="flex-1 space-y-4 px-3 py-4">
          <button
            onClick={() => navigate("/")}
            className={`flex w-full items-center gap-3 rounded-xl border-2 border-border px-3 py-2.5 text-sm font-bold text-text transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${!isGlobalChat ? "bg-primary shadow-neubrutal" : "bg-surface shadow-neubrutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neubrutal"}`}
          >
            <Gamepad2 className="h-4 w-4" />
            Rooms
          </button>

          <button
            onClick={() => navigate("/global-chat")}
            className={`flex w-full items-center gap-3 rounded-xl border-2 border-border px-3 py-2.5 text-sm font-bold text-text transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${isGlobalChat ? "bg-primary shadow-neubrutal" : "bg-surface shadow-neubrutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neubrutal"}`}
          >
            <MessageCircle className="h-4 w-4" />
            Global Chat
          </button>
        </nav>

        <div className="border-t-2 border-border px-4 py-4 bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-border bg-primary text-sm font-bold text-text">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-bold text-text">
                {user?.username}
              </p>
              <p className="text-xs text-text-secondary font-medium">Online</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-border bg-surface text-text transition-all hover:bg-error hover:text-white active:scale-95"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t-2 border-border bg-bg px-4 py-3 md:hidden">
        <button
          onClick={() => navigate("/")}
          className={`flex flex-col items-center gap-1 transition-colors ${!isGlobalChat ? "text-primary" : "text-text hover:text-primary"}`}
        >
          <Gamepad2 className="h-5 w-5" />
          <span className="text-[10px] font-bold">Rooms</span>
        </button>
        <button
          onClick={() => navigate("/global-chat")}
          className={`flex flex-col items-center gap-1 transition-colors ${isGlobalChat ? "text-primary" : "text-text hover:text-primary"}`}
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-[10px] font-bold">Global Chat</span>
        </button>
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-primary text-xs font-bold text-text">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <span className="text-[10px] font-bold text-text-secondary">
            {user?.username}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 text-text hover:text-error transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-[10px] font-bold">Logout</span>
        </button>
      </nav>
    </div>
  );
}
