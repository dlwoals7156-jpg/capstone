interface PageHeaderProps {
  num: string;
  title: string;
  sub: string;
}

export function PageHeader({ num, title, sub }: PageHeaderProps) {
  return (
    <div className="mb-9 border-b border-black/10 pb-7 pt-8 sm:pt-10">
      <p className="mb-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-black/30">
        <span className="w-6 h-px bg-black/20" />{num}
      </p>
      <h1 className="mb-3 text-3xl font-light leading-tight tracking-tight sm:text-4xl">{title}</h1>
      <p className="max-w-2xl text-[13px] leading-relaxed text-black/45">{sub}</p>
    </div>
  );
}
