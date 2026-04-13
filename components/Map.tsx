"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Maraude } from "@/types/maraude";

// Association → marker color
const ASSOCIATION_HUE: Record<string, string> = {
  "Emmaüs Solidarité": "#8B2019",
  "La Chorba": "#1a5276",
  Aurore: "#1d6a3a",
  "Samu Social de Paris": "#5d4037",
  "Les Enfants du Canal": "#6a3d9a",
};

function makeIcon(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="24" height="32">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20S24 21 24 12C24 5.373 18.627 0 12 0z"
        fill="${color}" stroke="#c8a84b" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="white" opacity="0.9"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -34],
  });
}

interface MapProps {
  maraudes: Maraude[];
  onMaraudeClick: (maraude: Maraude) => void;
  selectedId: number | null;
}

export default function Map({ maraudes, onMaraudeClick, selectedId }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<globalThis.Map<number, L.Marker>>(new globalThis.Map());

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [48.8566, 2.3522],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: "topright" }).addTo(map);

    // Tile layer — CartoDB Voyager (clean, elegant, no Google)
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }
    ).addTo(map);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync markers whenever the filtered maraudes list changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentIds = new Set(maraudes.map((m) => m.id));

    // Remove markers no longer in the list
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add or update markers
    maraudes.forEach((maraude) => {
      if (markersRef.current.has(maraude.id)) return;

      const color = ASSOCIATION_HUE[maraude.association] ?? "#2c3e50";
      const marker = L.marker([maraude.lat, maraude.lng], {
        icon: makeIcon(color),
        title: maraude.nom,
      });

      marker.on("click", () => onMaraudeClick(maraude));
      marker.addTo(map);
      markersRef.current.set(maraude.id, marker);
    });
  }, [maraudes, onMaraudeClick]);

  // Highlight selected marker
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const el = marker.getElement();
      if (!el) return;
      if (id === selectedId) {
        el.style.filter = "drop-shadow(0 0 6px #c8a84b)";
        el.style.zIndex = "1000";
      } else {
        el.style.filter = "";
        el.style.zIndex = "";
      }
    });
  }, [selectedId]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-2xl overflow-hidden shadow-lg"
      style={{ minHeight: "100%" }}
    />
  );
}
