const COMMERCIAL_PACKAGES = [
  {
    id: "com-1",
    name: "월드컵1구역 스트리트몰",
    yield: "예상 임대수익률 4.7%",
    bullet: ["관광객 유입 1일 5만 명", "주차 400면", "야간 집객을 위한 미디어 파사드"],
  },
  {
    id: "com-2",
    name: "팔달문 관광특구 앵커몰",
    yield: "예상 임대수익률 5.1%",
    bullet: ["관광버스 전용 하차장", "청년 창업존 배정", "관광 안내센터 연계"],
  },
  {
    id: "com-3",
    name: "수원역 환승센터 복합몰",
    yield: "예상 임대수익률 4.3%",
    bullet: ["GTX-C 환승 수요", "호텔·오피스 연계 유동층", "프랜차이즈 선임차 계약 진행"],
  },
];

export default function DealsCommercialPage() {
  return (
    <section className="flex h-full flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">상업시설 투자 정보</h1>
        <p className="mt-1 text-sm text-slate-500">고객층, 유동 인구, 선임차 조건을 비교해 안정적인 임대 수익을 확보하세요.</p>
      </header>

      <div className="space-y-4">
        {COMMERCIAL_PACKAGES.map((item) => (
          <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{item.name}</h2>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                {item.yield}
              </span>
            </div>
            <ul className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
              {item.bullet.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
