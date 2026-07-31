import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.username) {
          setUser({ id: payload.user_id, username: payload.username });
        } else {
          api.getUser().then((u) => {
            setUser({ id: u.id, username: u.username });
          }).catch(() => api.clearTokens());
        }
      } catch {
        api.clearTokens();
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await api.login(username, password);
    const payload = JSON.parse(atob(data.access.split(".")[1]));
    const u = { id: payload.user_id, username: payload.username || username };
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (username, password, email) => {
    await api.register(username, password, email);
  }, []);

  const logout = useCallback(() => {
    api.clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
