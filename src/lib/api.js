import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "./constants";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE;
  }

  getToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setTokens(access, refresh) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  }

  clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = { ...options.headers };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    let res = await fetch(url, { ...options, headers });

    if (res.status === 401 && this.getRefreshToken()) {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        headers["Authorization"] = `Bearer ${this.getToken()}`;
        res = await fetch(url, { ...options, headers });
      } else {
        this.clearTokens();
        window.location.href = "/auth";
        throw new Error("Session expired");
      }
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg =
        body.detail ||
        Object.values(body).flat().join(", ") ||
        `Request failed (${res.status})`;
      throw new Error(msg);
    }

    if (res.status === 204) return null;
    return res.json();
  }

  async tryRefresh() {
    try {
      const res = await fetch(`${this.baseUrl}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: this.getRefreshToken() }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      this.setTokens(data.access, data.refresh);
      return true;
    } catch {
      return false;
    }
  }

  login(username, password) {
    return this.request("/token/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }).then((data) => {
      this.setTokens(data.access, data.refresh);
      return data;
    });
  }

  register(username, password, email) {
    return this.request("/register/", {
      method: "POST",
      body: JSON.stringify({ username, password, email }),
    });
  }

  getRooms() {
    return this.request("/rooms/");
  }

  getRoomDetail(id) {
    return this.request(`/rooms/${id}/`);
  }

  createRoom(data) {
    return this.request("/create-room/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  getDecks() {
    return this.request("/decks/");
  }

  listDecks() {
    return this.request("/decks-list/");
  }
}

export const api = new ApiClient();
