const PARTNERS = [
  {
    id: "partner-1",
    name: "수원역 센트럴 공인중개사",
    specialties: ["재개발 조합원 매물", "법률·세무 네트워크", "상업시설 임대"],
  },
  {
    id: "partner-2",
    name: "광교 리얼티",
    specialties: ["프리미엄 오피스텔", "법인 임대 관리", "외국인 임차 컨설팅"],
  },
  {
    id: "partner-3",
    name: "팔달 프라임",
    specialties: ["주거 임대관리", "리모델링 패키지", "전월세 보증금 보호"],
  },
];

export default function CustomerPartnerPage() {
  return (
    <section className="flex h-full flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">파트너 네트워크</h1>
        <p className="mt-1 text-sm text-slate-500">
          수원 재개발 특화 공인중개사와 협력사의 주요 서비스를 소개합니다.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {PARTNERS.map((partner) => (
          <article key={partner.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{partner.name}</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {partner.specialties.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
