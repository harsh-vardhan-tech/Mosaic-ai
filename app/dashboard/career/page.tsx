"use client";

import { useState } from "react";
import {
  Compass,
  LoaderCircle,
  Sparkles,
  CheckCircle2,
  CircleDashed,
  CircleAlert,
  Lightbulb,
  MessageSquare,
  Gauge,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { api, ApiError, type CareerAnalysis, type InterviewPrep, type ProfileStrength } from "@/lib/api";
import { cn } from "@/lib/utils";

const TOOLTIP_STYLE = {
  background: "hsl(var(--surface-raised))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 13,
  color: "hsl(var(--foreground))",
};

export default function CareerPage() {
  return (
    <>
      <Topbar title="Career Intelligence" />
      <main className="flex flex-1 flex-col p-4 md:p-6">
        <Tabs defaultValue="analysis">
          <TabsList className="rounded-xl bg-surface-raised/60 backdrop-blur-sm">
            <TabsTrigger value="analysis" className="rounded-lg gap-1.5 data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">
              <Compass size={14} /> Skill Gap
            </TabsTrigger>
            <TabsTrigger value="interview" className="rounded-lg gap-1.5 data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">
              <MessageSquare size={14} /> Interview
            </TabsTrigger>
            <TabsTrigger value="strength" className="rounded-lg gap-1.5 data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">
              <Gauge size={14} /> Profile Strength
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="mt-6">
            <AnalysisPanel />
          </TabsContent>
          <TabsContent value="interview" className="mt-6">
            <InterviewPanel />
          </TabsContent>
          <TabsContent value="strength" className="mt-6">
            <StrengthPanel />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-tile-coral/30 bg-tile-coral/8 px-4 py-3 text-sm text-tile-coral ring-1 ring-inset ring-tile-coral/20">
      {message}
    </div>
  );
}

function RoleForm({
  role,
  setRole,
  onSubmit,
  loading,
  hasResult,
  placeholder,
}: {
  role: string;
  setRole: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  hasResult: boolean;
  placeholder: string;
}) {
  return (
    <form
      className="flex flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Input
        value={role}
        onChange={(e) => setRole(e.target.value)}
        placeholder={placeholder}
        className="rounded-xl bg-surface-raised/50 sm:max-w-sm backdrop-blur-sm transition-all focus:border-gold/50"
        aria-label="Target role"
      />
      <Button
        type="submit"
        disabled={loading}
        className="btn-glow w-fit gap-2 rounded-xl bg-gold text-gold-foreground hover:bg-gold"
      >
        {loading ? (
          <LoaderCircle className="animate-spin" size={15} />
        ) : (
          <Sparkles size={15} />
        )}
        {loading ? "Analyzing…" : hasResult ? "Re-analyze" : "Analyze"}
      </Button>
    </form>
  );
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, score));
  const color =
    clamped >= 70
      ? "hsl(var(--tile-teal))"
      : clamped >= 40
      ? "hsl(var(--gold))"
      : "hsl(var(--tile-coral))";
  const r = 42;
  const circumference = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="7" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - clamped / 100)}
            className="transition-all duration-1000"
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-display text-3xl font-medium">
          {clamped}
        </span>
      </div>
      <p className="text-xs font-medium text-muted">{label}</p>
    </div>
  );
}

const GAP_STYLE: Record<string, { icon: typeof CheckCircle2; text: string; bg: string; label: string }> = {
  have: { icon: CheckCircle2, text: "text-tile-teal", bg: "bg-tile-teal/10", label: "Have" },
  partial: { icon: CircleDashed, text: "text-gold", bg: "bg-gold/10", label: "Partial" },
  missing: { icon: CircleAlert, text: "text-tile-coral", bg: "bg-tile-coral/10", label: "Missing" },
};

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface-raised/70 p-5 backdrop-blur-sm">
      {children}
    </div>
  );
}

