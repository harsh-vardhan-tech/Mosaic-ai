"use client";

import { useMemo } from "react";
import type { Item } from "@/lib/api";

// SVG can't use Tailwind classes for fill/font — use CSS custom properties directly.
const CATEGORY_HEX: Record<string, string> = {
  Projects: "hsl(172 80% 58%)",
  Skills: "hsl(252 80% 72%)",
  Certifications: "hsl(30 95% 62%)",
  Internships: "hsl(6 90% 66%)",
  Achievements: "hsl(36 100% 62%)",
  Academics: "hsl(232 12% 52%)",
};

const SIZE = 320;
const CENTER = SIZE / 2;
const RADIUS = 115;

export function RelationshipGraph({
  center,
  related,
}: {
  center: Item;
  related: (Item & { shared_skills: string[] })[];
}) {
  const nodes = useMemo(() => {
    const count = related.length;
    return related.map((item, i) => {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      return {
        item,
        x: CENTER + RADIUS * Math.cos(angle),
        y: CENTER + RADIUS * Math.sin(angle),
      };
    });
  }, [related]);

  const centerColor = CATEGORY_HEX[center.category] ?? "hsl(232 12% 52%)";

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="mx-auto w-full max-w-xs"
      role="img"
      aria-label="Related items graph"
    >
      <defs>
        {/* Subtle radial glow for center node */}
        <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={centerColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={centerColor} stopOpacity="0" />
        </radialGradient>
        {/* Edge gradient */}
        <linearGradient id="edge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={centerColor} stopOpacity="0.6" />
          <stop offset="100%" stopColor="hsl(232 18% 16%)" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Glow behind center node */}
      <circle cx={CENTER} cy={CENTER} r={44} fill="url(#center-glow)" />

      {/* Connector lines */}
      {nodes.map(({ item, x, y }) => {
        const nodeColor = CATEGORY_HEX[item.category] ?? "hsl(232 12% 52%)";
        return (
          <line
            key={`line-${item.id}`}
            x1={CENTER}
            y1={CENTER}
            x2={x}
            y2={y}
            stroke={`url(#edge-grad-${item.id})`}
            strokeWidth={1.5}
            strokeOpacity={0.5}
            strokeDasharray="4 3"
          >
            <defs>
              <linearGradient
                id={`edge-grad-${item.id}`}
                x1={CENTER}
                y1={CENTER}
                x2={x}
                y2={y}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor={centerColor} stopOpacity="0.7" />
                <stop offset="100%" stopColor={nodeColor} stopOpacity="0.4" />
              </linearGradient>
            </defs>
          </line>
        );
      })}

      {/* Center node */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={28}
        fill={centerColor}
        fillOpacity={0.15}
        stroke={centerColor}
        strokeWidth={2}
        strokeOpacity={0.9}
      />
      <text
        x={CENTER}
        y={CENTER + 4}
        textAnchor="middle"
        style={{
          fontSize: "9px",
          fontWeight: 600,
          fill: "hsl(36 20% 92%)",
          fontFamily: "var(--font-manrope, sans-serif)",
        }}
      >
        {truncate(center.title, 14)}
      </text>

      {/* Satellite nodes */}
      {nodes.map(({ item, x, y }) => {
        const color = CATEGORY_HEX[item.category] ?? "hsl(232 12% 52%)";
        return (
          <g key={item.id}>
            <title>{`${item.title} — shared skills: ${item.shared_skills.join(", ")}`}</title>

            {/* Subtle node glow */}
            <circle
              cx={x}
              cy={y}
              r={24}
              fill={color}
              fillOpacity={0.06}
            />

            <circle
              cx={x}
              cy={y}
              r={19}
              fill={color}
              fillOpacity={0.14}
              stroke={color}
              strokeWidth={1.5}
              strokeOpacity={0.75}
            />
            <text
              x={x}
              y={y + 3.5}
              textAnchor="middle"
              style={{
                fontSize: "8px",
                fontWeight: 500,
                fill: "hsl(36 20% 88%)",
                fontFamily: "var(--font-manrope, sans-serif)",
              }}
            >
              {truncate(item.title, 10)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}\u2026` : text;
}
