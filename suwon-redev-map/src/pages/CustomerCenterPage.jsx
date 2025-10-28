import { useState } from "react";

const FAQ_ITEMS = [
  {
    id: "faq-1",
    question: "지도 데이터는 얼마나 자주 갱신되나요?",
    answer:
      "공식 공공데이터와 지자체 고시를 주기적으로 반영하며, 기본적으로 주 1회 데이터를 동기화합니다. 긴급 공지가 발생하면 즉시 반영됩니다.",
  },
  {
    id: "faq-2",
    question: "관심 구역을 저장하고 알림을 받을 수 있나요?",
    answer:
      "회원 가입 후 마이페이지에서 최대 10개의 관심 구역을 등록할 수 있으며, 공고 변경 사항을 이메일과 문자로 안내해 드립니다.",
  },
  {
    id: "faq-3",
    question: "현장 답사와 분양 상담도 지원하나요?",
    answer:
      "부동산 전문 파트너사와 연계된 답사/상담 서비스를 제공합니다. 고객센터로 문의를 등록해 주시면 24시간 이내 담당자가 연락드립니다.",
  },
  {
    id: "faq-4",
    question: "RDS 기반의 데이터는 어디에서 확인할 수 있나요?",
    answer:
      "내부 관리 콘솔에서 실시간으로 프로젝트 상태를 확인할 수 있으며, 곧 공개 예정인 리포트 센터에서도 열람하실 수 있습니다.",
  },
];

const CONTACT_CHANNELS = [
  { id: "channel-1", name: "전화 상담", value: "1533-4200", description: "평일 09:00 - 18:00" },
  { id: "channel-2", name: "카카오톡 채널", value: "@수원재개발맵", description: "365일 24시간 챗봇 지원" },
  { id: "channel-3", name: "이메일", value: "support@suwon-redev-map.com", description: "영업일 기준 24시간 내 답변" },
];

export default function CustomerCenterPage() {
  const [openFaq, setOpenFaq] = useState(FAQ_ITEMS[0].id);
  const [message, setMessage] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    setSubmittedMessage(message.trim());
    setMessage("");
  };

  return (
    <section className="grid h-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">고객센터</h1>
          <p className="mt-1 text-sm text-slate-500">
            자주 묻는 질문을 확인하거나 실시간 문의를 남겨주시면 상담사가 도와드립니다.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">자주 묻는 질문</h2>
          <div className="mt-4 space-y-3">
            {FAQ_ITEMS.map((faq) => {
              const isOpen = faq.id === openFaq;
              return (
                <div key={faq.id} className="rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    {faq.question}
                    <span className="text-xs text-slate-500">{isOpen ? "접기" : "펼치기"}</span>
                  </button>
                  {isOpen && <p className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">{faq.answer}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">문의 남기기</h2>
          <p className="mt-1 text-sm text-slate-500">빠르게 도와드릴 수 있도록 궁금한 내용을 작성해주세요.</p>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="문의 내용을 입력해주세요."
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              문의 등록
            </button>
          </form>
          {submittedMessage && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              접수된 문의: <span className="font-medium text-slate-800">{submittedMessage}</span>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">연락처</h2>
          <ul className="mt-4 space-y-3">
            {CONTACT_CHANNELS.map((channel) => (
              <li key={channel.id} className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">{channel.name}</p>
                <p className="text-sm text-slate-600">{channel.value}</p>
                <p className="text-xs text-slate-500">{channel.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