function AnalysisPanel() {
  const [role, setRole] = useState("");
  const [data, setData] = useState<CareerAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await api.careerAnalysis(role));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't run the analysis right now");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted">
        Name a target role and the AI compares it against everything you&apos;ve uploaded — an
        honest skill gap plus a concrete roadmap to close it.
      </p>
      <RoleForm
        role={role}
        setRole={setRole}
        onSubmit={run}
        loading={loading}
        hasResult={!!data}
        placeholder="e.g. Machine Learning Engineer"
      />
      {error && <ErrorBanner message={error} />}

      {data && (
        <div className="flex flex-col gap-4 fade-up">
          <SectionCard>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <ScoreRing score={data.readiness_score} label="Role readiness" />
              <div className="flex flex-1 flex-col gap-3">
                <p className="text-sm leading-relaxed">{data.readiness_summary}</p>
                {data.suggested_roles.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted">Also fits:</span>
                    {data.suggested_roles.map((r) => (
                      <span
                        key={r}
                        className="rounded-full bg-tile-violet/10 px-2.5 py-1 text-xs font-medium text-tile-violet ring-1 ring-inset ring-tile-violet/30"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </SectionCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard>
              <h3 className="mb-3 font-display text-base font-medium">Skill gap</h3>
              <div className="flex flex-col gap-3">
                {data.skill_gaps.map((gap) => {
                  const style = GAP_STYLE[gap.status] ?? GAP_STYLE.partial;
                  const Icon = style.icon;
                  return (
                    <div key={gap.skill} className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg",
                          style.bg
                        )}
                      >
                        <Icon size={14} className={style.text} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">
                          {gap.skill}{" "}
                          <span className={cn("text-xs font-medium", style.text)}>
                            · {style.label}
                          </span>
                        </p>
                        <p className="text-xs leading-relaxed text-muted">{gap.note}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard>
              <h3 className="mb-3 font-display text-base font-medium">Learning roadmap</h3>
              <ol className="flex flex-col gap-4">
                {[...data.roadmap]
                  .sort((a, b) => a.order - b.order)
                  .map((step) => (
                    <li key={step.order} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/12 font-mono text-xs font-semibold text-gold ring-1 ring-inset ring-gold/30">
                        {step.order}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{step.title}</p>
                        <p className="text-xs leading-relaxed text-muted">{step.description}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-tile-teal">
                          <ArrowRight size={11} />
                          {step.resource}
                        </p>
                      </div>
                    </li>
                  ))}
              </ol>
            </SectionCard>
          </div>

          {data.strengths.length > 0 && (
            <SectionCard>
              <h3 className="mb-3 font-display text-base font-medium">Your strengths</h3>
              <div className="flex flex-wrap gap-2">
                {data.strengths.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-tile-teal/10 px-3 py-1.5 text-sm text-tile-teal ring-1 ring-inset ring-tile-teal/30"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      )}

      {!data && !loading && !error && (
        <EmptyHint icon={Compass} text="Run an analysis to see your skill gap and roadmap." />
      )}
    </div>
  );
}

const Q_CATEGORY_STYLE: Record<string, string> = {
  technical: "bg-tile-violet/10 text-tile-violet ring-tile-violet/30",
  project: "bg-tile-teal/10 text-tile-teal ring-tile-teal/30",
  behavioral: "bg-tile-amber/10 text-tile-amber ring-tile-amber/30",
};

function InterviewPanel() {
  const [role, setRole] = useState("");
  const [data, setData] = useState<InterviewPrep | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await api.interviewPrep(role));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't prepare questions right now");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted">
        Questions an interviewer would actually ask <em>you</em> — grounded in your real projects,
        internships, and certifications.
      </p>
      <RoleForm
        role={role}
        setRole={setRole}
        onSubmit={run}
        loading={loading}
        hasResult={!!data}
        placeholder="e.g. Frontend Developer"
      />
      {error && <ErrorBanner message={error} />}

      {data && (
        <div className="flex flex-col gap-4 fade-up">
          {data.tips.length > 0 && (
            <SectionCard>
              <h3 className="mb-3 font-display text-base font-medium">Coach&apos;s tips</h3>
              <div className="flex flex-col gap-2">
                {data.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Lightbulb size={15} className="mt-0.5 shrink-0 text-gold" />
                    <span className="leading-relaxed">{tip}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          <div className="flex flex-col gap-3">
            {data.questions.map((q, i) => (
              <SectionCard key={i}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold leading-relaxed">{q.question}</p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset",
                      Q_CATEGORY_STYLE[q.category?.toLowerCase()] ??
                        "bg-surface text-muted ring-border"
                    )}
                  >
                    {q.category}
                  </span>
                </div>
                <p className="mt-2.5 text-xs leading-relaxed text-muted">
                  <span className="font-medium text-foreground">Strong answer: </span>
                  {q.hint}
                </p>
              </SectionCard>
            ))}
          </div>
        </div>
      )}

      {!data && !loading && !error && (
        <EmptyHint icon={MessageSquare} text="Generate questions to start practicing." />
      )}
    </div>
  );
}

function StrengthPanel() {
  const [data, setData] = useState<ProfileStrength | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await api.profileStrength());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't audit your profile right now");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted">
        An honest AI audit of your whole profile — a strength score across six dimensions and the
        quickest wins to improve it.
      </p>
      <Button
        onClick={run}
        disabled={loading}
        className="btn-glow w-fit gap-2 rounded-xl bg-gold text-gold-foreground hover:bg-gold"
      >
        {loading ? (
          <LoaderCircle className="animate-spin" size={15} />
        ) : (
          <Gauge size={15} />
        )}
        {loading ? "Auditing…" : data ? "Re-audit" : "Audit my profile"}
      </Button>
      {error && <ErrorBanner message={error} />}

      {data && (
        <div className="grid gap-4 lg:grid-cols-2 fade-up">
          <SectionCard>
            <div className="flex flex-col items-center gap-4">
              <ScoreRing score={data.overall} label="Profile strength" />
              <p className="text-center text-sm leading-relaxed">{data.summary}</p>
            </div>
          </SectionCard>

          <SectionCard>
            <h3 className="mb-3 font-display text-base font-medium">Skill radar</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data.radar} outerRadius="75%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="axis"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted))" }}
                  />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    dataKey="score"
                    stroke="hsl(var(--gold))"
                    fill="hsl(var(--gold))"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          {data.quick_wins.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-surface-raised/70 p-5 backdrop-blur-sm lg:col-span-2">
              <h3 className="mb-3 font-display text-base font-medium">Quick wins</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {data.quick_wins.map((win, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 rounded-xl bg-surface/50 px-3.5 py-3 text-sm"
                  >
                    <Sparkles size={14} className="mt-0.5 shrink-0 text-gold" />
                    <span className="leading-relaxed">{win}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!data && !loading && !error && (
        <EmptyHint icon={Gauge} text="Run the audit to see your profile radar." />
      )}
    </div>
  );
}

function EmptyHint({ icon: Icon, text }: { icon: typeof Compass; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-raised">
        <Icon className="h-7 w-7 text-muted" />
      </div>
      <p className="text-sm text-muted">{text}</p>
    </div>
  );
}
