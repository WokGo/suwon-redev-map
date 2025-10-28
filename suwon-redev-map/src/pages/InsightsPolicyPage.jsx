const POLICY_UPDATES = [
  {
    id: "policy-1",
    title: "재건축 초과이익환수 완화",
    description: "조합원 1인당 부담금 상한이 1억에서 6천만 원으로 조정돼 사업성 개선이 기대됩니다.",
  },
  {
    id: "policy-2",
    title: "역세권 청년주택 특별공급 확대",
    description: "청년·신혼부부 특별공급 비율이 5%p 상향돼 공공지원 민간임대 공급이 늘어납니다.",
  },
  {
    id: "policy-3",
    title: "투기과열지구 대출 규제 완화",
    description: "조합원 이주비 대출 한도가 주택가격의 60%까지 확대, 이주 일정 가속화 예상.",
  },
];

export default function InsightsPolicyPage() {
  return (
    <section className="flex h-full flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">정책 &amp; 제도 브리핑</h1>
        <p className="mt-1 text-sm text-slate-500">정부·지자체의 최신 부동산 정책 변화를 빠르게 전달합니다.</p>
      </header>

      <div className="space-y-3">
        {POLICY_UPDATES.map((policy) => (
          <article key={policy.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{policy.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{policy.description}</p>
          </article>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700">중개사 체크포인트</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>재건축 부담금 완화에 따라 추가 분담금 변동 여부를 수분양자에게 안내하세요.</li>
          <li>특별공급 확대 대상의 자격 요건을 사전에 검토하여 청약 컨설팅에 활용하세요.</li>
          <li>이주비 대출 한도 확대로 이주 시기 조정이 가능하므로 조합 일정표를 주기적으로 업데이트하세요.</li>
        </ul>
      </div>
    </section>
  );
}
