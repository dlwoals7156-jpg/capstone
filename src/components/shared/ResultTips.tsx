import { ChevronRight } from "lucide-react";

interface ResultTipsProps {
  tips: string[];
}

export function ResultTips({ tips }: ResultTipsProps) {
  return (
    <div className="mt-8">
      <p className="mb-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-black/30">
        스타일 추천 <span className="h-px flex-1 bg-black/10" />
      </p>
      <ul className="space-y-2">
        {tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-3 rounded-lg border border-black/5 bg-black/[0.015] px-3 py-3 text-[13px] font-light text-black/60">
            <ChevronRight size={12} className="mt-0.5 flex-shrink-0 text-black/30" />
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}
