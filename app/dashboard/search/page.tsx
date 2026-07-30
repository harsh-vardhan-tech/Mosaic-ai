"use client";

import { useState, type FormEvent } from "react";
import { Search as SearchIcon, LoaderCircle, Sparkles } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { categoryStyle } from "@/lib/categories";
import { api, ApiError, type Item } from "@/lib/api";
import { cn } from "@/lib/utils";

type SearchResult = Item & { relevance: number };

const EXAMPLE_QUERIES = [
  "my AI projects",
  "leadership experience",
  "internships in web development",
  "certifications in cloud",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.search(q);
      setResults(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Search failed — try again");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  return (
    <>
      <Topbar title="Search" />
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try 'show my AI projects' or 'certifications in data science'"
              className="rounded-xl bg-surface-raised/50 pl-10 backdrop-blur-sm transition-all focus:border-gold/50"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !query.trim()}
            className="btn-glow rounded-xl bg-gold px-5 text-gold-foreground hover:bg-gold"
          >
            {loading ? <LoaderCircle className="animate-spin" size={16} /> : "Search"}
          </Button>
        </form>

        {results === null && !loading && (
          <div className="flex flex-col gap-3">
            <p className="flex items-center gap-2 text-sm text-muted">
              <Sparkles size={14} className="text-gold" />
              Search in plain language across everything you&apos;ve uploaded. Try:
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUERIES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => {
                    setQuery(ex);
                    runSearch(ex);
                  }}
                  className="rounded-full border border-border/60 bg-surface-raised/60 px-3.5 py-1.5 text-sm text-muted backdrop-blur-sm transition-all hover:border-gold/30 hover:text-foreground"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-tile-coral/30 bg-tile-coral/8 px-4 py-3 text-sm text-tile-coral ring-1 ring-inset ring-tile-coral/20">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-1 items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <LoaderCircle className="h-8 w-8 animate-spin text-gold" />
                <div className="absolute inset-0 animate-ping rounded-full bg-gold/20" />
              </div>
              <p className="text-xs text-muted">Searching your Mosaic…</p>
            </div>
          </div>
        )}

        {!loading && results !== null && results.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
            <SearchIcon className="h-8 w-8 text-muted" />
            <p className="text-sm text-muted">
              No matches for &quot;{query}&quot; — try different words.
            </p>
          </div>
        )}

        {!loading && results !== null && results.length > 0 && (
          <ul className="flex flex-col gap-3">
            {results.map((item, i) => {
              const style = categoryStyle(item.category);
              const Icon = style.icon;
              return (
                <li
                  key={item.id}
                  className={cn(
                    "animated-border card-hover flex gap-3 rounded-2xl border bg-surface-raised/70 p-4 backdrop-blur-sm ring-1 ring-inset fade-up",
                    style.ring
                  )}
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      style.bg
                    )}
                  >
                    <Icon className={style.text} size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-base leading-snug">{item.title}</h3>
                      <span className="shrink-0 rounded-full bg-gold/10 px-2 py-0.5 font-mono text-xs text-gold ring-1 ring-inset ring-gold/25">
                        {Math.round(item.relevance * 100)}%
                      </span>
                    </div>
                    <p className="text-xs text-muted">
                      {[item.category, item.organization, item.date]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{item.description}</p>
                    {item.skills.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.skills.slice(0, 4).map((skill) => (
                          <Badge key={skill} className="text-[11px]">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
