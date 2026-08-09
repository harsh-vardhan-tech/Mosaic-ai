"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Upload, Sparkles, Search, MessageSquare, FileText, Compass,Star,
  Clock, BarChart3, ArrowRight, BadgeCheck, FolderKanban, Trophy,
  Building2, Zap, Brain, Globe, Shield, GraduationCap,
  Download, Users, ChevronRight, Mic, Network, Target, TrendingUp,
  Menu, X, CheckCircle2, ArrowUpRight, Play, Layers,
  Cpu, Rocket, Lock, ChevronDown, Minus,
} from "lucide-react";
import { MosaicMark } from "@/components/mosaic-mark";
import { AccentSwitcher } from "@/components/accent-switcher";
import { cn } from "@/lib/utils";

export function LandingNav({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
  ];

  return (
    <header className={cn("sticky top-0 z-40 transition-all duration-300", scrolled ? "border-b border-border/30 bg-surface/70 shadow-sm shadow-ink/10 backdrop-blur-2xl" : "border-b border-transparent bg-transparent")}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Mosaic AI home" className="transition-opacity hover:opacity-80">
          <MosaicMark />
        </Link>
        <nav className="hidden items-center gap-0.5 text-sm text-muted md:flex">
          {navLinks.map(({ label, href }) => (
            <a key={label} href={href} className="nav-glass-hover relative rounded-lg px-3.5 py-2 transition-colors hover:text-foreground">{label}</a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <AccentSwitcher className="mr-1" />
          {signedIn ? (
            <Link href="/dashboard" className="btn-glow inline-flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground">
              Open dashboard <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted transition-all hover:bg-surface-raised/70 hover:text-foreground">Sign in</Link>
              <Link href="/signup" className="btn-glow inline-flex items-center gap-1.5 rounded-xl bg-gold px-5 py-2 text-sm font-semibold text-gold-foreground">
                Get started free <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <AccentSwitcher />
          <button aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-surface-raised/60 text-muted transition-all hover:text-foreground">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="glass-card border-b border-border/30 px-4 pb-5 pt-2 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {navLinks.map(({ label, href }) => (
              <a key={label} href={href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium text-muted transition-colors hover:bg-surface-raised/70 hover:text-foreground">{label}</a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-border/30 pt-4">
            {signedIn ? (
              <Link href="/dashboard" onClick={() => setOpen(false)} className="btn-glow flex items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-semibold text-gold-foreground">Open dashboard <ArrowRight size={15} /></Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="flex items-center justify-center rounded-xl border border-border/60 py-3 text-sm font-medium text-muted transition-colors hover:text-foreground">Sign in</Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="btn-glow flex items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-semibold text-gold-foreground">Get started free <ArrowRight size={15} /></Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

const HERO_TILES = [
  { label: "Certifications", icon: BadgeCheck, text: "text-tile-amber", bg: "bg-tile-amber/12", ring: "ring-tile-amber/30", title: "AWS Cloud Practitioner", sub: "Amazon · 2025", floatClass: "tile-float-0", glowClass: "glow-card-gold", tag2c: "bg-tile-teal/10 text-tile-teal ring-tile-teal/30", tag2l: "indexed" },
  { label: "Projects", icon: FolderKanban, text: "text-tile-teal", bg: "bg-tile-teal/12", ring: "ring-tile-teal/30", title: "Campus Navigation App", sub: "React Native · Maps API", floatClass: "tile-float-1", glowClass: "glow-card-teal", tag2c: "bg-tile-violet/10 text-tile-violet ring-tile-violet/30", tag2l: "searchable" },
  { label: "Achievements", icon: Trophy, text: "text-gold", bg: "bg-gold/12", ring: "ring-gold/30", title: "Hackathon Winner", sub: "National hackathon", floatClass: "tile-float-2", glowClass: "glow-card-gold", tag2c: "bg-gold/10 text-gold ring-gold/30", tag2l: "story ready" },
  { label: "Internships", icon: Building2, text: "text-tile-coral", bg: "bg-tile-coral/12", ring: "ring-tile-coral/30", title: "SDE Intern", sub: "Fintech startup · Summer", floatClass: "tile-float-3", glowClass: "glow-card-coral", tag2c: "bg-tile-coral/10 text-tile-coral ring-tile-coral/30", tag2l: "resume-ready" },
];

const STATS = [
  { value: "6+", label: "Smart categories", color: "text-gold" },
  { value: "8", label: "Dashboard modules", color: "text-tile-teal" },
  { value: "3", label: "AI models", color: "text-tile-violet" },
  { value: "\u221e", label: "Possibilities", color: "text-tile-coral" },
];

const PARTICLES = [
  { x: "10%", y: "18%", size: 3, dur: "7s", delay: "0s", color: "bg-gold/50" },
  { x: "87%", y: "13%", size: 2, dur: "9s", delay: "1.2s", color: "bg-tile-teal/55" },
  { x: "74%", y: "73%", size: 4, dur: "6.5s", delay: "0.5s", color: "bg-tile-violet/45" },
  { x: "18%", y: "78%", size: 2, dur: "11s", delay: "2s", color: "bg-tile-coral/45" },
  { x: "54%", y: "8%", size: 3, dur: "8.5s", delay: "0.8s", color: "bg-tile-amber/40" },
  { x: "91%", y: "52%", size: 2, dur: "10s", delay: "1.7s", color: "bg-gold/35" },
  { x: "4%", y: "43%", size: 3, dur: "7.5s", delay: "0.3s", color: "bg-tile-teal/40" },
  { x: "39%", y: "88%", size: 2, dur: "13s", delay: "2.5s", color: "bg-tile-violet/35" },
  { x: "62%", y: "32%", size: 2, dur: "8s", delay: "1.1s", color: "bg-gold/30" },
  { x: "28%", y: "55%", size: 2, dur: "9.5s", delay: "3s", color: "bg-tile-teal/30" },
];

const CYCLED_WORDS = ["portfolio", "resume", "mosaic", "identity", "story"];

export function LandingHero({ signedIn }: { signedIn: boolean }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [animClass, setAnimClass] = useState<"word-in" | "word-out">("word-in");

  useEffect(() => {
    const id = setInterval(() => {
      setAnimClass("word-out");
      setTimeout(() => {
        setWordIdx((i) => (i + 1) % CYCLED_WORDS.length);
        setAnimClass("word-in");
      }, 320);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="hero-section relative overflow-x-hidden">
      <div className="hero-spotlight" aria-hidden="true" />
      <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <div key={i} className={cn("particle absolute rounded-full", p.color)} style={{ left: p.x, top: p.y, width: p.size * 4, height: p.size * 4, "--dur": p.dur, "--delay": p.delay } as React.CSSProperties} />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="orbit-ring" style={{ width: 900, height: 900, "--orbit-dur": "55s" } as React.CSSProperties} />
        <div className="orbit-ring-2" style={{ width: 620, height: 620, "--orbit-dur": "38s" } as React.CSSProperties} />
      </div>
      <div className="aurora-beam" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-40 -top-40 h-[750px] w-[750px] rounded-full opacity-10 dark:opacity-[0.18]" style={{ background: "radial-gradient(circle, hsl(36 100% 62%), transparent 65%)", filter: "blur(100px)" }} aria-hidden="true" />
      <div className="pointer-events-none absolute -right-32 top-1/3 h-[520px] w-[520px] rounded-full opacity-6 dark:opacity-[0.12]" style={{ background: "radial-gradient(circle, hsl(172 80% 58%), transparent 65%)", filter: "blur(90px)" }} aria-hidden="true" />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 md:py-44 lg:grid-cols-2 xl:gap-16">
        <div className="flex flex-col items-start gap-6">
          {/* Trust row */}
          <div className="fade-up flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-surface-raised/60 px-3 py-1.5 text-xs font-medium text-muted backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tile-teal opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-tile-teal" />
              </span>
              Live — use it now
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-surface-raised/60 px-3 py-1.5 text-xs font-medium text-muted backdrop-blur-sm">
              <GraduationCap size={11} className="text-gold" />
              Built for students
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-surface-raised/60 px-3 py-1.5 text-xs font-medium text-muted backdrop-blur-sm">
              <Lock size={11} className="text-tile-violet" />
              Private &amp; encrypted
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="badge-shimmer inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">
              <Zap size={11} className="fill-gold" />
              AI-powered digital identity
            </span>
          </div>

          <h1 className="fade-up fade-up-delay-1 heading-glow text-balance font-display text-[2.4rem] font-semibold leading-[1.07] tracking-tight sm:text-5xl lg:text-[3.8rem] xl:text-[4.2rem]">
            Every achievement.<br />
            One living{" "}
            <span className="relative inline-block min-w-[6ch]">
              <span key={wordIdx} className={cn("gradient-text not-italic", animClass)}>
                {CYCLED_WORDS[wordIdx]}
              </span>
            </span>
            .
          </h1>

          <p className="fade-up fade-up-delay-2 max-w-lg text-pretty text-[1.05rem] leading-relaxed text-muted sm:text-lg">
            Certificates, projects, internships, and awards scattered across a dozen folders — Mosaic AI brings them together, organizes the details, and helps you turn them into a portfolio, searchable workspace, and resume.
          </p>

          <div className="fade-up fade-up-delay-3 flex flex-wrap items-center gap-3">
            <Link href={signedIn ? "/dashboard" : "/signup"} className="btn-glow inline-flex items-center gap-2 rounded-xl bg-gold px-7 py-3.5 text-sm font-semibold text-gold-foreground shadow-lg shadow-gold/20">
              {signedIn ? "Open your Mosaic" : "Build your Mosaic \u2014 free"}
              <ArrowRight size={16} />
            </Link>
            <a href="#how-it-works" className="btn-outline group inline-flex items-center gap-2 rounded-xl border border-border/50 bg-surface-raised/40 px-6 py-3.5 text-sm font-semibold text-foreground backdrop-blur-sm">
              <Play size={13} className="fill-muted text-muted transition-colors group-hover:fill-gold group-hover:text-gold" />
              See how it works
            </a>
          </div>

          <div className="fade-up fade-up-delay-4 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-surface-raised/60 px-3.5 py-1.5 text-xs font-medium text-muted backdrop-blur-sm">
              <Rocket size={12} className="text-gold" />
              Built by a student, for students
            </span>
            <div className="hidden h-8 w-px bg-border/50 sm:block" aria-hidden="true" />
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
              {[{ dot: "bg-tile-teal", label: "Semantic search" }, { dot: "bg-tile-coral", label: "RAG chat" }, { dot: "bg-gold", label: "One-click resume" }].map(({ dot, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", dot)} />
                    <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", dot)} />
                  </span>
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="fade-up fade-up-delay-5 mt-1 w-full border-t border-border/30 pt-6">
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {STATS.map((s, i) => (
                <div key={s.label} className="stat-card glass-card group flex flex-col items-center gap-1 rounded-2xl border border-border/40 px-2 py-3 text-center sm:px-3 sm:py-4">
                  <span className={cn("number-pop font-display text-xl font-bold sm:text-2xl lg:text-3xl", s.color)} style={{ animationDelay: `${0.55 + i * 0.1}s` }}>{s.value}</span>
                  <span className="text-[9px] leading-tight text-muted sm:text-[10px] lg:text-[11px]">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative fade-up fade-up-delay-2 mx-auto w-full max-w-sm sm:max-w-md lg:max-w-none" aria-hidden="true">
          <div className="pointer-events-none absolute -inset-16 rounded-3xl" style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, hsl(36 100% 62% / 0.16), hsl(172 80% 58% / 0.09) 50%, transparent 75%)", filter: "blur(32px)" }} />
          <div className="grid grid-cols-2 gap-4">
            {HERO_TILES.map((tile, i) => {
              const Icon = tile.icon;
              return (
                <div key={tile.label} className={cn("animated-border glass-card glass-shimmer flex flex-col gap-4 rounded-2xl p-4 sm:p-5", tile.floatClass, tile.glowClass, i === 1 && "mt-8", i === 3 && "mt-8")} style={{ boxShadow: "0 2px 30px hsl(var(--ink) / 0.45), inset 0 1px 0 hsl(var(--foreground) / 0.04)" }}>
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset sm:h-11 sm:w-11", tile.bg, tile.ring)}>
                    <Icon className={tile.text} size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">{tile.label}</p>
                    <p className="mt-0.5 font-display text-xs font-medium leading-snug sm:text-sm">{tile.title}</p>
                    <p className="mt-0.5 text-[10px] text-muted sm:text-xs">{tile.sub}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-surface/80 px-2 py-0.5 font-mono text-[9px] text-muted ring-1 ring-inset ring-border/40 sm:text-[10px]">AI extracted</span>
                    <span className={cn("rounded-full px-2 py-0.5 font-mono text-[9px] ring-1 ring-inset sm:text-[10px]", tile.tag2c)}>{tile.tag2l}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function GlowDivider() {
  return <div className="glow-divider" aria-hidden="true" />;
}

const MARQUEE_ROW_1 = [
  { label: "AI OCR", color: "text-tile-teal", bg: "bg-tile-teal/10" },
  { label: "RAG Chat", color: "text-tile-violet", bg: "bg-tile-violet/10" },
  { label: "Semantic Search", color: "text-gold", bg: "bg-gold/10" },
  { label: "Resume Builder", color: "text-tile-coral", bg: "bg-tile-coral/10" },
  { label: "Knowledge Graph", color: "text-tile-teal", bg: "bg-tile-teal/10" },
  { label: "Skill Gap Analysis", color: "text-tile-violet", bg: "bg-tile-violet/10" },
  { label: "Citation Sources", color: "text-gold", bg: "bg-gold/10" },
  { label: "Career Roadmap", color: "text-tile-amber", bg: "bg-tile-amber/10" },
  { label: "Voice Search", color: "text-tile-teal", bg: "bg-tile-teal/10" },
  { label: "Entity Extraction", color: "text-tile-coral", bg: "bg-tile-coral/10" },
  { label: "Portfolio Generator", color: "text-gold", bg: "bg-gold/10" },
  { label: "Interview Coach", color: "text-tile-violet", bg: "bg-tile-violet/10" },
  { label: "CGPA Tracker", color: "text-tile-teal", bg: "bg-tile-teal/10" },
  { label: "AI Bio", color: "text-tile-amber", bg: "bg-tile-amber/10" },
  { label: "Timeline View", color: "text-tile-coral", bg: "bg-tile-coral/10" },
  { label: "Hackathon Tracker", color: "text-gold", bg: "bg-gold/10" },
];

const MARQUEE_ROW_2 = [
  { label: "Google Drive Import", color: "text-tile-violet", bg: "bg-tile-violet/10" },
  { label: "ATS Resume Check", color: "text-tile-coral", bg: "bg-tile-coral/10" },
  { label: "Skill Radar Chart", color: "text-gold", bg: "bg-gold/10" },
  { label: "Multi-doc Chat", color: "text-tile-teal", bg: "bg-tile-teal/10" },
  { label: "PDF Export", color: "text-tile-amber", bg: "bg-tile-amber/10" },
  { label: "AI Cover Letter", color: "text-tile-violet", bg: "bg-tile-violet/10" },
  { label: "Achievement Detection", color: "text-gold", bg: "bg-gold/10" },
  { label: "LinkedIn Import", color: "text-tile-coral", bg: "bg-tile-coral/10" },
  { label: "Version History", color: "text-tile-teal", bg: "bg-tile-teal/10" },
  { label: "Relationship Engine", color: "text-tile-violet", bg: "bg-tile-violet/10" },
  { label: "NPTEL Tracker", color: "text-tile-amber", bg: "bg-tile-amber/10" },
  { label: "AI Personalization", color: "text-tile-coral", bg: "bg-tile-coral/10" },
  { label: "QR Portfolio", color: "text-gold", bg: "bg-gold/10" },
  { label: "Voice Upload", color: "text-tile-teal", bg: "bg-tile-teal/10" },
  { label: "GitHub Import", color: "text-tile-violet", bg: "bg-tile-violet/10" },
  { label: "Multi-language", color: "text-tile-coral", bg: "bg-tile-coral/10" },
];

function MarqueePill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className={cn("marquee-pill-hover mx-2 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/35 px-3.5 py-1.5 text-sm font-medium", bg, color)}>
      <span className={cn("h-1.5 w-1.5 rounded-full opacity-60", bg.replace("/10", ""))} />
      {label}
    </span>
  );
}

export function LandingMarquee() {
  return (
    <>
      <GlowDivider />
      <section className="relative overflow-hidden py-10">
        <div className="pointer-events-none absolute inset-0 opacity-30" style={{ background: "radial-gradient(ellipse 80% 100% at 50% 50%, hsl(var(--surface-raised)), transparent)" }} aria-hidden="true" />
        <p className="reveal mb-5 text-center text-xs font-medium uppercase tracking-widest text-muted">
          160+ features across every dimension of your career
        </p>
        <div className="relative flex flex-col gap-3">
          <div className="marquee-wrapper">
            <div className="marquee-track">
              {[...MARQUEE_ROW_1, ...MARQUEE_ROW_1].map((item, i) => (<MarqueePill key={i} {...item} />))}
            </div>
          </div>
          <div className="marquee-wrapper">
            <div className="marquee-track-reverse">
              {[...MARQUEE_ROW_2, ...MARQUEE_ROW_2].map((item, i) => (<MarqueePill key={i} {...item} />))}
            </div>
          </div>
        </div>
      </section>
      <GlowDivider />
    </>
  );
}

const FEATURES = [
  { icon: Upload, color: "text-tile-teal", bg: "bg-tile-teal/12", border: "border-tile-teal/20", glow: "glow-card-teal", title: "Drop anything, get structure", body: "PDFs, images, and DOCX files are organized into title, organization, dates, skills, entities, and category automatically.", badges: ["OCR", "Auto-title", "Auto-tags"] },
  { icon: MessageSquare, color: "text-tile-coral", bg: "bg-tile-coral/12", border: "border-tile-coral/20", glow: "glow-card-coral", title: "Chat with your journey", body: "Ask \"what AI certifications do I have?\" and get grounded answers with the exact source documents cited inline.", badges: ["RAG", "Citations", "Multi-doc"] },
  { icon: Search, color: "text-tile-violet", bg: "bg-tile-violet/12", border: "border-tile-violet/20", glow: "glow-card-violet", title: "Semantic + hybrid search", body: "Find items by meaning, not just keywords — every document is embedded into a personal vector index, scoped only to you.", badges: ["Semantic", "Keyword", "Voice"] },
  { icon: FileText, color: "text-gold", bg: "bg-gold/12", border: "border-gold/20", glow: "glow-card-gold", title: "One-click resume & bio", body: "Generate a structured resume, professional bio, shareable portfolio, cover letter, or LinkedIn summary from everything uploaded.", badges: ["PDF export", "ATS check", "Templates"] },
  { icon: Compass, color: "text-tile-amber", bg: "bg-tile-amber/12", border: "border-tile-amber/20", glow: "glow-card-gold", title: "Career intelligence", body: "Pick a target role and get a skill-gap analysis, personalized learning roadmap, AI interview coach, and mock interview questions.", badges: ["Skill gap", "Roadmap", "Interview"] },
  { icon: BarChart3, color: "text-tile-teal", bg: "bg-tile-teal/12", border: "border-tile-teal/20", glow: "glow-card-teal", title: "Analytics & timeline", body: "Skill radar charts, category breakdowns, year-by-year growth, career score, AI readiness score, and a chronological career timeline.", badges: ["Radar chart", "Skill graph", "Timeline"] },
  { icon: Network, color: "text-tile-violet", bg: "bg-tile-violet/12", border: "border-tile-violet/20", glow: "glow-card-violet", title: "Knowledge graph", body: "See how your skills, certificates, projects, internships, and companies connect — an interactive visual web of your expertise.", badges: ["Graph viz", "Relationships", "Interactive"] },
  { icon: Globe, color: "text-tile-coral", bg: "bg-tile-coral/12", border: "border-tile-coral/20", glow: "glow-card-coral", title: "One-click public portfolio", body: "Generate a public portfolio website from your Mosaic with a shareable link, QR code, and portfolio analytics.", badges: ["Public URL", "QR code", "Analytics"] },
  { icon: GraduationCap, color: "text-tile-amber", bg: "bg-tile-amber/12", border: "border-tile-amber/20", glow: "glow-card-gold", title: "Student-first features", body: "CGPA tracker, semester tracking, NPTEL courses, placement tracker, hackathon tracker, and internship management in one place.", badges: ["CGPA", "NPTEL", "Placements"] },
];

export function LandingFeatures() {
  return (
    <section id="features" className="relative overflow-hidden">
      <div className="grid-lines-bg" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 opacity-25" style={{ background: "radial-gradient(ellipse 65% 100% at 50% 0%, hsl(var(--gold) / 0.14), transparent)" }} aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <div className="reveal mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-surface-raised/60 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted backdrop-blur-sm">
            <Sparkles size={12} className="text-gold" />
            9 AI systems, one platform
          </span>
          <h2 className="mt-4 text-balance font-display text-3xl font-medium tracking-tight sm:text-4xl lg:text-[2.6rem]">
            A career record that <span className="gradient-text">works for you</span>
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted">From raw files to searchable, chatted, generated intelligence — Mosaic AI does all the heavy lifting.</p>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className={cn("reveal animated-border glass-card glass-shimmer group flex flex-col gap-5 rounded-2xl border p-6", f.border, f.glow, i % 3 === 1 && "reveal-delay-2", i % 3 === 2 && "reveal-delay-3")}>
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-inset transition-all duration-300 group-hover:scale-110", f.bg, f.border)}>
                  <Icon className={f.color} size={22} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-medium leading-snug">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
                </div>
                <div className="mt-auto flex flex-wrap gap-1.5">
                  {f.badges.map((b) => (
                    <span key={b} className={cn("rounded-full px-2.5 py-1 font-mono text-[10px] ring-1 ring-inset", f.bg, f.color, f.border)}>{b}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { icon: Upload, color: "text-gold", bg: "bg-gold/12", border: "border-gold/25", glow: "glow-card-gold", num: "01", title: "Upload anything", body: "Drag in a certificate, project report, internship letter, or degree transcript. PDF, image, DOCX — all supported up to 15 MB.", connector: "from-gold/50", detail: "Batch upload, ZIP, Google Drive — all work." },
  { icon: Brain, color: "text-tile-violet", bg: "bg-tile-violet/12", border: "border-tile-violet/25", glow: "glow-card-violet", num: "02", title: "AI organizes the story", body: "AI reads each file and pulls out skills, dates, organizations, entities, and importance — then organizes everything for you.", connector: "from-tile-violet/50", detail: "Review and edit everything before you use it." },
  { icon: Zap, color: "text-tile-teal", bg: "bg-tile-teal/12", border: "border-tile-teal/25", glow: "glow-card-teal", num: "03", title: "Use it everywhere", body: "Search it, chat with it, see it on your timeline, generate resumes and bios, get career analysis — your entire journey, instantly accessible.", connector: null, detail: "Your Mosaic grows smarter with every upload." },
];

export function LandingHowItWorks() {
  return (
    <>
      <GlowDivider />
      <section id="how-it-works" className="relative overflow-hidden bg-surface-raised/12">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-80 opacity-18" style={{ background: "radial-gradient(ellipse 65% 100% at 50% 100%, hsl(var(--tile-teal) / 0.14), transparent)" }} aria-hidden="true" />
        {/* Extra desktop ambient glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-12 hidden md:block" style={{ background: "radial-gradient(ellipse 55% 100% at 50% 0%, hsl(var(--tile-violet) / 0.12), transparent)" }} aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-32">
          <div className="reveal mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-surface-raised/60 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted backdrop-blur-sm">
              <Zap size={12} className="text-tile-teal" />
              Simple by design
            </span>
            <h2 className="mt-4 text-balance font-display text-3xl font-medium tracking-tight sm:text-4xl lg:text-[2.6rem]">
              Three steps to a <span className="gradient-text-cyan">living portfolio</span>
            </h2>
            <p className="mt-4 text-pretty text-muted">From raw files to searchable, chatted, generated intelligence.</p>
          </div>
          <ol className="relative mt-16 grid gap-6 md:grid-cols-3 md:gap-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className={cn("reveal animated-border glass-card glass-shimmer group relative flex flex-col gap-6 rounded-3xl border p-8 md:p-10", step.border, step.glow, i === 1 && "reveal-delay-2", i === 2 && "reveal-delay-3")}>
                  {i < STEPS.length - 1 && (
                    <div className={cn("absolute -right-4 top-14 z-10 hidden h-px w-8 md:block", `bg-gradient-to-r ${step.connector} to-transparent`)} aria-hidden="true" />
                  )}
                  {/* Step number badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className={cn("flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset transition-all duration-300 group-hover:scale-110 md:h-[72px] md:w-[72px]", step.bg, step.border)}>
                      <Icon size={30} className={step.color} />
                    </div>
                    <span className="select-none font-display text-6xl font-bold leading-none text-foreground/[0.07] md:text-7xl">{step.num}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-semibold md:text-2xl">{step.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">{step.body}</p>
                  </div>
                  <div className={cn("flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs md:text-sm", step.bg, step.border, step.color)}>
                    <CheckCircle2 size={14} className="flex-shrink-0" />
                    {step.detail}
                  </div>
                </li>
              );
            })}
          </ol>
          {/* Desktop connector line */}
          <div className="pointer-events-none relative mt-10 hidden md:flex items-center justify-center gap-0" aria-hidden="true">
            <div className="h-px w-2/3 bg-gradient-to-r from-transparent via-border/40 to-transparent" />
          </div>
        </div>
      </section>
      <GlowDivider />
    </>
  );
}

const ALL_FEATURE_CATEGORIES = [
  { icon: Upload, color: "text-tile-teal", bg: "bg-tile-teal/10", title: "Document Management", features: ["Drag & Drop Upload","Multi-file Upload","Folder Upload","ZIP Upload","DOCX Support","PDF Support","Image OCR","Auto File Rename","Duplicate Detection","Version History","Document Preview","Download Original","Favorite Documents","Pin Documents","Archive Documents","Smart Folder Creation","Bulk Upload","Bulk Delete"] },
  { icon: Sparkles, color: "text-tile-violet", bg: "bg-tile-violet/10", title: "AI Processing", features: ["OCR","Metadata Extraction","Entity Extraction","Skill Extraction","Project Extraction","Internship Extraction","Achievement Extraction","Education Extraction","Contact Extraction","Experience Extraction","Keyword Extraction","Summary Generation","Auto Title","Auto Tags","AI Description","AI Importance Score","AI Confidence Score"] },
  { icon: MessageSquare, color: "text-tile-coral", bg: "bg-tile-coral/10", title: "RAG Features", features: ["Chat with Documents","Multi-document Chat","Cross-document Reasoning","Citation Sources","Source Highlighting","Context Window","Conversation History","Suggested Questions","Smart Prompts","AI Follow-up Questions","Memory Context","AI Explanation Mode","Chat Export"] },
  { icon: Search, color: "text-gold", bg: "bg-gold/10", title: "Search", features: ["Semantic Search","Keyword Search","Hybrid Search","Voice Search","Image Search","Search by Skill","Search by Year","Search by Company","Search by Certificate","Search by Project","Search by Internship","Search by Tag","Search Filters","Recent Searches","Search Suggestions"] },
  { icon: BarChart3, color: "text-tile-teal", bg: "bg-tile-teal/10", title: "Analytics", features: ["Total Documents","Total Skills","Total Projects","Total Certificates","Skills Graph","Category Graph","Year-wise Growth","Monthly Activity","Career Score","AI Readiness Score","Resume Score","Profile Completion","Upload Statistics","AI Usage Statistics"] },
  { icon: Clock, color: "text-tile-amber", bg: "bg-tile-amber/10", title: "Timeline", features: ["Career Timeline","Academic Timeline","Achievement Timeline","Internship Timeline","Certification Timeline","Project Timeline","Timeline Filters","Timeline Search","Timeline Export"] },
  { icon: Network, color: "text-tile-violet", bg: "bg-tile-violet/10", title: "Relationship Engine", features: ["Skill \u2194 Certificate","Skill \u2194 Project","Project \u2194 Internship","Internship \u2194 Company","Company \u2194 Skill","Education \u2194 Skill","Achievement \u2194 Project","Knowledge Graph","Interactive Graph"] },
  { icon: Users, color: "text-tile-coral", bg: "bg-tile-coral/10", title: "Profile Intelligence", features: ["AI Bio","AI Resume","AI Portfolio","AI LinkedIn Summary","AI Cover Letter","AI Introduction","AI Elevator Pitch","AI About Me","AI Career Summary","AI Personal Branding"] },
  { icon: Compass, color: "text-gold", bg: "bg-gold/10", title: "Career Features", features: ["Career Suggestions","Recommended Jobs","Skill Gap Analysis","Missing Skills","Learning Roadmap","Next Certification Recommendation","Resume Improvement Tips","Interview Questions","Mock Interview","ATS Resume Check"] },
  { icon: TrendingUp, color: "text-tile-teal", bg: "bg-tile-teal/10", title: "AI Insights", features: ["Top Skill","Weak Skill","Missing Documents","Career Growth Prediction","Learning Pattern","Activity Insights","Achievement Insights","Profile Strength","AI Suggestions","Smart Notifications"] },
  { icon: FileText, color: "text-tile-violet", bg: "bg-tile-violet/10", title: "Resume Features", features: ["Resume Builder","Resume Analyzer","Resume Score","Resume Export PDF","Resume Templates","Resume Versioning","Resume Comparison","Resume Optimization"] },
  { icon: Globe, color: "text-tile-amber", bg: "bg-tile-amber/10", title: "Portfolio", features: ["One-click Portfolio Website","Portfolio Export","Public Profile","Portfolio Sharing","QR Code","Portfolio Analytics"] },
  { icon: Download, color: "text-tile-coral", bg: "bg-tile-coral/10", title: "Export", features: ["Export PDF","Export DOCX","Export JSON","Export Markdown","Export ZIP","Email Report"] },
  { icon: Shield, color: "text-gold", bg: "bg-gold/10", title: "Security", features: ["Google Login","Microsoft Login","GitHub Login","MFA","Email Verification","Session History","Device Management","Secure File Encryption"] },
  { icon: Brain, color: "text-tile-violet", bg: "bg-tile-violet/10", title: "Smart AI", features: ["AI Memory","AI Personalization","AI Daily Summary","AI Weekly Report","AI Achievement Detection","AI Duplicate Detection","AI Goal Tracking","AI Progress Tracking","AI Habit Analysis"] },
  { icon: GraduationCap, color: "text-tile-teal", bg: "bg-tile-teal/10", title: "Student Features", features: ["Semester Tracking","CGPA Tracking","Subject Tracking","Certificate Tracking","Internship Tracking","Placement Tracker","Hackathon Tracker","Course Tracker","NPTEL Tracker"] },
  { icon: Globe, color: "text-tile-coral", bg: "bg-tile-coral/10", title: "Integrations", features: ["GitHub Import","LinkedIn Import","Google Drive","OneDrive","Dropbox","Notion","Gmail","Google Calendar"] },
  { icon: Mic, color: "text-tile-amber", bg: "bg-tile-amber/10", title: "Advanced AI", features: ["Voice Chat","Voice Upload","Speech-to-Text","AI Podcast Summary","Lecture Notes","AI Translation","Multi-language Support","AI Document Comparison"] },
];

const WOW_FEATURES = [
  { icon: Network, color: "text-tile-violet", bg: "bg-tile-violet/12", border: "border-tile-violet/25", glow: "glow-card-violet", title: "Knowledge Graph Visualization", body: "An interactive visual web showing how all your skills, projects, certificates, and companies connect to each other." },
  { icon: Clock, color: "text-tile-teal", bg: "bg-tile-teal/12", border: "border-tile-teal/25", glow: "glow-card-teal", title: "3D Career Timeline", body: "Your entire career journey rendered as an animated, scrollable timeline — the story of how far you've come." },
  { icon: Target, color: "text-tile-coral", bg: "bg-tile-coral/12", border: "border-tile-coral/25", glow: "glow-card-coral", title: "AI Career Twin", body: "An AI that deeply knows your profile and acts as your personal career advisor — \"Am I ready for this job?\"" },
  { icon: Star, color: "text-gold", bg: "bg-gold/12", border: "border-gold/25", glow: "glow-card-gold", title: "AI Story of My Journey", body: "Generate a compelling narrative of your entire student journey — certificates, hackathons, internships, projects and all." },
  { icon: BarChart3, color: "text-tile-violet", bg: "bg-tile-violet/12", border: "border-tile-violet/25", glow: "glow-card-violet", title: "AI Skill Radar Chart", body: "A beautiful radar visualization of your skill coverage across technical, soft, domain, and academic dimensions." },
  { icon: Sparkles, color: "text-tile-amber", bg: "bg-tile-amber/12", border: "border-tile-amber/25", glow: "glow-card-gold", title: "AI Interview Coach", body: "Real interview questions grounded in YOUR actual projects and internships — not generic prep. Practice with hints." },
];

export function LandingAllFeatures() {
  const totalFeatures = ALL_FEATURE_CATEGORIES.reduce((sum, c) => sum + c.features.length, 0);
  return (
    <section id="all-features" className="relative overflow-hidden">
      <div className="grid-lines-bg" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 opacity-22" style={{ background: "radial-gradient(ellipse 70% 100% at 50% 0%, hsl(var(--tile-violet) / 0.14), transparent)" }} aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <div className="mb-24">
          <div className="reveal mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
              <Star size={12} className="fill-gold" />
              Standout experiences
            </span>
            <h2 className="mt-4 text-balance font-display text-3xl font-medium tracking-tight sm:text-4xl lg:text-[2.6rem]">
              Built to <span className="gradient-text">leave an impression</span>
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted">Every detail is crafted so your profile speaks before you do.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WOW_FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className={cn("reveal animated-border glass-card glass-shimmer group flex flex-col gap-4 rounded-2xl border p-6", f.border, f.glow, i % 3 === 1 && "reveal-delay-2", i % 3 === 2 && "reveal-delay-3")}>
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-inset transition-all duration-300 group-hover:scale-110", f.bg, f.border)}>
                    <Icon className={f.color} size={22} />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-medium leading-snug">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="reveal mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-surface-raised/60 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted backdrop-blur-sm">
            <Zap size={12} className="text-gold" />
            {totalFeatures}+ features total
          </span>
          <h2 className="mt-4 text-balance font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Everything you&apos;d ever need
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted">A complete platform built from first principles for students who take their careers seriously.</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_FEATURE_CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <div key={cat.title} className={cn("reveal card-hover glass-shimmer group rounded-2xl border border-border/40 bg-surface-raised/45 p-5 backdrop-blur-sm", i % 3 === 1 && "reveal-delay-2", i % 3 === 2 && "reveal-delay-3")}>
                <div className="mb-4 flex items-center gap-3">
                  <div className={cn("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-border/30 transition-transform duration-200 group-hover:scale-110", cat.bg)}>
                    <Icon size={16} className={cat.color} />
                  </div>
                  <h3 className="font-display text-sm font-semibold">{cat.title}</h3>
                  <span className="ml-auto flex-shrink-0 rounded-full bg-surface/80 px-2 py-0.5 font-mono text-[10px] text-muted ring-1 ring-border/60">{cat.features.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.features.map((feature) => (
                    <span key={feature} className="feature-pill-hover cursor-default rounded-md bg-surface/70 px-2 py-1 text-[11px] text-muted ring-1 ring-inset ring-border/40">{feature}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   COMPARISON TABLE
   ================================================================ */
const COMPARISON_ROWS = [
  { feature: "AI document extraction", mosaic: true, linkedin: false, notion: false, pdf: false },
  { feature: "Semantic search over your files", mosaic: true, linkedin: false, notion: true, pdf: false },
  { feature: "Chat with your portfolio (RAG)", mosaic: true, linkedin: false, notion: false, pdf: false },
  { feature: "One-click AI resume", mosaic: true, linkedin: true, notion: false, pdf: false },
  { feature: "Skill gap analysis + roadmap", mosaic: true, linkedin: false, notion: false, pdf: false },
  { feature: "Career timeline visualization", mosaic: true, linkedin: true, notion: false, pdf: false },
  { feature: "AI cover letter & bio", mosaic: true, linkedin: false, notion: false, pdf: false },
  { feature: "Knowledge graph of your skills", mosaic: true, linkedin: false, notion: false, pdf: false },
  { feature: "Public shareable portfolio URL", mosaic: true, linkedin: true, notion: true, pdf: false },
  { feature: "Student-specific features (CGPA, NPTEL)", mosaic: true, linkedin: false, notion: false, pdf: false },
  { feature: "Free to use", mosaic: true, linkedin: true, notion: false, pdf: true },
];

export function LandingComparison() {
  return (
    <>
      <GlowDivider />
      <section id="comparison" className="relative overflow-hidden bg-surface-raised/8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 opacity-18" style={{ background: "radial-gradient(ellipse 55% 100% at 50% 0%, hsl(var(--tile-teal) / 0.10), transparent)" }} aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-20 sm:px-6 md:py-28">
          <div className="reveal mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-surface-raised/60 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted backdrop-blur-sm">
              <Layers size={12} className="text-gold" />
              Why Mosaic?
            </span>
            <h2 className="mt-4 text-balance font-display text-3xl font-medium tracking-tight sm:text-4xl lg:text-[2.6rem]">
              Not just another <span className="gradient-text">profile page</span>
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted">See how Mosaic AI compares to the tools students usually fall back on.</p>
          </div>

          <div className="reveal mt-14 overflow-x-auto rounded-2xl border border-border/40">
            <table className="w-full min-w-[540px] text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-surface-raised/50">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-widest text-muted">Feature</th>
                  <th className="px-4 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-gold/12 px-3 py-1 text-xs font-bold text-gold ring-1 ring-gold/25">
                      <Zap size={11} className="fill-gold" />
                      Mosaic AI
                    </span>
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-muted">LinkedIn</th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-muted">Notion</th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-muted">Plain PDF</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={row.feature} className={cn("border-b border-border/25 transition-colors hover:bg-surface-raised/40", i % 2 === 0 ? "bg-transparent" : "bg-surface-raised/15")}>
                    <td className="px-5 py-3.5 text-sm text-foreground/80">{row.feature}</td>
                    <td className="px-4 py-3.5 text-center">
                      {row.mosaic ? (
                        <CheckCircle2 size={17} className="mx-auto text-tile-teal" />
                      ) : (
                        <Minus size={15} className="mx-auto text-muted/30" />
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {row.linkedin ? (
                        <CheckCircle2 size={15} className="mx-auto text-muted/60" />
                      ) : (
                        <Minus size={15} className="mx-auto text-muted/30" />
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {row.notion ? (
                        <CheckCircle2 size={15} className="mx-auto text-muted/60" />
                      ) : (
                        <Minus size={15} className="mx-auto text-muted/30" />
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {row.pdf ? (
                        <CheckCircle2 size={15} className="mx-auto text-muted/60" />
                      ) : (
                        <Minus size={15} className="mx-auto text-muted/30" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <GlowDivider />
    </>
  );
}

/* ================================================================
   FAQ ACCORDION
   ================================================================ */
const FAQS = [
  {
    q: "Is Mosaic AI really free?",
    a: "Yes — completely free for students. Upload your documents, use AI extraction, semantic search, chat, resume generation, and get your public portfolio URL with no credit card required.",
  },
  {
    q: "What file types does Mosaic AI support?",
    a: "PDF, DOCX, JPG, PNG, WEBP, and ZIP files up to 15 MB each. Gemini AI handles OCR on scanned certificates and images automatically.",
  },
  {
    q: "Is my data private and secure?",
    a: "All documents are encrypted at rest and scoped strictly to your account. No other user can access your files. Vector indexes are isolated per user — nothing is ever shared.",
  },
  {
    q: "How accurate is the AI extraction?",
    a: "Gemini 1.5 Pro reads each file in full and extracts title, organization, dates, skills, and category with very high accuracy. You can always edit any extracted field manually.",
  },
  {
    q: "Can I use Mosaic AI for placements and internship applications?",
    a: "Absolutely — that is the main use case. Generate an ATS-optimized resume, AI cover letter, LinkedIn summary, or shareable portfolio URL directly from your uploaded documents in seconds.",
  },
  {
    q: "What is the Knowledge Graph?",
    a: "It is an interactive visual graph that shows how your skills, certificates, projects, internships, and companies connect to each other — giving you a bird's-eye view of your expertise.",
  },
  {
    q: "Do I need to upload my CV to get started?",
    a: "No. Start by uploading any single certificate, project report, or internship letter. Mosaic builds your profile incrementally — every new document makes it smarter.",
  },
  {
    q: "What is RAG chat?",
    a: "RAG stands for Retrieval-Augmented Generation. You can ask questions like 'what AI certifications do I have?' and Mosaic retrieves the exact documents, then Gemini generates a grounded answer with citations.",
  },
];

function FaqItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn("rounded-2xl border transition-all duration-200", open ? "border-gold/25 bg-gold/5" : "border-border/35 bg-surface-raised/30")}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold leading-snug sm:text-base">{q}</span>
        <ChevronDown size={17} className={cn("flex-shrink-0 text-muted transition-transform duration-200", open && "rotate-180 text-gold")} />
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-sm leading-relaxed text-muted">{a}</p>
        </div>
      )}
    </div>
  );
}

export function LandingFaq() {
  return (
    <>
      <GlowDivider />
      <section id="faq" className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-15" style={{ background: "radial-gradient(ellipse 50% 100% at 50% 0%, hsl(var(--tile-violet) / 0.12), transparent)" }} aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 py-20 sm:px-6 md:py-28">
          <div className="reveal mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-surface-raised/60 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted backdrop-blur-sm">
              <MessageSquare size={12} className="text-tile-violet" />
              Common questions
            </span>
            <h2 className="mt-4 text-balance font-display text-3xl font-medium tracking-tight sm:text-4xl lg:text-[2.6rem]">
              Everything you <span className="gradient-text-cyan">want to know</span>
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted">No jargon. Straight answers.</p>
          </div>
          <div className="mt-12 flex flex-col gap-3">
            {FAQS.map((faq, i) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} defaultOpen={i === 0} />
            ))}
          </div>
        </div>
      </section>
      <GlowDivider />
    </>
  );
}

export function LandingCta({ signedIn }: { signedIn: boolean }) {
  return (
    <>
      <GlowDivider />
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="cta-aurora" aria-hidden="true" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-48 -top-48 h-[600px] w-[600px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, hsl(36 100% 62%), transparent 70%)", filter: "blur(90px)" }} />
          <div className="absolute -bottom-48 -right-48 h-[600px] w-[600px] rounded-full opacity-16" style={{ background: "radial-gradient(circle, hsl(172 80% 58%), transparent 70%)", filter: "blur(90px)" }} />
          <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10" style={{ background: "radial-gradient(circle, hsl(252 80% 72%), transparent 70%)", filter: "blur(70px)" }} />
        </div>
        <div className="noise-overlay" aria-hidden="true" />
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-7 px-4 py-28 text-center sm:px-6 md:py-36">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/12 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
            <Sparkles size={12} className="fill-gold" />
            Free to start — no credit card
          </span>
          <h2 className="heading-glow max-w-3xl text-balance font-display text-4xl font-semibold tracking-tight text-paper sm:text-5xl lg:text-[3.5rem]">
            Your achievements deserve better<br className="hidden sm:block" /> than a{" "}
            <span className="gradient-text">downloads folder</span>.
          </h2>
          <p className="max-w-xl text-pretty text-lg leading-relaxed text-paper/55">
            Start uploading in under a minute — Mosaic AI handles the extraction, organization, and storytelling so you can focus on what matters.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Link href={signedIn ? "/dashboard" : "/signup"} className="btn-glow inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-10 py-4 text-base font-semibold text-gold-foreground sm:w-auto">
              {signedIn ? "Open your Mosaic" : "Create your free account"}
              <ArrowRight size={18} />
            </Link>
            <a href="#features" className="btn-outline inline-flex w-full items-center justify-center gap-2 rounded-xl border border-paper/25 bg-paper/5 px-8 py-4 text-base font-semibold text-paper/80 backdrop-blur-sm transition-all hover:bg-paper/10 hover:text-paper sm:w-auto">
              Explore features
              <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-paper/40">
            {[{ icon: BadgeCheck, color: "text-tile-teal", label: "No credit card required" }, { icon: Zap, color: "text-gold", label: "Setup in 60 seconds" }, { icon: Shield, color: "text-tile-violet", label: "Your data, encrypted" }].map(({ icon: Icon, color, label }) => (
              <span key={label} className="inline-flex items-center gap-2"><Icon size={15} className={color} />{label}</span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function LandingFooter() {
  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Comparison", href: "#comparison" },
    { label: "FAQ", href: "#faq" },
    { label: "Sign in", href: "/login" },
    { label: "Get started", href: "/signup" },
  ];
  const TECH_STACK = ["Gemini AI", "Firebase", "Next.js", "Pinecone"];
  return (
    <footer className="relative overflow-hidden border-t border-paper/8 bg-ink text-paper">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(36 100% 62% / 0.45) 50%, transparent)" }} aria-hidden="true" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-3">
          <div className="flex flex-col gap-4">
            <MosaicMark />
            <p className="max-w-xs text-sm leading-relaxed text-paper/40">
              AI-powered digital identity for students — turn scattered achievements into a living, searchable portfolio.
            </p>
            <div className="flex flex-wrap gap-2">
              {TECH_STACK.map((t) => (
                <span key={t} className="rounded-full border border-paper/12 bg-paper/6 px-2.5 py-1 text-[10px] font-medium text-paper/40">{t}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-paper/30">Navigation</p>
            <nav className="flex flex-col gap-2.5" aria-label="Footer navigation">
              {navLinks.map(({ label, href }) => (
                <a key={label} href={href} className="group inline-flex items-center gap-1.5 text-sm text-paper/40 transition-colors hover:text-paper/80">
                  <ChevronRight size={12} className="text-paper/20 transition-transform group-hover:translate-x-0.5 group-hover:text-gold/70" />
                  {label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-paper/30">Get started</p>
            <p className="text-sm leading-relaxed text-paper/40">Free forever for students. Upload your first document and watch the magic happen.</p>
            <Link href="/signup" className="btn-glow inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-semibold text-gold-foreground">
              Build your Mosaic <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-paper/8 py-6 sm:flex-row">
          <p className="text-[11px] tracking-wide text-paper/25">&copy; {new Date().getFullYear()} Mosaic AI. All rights reserved.</p>
          <p className="text-[11px] tracking-wide text-paper/25">
            Crafted by{" "}
            <a href="https://harsh-vardhan.tech" target="_blank" rel="noopener noreferrer" className="font-medium text-paper/40 underline-offset-2 transition-colors hover:text-gold hover:underline">
              Harsh Vardhan
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
