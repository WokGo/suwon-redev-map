import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Polygon, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const FALLBACK_ZONES = [
  { id: "wooman1", name: "우만1구역", units: 2800 },
  { id: "wooman2", name: "우만2구역", units: 2700 },
  { id: "worldcup1", name: "월드컵1구역", units: 1500 },
];

const ZONE_COORDINATES = {
  wooman1: [
    [37.2914, 127.0188],
    [37.2899, 127.0272],
    [37.2852, 127.0264],
    [37.2862, 127.0174],
  ],
  wooman2: [
    [37.2894, 127.0296],
    [37.2873, 127.0386],
    [37.2816, 127.0372],
    [37.2837, 127.0284],
  ],
  worldcup1: [
    [37.2941, 127.035],
    [37.2923, 127.0438],
    [37.2870, 127.0429],
    [37.2884, 127.0341],
  ],
};

const BASE_COORD = [37.2862, 127.0327];

const computeCentroid = (coordinates = []) => {
  if (!coordinates.length) return BASE_COORD;
  const { lat, lng } = coordinates.reduce(
    (acc, [currentLat, currentLng]) => ({
      lat: acc.lat + currentLat / coordinates.length,
      lng: acc.lng + currentLng / coordinates.length,
    }),
    { lat: 0, lng: 0 },
  );
  return [lat, lng];
};

const augmentZones = (zones = []) =>
  zones.map((zone) => {
    const coordinates = zone.coordinates?.length ? zone.coordinates : ZONE_COORDINATES[zone.id] ?? [];
    return {
      ...zone,
      coordinates,
      centroid: computeCentroid(coordinates),
    };
  });

export default function MapPage() {
  const [zones, setZones] = useState(augmentZones(FALLBACK_ZONES));
  const [error, setError] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState(zones[0]?.id ?? null);
  const mapRef = useRef(null);

  useEffect(() => {
    fetch("/api/zones")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .then((data) => {
        const merged = augmentZones(data);
        setZones(merged);
        if (merged.length && !selectedZoneId) {
          setSelectedZoneId(merged[0].id);
        }
      })
      .catch(() => {
        setZones(augmentZones(FALLBACK_ZONES));
        setError("API에서 구역 데이터를 불러오지 못했습니다. 기본 데이터를 표시합니다.");
      });
  }, []);

  useEffect(() => {
    if (!selectedZoneId && zones.length) {
      setSelectedZoneId(zones[0].id);
    }
  }, [zones, selectedZoneId]);

  const polygons = useMemo(
    () =>
      zones
        .map((zone) => ({
          zone,
          positions: zone.coordinates ?? [],
        }))
        .filter(({ positions }) => positions.length >= 3),
    [zones],
  );

  const handleSelectZone = (zone) => {
    setSelectedZoneId(zone.id);
    if (zone.coordinates?.length && mapRef.current) {
      mapRef.current.fitBounds(zone.coordinates, {
        padding: [32, 32],
        animate: true,
      });
    }
  };

  const selectedZone = zones.find((zone) => zone.id === selectedZoneId);

  useEffect(() => {
    if (selectedZone?.coordinates?.length && mapRef.current) {
      mapRef.current.fitBounds(selectedZone.coordinates, {
        padding: [32, 32],
        animate: true,
      });
    }
  }, [selectedZone?.id]);

  return (
    <section className="flex h-full flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">재개발 현황 지도</h1>
        <p className="mt-1 text-sm text-slate-500">
          수원 주요 재개발 구역의 분포와 세대수를 실시간으로 확인하세요.
        </p>
        {error && <p className="mt-2 text-sm text-amber-600">{error}</p>}
      </header>

      <div className="grid flex-1 gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">구역 목록</h2>
          <p className="mt-1 text-xs text-slate-500">세대 수 기준으로 정렬된 구역 정보입니다.</p>
          <ul className="mt-4 space-y-3 overflow-y-auto pr-1" style={{ maxHeight: "calc(100vh - 280px)" }}>
            {zones.map((zone) => {
              const isSelected = zone.id === selectedZoneId;
              return (
                <li
                  key={zone.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectZone(zone)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleSelectZone(zone);
                    }
                  }}
                  className={`cursor-pointer rounded-lg border p-3 shadow-sm transition ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 text-blue-800"
                      : "border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-blue-50"
                  }`}
                >
                  <p className="text-base font-semibold text-slate-900">{zone.name}</p>
                  <p className="mt-1 text-sm text-slate-600">세대수: {zone.units.toLocaleString()} 세대</p>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="min-h-[420px] rounded-xl border border-slate-200 bg-white shadow-sm">
          <MapContainer
            center={selectedZone?.centroid ?? BASE_COORD}
            zoom={14}
            whenCreated={(mapInstance) => {
              mapRef.current = mapInstance;
              if (selectedZone?.coordinates?.length) {
                mapInstance.fitBounds(selectedZone.coordinates, { padding: [32, 32], animate: false });
              }
            }}
            className="h-full w-full rounded-xl"
            style={{ minHeight: 420 }}
          >
            <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {polygons.map(({ zone, positions }) => {
              const isSelected = zone.id === selectedZoneId;
              return (
                <Polygon
                  key={zone.id}
                  positions={positions}
                  pathOptions={{
                    color: isSelected ? "#2563eb" : "#60a5fa",
                    fillOpacity: isSelected ? 0.4 : 0.2,
                    weight: isSelected ? 3 : 2,
                  }}
                  eventHandlers={{
                    click: () => handleSelectZone(zone),
                  }}
                >
                <Popup>
                  <strong>{zone.name}</strong>
                  <br />
                  {zone.units.toLocaleString()} 세대
                </Popup>
                </Polygon>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </section>
  );
}
