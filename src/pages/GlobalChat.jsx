import { useState, useEffect, useRef, useCallback } from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { MessageCircle, Send } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function GlobalChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const data = await api.getMessages();
      setMessages(data.results || data || []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await api.sendMessage(text);
      setInput("");
      await fetchMessages();
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      <SEO title="Global Chat" />
      <Layout>
        <div className="mx-auto flex h-[calc(100vh-5rem)] max-w-4xl flex-col px-4 py-6 md:px-8 md:py-10">
          <div className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight text-text">
              Global Chat
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Chat with everyone on Lexiq
            </p>
          </div>

          <div className="flex flex-1 flex-col rounded-2xl border-2 border-border bg-surface shadow-neubrutal overflow-y-scroll">
            <div className="flex items-center gap-3 border-b-2 border-border px-5 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-primary">
                <MessageCircle className="h-4 w-4 text-text" />
              </div>
              <span className="text-sm font-bold text-text">#general</span>
            </div>

            <div className="flex-1 space-y-4 p-5 overflow-y-scroll">
              {messages.length === 0 && (
                <p className="text-center text-sm font-medium text-text-tertiary py-8">
                  No messages yet. Start the conversation!
                </p>
              )}
              {messages.map((msg, i) => (
                <div
                  key={msg.id ?? i}
                  className={`p-3 rounded-xl  w-fit ${msg.user === user?.username ? "bg-slate-900 ml-auto rounded-br-none" : "bg-[#020202] rounded-bl-none"}`}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-white/70 tracking-wide">
                      {msg.user}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {msg.timestamp
                        ? new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-white">{msg.message}</p>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="border-t-2 border-border p-4">
              <div className="flex gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border-2 border-border bg-surface py-2.5 pl-4 pr-4 text-sm font-bold text-text outline-none placeholder:text-text-tertiary shadow-neubrutal-sm focus:bg-surface-hover"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  className="flex items-center gap-2 rounded-xl border-2 border-border bg-primary px-4 py-2.5 text-sm font-bold text-text shadow-neubrutal transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neubrutal-lg active:translate-x-0 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
