import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-6 inline-flex items-center gap-2 rounded-lg border border-transparent px-1 py-2 text-[11px] uppercase tracking-[0.12em] text-black/40 transition-colors duration-200 hover:text-black"
    >
      <ArrowLeft size={12} /> Back
    </button>
  );
}
