import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { user, login, signup, loading } = useAuth();

  useEffect(() => {
    if (user) {
      setSuccess(`${user.name}님, 이미 로그인 상태입니다.`);
    }
  }, [user]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (mode === "signup") {
        const result = await signup(form);
        if (result.success) {
          setSuccess(result.message || "회원가입이 완료되었습니다.");
          setTimeout(() => navigate("/", { replace: true }), 800);
        } else {
          setError(result.message || "회원가입에 실패했습니다.");
        }
      } else {
        const result = await login({ email: form.email, password: form.password });
        if (result.success) {
          setSuccess("로그인되었습니다. 메인 페이지로 이동합니다.");
          setTimeout(() => navigate("/", { replace: true }), 600);
        } else {
          setError(result.message || "로그인에 실패했습니다.");
        }
      }
    } catch (exception) {
      setError(exception.message || "요청 처리 중 문제가 발생했습니다.");
    }
  };

  if (user && !loading && success) {
    return (
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900">이미 로그인되어 있습니다</h1>
          <p className="mt-2 text-sm text-slate-500">{success}</p>
        </header>
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <button
            type="button"
            onClick={() => navigate("/", { replace: true })}
            className="rounded-md bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            지도 홈으로 이동
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          {mode === "login" ? "로그인" : "회원가입"}으로 시작하세요
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Flask 백엔드에 등록된 계정으로 안전하게 접속합니다. 곧 RDS 연동으로 더 견고한 인증을 제공할 예정입니다.
        </p>
      </header>

      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
              setSuccess("");
            }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              mode === "login" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
              setSuccess("");
            }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              mode === "signup" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label htmlFor="auth-name" className="block text-sm font-medium text-slate-700">
                이름
              </label>
              <input
                id="auth-name"
                type="text"
                value={form.name}
                onChange={handleChange("name")}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="홍길동"
                required
              />
            </div>
          )}
          <div>
            <label htmlFor="auth-email" className="block text-sm font-medium text-slate-700">
              이메일
            </label>
            <input
              id="auth-email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="auth-password" className="block text-sm font-medium text-slate-700">
              비밀번호
            </label>
            <input
              id="auth-password"
              type="password"
              value={form.password}
              onChange={handleChange("password")}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="8자 이상 입력해주세요"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {loading ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}
          </button>
        </form>

        {error && <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
        {success && !user && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">{success}</div>
        )}
      </div>
    </section>
  );
}
