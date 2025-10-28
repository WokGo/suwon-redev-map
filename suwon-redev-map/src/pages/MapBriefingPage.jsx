const FIELD_REPORTS = [
  {
    id: "report-1",
    title: "우만2구역 철거 공정률 45%",
    summary: "지상 구조물 해체가 절반 이상 진행돼 연내 착공이 가능한 상태입니다.",
    checklist: ["석면 해체 완료", "가설 울타리 확장", "통학로 우회로 임시 운영"],
  },
  {
    id: "report-2",
    title: "월드컵1구역 상업시설 MD 구성 확정",
    summary: "2층 규모 스트리트형 상가로 식음·라이프스타일 브랜드 계약이 마무리됐습니다.",
    checklist: ["1층 식음 비중 55%", "공동주차장 410면", "야간 조명 시뮬레이션 적용"],
  },
  {
    id: "report-3",
    title: "팔달6구역 교통영향평가 조건부 승인",
    summary: "트램 정거장 연계형 광장과 순환버스 노선을 조건부로 승인받았습니다.",
    checklist: ["트램 환승데크 조성", "주민 편의시설 24시간 개방", "주차장 동선 일방통행 설계"],
  },
];

export default function MapBriefingPage() {
  return (
    <section className="flex h-full flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">현장 브리핑</h1>
        <p className="mt-1 text-sm text-slate-500">
          주간 현장 점검 보고서를 토대로 공정 상황과 인허가 이슈를 정리했습니다. 공인중개사와 투자자 미팅 전에 참고하세요.
        </p>
      </header>

      <div className="space-y-4">
        {FIELD_REPORTS.map((report) => (
          <article key={report.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{report.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{report.summary}</p>
            <ul className="mt-4 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
              {report.checklist.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
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
