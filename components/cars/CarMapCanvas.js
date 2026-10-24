"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

/* A div icon avoids Leaflet's bundler-dependent default marker images. */
const PIN = {
  className: "",
  html: '<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#0B3D2E;border:3px solid #fff;box-shadow:0 1px 6px rgba(20,24,26,.35)"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
};

/**
 * Plain Leaflet, mounted by hand.
 *
 * react-leaflet reuses a map instance across remounts, which throws when the
 * same route is visited twice. Creating and destroying the map in one effect
 * keeps the lifecycle obvious and survives client-side navigation.
 */
export default function CarMapCanvas({ latitude, longitude, label }) {
  const nodeRef = useRef(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return undefined;

    const map = L.map(node, {
      center: [latitude, longitude],
      zoom: 14,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    L.marker([latitude, longitude], {
      icon: L.divIcon(PIN),
      title: label,
    })
      .addTo(map)
      .bindPopup(label);

    return () => {
      map.off();
      map.remove();
    };
  }, [latitude, longitude, label]);

  return (
    <div
      ref={nodeRef}
      className="h-full w-full"
      role="img"
      aria-label={`Map showing the approximate location of ${label}`}
    />
  );
}
