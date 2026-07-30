"use client";

import { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   GalaxyBg — accent-aware live canvas background
   Theme is detected INSTANTLY via MutationObserver on data-accent + style.
   Each accent has its own distinct particle animation:
     azure  → drifting star field + shooting stars  (blue / cool white)
     gold   → golden dust storm, warm embers         (amber / orange)
     teal   → bioluminescence ocean, rising bubbles  (cyan / seafoam)
     coral  → fire embers floating upward            (orange / red)
     violet → vortex spiral arms                     (purple / indigo)
───────────────────────────────────────────────────────────────────────────── */

type Theme = "azure" | "gold" | "teal" | "coral" | "violet";

// ─── accent → fixed HSL palette per theme ────────────────────────────────────
const THEME_HSL: Record<Theme, [number, number, number]> = {
  azure:  [210, 100, 63],
  gold:   [36,  100, 62],
  teal:   [188, 92,  60],
  coral:  [8,   92,  68],
  violet: [260, 92,  74],
};

function getThemeFromDOM(): Theme {
  if (typeof document === "undefined") return "azure";
  const da = document.documentElement.dataset.accent as Theme | undefined;
  if (da && da !== "azure") return da;
  // Fallback: read --gold hue from inline style
  const v = document.documentElement.style.getPropertyValue("--gold").trim();
  if (!v) return "azure";
  const hue = parseFloat(v.split(/\s+/)[0] ?? "210");
  if (hue >= 25  && hue <= 50)  return "gold";
  if (hue >= 170 && hue <= 205) return "teal";
  if (hue >= 1   && hue <= 24)  return "coral";
  if (hue >= 240 && hue <= 290) return "violet";
  return "azure";
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
const rnd  = (a: number, b: number) => a + Math.random() * (b - a);
const rndI = (a: number, b: number) => Math.floor(rnd(a, b));

// ═══════════════════════════════════════════════════════════════════════════════
// AZURE — Star field + shooting stars
// ═══════════════════════════════════════════════════════════════════════════════
interface Star { x: number; y: number; z: number; r: number; speed: number; op: number; tw: number; twS: number; colored: boolean }
interface Shooter { x: number; y: number; vx: number; vy: number; len: number; life: number; decay: number }

function initAzure(W: number, H: number) {
  const n = Math.min(Math.round((W * H) / 4000), 300);
  const stars: Star[] = Array.from({ length: n }, () => {
    const z = Math.random();
    return { x: rnd(0, W), y: rnd(0, H), z, r: 0.3 + z * 1.5, speed: 0.05 + z * 0.2, op: 0.18 + z * 0.52, tw: rnd(0, Math.PI * 2), twS: rnd(0.005, 0.014), colored: z > 0.55 };
  });
  const nebulae = Array.from({ length: 5 }, () => ({ x: rnd(0.1, 0.9) * W, y: rnd(0.1, 0.9) * H, r: rnd(130, 260), op: rnd(0.018, 0.04), ph: rnd(0, Math.PI * 2), spd: rnd(0.0018, 0.004), hShift: rnd(-45, 45) }));
  return { stars, nebulae, shooters: [] as Shooter[] };
}

function drawAzure(ctx: CanvasRenderingContext2D, W: number, H: number, frame: number, s: ReturnType<typeof initAzure>, h: number, sat: number, lit: number) {
  for (const nb of s.nebulae) {
    const a = nb.op + Math.sin(frame * nb.spd + nb.ph) * 0.008;
    const nh = ((h + nb.hShift) % 360 + 360) % 360;
    const g = ctx.createRadialGradient(nb.x, nb.y, 0, nb.x, nb.y, nb.r);
    g.addColorStop(0,   `hsla(${nh},${sat}%,${Math.min(lit + 18, 88)}%,${a})`);
    g.addColorStop(0.5, `hsla(${(nh + 25) % 360},${sat * 0.6}%,${lit}%,${a * 0.3})`);
    g.addColorStop(1, "transparent");
    ctx.beginPath(); ctx.arc(nb.x, nb.y, nb.r, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
  }
  for (const star of s.stars) {
    star.x += star.speed;
    if (star.x > W + 2) { star.x = -2; star.y = rnd(0, H); }
    const tw = Math.sin(frame * star.twS + star.tw);
    const a  = Math.max(0.05, star.op + tw * 0.1);
    const sh = star.colored ? h : (h + 35) % 360;
    const ss = star.colored ? Math.min(sat, 75) : 12;
    const sl = star.colored ? Math.min(lit + 24, 94) : 92;
    ctx.beginPath(); ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${sh},${ss}%,${sl}%,${a})`; ctx.fill();
  }
  if (frame % 90 === 0 && Math.random() > 0.3) {
    const spd = rnd(5, 10);
    s.shooters.push({ x: rnd(0, W * 0.55), y: rnd(0, H * 0.55), vx: spd, vy: rnd(-1.2, 1.2), len: rnd(55, 140), life: 1, decay: rnd(0.008, 0.018) });
  }
  s.shooters = s.shooters.filter(sh => sh.life > 0.02);
  for (const sh of s.shooters) {
    sh.life -= sh.decay;
    const mag = Math.hypot(sh.vx, sh.vy);
    const tx = sh.x - (sh.vx / mag) * sh.len, ty = sh.y - (sh.vy / mag) * sh.len;
    const g = ctx.createLinearGradient(tx, ty, sh.x, sh.y);
    g.addColorStop(0, "transparent");
    g.addColorStop(0.7, `hsla(${h},80%,88%,${sh.life * 0.28})`);
    g.addColorStop(1, `hsla(${h},100%,97%,${sh.life * 0.8})`);
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(sh.x, sh.y);
    ctx.strokeStyle = g; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.beginPath(); ctx.arc(sh.x, sh.y, 1.4, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${h},100%,97%,${sh.life})`; ctx.fill();
    sh.x += sh.vx; sh.y += sh.vy;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GOLD — Golden dust storm + rising embers
// ═══════════════════════════════════════════════════════════════════════════════
interface Dust { x: number; y: number; vx: number; vy: number; r: number; op: number; wave: number; waveSpd: number }

function initGold(W: number, H: number) {
  const n = Math.min(Math.round((W * H) / 2600), 360);
  const dust: Dust[] = Array.from({ length: n }, () => ({
    x: rnd(0, W), y: rnd(0, H),
    vx: rnd(0.2, 0.85), vy: rnd(-0.1, 0.1),
    r: rnd(0.4, 2.4), op: rnd(0.05, 0.48),
    wave: rnd(0, Math.PI * 2), waveSpd: rnd(0.007, 0.022),
  }));
  return { dust };
}

function drawGold(ctx: CanvasRenderingContext2D, W: number, H: number, frame: number, s: ReturnType<typeof initGold>) {
  for (const d of s.dust) {
    d.x += d.vx;
    d.y += d.vy + Math.sin(frame * d.waveSpd + d.wave) * 0.2;
    if (d.x > W + 4) { d.x = -4; d.y = rnd(0, H); }
    if (d.y < -4) d.y = H + 4;
    if (d.y > H + 4) d.y = -4;
    const isEmber = d.r > 1.7;
    const hue = isEmber ? rnd(18, 34) : rnd(32, 50);
    const sat = isEmber ? 100 : rnd(75, 98);
    const lit = isEmber ? rnd(70, 84) : rnd(62, 78);
    ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue},${sat}%,${lit}%,${d.op})`; ctx.fill();
  }
  // Wind streak lines every few frames
  if (frame % 3 === 0 && Math.random() > 0.55) {
    const y = rnd(0, H), len = rnd(50, 220);
    const g = ctx.createLinearGradient(0, y, len, y);
    g.addColorStop(0, "transparent");
    g.addColorStop(0.5, `hsla(42,95%,72%,${rnd(0.04, 0.12)})`);
    g.addColorStop(1, "transparent");
    ctx.beginPath(); ctx.moveTo(rnd(-20, W * 0.25), y); ctx.lineTo(rnd(W * 0.3, W + 20), y + rnd(-10, 10));
    ctx.strokeStyle = g; ctx.lineWidth = rnd(0.4, 1.4); ctx.stroke();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEAL — Bioluminescent bubbles + wave ripples
// ═══════════════════════════════════════════════════════════════════════════════
interface Bubble { x: number; y: number; vy: number; r: number; op: number; wave: number; waveA: number; waveSpd: number }

function initTeal(W: number, H: number) {
  const n = Math.min(Math.round((W * H) / 3200), 280);
  const bubbles: Bubble[] = Array.from({ length: n }, () => ({
    x: rnd(0, W), y: rnd(0, H),
    vy: -(rnd(0.1, 0.6)),
    r: rnd(0.5, 3.8), op: rnd(0.07, 0.52),
    wave: rnd(0, Math.PI * 2), waveA: rnd(5, 20), waveSpd: rnd(0.009, 0.026),
  }));
  return { bubbles };
}

function drawTeal(ctx: CanvasRenderingContext2D, W: number, H: number, frame: number, s: ReturnType<typeof initTeal>) {
  // Deep ocean floor glow
  const og = ctx.createLinearGradient(0, H * 0.55, 0, H);
  og.addColorStop(0, "transparent"); og.addColorStop(1, `hsla(188,80%,28%,0.08)`);
  ctx.fillStyle = og; ctx.fillRect(0, H * 0.55, W, H * 0.45);

  for (const b of s.bubbles) {
    b.y += b.vy;
    const wx = b.x + Math.sin(frame * b.waveSpd + b.wave) * b.waveA;
    if (b.y < -8) { b.y = H + rnd(0, 80); b.x = rnd(0, W); }
    const hue = rnd(172, 200);
    ctx.beginPath(); ctx.arc(wx, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue},92%,${rnd(68, 92)}%,${b.op})`; ctx.fill();
  }
  // Horizontal shimmer wave lines
  for (let i = 0; i < 3; i++) {
    const yBase = H * (0.28 + i * 0.26) + Math.sin(frame * 0.007 + i * 2.2) * 20;
    ctx.beginPath(); ctx.moveTo(0, yBase);
    for (let x = 0; x <= W; x += 16) {
      ctx.lineTo(x, yBase + Math.sin((x / W) * Math.PI * 5 + frame * 0.013 + i) * 7);
    }
    ctx.strokeStyle = `hsla(188,80%,72%,0.045)`; ctx.lineWidth = 0.7; ctx.stroke();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORAL — Fire embers floating upward
// ═══════════════════════════════════════════════════════════════════════════════
interface Ember { x: number; y: number; vy: number; vx: number; r: number; op: number; life: number; maxLife: number; wave: number; waveSpd: number }

function initCoral(W: number, H: number) {
  const n = Math.min(Math.round((W * H) / 3000), 300);
  const embers: Ember[] = Array.from({ length: n }, () => {
    const ml = rndI(150, 400);
    return { x: rnd(W * 0.05, W * 0.95), y: H + rnd(0, H * 0.5), vy: -(rnd(0.28, 1.2)), vx: rnd(-0.25, 0.25), r: rnd(0.5, 3.0), op: rnd(0.12, 0.58), life: rndI(0, ml), maxLife: ml, wave: rnd(0, Math.PI * 2), waveSpd: rnd(0.018, 0.055) };
  });
  return { embers };
}

function drawCoral(ctx: CanvasRenderingContext2D, W: number, H: number, frame: number, s: ReturnType<typeof initCoral>) {
  // Heat glow at bottom
  const hg = ctx.createLinearGradient(0, H * 0.6, 0, H);
  hg.addColorStop(0, "transparent"); hg.addColorStop(1, `hsla(10,80%,32%,0.09)`);
  ctx.fillStyle = hg; ctx.fillRect(0, H * 0.6, W, H * 0.4);

  for (const e of s.embers) {
    e.life++;
    e.y += e.vy + Math.sin(frame * e.waveSpd + e.wave) * 0.28;
    e.x += e.vx + Math.sin(frame * e.waveSpd * 0.65 + e.wave) * 0.18;
    if (e.life >= e.maxLife || e.y < -12) { e.x = rnd(W * 0.05, W * 0.95); e.y = H + rnd(0, 90); e.life = 0; }
    const t = e.life / e.maxLife;
    const alpha = e.op * Math.sin(t * Math.PI);
    const hue = t < 0.45 ? rnd(8, 20) : rnd(22, 44);
    ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue},96%,${rnd(62, 86)}%,${alpha})`; ctx.fill();
  }
  // Upward heat streaks
  if (frame % 4 === 0 && Math.random() > 0.58) {
    const x = rnd(W * 0.05, W * 0.95), len = rnd(35, 130);
    const g = ctx.createLinearGradient(x, H, x + rnd(-12, 12), H - len);
    g.addColorStop(0, `hsla(${rnd(8, 18)},90%,55%,${rnd(0.05, 0.15)})`);
    g.addColorStop(1, "transparent");
    ctx.beginPath(); ctx.moveTo(x, H); ctx.lineTo(x + rnd(-10, 10), H - len);
    ctx.strokeStyle = g; ctx.lineWidth = rnd(0.5, 2.0); ctx.stroke();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIOLET — Vortex spiral arms
// ═══════════════════════════════════════════════════════════════════════════════
interface VortexP { angle: number; radius: number; speed: number; r: number; op: number; drift: number; arm: number }

function initViolet(W: number, H: number) {
  const n   = Math.min(Math.round((W * H) / 4200), 260);
  const cx  = W * 0.5, cy = H * 0.5;
  const maxR = Math.min(W, H) * 0.52;
  const particles: VortexP[] = Array.from({ length: n }, () => {
    const arm    = rndI(0, 4);
    const radius = rnd(maxR * 0.06, maxR);
    const armA   = (arm / 4) * Math.PI * 2 + (radius / maxR) * Math.PI * 3;
    return { angle: armA + rnd(-0.45, 0.45), radius, speed: (0.003 + (1 - radius / maxR) * 0.009) * (Math.random() > 0.5 ? 1 : -0.45), r: rnd(0.4, 1.9), op: rnd(0.09, 0.55), drift: rnd(-0.06, 0.06), arm };
  });
  return { cx, cy, maxR, particles };
}

function drawViolet(ctx: CanvasRenderingContext2D, _W: number, _H: number, frame: number, s: ReturnType<typeof initViolet>, h: number, sat: number, lit: number) {
  const { cx, cy, maxR, particles } = s;
  // Central glow
  const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.32);
  cg.addColorStop(0,   `hsla(${h},${sat}%,${Math.min(lit + 22, 90)}%,0.07)`);
  cg.addColorStop(0.5, `hsla(${(h + 28) % 360},${sat}%,${lit}%,0.028)`);
  cg.addColorStop(1,   "transparent");
  ctx.beginPath(); ctx.arc(cx, cy, maxR * 0.32, 0, Math.PI * 2);
  ctx.fillStyle = cg; ctx.fill();

  for (const p of particles) {
    p.angle  += p.speed;
    p.radius  = Math.max(maxR * 0.04, Math.min(p.radius + Math.sin(frame * 0.004 + p.angle) * p.drift * 0.04, maxR * 0.98));
    const x   = cx + Math.cos(p.angle) * p.radius;
    const y   = cy + Math.sin(p.angle) * p.radius;
    const f   = p.radius / maxR;
    const ph  = ((h + f * 55) % 360 + 360) % 360;
    const pl  = Math.min(lit + 26 * (1 - f), 92);
    ctx.beginPath(); ctx.arc(x, y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${ph},${sat}%,${pl}%,${p.op * (1 - f * 0.4)})`; ctx.fill();
  }
  // Faint spiral arm traces
  for (let arm = 0; arm < 4; arm++) {
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const f  = i / 120;
      const rv = f * maxR * 0.92;
      const a  = (arm / 4) * Math.PI * 2 + f * Math.PI * 3.2 + frame * 0.0018;
      const px = cx + Math.cos(a) * rv, py = cy + Math.sin(a) * rv;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = `hsla(${h},${sat}%,${lit}%,0.028)`; ctx.lineWidth = 0.7; ctx.stroke();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export function GalaxyBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width  = W;
    canvas.height = H;

    let theme  = getThemeFromDOM();
    let hsl    = THEME_HSL[theme];
    let frame  = 0;
    let raf    = 0;

    // Init all particle states once — switching theme is instant, zero re-alloc
    let azureState  = initAzure(W, H);
    let goldState   = initGold(W, H);
    let tealState   = initTeal(W, H);
    let coralState  = initCoral(W, H);
    let violetState = initViolet(W, H);

    // ── INSTANT theme detection via MutationObserver ───────────────────────────
    const observer = new MutationObserver(() => {
      const next = getThemeFromDOM();
      if (next !== theme) { theme = next; hsl = THEME_HSL[theme]; }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-accent", "style"] });

    // ── Debounced resize ───────────────────────────────────────────────────────
    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        W = window.innerWidth; H = window.innerHeight;
        canvas.width = W; canvas.height = H;
        azureState  = initAzure(W, H);
        goldState   = initGold(W, H);
        tealState   = initTeal(W, H);
        coralState  = initCoral(W, H);
        violetState = initViolet(W, H);
      }, 200) as unknown as number;
    };
    window.addEventListener("resize", onResize, { passive: true });

    // ── RAF loop ───────────────────────────────────────────────────────────────
    function draw() {
      if (!ctx) return; // <--- FIX: TS ko confirm karne ke liye ki ctx yahan null nahi hai

      raf = requestAnimationFrame(draw);
      frame++;
      ctx.clearRect(0, 0, W, H);
      ctx.shadowBlur = 0;
      const [h, s, l] = hsl;
      switch (theme) {
        case "azure":  drawAzure(ctx, W, H, frame, azureState, h, s, l);   break;
        case "gold":   drawGold(ctx, W, H, frame, goldState);              break;
        case "teal":   drawTeal(ctx, W, H, frame, tealState);              break;
        case "coral":  drawCoral(ctx, W, H, frame, coralState);            break;
        case "violet": drawViolet(ctx, W, H, frame, violetState, h, s, l); break;
      }
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      style={{ opacity: 0.85 }}
    />
  );
}
