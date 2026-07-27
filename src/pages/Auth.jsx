import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff, Gamepad2, Mail, Lock, User } from "lucide-react";
import SEO from "../components/SEO";

export default function Auth() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [regForm, setRegForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  if (user) {
    navigate("/", { replace: true });
    return null;
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setBusy(true);
    try {
      await login(loginForm.username, loginForm.password);
      toast.success("Welcome back!");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!regForm.username || !regForm.email || !regForm.password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (regForm.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setBusy(true);
    try {
      await register(regForm.username, regForm.password, regForm.email);
      toast.success("Account created! You can now log in.");
      setTab("login");
      setLoginForm({ username: regForm.username, password: "" });
      setRegForm({ username: "", email: "", password: "" });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SEO title="Sign In" />
      <div className="flex min-h-screen bg-bg">
      <div className="relative hidden w-1/2 lg:flex flex-col justify-between overflow-hidden bg-primary p-12 border-r-4 border-border">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full border-4 border-border bg-bg" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-3xl border-4 border-border bg-bg/50 rotate-45" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-x-4 border-y-4 border-y-transparent border-border bg-none rotate-45 ">
              <Gamepad2 className="h-5 w-5 text-text" />
            </div>
            <span className="text-xl font-bold tracking-tight text-text">
              Lexiq
            </span>
          </div>
        </div>

        <div className="relative z-10 bg-surface border-4 border-border p-8 rounded-2xl shadow-neubrutal">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-text">
            Build your vocabulary
            <br />
            <span className="bg-primary px-2 py-0.5 border-2 border-border shadow-neubrutal-sm inline-block scale-95 origin-left rotate-[-1deg]">
              one quiz at a time
            </span>
          </h1>
          <p className="mt-4 max-w-md text-md font-bold text-text-secondary leading-relaxed">
            Challenge yourself and others with vocabulary quizzes. Create rooms,
            invite players, and see who comes out on top.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-sm font-bold text-text-secondary">
          <span className="h-0.5 w-8 bg-text" />
          Learn words that matter
        </div>
      </div>

      <div className="flex w-full items-center justify-center lg:w-1/2 p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-x-4 border-y-4 border-y-transparent border-border bg-none rotate-45 ">
              <Gamepad2 className="h-5 w-5 text-text" />
            </div>
            <span className="text-xl font-bold text-text">Lexiq</span>
          </div>

          <div className="mb-8 flex gap-2 rounded-xl border-2 border-border bg-surface p-1.5 shadow-neubrutal-sm">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 rounded-lg py-2 text-sm font-bold border-2 transition-all cursor-pointer ${
                tab === "login"
                  ? "bg-primary text-text border-border shadow-neubrutal-sm translate-x-[-1px] translate-y-[-1px]"
                  : "bg-transparent text-text-secondary border-transparent hover:text-text"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 rounded-lg py-2 text-sm font-bold border-2 transition-all cursor-pointer ${
                tab === "signup"
                  ? "bg-primary text-text border-border shadow-neubrutal-sm translate-x-[-1px] translate-y-[-1px]"
                  : "bg-transparent text-text-secondary border-transparent hover:text-text"
              }`}
            >
              Sign Up
            </button>
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-text">
                  Username
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <input
                    value={loginForm.username}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, username: e.target.value })
                    }
                    className="w-full rounded-xl border-2 border-border bg-surface py-2.5 pl-10 pr-4 text-sm font-bold text-text outline-none placeholder:text-text-tertiary shadow-neubrutal-sm transition-all focus:bg-surface-hover"
                    placeholder="Enter your username"
                    autoComplete="username"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-text">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    className="w-full rounded-xl border-2 border-border bg-surface py-2.5 pl-10 pr-10 text-sm font-bold text-text outline-none placeholder:text-text-tertiary shadow-neubrutal-sm transition-all focus:bg-surface-hover"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text"
                    tabIndex={-1}
                  >
                    {showPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl border-2 border-border bg-primary py-2.5 text-sm font-bold text-text shadow-neubrutal transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neubrutal-lg active:translate-x-0 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {busy ? "Signing in..." : "Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-text">
                  Username
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <input
                    value={regForm.username}
                    onChange={(e) =>
                      setRegForm({ ...regForm, username: e.target.value })
                    }
                    className="w-full rounded-xl border-2 border-border bg-surface py-2.5 pl-10 pr-4 text-sm font-bold text-text outline-none placeholder:text-text-tertiary shadow-neubrutal-sm transition-all focus:bg-surface-hover"
                    placeholder="Choose a username"
                    autoComplete="username"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-text">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <input
                    type="email"
                    value={regForm.email}
                    onChange={(e) =>
                      setRegForm({ ...regForm, email: e.target.value })
                    }
                    className="w-full rounded-xl border-2 border-border bg-surface py-2.5 pl-10 pr-4 text-sm font-bold text-text outline-none placeholder:text-text-tertiary shadow-neubrutal-sm transition-all focus:bg-surface-hover"
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-text">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={regForm.password}
                    onChange={(e) =>
                      setRegForm({ ...regForm, password: e.target.value })
                    }
                    className="w-full rounded-xl border-2 border-border bg-surface py-2.5 pl-10 pr-10 text-sm font-bold text-text outline-none placeholder:text-text-tertiary shadow-neubrutal-sm transition-all focus:bg-surface-hover"
                    placeholder="Create a password (8+ chars)"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text"
                    tabIndex={-1}
                  >
                    {showPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl border-2 border-border bg-primary py-2.5 text-sm font-bold text-text shadow-neubrutal transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neubrutal-lg active:translate-x-0 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {busy ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-xs font-semibold text-text-tertiary">
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
