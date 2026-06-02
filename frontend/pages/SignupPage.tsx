import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Page } from "../src/types";
import { signup } from "../services/authService";

interface SignupPageProps {
  onNavigate: (page: Page) => void;
}

export function SignupPage({ onNavigate }: SignupPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState("female");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    try {
      await signup({ email, password, nickname, gender });
      setMessage("회원가입 완료. 로그인 화면으로 이동합니다.");
      onNavigate("login");
    } catch {
      setMessage("이미 가입된 이메일이거나 입력값이 부족합니다.");
    }
  };

  return (
    <section className="mx-auto max-w-md space-y-6 rounded-lg border border-black/10 p-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">Account</p>
        <h1 className="mt-2 text-2xl font-light">회원가입</h1>
      </div>
      <input className="w-full rounded-lg border border-black/10 px-3 py-3 text-[14px]" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full rounded-lg border border-black/10 px-3 py-3 text-[14px]" placeholder="닉네임" value={nickname} onChange={(e) => setNickname(e.target.value)} />
      <input className="w-full rounded-lg border border-black/10 px-3 py-3 text-[14px]" placeholder="비밀번호 6자 이상" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        {[
          { value: "female", label: "여성" },
          { value: "male", label: "남성" },
        ].map((item) => (
          <button key={item.value} type="button" onClick={() => setGender(item.value)}
            className={`rounded-lg border px-3 py-3 text-[12px] ${gender === item.value ? "border-black bg-black text-white" : "border-black/10 text-black/55"}`}>
            {item.label}
          </button>
        ))}
      </div>
      <button type="button" onClick={handleSubmit} className="flex w-full items-center justify-center gap-2 rounded-lg bg-black py-3 text-[12px] uppercase tracking-widest text-white">
        Sign Up <ArrowRight size={14} />
      </button>
      {message && <p className="text-[12px] text-black/55">{message}</p>}
    </section>
  );
}
