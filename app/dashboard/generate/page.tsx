"use client";

import { useState } from "react";
import { Sparkles, LoaderCircle, Copy, Check, FileText, User, Briefcase } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

type ResumeData = Awaited<ReturnType<typeof api.generateResume>>;
type PortfolioData = Awaited<ReturnType<typeof api.generatePortfolio>>;

export default function GeneratePage() {
  return (
    <>
      <Topbar title="Generate" />
      <main className="flex flex-1 flex-col p-4 md:p-6">
        <Tabs defaultValue="bio">
          <TabsList className="rounded-xl bg-surface-raised/60 backdrop-blur-sm">
            <TabsTrigger value="bio" className="rounded-lg gap-1.5 data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">
              <User size={14} /> Bio
            </TabsTrigger>
            <TabsTrigger value="resume" className="rounded-lg gap-1.5 data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">
              <FileText size={14} /> Resume
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="rounded-lg gap-1.5 data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">
              <Briefcase size={14} /> Portfolio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bio" className="mt-6">
            <BioPanel />
          </TabsContent>
          <TabsContent value="resume" className="mt-6">
            <ResumePanel />
          </TabsContent>
          <TabsContent value="portfolio" className="mt-6">
            <PortfolioPanel />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}

function GenerateButton({
  onClick,
  loading,
  hasResult,
}: {
  onClick: () => void;
  loading: boolean;
  hasResult: boolean;
}) {
  return (
    <Button
      onClick={onClick}
      disabled={loading}
      className="btn-glow w-fit gap-2 rounded-xl bg-gold text-gold-foreground hover:bg-gold"
    >
      {loading ? (
        <LoaderCircle className="animate-spin" size={16} />
      ) : (
        <Sparkles size={16} />
      )}
      {loading ? "Generating…" : hasResult ? "Regenerate" : "Generate"}
    </Button>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-tile-coral/30 bg-tile-coral/8 px-4 py-3 text-sm text-tile-coral ring-1 ring-inset ring-tile-coral/20">
      {message}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      className="rounded-lg gap-1.5 transition-all hover:bg-gold/10 hover:text-gold"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check size={14} className="text-tile-teal" /> : <Copy size={14} />}
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
}

function ResultCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface-raised/70 p-6 backdrop-blur-sm ring-1 ring-inset ring-border/30 fade-up">
      {children}
    </div>
  );
}

function BioPanel() {
  const [bio, setBio] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.generateBio();
      setBio(res.bio);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't generate a bio right now");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        A short, first-person professional bio built from everything you&apos;ve uploaded.
      </p>
      <GenerateButton onClick={generate} loading={loading} hasResult={!!bio} />
      {error && <ErrorBanner message={error} />}
      {bio && (
        <ResultCard>
          <p className="whitespace-pre-wrap font-display text-base leading-relaxed">{bio}</p>
          <div className="mt-4 border-t border-border pt-4">
            <CopyButton text={bio} />
          </div>
        </ResultCard>
      )}
    </div>
  );
}

function ResumePanel() {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      setResume(await api.generateResume());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't generate a resume right now");
    } finally {
      setLoading(false);
    }
  };

  const plainText = resume
    ? [
        resume.full_summary,
        ...resume.sections.map(
          (s) => `${s.heading}\n${s.bullets.map((b) => `- ${b}`).join("\n")}`
        ),
      ].join("\n\n")
    : "";

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        A structured resume, grouped into sections, built from your uploaded items.
      </p>
      <GenerateButton onClick={generate} loading={loading} hasResult={!!resume} />
      {error && <ErrorBanner message={error} />}
      {resume && (
        <ResultCard>
          <p className="mb-5 text-sm leading-relaxed text-muted">{resume.full_summary}</p>
          {resume.sections.map((section) => (
            <div key={section.heading} className="mb-5">
              <h3 className="mb-2.5 font-display text-lg font-medium">{section.heading}</h3>
              <ul className="flex flex-col gap-2">
                {section.bullets.map((bullet, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                    <span className="mt-0.5 text-gold">▸</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="border-t border-border pt-4">
            <CopyButton text={plainText} />
          </div>
        </ResultCard>
      )}
    </div>
  );
}

function PortfolioPanel() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      setPortfolio(await api.generatePortfolio());
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't generate a portfolio right now"
      );
    } finally {
      setLoading(false);
    }
  };

  const plainText = portfolio
    ? [
        portfolio.title,
        portfolio.tagline,
        ...portfolio.sections.map((s) => `${s.heading}\n${s.content}`),
      ].join("\n\n")
    : "";

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        A shareable narrative page — a title, tagline, and themed sections.
      </p>
      <GenerateButton onClick={generate} loading={loading} hasResult={!!portfolio} />
      {error && <ErrorBanner message={error} />}
      {portfolio && (
        <ResultCard>
          <div className="mb-5">
            <h2 className="font-display text-2xl font-medium">{portfolio.title}</h2>
            <p className="mt-1 italic text-muted">{portfolio.tagline}</p>
          </div>
          {portfolio.sections.map((section) => (
            <div key={section.heading} className="mb-4">
              <h3 className="mb-1.5 font-display text-lg font-medium">{section.heading}</h3>
              <p className="text-sm leading-relaxed text-muted">{section.content}</p>
            </div>
          ))}
          <div className="border-t border-border pt-4">
            <CopyButton text={plainText} />
          </div>
        </ResultCard>
      )}
    </div>
  );
}
