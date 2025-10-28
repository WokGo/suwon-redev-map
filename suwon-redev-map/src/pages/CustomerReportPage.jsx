const REPORTS = [
  {
    id: "report-1",
    title: "2025 수원 정비사업 리포트",
    description: "정비구역별 사업성, 분양가, 인허가 타임라인을 정리한 연간 보고서입니다.",
    size: "PDF · 4.2MB",
  },
  {
    id: "report-2",
    title: "역세권 상업시설 임대료 분석",
    description: "월드컵 경기장·수원역 상권의 임대료 시세와 공실률 데이터를 수록했습니다.",
    size: "PDF · 2.8MB",
  },
  {
    id: "report-3",
    title: "재개발 투자 체크리스트",
    description: "실투자금 계산법, 분양권 전매 규정, 세무 유의점 등을 한 눈에 볼 수 있습니다.",
    size: "PDF · 1.5MB",
  },
];

export default function CustomerReportPage() {
  return (
    <section className="flex h-full flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">자료실</h1>
        <p className="mt-1 text-sm text-slate-500">중개사와 투자자를 위한 심화 리포트를 다운로드하세요.</p>
      </header>

      <div className="space-y-3">
        {REPORTS.map((report) => (
          <article key={report.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{report.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{report.description}</p>
              </div>
              <button
                type="button"
                className="mt-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 md:mt-0"
              >
                다운로드 ({report.size})
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
