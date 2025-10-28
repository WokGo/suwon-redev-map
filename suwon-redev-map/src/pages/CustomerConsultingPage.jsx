import { useState } from "react";

const AVAILABLE_SLOTS = ["11월 5일(화) 오후 2시", "11월 6일(수) 오후 7시(야간)", "11월 8일(금) 오전 11시"];

export default function CustomerConsultingPage() {
  const [selectedSlot, setSelectedSlot] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedSlot) return;
    setSubmitted(true);
  };

  return (
    <section className="mx-auto flex h-full w-full max-w-3xl flex-col gap-6">
      <header className="text-center">
        <h1 className="text-2xl font-semibold text-slate-900">전문 중개 상담 예약</h1>
        <p className="mt-1 text-sm text-slate-500">수원 재개발 전문 공인중개사와 1:1 맞춤 상담을 예약하세요.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-slate-700">원하는 일정</label>
        <div className="grid gap-3 md:grid-cols-3">
          {AVAILABLE_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => setSelectedSlot(slot)}
              className={`rounded-lg border px-3 py-3 text-sm ${
                selectedSlot === slot
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-300 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          상담 예약 요청
        </button>
      </form>

      {submitted && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {selectedSlot} 일정으로 상담 요청이 접수되었습니다. 담당 공인중개사가 영업일 기준 24시간 이내 연락드립니다.
        </div>
      )}
    </section>
  );
}
