import { useMemo, useState } from "react";

const METRICS = {
  progress: { label: "사업 진척도(%)", format: (value) => `${value}%` },
  households: { label: "총 세대수", format: (value) => value.toLocaleString("ko-KR") },
  price: { label: "평균 분양가(억원)", format: (value) => `${value.toFixed(1)}억` },
};

const PROJECT_SUMMARY = [
  { id: "wooman1", name: "우만1구역", progress: 68, households: 2800, price: 5.9 },
  { id: "wooman2", name: "우만2구역", progress: 54, households: 2700, price: 5.4 },
  { id: "worldcup1", name: "월드컵1구역", progress: 41, households: 1500, price: 4.8 },
  { id: "ingye", name: "인계3구역", progress: 37, households: 2100, price: 5.1 },
  { id: "paldal", name: "팔달6구역", progress: 73, households: 3200, price: 6.2 },
];

export default function InsightsPage() {
  const [metric, setMetric] = useState("progress");

  const sortedProjects = useMemo(() => {
    const valueKey = metric;
    return [...PROJECT_SUMMARY].sort((a, b) => b[valueKey] - a[valueKey]);
  }, [metric]);

  const topProject = sortedProjects[0];
  const metricInfo = METRICS[metric];

  return (
    <section className="flex h-full flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">투자 인사이트</h1>
        <p className="mt-1 text-sm text-slate-500">
          주요 구역별로 사업 진척도, 세대 수, 예상 분양가를 비교해 볼 수 있습니다.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        {Object.entries(METRICS).map(([key, value]) => {
          const isActive = key === metric;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setMetric(key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                isActive ? "bg-blue-600 text-white shadow" : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {value.label}
            </button>
          );
        })}
      </div>

      {topProject && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">현재 1위 구역</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">{topProject.name}</h2>
          <p className="mt-2 text-sm text-slate-700">
            {metricInfo.label}: <span className="font-semibold text-blue-700">{metricInfo.format(topProject[metric])}</span>
          </p>
          <p className="mt-1 text-sm text-slate-600">
            총 세대수 {topProject.households.toLocaleString("ko-KR")}세대, 평균 분양가 {METRICS.price.format(topProject.price)} 수준입니다.
          </p>
        </div>
      )}

      <div className="flex-1 rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-3">구역명</th>
              <th scope="col" className="px-4 py-3">사업 진척도</th>
              <th scope="col" className="px-4 py-3">세대 수</th>
              <th scope="col" className="px-4 py-3">평균 분양가</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {sortedProjects.map((project) => (
              <tr key={project.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{project.name}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span>{project.progress}%</span>
                    <span className="h-2 flex-1 rounded-full bg-slate-200">
                      <span
                        className="block h-2 rounded-full bg-blue-500"
                        style={{ width: `${project.progress}%` }}
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">{project.households.toLocaleString("ko-KR")}세대</td>
                <td className="px-4 py-3">{METRICS.price.format(project.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
