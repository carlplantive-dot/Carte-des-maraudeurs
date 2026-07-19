"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { maraudes } from "@/data/maraudes";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-cream animate-pulse" />,
});

export default function OrientationPage() {
  return (
    <>
      {/* ════ DESKTOP (lg+) ════════════════════════════════════════════════ */}
      <div className="hidden lg:flex h-screen overflow-hidden bg-cream">

        {/* Left panel */}
        <div className="w-[440px] flex-shrink-0 px-10 py-12 flex flex-col justify-center gap-6 border-r border-warm-border/60 shadow-lg z-10">

          {/* Logo */}
          <div className="w-14 h-14 rounded-2xl bg-brick flex items-center justify-center shadow-md">
            <svg viewBox="0 0 32 32" width="32" height="32" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M16 3C11.03 3 7 7.03 7 12c0 6.75 9 17 9 17s9-10.25 9-17c0-4.97-4.03-9-9-9z" fill="white" />
              <path d="M16 15C14 13 12 12.5 12 10.5A2.1 2.1 0 0 1 16 9a2.1 2.1 0 0 1 4 1.5C20 12.5 18 13 16 15z" fill="#C0622F" />
            </svg>
          </div>

          {/* Title + subtitle */}
          <div>
            <h1 className="text-3xl font-bold text-warm-dark leading-tight">Maraude Paris</h1>
            <p className="text-warm-mid mt-1 text-base">La carte des actions solidaires</p>
          </div>

          {/* Big question */}
          <h2 className="text-xl font-semibold text-warm-dark">{"Qu'est-ce qui vous amène ?"}</h2>

          {/* Two primary buttons */}
          <div className="flex flex-col gap-3">
            <Link
              href="/aider"
              className="py-4 px-8 bg-brick hover:bg-brick-dark text-white rounded-2xl font-bold text-lg text-center transition-colors"
            >
              🤝 Je veux aider
            </Link>
            <Link
              href="/aide"
              className="py-4 px-8 bg-brick hover:bg-brick-dark text-white rounded-2xl font-bold text-lg text-center transition-colors"
            >
              🙏 {"J'ai besoin d'aide"}
            </Link>
          </div>

          {/* Tertiary link */}
          <Link
            href="/carte"
            className="text-warm-mid hover:text-brick font-medium text-center transition-colors"
          >
            Explorer la carte →
          </Link>

          {/* Footer */}
          <p className="mt-auto text-warm-mid/60 text-xs text-center">
            Maraude Paris — La carte des actions solidaires
          </p>
        </div>

        {/* Right: non-interactive map with click overlay → /carte */}
        <div className="flex-1 relative">
          <Map
            maraudes={maraudes}
            onMaraudeClick={() => {}}
            selectedId={null}
            userLocation={null}
          />
          <Link
            href="/carte"
            className="absolute inset-0 z-[1000]"
            aria-label="Explorer la carte"
          />
        </div>
      </div>

      {/* ════ MOBILE (< lg) ════════════════════════════════════════════════ */}
      <div className="lg:hidden flex flex-col h-screen bg-cream text-warm-dark overflow-hidden">

        {/* Map thumbnail at top (40vh) with overlay link */}
        <div className="relative flex-shrink-0" style={{ height: "40vh" }}>
          <Map
            maraudes={maraudes}
            onMaraudeClick={() => {}}
            selectedId={null}
            userLocation={null}
          />
          <Link
            href="/carte"
            className="absolute inset-0 z-[1000] flex items-end justify-center pb-4"
            aria-label="Explorer la carte"
          >
            <span className="bg-brick/90 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
              Explorer la carte →
            </span>
          </Link>
        </div>

        {/* Content below map */}
        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-6">

          {/* Logo + title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brick flex items-center justify-center shadow-md flex-shrink-0">
              <svg viewBox="0 0 32 32" width="26" height="26" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M16 3C11.03 3 7 7.03 7 12c0 6.75 9 17 9 17s9-10.25 9-17c0-4.97-4.03-9-9-9z" fill="white" />
                <path d="M16 15C14 13 12 12.5 12 10.5A2.1 2.1 0 0 1 16 9a2.1 2.1 0 0 1 4 1.5C20 12.5 18 13 16 15z" fill="#C0622F" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-warm-dark">Maraude Paris</h1>
              <p className="text-warm-mid text-sm">La carte des actions solidaires</p>
            </div>
          </div>

          {/* Big question */}
          <h2 className="text-xl font-semibold text-warm-dark">{"Qu'est-ce qui vous amène ?"}</h2>

          {/* Two primary buttons */}
          <div className="flex flex-col gap-3">
            <Link
              href="/aider"
              className="py-4 px-8 bg-brick hover:bg-brick-dark text-white rounded-2xl font-bold text-lg text-center transition-colors"
            >
              🤝 Je veux aider
            </Link>
            <Link
              href="/aide"
              className="py-4 px-8 bg-brick hover:bg-brick-dark text-white rounded-2xl font-bold text-lg text-center transition-colors"
            >
              🙏 {"J'ai besoin d'aide"}
            </Link>
          </div>

          {/* Tertiary link */}
          <Link
            href="/carte"
            className="text-warm-mid hover:text-brick font-medium text-center transition-colors"
          >
            Explorer la carte →
          </Link>

          {/* Footer */}
          <p className="mt-auto text-warm-mid/60 text-xs text-center pt-4">
            Maraude Paris — La carte des actions solidaires
          </p>
        </div>
      </div>
    </>
  );
}
