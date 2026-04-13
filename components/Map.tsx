"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { Maraude } from "@/types/maraude";
import { ASSOCIATION_COLORS } from "@/lib/associations";

function makeIcon(color: string, selected = false) {
  const glow = selected ? `filter="url(#glow)"` : "";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="24" height="32">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20S24 21 24 12C24 5.373 18.627 0 12 0z"
        fill="${color}" stroke="#c8a84b" stroke-width="${selected ? 2 : 1.5}" ${glow}/>
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

// User location icon
const userIcon = L.divIcon({
  html: `<div style="
    width:16px;height:16px;
    background:#2563eb;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 0 0 3px rgba(37,99,235,0.3);
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
}

export default function Map({
  maraudes,
  onMaraudeClick,
  selectedId,
  userLocation,
  onMapReady,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<globalThis.Map<number, L.Marker>>(new globalThis.Map());
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [48.8566, 2.3522],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: "topright" }).addTo(map);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }
    ).addTo(map);

    // Marker cluster group with custom styling
    const cluster = (L as unknown as { markerClusterGroup: (opts: object) => L.MarkerClusterGroup }).markerClusterGroup({
      maxClusterRadius: 50,
      iconCreateFunction: (c: L.MarkerCluster) => {
        const count = c.getChildCount();
        return L.divIcon({
          html: `<div style="
            background:#1a1a2e;color:#c8a84b;
            width:36px;height:36px;border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            font-size:13px;font-weight:700;
            border:2px solid #c8a84b;
            box-shadow:0 2px 6px rgba(0,0,0,0.4);
          ">${count}</div>`,
          className: "",
          iconSize: [36, 36],
          iconAnchor: [18, 18],
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

    return () => {
      map.remove();
      mapRef.current = null;
      clusterRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync markers with current filtered list
  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;

    const currentIds = new Set(maraudes.map((m) => m.id));

    // Remove stale markers
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        cluster.removeLayer(marker);
        markersRef.current.delete(id);
      }
    });

    // Add new markers
    maraudes.forEach((maraude) => {
      if (markersRef.current.has(maraude.id)) return;
      const color = ASSOCIATION_COLORS[maraude.association] ?? "#2c3e50";
      const marker = L.marker([maraude.lat, maraude.lng], {
        icon: makeIcon(color, false),
        title: maraude.nom,
      });
      marker.on("click", () => onMaraudeClick(maraude));
      cluster.addLayer(marker);
      markersRef.current.set(maraude.id, marker);
    });
  }, [maraudes, onMaraudeClick]);

  // Refresh selected marker icon
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const maraude = maraudes.find((m) => m.id === id);
      if (!maraude) return;
      const color = ASSOCIATION_COLORS[maraude.association] ?? "#2c3e50";
      marker.setIcon(makeIcon(color, id === selectedId));
    });
  }, [selectedId, maraudes]);

  // User location marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
    if (userLocation) {
      userMarkerRef.current = L.marker(userLocation, { icon: userIcon })
        .addTo(map)
        .bindTooltip("Vous êtes ici", { permanent: false, direction: "top" });
    }
  }, [userLocation]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-2xl overflow-hidden shadow-lg"
      style={{ minHeight: "100%" }}
    />
  );
}
