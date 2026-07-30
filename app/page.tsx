"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  LandingNav,
  LandingHero,
  LandingMarquee,
  LandingFeatures,
  LandingHowItWorks,
  LandingAllFeatures,
  LandingComparison,
  LandingFaq,
  LandingCta,
  LandingFooter,
} from "@/components/landing-sections";
import { GalaxyBg } from "@/components/galaxy-bg";

export default function Home() {
  const { user, loading } = useAuth();
  const signedIn = !loading && !!user;
  const pageRef = useRef<HTMLDivElement>(null);

  /* ----------------------------------------------------------
     Scroll-reveal observer — adds .revealed to .reveal elements
     when they enter the viewport
  ---------------------------------------------------------- */
  useEffect(() => {
    // Small timeout to let the DOM settle after hydration
    const timer = setTimeout(() => {
      const els = document.querySelectorAll<HTMLElement>(".reveal");
      if (!els.length) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("revealed");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -24px 0px" }
      );

      els.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  /* ----------------------------------------------------------
     Hero spotlight — tracks mouse position for radial glow
  ---------------------------------------------------------- */
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".hero-section");
    if (!hero) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      hero.style.setProperty("--mouse-x", `${x}%`);
      hero.style.setProperty("--mouse-y", `${y}%`);
    };

    hero.addEventListener("mousemove", handleMouseMove);
    return () => hero.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={pageRef} className="relative min-h-screen bg-surface">
      {/* ---- Layer 0: Galaxy canvas background ---- */}
      <GalaxyBg />

      {/* ---- Layer 1: Animated orb blobs + aurora sweep + drifting grid ---- */}
      <div className="live-bg" aria-hidden="true">
        <div className="orb-3" />
        <div className="orb-4" />
        <div className="orb-5" />
        <div className="bg-aurora-sweep" />
        <div className="bg-grid-drift" />
      </div>

      {/* ---- Layer 2: Noise/grain texture ---- */}
      <div className="noise-overlay" aria-hidden="true" />

      <LandingNav signedIn={signedIn} />
      <main>
        <LandingHero signedIn={signedIn} />
        <LandingMarquee />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingAllFeatures />
        <LandingComparison />
        <LandingFaq />
        <LandingCta signedIn={signedIn} />
      </main>
      <LandingFooter />
    </div>
  );
}
