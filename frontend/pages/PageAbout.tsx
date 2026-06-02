import { BackButton } from "../components/BackButton";
import { PageHeader } from "../components/PageHeader";

interface PageAboutProps {
  onBack: () => void;
}

export function PageAbout({ onBack }: PageAboutProps) {
  return (
    <div className="mx-auto max-w-2xl px-5 pb-20 sm:px-6">
      <header className="mb-6 flex items-center justify-between border-b border-black/10 py-7">
        <div className="flex items-baseline gap-3 cursor-pointer select-none group" onClick={onBack}>
          <span className="text-base font-light tracking-widest uppercase group-hover:text-black/60 transition-colors duration-200" style={{ fontFamily: "'Playfair Display', serif" }}>Deeplook</span>
          <span className="rounded-md border border-black/15 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-black/40 transition-colors duration-200 group-hover:border-black/30">AI Fashion Tech Lab</span>
        </div>
      </header>
      <BackButton onClick={onBack} />
      <PageHeader num="About Deeplook" title="소개" sub="AI Fashion Tech Lab에 대해" />
      <div className="space-y-10">
        <div className="rounded-lg border border-black/10 p-5">
          <p className="mb-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-black/30">What we do</p>
          <p className="text-[14px] font-light leading-relaxed text-black/70">
            Deeplook은 사용자의 미세한 신체적 특징(퍼스널 컬러, 골격, 체형 비율)을 다각도로 분석하여 최상의 패션 스타일링을 도출하는 정교한 알고리즘 테크 연구소입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
export default PageAbout;
