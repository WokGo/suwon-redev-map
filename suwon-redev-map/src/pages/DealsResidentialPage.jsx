const RESIDENTIAL_LIST = [
  {
    id: "res-1",
    name: "우만1구역 센트럴 파크",
    price: "평균 6.1억",
    highlights: ["59㎡·84㎡ 위주 구성", "전 세대 남향 위주 배치", "학교·공원 도보 5분"],
  },
  {
    id: "res-2",
    name: "팔달6구역 더 시티",
    price: "평균 6.5억",
    highlights: ["84㎡ 특화 평면", "프리미엄 커뮤니티", "분양가상한제 적용"],
  },
  {
    id: "res-3",
    name: "인계3구역 리버뷰",
    price: "평균 5.8억",
    highlights: ["역세권 입지", "탄력형 중도금 납부", "입주민 공유오피스"],
  },
];

export default function DealsResidentialPage() {
  return (
    <section className="flex h-full flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">아파트 청약 가이드</h1>
        <p className="mt-1 text-sm text-slate-500">실수요자와 투자자 모두 놓치지 말아야 할 분양 단지를 비교하세요.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {RESIDENTIAL_LIST.map((item) => (
          <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{item.name}</h2>
            <p className="mt-1 text-sm text-blue-600">{item.price}</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {item.highlights.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400" />
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
