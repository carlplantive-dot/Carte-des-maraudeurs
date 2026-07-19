"use client";

import { useState, useRef, useEffect } from "react";
import { Categorie, CATEGORIES } from "@/lib/categories";
import { MomentJournee } from "@/lib/time";

type Periode = "semaine" | "weekend" | null;

interface Props {
  count: number;
  filterMoment: MomentJournee | null;
  setFilterMoment: (v: MomentJournee | null) => void;
  filterPeriode: Periode;
  setFilterPeriode: (v: Periode) => void;
  filterCategorie: Categorie | null;
  setFilterCategorie: (v: Categorie | null) => void;
  onGeolocate: () => void;
  geoLoading: boolean;
  userLocation: [number, number] | null;
}

const TEMPS_OPTIONS: { value: MomentJournee | null; label: string }[] = [
  { value: null,   label: "n'importe quand" },
  { value: "Jour", label: "un matin"         },
  { value: "Soir", label: "une soirée"       },
  { value: "Nuit", label: "une nuit"         },
];

const TYPE_OPTIONS: { value: Categorie | null; label: string; sub?: string }[] = [
  { value: null,             label: "tout type d'action"       },
  { value: "Maraude",        label: "aller vers les gens",     sub: "maraude de rue" },
  { value: "Repas",          label: "distribuer des repas",    sub: "soupe, petit déjeuner" },
  { value: "Vêtements",      label: "donner des vêtements",    sub: "vestiaire, hygiène" },
  { value: "Accueil",        label: "accueillir et écouter",   sub: "café d'accueil, écoute" },
  { value: "Accompagnement", label: "accompagner socialement", sub: "insertion, emploi" },
  { value: "Soins",          label: "prodiguer des soins",     sub: "équipe médicale" },
  { value: "Hébergement",    label: "héberger",                sub: "mise à l'abri" },
];

function InlineSelect<T extends string | null>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string; sub?: string }[];
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find(o => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-brick text-white rounded-full text-lg font-bold leading-tight hover:bg-brick-dark transition-colors"
      >
        {current.label}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-warm-border z-50 min-w-[220px] py-1.5 overflow-hidden">
          {options.map(opt => (
            <button
              key={String(opt.value)}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 hover:bg-cream transition-colors flex flex-col gap-0.5 ${opt.value === value ? "bg-cream" : ""}`}
            >
              <span className={`text-sm font-semibold ${opt.value === value ? "text-brick" : "text-warm-dark"}`}>
                {opt.label}
              </span>
              {opt.sub && <span className="text-[11px] text-warm-mid">{opt.sub}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ConversationalPanel({
  count,
  filterMoment,
  setFilterMoment,
  filterPeriode,
  setFilterPeriode,
  filterCategorie,
  setFilterCategorie,
  onGeolocate,
  geoLoading,
  userLocation,
}: Props) {
  const typeLabel = TYPE_OPTIONS.find(o => o.value === filterCategorie)?.sub ?? "";

  return (
    <div className="flex flex-col h-full bg-cream px-8 py-10 select-none">

      {/* Logo + titre */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-brick flex items-center justify-center flex-shrink-0 shadow-md">
          <svg viewBox="0 0 32 32" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 3C11.03 3 7 7.03 7 12c0 6.75 9 17 9 17s9-10.25 9-17c0-4.97-4.03-9-9-9z" fill="white"/>
            <path d="M16 15C14 13 12 12.5 12 10.5A2.1 2.1 0 0 1 16 9a2.1 2.1 0 0 1 4 1.5C20 12.5 18 13 16 15z" fill="#C0622F"/>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-warm-dark leading-tight">Maraude Paris</h1>
          <p className="text-sm text-warm-mid">Devenez bénévole près de chez vous</p>
        </div>
      </div>

      {/* Formulaire conversationnel */}
      <div className="space-y-5 flex-1">
        {/* Ligne 1 : temps */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xl font-semibold text-warm-dark">Je peux donner</span>
          <InlineSelect
            value={filterMoment}
            options={TEMPS_OPTIONS}
            onChange={setFilterMoment}
          />
        </div>

        {/* Ligne 2 : période semaine/weekend */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xl font-semibold text-warm-dark">plutôt</span>
          <div className="flex gap-2">
            {([
              { v: "semaine" as Periode, label: "en semaine" },
              { v: "weekend" as Periode, label: "le week-end" },
            ]).map(({ v, label }) => (
              <button
                key={v!}
                onClick={() => setFilterPeriode(filterPeriode === v ? null : v)}
                className={`px-4 py-1.5 rounded-full text-base font-semibold border-2 transition-all ${
                  filterPeriode === v
                    ? "bg-brick text-white border-brick"
                    : "bg-transparent text-warm-mid border-warm-border hover:border-warm-dark hover:text-warm-dark"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Ligne 3 : type d'action */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xl font-semibold text-warm-dark">pour</span>
          <InlineSelect
            value={filterCategorie}
            options={TYPE_OPTIONS}
            onChange={setFilterCategorie}
          />
        </div>

        {/* Sous-titre dynamique */}
        <p className="text-warm-mid text-sm italic pl-1">
          {typeLabel ? `— ${typeLabel}` : "— maraude, distribution, écoute, vestiaire…"}
        </p>

        {/* CTA géolocalisation */}
        <button
          onClick={onGeolocate}
          disabled={geoLoading}
          className="w-full mt-4 py-4 px-6 bg-brick hover:bg-brick-dark disabled:opacity-60 text-white rounded-2xl font-bold text-base shadow-md transition-colors flex items-center justify-center gap-2"
        >
          {geoLoading
            ? <span className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
            : <span>{userLocation ? "📍" : "📍"}</span>
          }
          {userLocation
            ? `Voir les ${count} missions près de chez moi →`
            : `Voir les ${count} missions →`
          }
        </button>

        {/* Callout info */}
        <div className="mt-4 bg-olive-light border border-olive/20 rounded-2xl px-5 py-4 flex gap-3 items-start">
          <span className="text-olive text-xl flex-shrink-0 mt-0.5">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5" fill="currentColor" strokeWidth="0"/>
            </svg>
          </span>
          <p className="text-sm text-olive leading-relaxed">
            <strong>Pas besoin d'expérience.</strong> Chaque mission indique si les débutant·e·s sont les bienvenus — et vous n'êtes jamais seul·e.
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-[11px] text-warm-mid/50 text-center mt-8">
        Maraude Paris — La carte des actions solidaires
      </p>
    </div>
  );
}
