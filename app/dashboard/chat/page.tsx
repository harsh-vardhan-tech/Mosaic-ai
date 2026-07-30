"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Send, LoaderCircle, Bot, User, FileText, Sparkles } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api, ApiError, type ChatMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

interface DisplayMessage extends ChatMessage {
  sources?: { id: string; title: string; category: string }[];
}

const SUGGESTIONS = [
  "Summarize my experience so far",
  "What skills come up most across my documents?",
  "Which certifications do I have in AI or data?",
  "What internships have I completed?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const send = async (question: string) => {
    if (!question.trim() || sending) return;
    setError(null);
    const history = messages.map(({ role, content }) => ({ role, content }));
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setSending(true);
    try {
      const res = await api.chat(question, history);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.answer, sources: res.sources },
      ]);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Chat is unavailable right now — try again shortly"
      );
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      <Topbar title="Chat with your documents" />
      <main className="flex flex-1 flex-col overflow-hidden p-4 md:p-6">
        {/* Messages */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-4">
          {messages.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10 ring-1 ring-inset ring-gold/25">
                <Bot className="h-8 w-8 text-gold" />
              </div>
              <div>
                <p className="font-display text-lg font-medium">Ask your Mosaic anything</p>
                <p className="mt-1 max-w-sm text-sm text-muted">
                  Answers grounded in your own uploaded documents — certificates, projects, internships.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-border/60 bg-surface-raised/70 px-3.5 py-1.5 text-sm text-muted backdrop-blur-sm transition-all hover:border-gold/30 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3 fade-up",
                m.role === "user" && "flex-row-reverse"
              )}
              style={{ animationDelay: "0s" }}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  m.role === "user"
                    ? "bg-gold/15 text-gold ring-1 ring-gold/25"
                    : "bg-surface-raised text-muted ring-1 ring-border"
                )}
              >
                {m.role === "user" ? <User size={15} /> : <Bot size={15} />}
              </div>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-3 text-sm",
                  m.role === "user"
                    ? "rounded-tr-sm bg-gold/12 ring-1 ring-inset ring-gold/20"
                    : "rounded-tl-sm bg-surface-raised ring-1 ring-inset ring-border"
                )}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
                    {m.sources.map((s) => (
                      <span
                        key={s.id}
                        className="flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs text-muted ring-1 ring-inset ring-border"
                      >
                        <FileText size={10} />
                        {s.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-raised text-muted ring-1 ring-border">
                <Bot size={15} />
              </div>
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-surface-raised px-4 py-3 ring-1 ring-inset ring-border">
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-muted"
                      style={{
                        animation: "bounce 1.2s ease-in-out infinite",
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </span>
                <span className="text-xs text-muted">Thinking…</span>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-tile-coral/30 bg-tile-coral/8 px-4 py-3 text-sm text-tile-coral ring-1 ring-inset ring-tile-coral/20">
              {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 border-t border-border/60 pt-4"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask about your projects, skills, or certifications…"
            disabled={sending}
            className="rounded-xl bg-surface-raised/50 backdrop-blur-sm transition-all focus:border-gold/50"
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || !input.trim()}
            aria-label="Send"
            className="btn-glow shrink-0 rounded-xl bg-gold text-gold-foreground hover:bg-gold disabled:opacity-50"
          >
            <Send size={16} />
          </Button>
        </form>
      </main>
    </>
  );
}
