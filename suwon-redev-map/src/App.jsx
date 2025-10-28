import { useEffect, useMemo, useState } from "react";
import { MapContainer, Polygon, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const FALLBACK_ZONES = [
  { id: "wooman1", name: "우만1구역", units: 2800 },
  { id: "wooman2", name: "우만2구역", units: 2700 },
  { id: "worldcup1", name: "월드컵1구역", units: 1500 },
];

const BASE_COORD = [37.2862, 127.0327];

function App() {
  const [zones, setZones] = useState(FALLBACK_ZONES);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/zones")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .then((data) => setZones(data))
      .catch(() => setError("API에서 구역 데이터를 불러오지 못했습니다. 기본 데이터를 표시합니다."));
  }, []);

  const polygons = useMemo(
    () =>
      zones.map((zone, idx) => {
        const latOffset = idx * 0.0025;
        return {
          zone,
          positions: [
            [BASE_COORD[0] + latOffset, BASE_COORD[1]],
            [BASE_COORD[0] + latOffset, BASE_COORD[1] + 0.01],
            [BASE_COORD[0] + latOffset + 0.002, BASE_COORD[1] + 0.005],
          ],
        };
      }),
    [zones],
  );

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-800">수원 재개발 현황 지도</h1>
        <p className="text-sm text-slate-500">React + Leaflet + Flask API</p>
        {error && <p className="mt-2 text-sm text-amber-600">{error}</p>}
      </header>

      <main className="flex flex-1 flex-row divide-x divide-slate-200">
        <section className="w-80 overflow-y-auto bg-white p-4">
          <h2 className="text-lg font-medium text-slate-700">구역 목록</h2>
          <ul className="mt-4 space-y-3">
            {zones.map((zone) => (
              <li key={zone.id} className="rounded-lg border border-slate-200 p-3 shadow-sm">
                <p className="text-base font-semibold text-slate-800">{zone.name}</p>
                <p className="text-sm text-slate-500">세대수: {zone.units.toLocaleString()} 세대</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex-1">
          <MapContainer center={BASE_COORD} zoom={14} className="h-full w-full" style={{ background: "#eef2ff" }}>
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {polygons.map(({ zone, positions }) => (
              <Polygon key={zone.id} positions={positions} pathOptions={{ color: "#2563eb", fillOpacity: 0.25 }}>
                <Popup>
                  <strong>{zone.name}</strong>
                  <br />
                  {zone.units.toLocaleString()} 세대
                </Popup>
              </Polygon>
            ))}
          </MapContainer>
        </section>
      </main>
    </div>
  );
}

export default App;
