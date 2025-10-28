const LOAN_PROGRAMS = [
  {
    id: "loan-1",
    title: "조합원 중도금 이자지원",
    summary: "도시공사 협약은행을 통해 2.9% 고정금리로 지원, 만기 일시상환 가능",
  },
  {
    id: "loan-2",
    title: "실거주 안심전환대출",
    summary: "정부 보금자리론 대체 상품, 최대 5억 한도. 한부모·신혼부부 우대금리 -0.2%",
  },
  {
    id: "loan-3",
    title: "임대사업자 전용 대출",
    summary: "개인사업자 등록 시 LTV 70%까지, 10년 만기 원리금 균등 상환",
  },
];

export default function InsightsFinancePage() {
  return (
    <section className="flex h-full flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">금융 지원 &amp; 자금계획</h1>
        <p className="mt-1 text-sm text-slate-500">공공·민간 금융 프로그램을 비교하고 최적의 자금 조달 전략을 세워보세요.</p>
      </header>

      <div className="space-y-4">
        {LOAN_PROGRAMS.map((loan) => (
          <article key={loan.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{loan.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{loan.summary}</p>
          </article>
        ))}
      </div>

      <div className="rounded-xl border border-amber-100 bg-amber-50 p-5 text-sm text-amber-800">
        <p className="font-semibold">전문가 Tip</p>
        <p className="mt-1">
          분양 후 전매 제한 기간 동안은 대출 갈아타기가 어려우므로, 중도금 대출 실행 전에 확정금리를 확보하는 것이
          중요합니다.
        </p>
      </div>
    </section>
  );
}
