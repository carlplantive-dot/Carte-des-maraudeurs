"use client";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-hogwarts text-parchment px-6 text-center">
      <span className="text-6xl mb-6 select-none">🗺️</span>
      <h1 className="text-2xl font-bold tracking-wide mb-2">
        La Carte des Maraudeurs
      </h1>
      <p className="text-gold font-serif italic text-sm mb-6 tracking-widest">
        ✦ Solennellement juré de venir en aide ✦
      </p>
      <div className="bg-parchment/10 border border-gold/30 rounded-xl px-6 py-5 max-w-sm">
        <p className="text-parchment/90 text-base font-medium mb-2">
          Vous êtes hors-ligne
        </p>
        <p className="text-parchment/60 text-sm leading-relaxed">
          La carte nécessite une connexion pour charger les tuiles. Reconnectez-vous
          pour voir toutes les maraudes.
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 px-5 py-2.5 rounded-full bg-gold text-hogwarts-dark font-semibold text-sm hover:bg-gold/90 transition-colors"
      >
        Réessayer
      </button>
      <p className="text-parchment/30 text-xs mt-8 font-serif italic">
        Méfait accompli
      </p>
    </div>
  );
}
