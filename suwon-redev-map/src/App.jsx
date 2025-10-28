import { useMemo, useState } from "react";
import { BrowserRouter, NavLink, Route, Routes, useLocation } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import CustomerCenterPage from "./pages/CustomerCenterPage";
import CustomerConsultingPage from "./pages/CustomerConsultingPage";
import CustomerPartnerPage from "./pages/CustomerPartnerPage";
import CustomerReportPage from "./pages/CustomerReportPage";
import DealsCommercialPage from "./pages/DealsCommercialPage";
import DealsOfficetelPage from "./pages/DealsOfficetelPage";
import DealsPage from "./pages/DealsPage";
import DealsResidentialPage from "./pages/DealsResidentialPage";
import InsightsFinancePage from "./pages/InsightsFinancePage";
import InsightsMarketPage from "./pages/InsightsMarketPage";
import InsightsPage from "./pages/InsightsPage";
import InsightsPolicyPage from "./pages/InsightsPolicyPage";
import MapBriefingPage from "./pages/MapBriefingPage";
import MapPage from "./pages/MapPage";
import MapSchedulePage from "./pages/MapSchedulePage";
import { useAuth } from "./context/AuthContext";

const MENU_LINKS = [
  {
    to: "/",
    label: "지도 홈",
    description: "재개발 현황과 구역별 세대 수",
    end: true,
    subLinks: [
      { to: "/", label: "현황 지도", end: true },
      { to: "/map/schedule", label: "분양 일정" },
      { to: "/map/briefing", label: "현장 브리핑" },
    ],
  },
  {
    to: "/deals",
    label: "분양 탐색",
    description: "새로운 분양/투자 공고 모아보기",
    subLinks: [
      { to: "/deals", label: "전체 분양", end: true },
      { to: "/deals/residential", label: "아파트 청약" },
      { to: "/deals/commercial", label: "상업시설 분양" },
      { to: "/deals/officetel", label: "오피스텔 투자" },
    ],
  },
  {
    to: "/insights",
    label: "투자 인사이트",
    description: "시장지표·금융·정책 분석",
    subLinks: [
      { to: "/insights", label: "프로젝트 비교", end: true },
      { to: "/insights/market", label: "시장 동향" },
      { to: "/insights/finance", label: "금융/자금계획" },
      { to: "/insights/policy", label: "정책 브리핑" },
    ],
  },
  {
    to: "/customer",
    label: "고객센터",
    description: "FAQ · 상담 · 자료실",
    subLinks: [
      { to: "/customer", label: "고객센터 홈", end: true },
      { to: "/customer/consulting", label: "상담 예약" },
      { to: "/customer/reports", label: "자료실" },
      { to: "/customer/partners", label: "파트너 네트워크" },
    ],
  },
];

const ROUTES = [
  { path: "/", element: <MapPage /> },
  { path: "/map/schedule", element: <MapSchedulePage /> },
  { path: "/map/briefing", element: <MapBriefingPage /> },
  { path: "/deals", element: <DealsPage /> },
  { path: "/deals/residential", element: <DealsResidentialPage /> },
  { path: "/deals/commercial", element: <DealsCommercialPage /> },
  { path: "/deals/officetel", element: <DealsOfficetelPage /> },
  { path: "/insights", element: <InsightsPage /> },
  { path: "/insights/market", element: <InsightsMarketPage /> },
  { path: "/insights/finance", element: <InsightsFinancePage /> },
  { path: "/insights/policy", element: <InsightsPolicyPage /> },
  { path: "/customer", element: <CustomerCenterPage /> },
  { path: "/customer/consulting", element: <CustomerConsultingPage /> },
  { path: "/customer/reports", element: <CustomerReportPage /> },
  { path: "/customer/partners", element: <CustomerPartnerPage /> },
  { path: "/auth", element: <AuthPage /> },
];

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  const matchesPath = (target) => {
    if (target === "/") {
      return location.pathname === "/";
    }
    return location.pathname === target || location.pathname.startsWith(`${target}/`);
  };

  const activeMenu = useMemo(() => {
    return MENU_LINKS.find((menu) => menu.subLinks?.some((subLink) => matchesPath(subLink.to))) || null;
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800">
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-slate-900/40 md:hidden" onClick={closeSidebar} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-white shadow-lg transition duration-200 ease-in-out md:static md:block md:h-full md:translate-x-0 md:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col border-r border-slate-200">
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Suwon Redev Map</p>
              <h1 className="text-lg font-semibold text-slate-900">재개발 서비스</h1>
            </div>
            <button
              type="button"
              onClick={closeSidebar}
              className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 md:hidden"
            >
              닫기
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 pb-6">
            <ul className="space-y-2">
              {MENU_LINKS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `block rounded-xl px-4 py-3 transition ${
                        isActive || item.subLinks?.some((subLink) => matchesPath(subLink.to))
                          ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                          : "text-slate-700 hover:bg-slate-100"
                      }`
                    }
                    onClick={closeSidebar}
                  >
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="mt-1 text-xs text-slate-400">{item.description}</p>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            {user ? (
              <div className="space-y-2">
                <p className="font-semibold text-slate-800">{user.name}님 환영합니다.</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeSidebar();
                  }}
                  className="w-full rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <NavLink
                to="/auth"
                className="block rounded-md border border-slate-300 px-3 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-white"
                onClick={closeSidebar}
              >
                로그인 / 회원가입
              </NavLink>
            )}
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-slate-200 bg-white">
          <div className="flex items-center gap-4 px-6 py-4">
            <button
              type="button"
              onClick={toggleSidebar}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 md:hidden"
            >
              메뉴
            </button>
            <div className="hidden md:block">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Today&apos;s Highlight</p>
              <h2 className="text-lg font-semibold text-slate-900">수원 재개발 통합 허브</h2>
            </div>
            <div className="flex flex-1 items-center">
              <label htmlFor="global-search" className="sr-only">
                검색
              </label>
              <div className="relative w-full max-w-md">
                <input
                  id="global-search"
                  type="search"
                  placeholder="구역명, 키워드로 검색해 보세요"
                  className="w-full rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
                  검색
                </span>
              </div>
            </div>
            {user ? (
              <div className="hidden items-center gap-3 md:flex">
                <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                  {user.name}님
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <NavLink
                to="/auth"
                className={({ isActive }) =>
                  `hidden rounded-md px-4 py-2 text-sm font-semibold md:block ${
                    isActive ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                로그인 / 회원가입
              </NavLink>
            )}
          </div>
          {activeMenu?.subLinks?.length ? (
            <nav className="border-t border-slate-200 bg-slate-50">
              <ul className="flex items-center gap-4 overflow-x-auto px-6 py-2 text-sm font-medium text-slate-600">
                {activeMenu.subLinks.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      end={link.end}
                      className={({ isActive }) =>
                        `rounded-full px-3 py-1 transition ${
                          isActive ? "bg-blue-600 text-white" : "hover:bg-white hover:text-slate-800"
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          ) : (
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-2 text-sm text-slate-500">
              맞춤형 부동산 정보를 준비 중입니다.
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto flex h-full max-w-7xl flex-col gap-6 px-6 py-6">
            <Routes>
              {ROUTES.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
              <Route
                path="*"
                element={
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
                    요청하신 페이지를 찾을 수 없습니다. 좌측 메뉴에서 다시 선택해주세요.
                  </div>
                }
              />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
