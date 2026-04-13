"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsIOS(ios);
    setIsStandalone(standalone);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => setInstalled(true));

    // Ne pas ré-afficher si déjà dismissed dans cette session
    if (sessionStorage.getItem("cdm-install-dismissed")) setDismissed(true);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isStandalone || installed || dismissed) return null;

  // Android / Chrome — prompt natif disponible
  if (deferredPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-[1100] animate-slide-up">
        <div className="bg-hogwarts border border-gold/40 rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3">
          <span className="text-2xl flex-shrink-0">🗺️</span>
          <div className="flex-1 min-w-0">
            <p className="text-parchment text-sm font-semibold leading-tight">
              Installer l'application
            </p>
            <p className="text-parchment/60 text-xs">
              Accès rapide depuis l'écran d'accueil
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => {
                sessionStorage.setItem("cdm-install-dismissed", "1");
                setDismissed(true);
              }}
              className="px-3 py-1.5 rounded-full text-xs text-parchment/50 hover:text-parchment border border-parchment/20"
            >
              Plus tard
            </button>
            <button
              onClick={async () => {
                await deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === "accepted") setInstalled(true);
                setDeferredPrompt(null);
              }}
              className="px-3 py-1.5 rounded-full text-xs bg-gold text-hogwarts-dark font-semibold"
            >
              Installer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // iOS Safari — instructions manuelles
  if (isIOS) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-[1100] animate-slide-up">
        <div className="bg-hogwarts border border-gold/40 rounded-2xl px-4 py-3 shadow-2xl">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl flex-shrink-0">🗺️</span>
              <p className="text-parchment text-sm font-semibold">
                Installer sur l'écran d'accueil
              </p>
            </div>
            <button
              onClick={() => {
                sessionStorage.setItem("cdm-install-dismissed", "1");
                setDismissed(true);
              }}
              className="text-parchment/40 hover:text-parchment text-lg leading-none mt-0.5"
            >
              ✕
            </button>
          </div>
          <p className="text-parchment/70 text-xs mt-2 leading-relaxed">
            Appuie sur{" "}
            <span className="text-gold font-semibold">
              Partager <span aria-label="icône partage">⎋</span>
            </span>{" "}
            puis{" "}
            <span className="text-gold font-semibold">
              « Sur l'écran d'accueil »{" "}
              <span aria-label="icône plus">➕</span>
            </span>
          </p>
        </div>
      </div>
    );
  }

  return null;
}
