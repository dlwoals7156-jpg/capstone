import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Page } from "../src/types";
import { checkEmail, signup } from "../services/authService";

interface SignupPageProps {
  onNavigate: (page: Page) => void;
}

export function SignupPage({ onNavigate }: SignupPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("female");
  const [message, setMessage] = useState("");
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleEmailCheck = async () => {
    if (!isValidEmail(email)) {
      setMessage("올바른 이메일 형식으로 입력해 주세요.");
      setIsEmailAvailable(null);
      return;
    }
    try {
      const result = await checkEmail(email);
      setIsEmailAvailable(result.available);
      setMessage(result.available ? "사용 가능한 이메일입니다." : "이미 가입된 이메일입니다.");
    } catch {
      setIsEmailAvailable(null);
      setMessage("이메일 중복 확인에 실패했습니다.");
    }
  };

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      setMessage("올바른 이메일 형식으로 입력해 주세요.");
      return;
    }
    if (name.trim().length < 2) {
      setMessage("이름은 2자 이상 입력해 주세요.");
      return;
    }
    if (password.length < 6) {
      setMessage("비밀번호는 6자 이상 입력해 주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      setMessage("비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    if (isEmailAvailable !== true) {
      setMessage("이메일 중복 확인을 완료해주세요.");
      return;
    }
    try {
      await signup({ email, password, password_confirm: passwordConfirm, nickname: name.trim(), gender });
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
      <div className="flex gap-2">
        <input
          className="min-w-0 flex-1 rounded-lg border border-black/10 px-3 py-3 text-[14px]"
          placeholder="이메일"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setIsEmailAvailable(null);
          }}
        />
        <button
          type="button"
          onClick={handleEmailCheck}
          className="shrink-0 rounded-lg border border-black/20 px-3 text-[12px] text-black/60 transition-colors hover:border-black"
        >
          중복 확인
        </button>
      </div>
      <input className="w-full rounded-lg border border-black/10 px-3 py-3 text-[14px]" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="w-full rounded-lg border border-black/10 px-3 py-3 text-[14px]" placeholder="비밀번호 6자 이상" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <input className="w-full rounded-lg border border-black/10 px-3 py-3 text-[14px]" placeholder="비밀번호 확인" type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
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
      {isEmailAvailable === true && <p className="text-[12px] text-black/45">이메일 중복 확인이 완료되었습니다.</p>}
      {message && <p className="text-[12px] text-black/55">{message}</p>}
    </section>
  );
}
