"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { Maraude } from "@/types/maraude";
import { getCategorie, CATEGORIES } from "@/lib/categories";

function makeIcon(maraude: Maraude, selected = false, dimmed = false, highlighted = false) {
  const cat = getCategorie(maraude);
  const { color, icon } = CATEGORIES[cat];
  const fillColor = dimmed ? "#9CA3AF" : color;
  const baseSize = selected ? 36 : 30;
  const size = highlighted ? baseSize + 3 : baseSize;
  const opacity = dimmed ? 0.35 : 1;

  let shadow: string;
  if (dimmed) {
    shadow = `filter: drop-shadow(0 2px 3px rgba(0,0,0,0.25));`;
  } else if (highlighted) {
    shadow = `filter: drop-shadow(0 0 8px ${color}cc) drop-shadow(0 0 4px ${color}88);`;
  } else if (selected) {
    shadow = `filter: drop-shadow(0 0 6px ${color}99);`;
  } else {
    shadow = `filter: drop-shadow(0 2px 3px rgba(0,0,0,0.25));`;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 8}" viewBox="0 0 30 38" style="${shadow}" opacity="${opacity}">
      <path d="M15 0C8.37 0 3 5.37 3 12c0 8.5 12 26 12 26S27 20.5 27 12C27 5.37 21.63 0 15 0z"
        fill="${fillColor}" stroke="white" stroke-width="${selected ? 2.5 : 2}"/>
      <circle cx="15" cy="12" r="8" fill="white" opacity="0.95"/>
      <text x="15" y="16.5" text-anchor="middle" font-size="10" font-family="system-ui">${icon}</text>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 10)],
  });
}

const userIcon = L.divIcon({
  html: `<div style="
    width:16px;height:16px;
    background:#2563eb;border:3px solid white;border-radius:50%;
    box-shadow:0 0 0 4px rgba(37,99,235,0.2);
  "></div>`,
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

interface MapProps {
  maraudes: Maraude[];
  onMaraudeClick: (maraude: Maraude) => void;
  selectedId: number | null;
  userLocation: [number, number] | null;
  onMapReady?: (map: L.Map) => void;
  allMaraudes?: Maraude[];
  highlightedId?: number | null;
}

export default function Map({ maraudes, onMaraudeClick, selectedId, userLocation, onMapReady, allMaraudes, highlightedId }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<globalThis.Map<number, L.Marker>>(new globalThis.Map());
  const userMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [48.8566, 2.3522],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: "topright" }).addTo(map);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    const cluster = (L as unknown as { markerClusterGroup: (opts: object) => L.MarkerClusterGroup }).markerClusterGroup({
      maxClusterRadius: 45,
      iconCreateFunction: (c: L.MarkerCluster) => {
        const count = c.getChildCount();
        const big = count >= 20;
        const sz = big ? 44 : 36;
        return L.divIcon({
          html: `<div style="
            background:#C0622F;color:white;
            width:${sz}px;height:${sz}px;border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            font-size:${big ? 14 : 12}px;font-weight:700;
            border:2.5px solid white;
            box-shadow:0 3px 10px rgba(192,98,47,0.45);
          ">${count}</div>`,
          className: "",
          iconSize: [sz, sz],
          iconAnchor: [sz / 2, sz / 2],
        });
      },
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      animate: true,
    });

    cluster.addTo(map);
    clusterRef.current = cluster;
    mapRef.current = map;
    onMapReady?.(map);

    return () => { map.remove(); mapRef.current = null; clusterRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;
    const displayList = allMaraudes ?? maraudes;
    const displayIds = new Set(displayList.map((m) => m.id));
    markersRef.current.forEach((marker, id) => {
      if (!displayIds.has(id)) { cluster.removeLayer(marker); markersRef.current.delete(id); }
    });
    displayList.forEach((maraude) => {
      if (markersRef.current.has(maraude.id)) return;
      const marker = L.marker([maraude.lat, maraude.lng], {
        icon: makeIcon(maraude, false),
        title: maraude.nom,
      });
      marker.on("click", () => onMaraudeClick(maraude));
      cluster.addLayer(marker);
      markersRef.current.set(maraude.id, marker);
    });
  }, [maraudes, allMaraudes, onMaraudeClick]);

  useEffect(() => {
    const activeIds = new Set(maraudes.map((m) => m.id));
    const displayList = allMaraudes ?? maraudes;
    markersRef.current.forEach((marker, id) => {
      const maraude = displayList.find((m) => m.id === id);
      if (!maraude) return;
      const selected = id === selectedId;
      const dimmed = allMaraudes !== undefined && !activeIds.has(id);
      const highlighted = highlightedId !== null && highlightedId !== undefined && id === highlightedId;
      marker.setIcon(makeIcon(maraude, selected, dimmed, highlighted));
    });
  }, [selectedId, highlightedId, maraudes, allMaraudes]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    userMarkerRef.current?.remove();
    userMarkerRef.current = null;
    if (userLocation) {
      userMarkerRef.current = L.marker(userLocation, { icon: userIcon })
        .addTo(map)
        .bindTooltip("Vous êtes ici", { permanent: false, direction: "top" });
    }
  }, [userLocation]);

  return <div ref={containerRef} className="w-full h-full" style={{ minHeight: "100%" }} />;
}
