const OFFICETEL_UNITS = [
  {
    id: "off-1",
    name: "수원센트럴 브릿지",
    price: "분양가 2.9억부터",
    tenant: "IT 스타트업·1인 가구 수요 집중",
    perks: ["풀옵션 제공", "라운지·피트니스", "24시간 스마트 컨시어지"],
  },
  {
    id: "off-2",
    name: "광교 비즈스테이",
    price: "분양가 3.2억부터",
    tenant: "기업체 법인 임대, 연구단지 출퇴근 수요",
    perks: ["호수공원 조망", "공유회의실", "주 1회 하우스키핑"],
  },
];

export default function DealsOfficetelPage() {
  return (
    <section className="flex h-full flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">오피스텔 투자 리스트</h1>
        <p className="mt-1 text-sm text-slate-500">중도금 대출 조건과 임차 수요를 확인하여 안정적인 수익을 확보하세요.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {OFFICETEL_UNITS.map((unit) => (
          <article key={unit.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{unit.name}</h2>
              <span className="text-sm font-semibold text-blue-600">{unit.price}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{unit.tenant}</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {unit.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
