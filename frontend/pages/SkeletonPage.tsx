import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Page, SkeletonAnswer, SkeletonResult } from "../src/types";
import { SKELETON_QUESTIONS } from "../src/constants/data";
import { calcSkeletonResult } from "../src/utils/helpers";
import { BackButton } from "../components/BackButton";
import { CrossNavButtons } from "../components/CrossNavButtons";
import { PageHeader } from "../components/PageHeader";
import { ResultTips } from "../components/ResultTips";

interface SkeletonPageProps {
  onComplete: (skeleton: string) => void;
  onNavigate: (page: Page) => void;
}

export function SkeletonPage({ onComplete, onNavigate }: SkeletonPageProps) {
  const [skAnswers, setSkAnswers] = useState<SkeletonAnswer[]>([]);
  const [skResult, setSkResult] = useState<SkeletonResult | null>(null);
  const currentQuestion = SKELETON_QUESTIONS[skAnswers.length];

  return (
    <div className="mx-auto max-w-4xl">
      <BackButton onClick={() => onNavigate("main")} />
      <PageHeader
        num="Diagnosis 02"
        title="골격 체형 엔진"
        sub="스트레이트·웨이브·내추럴 점수를 질문별 가중치로 계산하고 혼합형까지 허용합니다."
      />

      {!skResult ? (
        <div className="rounded-lg border border-black/10 p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between text-[11px] uppercase tracking-wider text-black/40">
            <span>
              Question {skAnswers.length + 1} of {SKELETON_QUESTIONS.length}
            </span>
            <div className="relative h-1 w-28 rounded-full bg-black/10">
              <div
                className="h-full rounded-full bg-black transition-all duration-300"
                style={{ width: `${((skAnswers.length + 1) / SKELETON_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          <h3 className="text-2xl font-light leading-snug">{currentQuestion.q}</h3>
          <div className="mt-7 grid gap-3">
            {currentQuestion.options.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => {
                  const next = [...skAnswers, opt.label];
                  setSkAnswers(next);
                  if (next.length === SKELETON_QUESTIONS.length) {
                    const res = calcSkeletonResult(next);
                    setSkResult(res);
                    onComplete(res.type);
                  }
                }}
                className="rounded-lg border border-black/10 p-4 text-left transition-colors hover:border-black/30 hover:bg-black/[0.015]"
              >
                <p className="text-[14px] font-light text-black">{opt.text}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {Object.entries(opt.weights).map(([key, value]) => (
                    <span key={key} className="rounded-md bg-black/[0.04] px-2 py-1 text-[10px] uppercase tracking-wide text-black/45">
                      {key === "straight" ? "스트레이트" : key === "wave" ? "웨이브" : "내추럴"} +{value}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-black p-6 sm:p-8">
          <div className="flex flex-col gap-4 border-b border-black/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">Result Name</p>
              <h2 className="mt-2 text-4xl font-light tracking-tight">{skResult.type}</h2>
              <p className="mt-2 text-[12px] uppercase tracking-widest text-black/40">{skResult.en} Architecture</p>
            </div>
            <div className="rounded-lg bg-black px-4 py-3 text-white">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/55">Confidence</p>
              <p className="mt-1 text-2xl font-light">{Math.round(skResult.confidence * 100)}%</p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-5">
              <p className="text-[15px] font-light leading-relaxed text-black/70">{skResult.desc}</p>
              <div className="rounded-lg border border-black/10 bg-black/[0.015] p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">타입별 점수</p>
                <div className="mt-4 space-y-3">
                  {Object.entries(skResult.scores).map(([key, value]) => (
                    <div key={key}>
                      <div className="mb-1 flex items-center justify-between text-[12px] text-black/60">
                        <span>{key}</span>
                        <span>{value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-black/10">
                        <div className="h-full rounded-full bg-black" style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[12px] leading-relaxed text-black/50">보조 결과: {skResult.secondaryType}</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-lg border border-black/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">분석 근거</p>
                <ul className="mt-3 space-y-2">
                  {skResult.reasons.map((reason) => (
                    <li key={reason} className="text-[12px] leading-relaxed text-black/60">
                      - {reason}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-black/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">추천 포인트</p>
                <ul className="mt-3 space-y-2">
                  {skResult.recommendationPoints.map((point) => (
                    <li key={point} className="flex gap-2 text-[12px] leading-relaxed text-black/60">
                      <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-black/45" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-black/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">주의 포인트</p>
                <ul className="mt-3 space-y-2">
                  {skResult.cautionPoints.map((point) => (
                    <li key={point} className="text-[12px] leading-relaxed text-black/60">
                      - {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <ResultTips tips={skResult.tips} />

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => onNavigate("main")}
              className="flex-1 rounded-lg bg-black py-3 text-[12px] uppercase tracking-widest text-white transition-colors hover:bg-black/80"
            >
              메인으로 복귀
            </button>
            <button
              type="button"
              onClick={() => {
                setSkAnswers([]);
                setSkResult(null);
              }}
              className="rounded-lg border border-black/20 px-5 py-3 text-[12px] uppercase text-black/60 transition-colors hover:border-black"
            >
              다시 진단
            </button>
          </div>
        </div>
      )}

      <CrossNavButtons current="skeleton" onNavigate={onNavigate} />
    </div>
  );
}
export default SkeletonPage;
