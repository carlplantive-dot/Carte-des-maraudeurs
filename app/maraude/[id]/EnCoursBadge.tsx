"use client";

import { Maraude } from "@/types/maraude";
import { isEnCours } from "@/lib/time";

export default function EnCoursBadge({ maraude }: { maraude: Maraude }) {
  if (!isEnCours(maraude)) return null;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
      En cours maintenant
    </span>
  );
}
