const MARKET_METRICS = [
  { id: "metric-1", title: "매매가격지수", value: "112.4", change: "+0.6% (전월 대비)" },
  { id: "metric-2", title: "전세가격지수", value: "107.8", change: "+0.3% (전월 대비)" },
  { id: "metric-3", title: "미분양 물량", value: "425세대", change: "-11.2% (전월 대비)" },
];

export default function InsightsMarketPage() {
  return (
    <section className="flex h-full flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">시장 동향 리포트</h1>
        <p className="mt-1 text-sm text-slate-500">국토부·KB 시세를 기반으로 수원의 주거 시장 변화를 요약했습니다.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {MARKET_METRICS.map((metric) => (
          <article key={metric.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{metric.title}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{metric.value}</p>
            <p className="mt-1 text-sm text-blue-600">{metric.change}</p>
          </article>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">중개사 한 줄 브리핑</h2>
        <p className="mt-2 text-sm text-slate-600">
          전세 재계약 비중이 높아져 급매물은 감소 추세입니다. 조합원 이주가 본격화될 2026년까지 신축 프리미엄이 유지될
          가능성이 높으니 장기 보유 전략이 유리합니다.
        </p>
      </div>
    </section>
  );
}
