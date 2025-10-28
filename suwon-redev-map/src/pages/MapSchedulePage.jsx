const UPCOMING_EVENTS = [
  { id: "event-1", month: "11월", title: "우만1구역 1차 일반분양", detail: "견본주택 오픈 및 청약 접수 시작 (11월 14일)" },
  { id: "event-2", month: "12월", title: "월드컵1구역 임대주택 접수", detail: "청년·신혼부부 우선 공급, 온라인 신청" },
  { id: "event-3", month: "1월", title: "팔달6구역 관리처분 인가", detail: "기존 조합원 관리처분 총회 및 이주 일정 확정" },
];

export default function MapSchedulePage() {
  return (
    <section className="flex h-full flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">수원 재개발 일정 캘린더</h1>
        <p className="mt-1 text-sm text-slate-500">월별 주요 분양 일정과 조합 공지사항을 한 번에 확인하세요.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {UPCOMING_EVENTS.map((event) => (
          <article key={event.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">{event.month}</span>
            <h2 className="mt-3 text-lg font-semibold text-slate-900">{event.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{event.detail}</p>
          </article>
        ))}
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-6 text-sm text-blue-800">
        <p className="font-semibold">Tip</p>
        <p className="mt-1">
          조합 공고는 고시일로부터 7일 내 이의신청이 가능합니다. 회의 일정은 고객센터 &gt; 상담 예약 페이지에서 알림 신청을
          해두면 문자로 받아볼 수 있어요.
        </p>
      </div>
    </section>
  );
}
