import { useMemo, useState } from "react";

const DEAL_CATEGORIES = ["전체", "주거", "상업", "오피스텔", "주거복합"];

const DEALS = [
  {
    id: "deal-1",
    category: "주거",
    title: "우만1구역 재건축 일반 분양",
    description: "84㎡ 타입 기준 5억 9천만 원부터, 남향 위주 배치.",
    status: "청약 접수 중",
    date: "2025-11-02",
  },
  {
    id: "deal-2",
    category: "상업",
    title: "월드컵 상업지구 상가 분양",
    description: "수원 월드컵 경기장 인근 스트리트몰, 공실 보장 1년.",
    status: "사전 예약",
    date: "2025-11-15",
  },
  {
    id: "deal-3",
    category: "오피스텔",
    title: "수원센트럴 오피스텔",
    description: "야간 조망 좋은 35층 복합단지, 전 타입 풀옵션 제공.",
    status: "홍보관 오픈",
    date: "2025-12-01",
  },
  {
    id: "deal-4",
    category: "주거복합",
    title: "인계동 주거복합 신축",
    description: "주거·업무·문화가 결합된 역세권 단지, 지하철 도보 3분.",
    status: "관심고객 모집",
    date: "2025-11-24",
  },
  {
    id: "deal-5",
    category: "주거",
    title: "팔달6구역 전용 59㎡ 타입",
    description: "분양가 상한 적용 단지, 중도금 전액 무이자.",
    status: "청약 예정",
    date: "2025-12-10",
  },
];

const STATUS_BADGES = {
  "청약 접수 중": "bg-emerald-100 text-emerald-700",
  "사전 예약": "bg-blue-100 text-blue-700",
  "홍보관 오픈": "bg-purple-100 text-purple-700",
  "관심고객 모집": "bg-amber-100 text-amber-700",
  "청약 예정": "bg-slate-100 text-slate-700",
};

export default function DealsPage() {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [viewMode, setViewMode] = useState("grid");

  const filteredDeals = useMemo(() => {
    if (activeCategory === "전체") return DEALS;
    return DEALS.filter((deal) => deal.category === activeCategory);
  }, [activeCategory]);

  const toggleViewMode = () => setViewMode((mode) => (mode === "grid" ? "list" : "grid"));

  return (
    <section className="flex h-full flex-col gap-6">
      <header className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">분양/투자 소식</h1>
          <p className="mt-1 text-sm text-slate-500">
            카테고리별 최신 분양 공고와 투자 포인트를 확인해 보세요.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleViewMode}
          className="self-start rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          보기 전환: {viewMode === "grid" ? "목록형" : "카드형"}
        </button>
      </header>

      <div className="flex flex-wrap gap-2">
        {DEAL_CATEGORIES.map((category) => {
          const isActive = category === activeCategory;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive ? "bg-slate-900 text-white shadow" : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div
        className={`grid flex-1 gap-4 ${
          viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
        }`}
      >
        {filteredDeals.map((deal) => (
          <article
            key={deal.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{deal.category}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGES[deal.status]}`}>
                  {deal.status}
                </span>
              </div>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">{deal.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{deal.description}</p>
            </div>
            <p className="mt-4 text-sm text-slate-500">일정: {new Date(deal.date).toLocaleDateString("ko-KR")}</p>
          </article>
        ))}
        {filteredDeals.length === 0 && (
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-sm text-slate-500">
            선택한 카테고리의 소식이 곧 업데이트될 예정입니다.
          </div>
        )}
      </div>
    </section>
  );
}
