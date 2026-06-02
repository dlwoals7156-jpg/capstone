import { ArrowUpRight } from "lucide-react";
import { Page } from "../src/types";

interface CrossNavButtonsProps {
  current: Page;
  onNavigate: (p: Page) => void;
}

export function CrossNavButtons({ current, onNavigate }: CrossNavButtonsProps) {
  const all: { page: Page; label: string }[] = [
    { page: "personal-color", label: "퍼스널 컬러 진단" },
    { page: "skeleton", label: "골격 체형 진단" },
    { page: "body-shape", label: "몸 체형 진단" },
  ];

  return (
    <div className="mt-10 border-t border-black/10 pt-8">
      <p className="mb-4 text-[10px] uppercase tracking-[0.22em] text-black/30">다른 진단 바로가기</p>
      <div className="flex gap-3 flex-wrap">
        {all.filter((x) => x.page !== current).map((x) => (
          <button key={x.page} onClick={() => onNavigate(x.page)}
            className="flex items-center gap-2 rounded-lg border border-black/20 px-4 py-2.5 text-[12px] text-black transition-colors duration-200 hover:bg-black hover:text-white">
            {x.label}
            <ArrowUpRight size={12} />
          </button>
        ))}
      </div>
    </div>
  );
}
