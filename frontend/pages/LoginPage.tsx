import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Page } from "../src/types";
import { login } from "../services/authService";

interface LoginPageProps {
  onNavigate: (page: Page) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    try {
      await login({ email, password });
      setMessage("로그인 완료. 이제 분석 결과를 저장할 수 있어요.");
      onNavigate("main");
    } catch {
      setMessage("로그인 정보를 다시 확인해 주세요.");
    }
  };

  return (
    <section className="mx-auto max-w-md space-y-6 rounded-lg border border-black/10 p-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">Account</p>
        <h1 className="mt-2 text-2xl font-light">로그인</h1>
      </div>
      <input className="w-full rounded-lg border border-black/10 px-3 py-3 text-[14px]" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full rounded-lg border border-black/10 px-3 py-3 text-[14px]" placeholder="비밀번호" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="button" onClick={handleSubmit} className="flex w-full items-center justify-center gap-2 rounded-lg bg-black py-3 text-[12px] uppercase tracking-widest text-white">
        Login <ArrowRight size={14} />
      </button>
      {message && <p className="text-[12px] text-black/55">{message}</p>}
      <button type="button" onClick={() => onNavigate("signup")} className="text-[12px] text-black/45 underline">
        계정이 없다면 회원가입
      </button>
    </section>
  );
}
