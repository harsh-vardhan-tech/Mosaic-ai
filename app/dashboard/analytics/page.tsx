"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, BarChart3, TrendingUp, Layers, Zap, Calendar } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { Topbar } from "@/components/topbar";
import { api, ApiError, type AnalyticsSummary } from "@/lib/api";
import { cn } from "@/lib/utils";

const CATEGORY_HEX: Record<string, string> = {
  Projects: "hsl(var(--tile-teal))",
  Skills: "hsl(var(--tile-violet))",
  Certifications: "hsl(var(--tile-amber))",
  Internships: "hsl(var(--tile-coral))",
  Achievements: "hsl(var(--gold))",
  Academics: "hsl(var(--muted))",
};

const TOOLTIP_STYLE = {
  background: "hsl(var(--surface-raised))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 13,
  color: "hsl(var(--foreground))",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .analyticsSummary()
      .then((d) => !cancelled && setData(d))
      .catch(
        (err) =>
          !cancelled &&
          setError(err instanceof ApiError ? err.message : "Couldn't load analytics")
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // The backend already returns top_skills sorted desc; cap the chart at 8 so
  // the labels stay legible inside the fixed-height card.
  const topSkills = (data?.top_skills ?? [])
    .slice(0, 8)
    .map(([skill, count]) => ({ skill, count }));

  return (
    <>
      <Topbar title="Analytics" />
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {loading ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <LoaderCircle className="h-8 w-8 animate-spin text-gold" />
                <div className="absolute inset-0 animate-ping rounded-full bg-gold/20" />
              </div>
              <p className="text-xs text-muted">Crunching your data…</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-tile-coral/30 bg-tile-coral/8 px-4 py-3 text-sm text-tile-coral ring-1 ring-inset ring-tile-coral/20">
            {error}
          </div>
        ) : !data || data.total_items === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-raised">
              <BarChart3 className="h-7 w-7 text-muted" />
            </div>
            <p className="text-sm text-muted">Upload a few items to see your analytics.</p>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard
                icon={Layers}
                iconColor="text-gold"
                iconBg="bg-gold/10"
                label="Total items"
                value={data.total_items}
              />
              <StatCard
                icon={BarChart3}
                iconColor="text-tile-teal"
                iconBg="bg-tile-teal/10"
                label="Categories"
                value={Object.keys(data.by_category).length}
              />
              <StatCard
                icon={Zap}
                iconColor="text-tile-violet"
                iconBg="bg-tile-violet/10"
                label="Unique skills"
                value={data.top_skills.length}
              />
              <StatCard
                icon={Calendar}
                iconColor="text-tile-coral"
                iconBg="bg-tile-coral/10"
                label="Years active"
                value={Object.keys(data.by_year).filter((y) => y !== "Unknown").length}
              />
            </div>

            {/* Category chart */}
            <ChartCard title="Items by category" icon={BarChart3}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(data.by_category).map(([category, count]) => ({
                    category,
                    count,
                  }))}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "hsl(var(--border)/0.3)" }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {Object.keys(data.by_category).map((category) => (
                      <Cell
                        key={category}
                        fill={CATEGORY_HEX[category] ?? "hsl(var(--muted))"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard title="Top skills" icon={Zap}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={topSkills}
                    margin={{ left: 8, right: 16 }}
                    barCategoryGap="22%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="skill"
                      width={132}
                      interval={0}
                      tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                      tickFormatter={(v: string) =>
                        v.length > 20 ? `${v.slice(0, 19)}…` : v
                      }
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "hsl(var(--border)/0.3)" }} />
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--gold))"
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Growth by year" icon={TrendingUp}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(data.by_year).map(([year, count]) => ({
                      year,
                      count,
                    }))}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 12, fill: "hsl(var(--muted))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "hsl(var(--border)/0.3)" }} />
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--tile-teal))"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </>
        )}
      </main>
    </>
  );
}

function StatCard({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
}: {
  icon: typeof BarChart3;
  iconColor: string;
  iconBg: string;
  label: string;
  value: number;
}) {
  return (
    <div className="card-hover rounded-2xl border border-border/60 bg-surface-raised/70 p-5 backdrop-blur-sm">
      <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl", iconBg)}>
        <Icon size={18} className={iconColor} />
      </div>
      <p className="font-display text-3xl font-medium">{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}

function ChartCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof BarChart3;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface-raised/70 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-2">
        <Icon size={16} className="text-gold" />
        <h3 className="font-display text-base font-medium">{title}</h3>
      </div>
      <div className="h-72">{children}</div>
    </div>
  );
}
