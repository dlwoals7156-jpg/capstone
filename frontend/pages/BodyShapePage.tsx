import { useState } from "react";
import { CheckCircle2, Ruler } from "lucide-react";
import { BodyShapeAnswer, BodyShapeResult, Page } from "../src/types";
import { calcBodyType } from "../src/utils/helpers";
import { BackButton } from "../components/BackButton";
import { CrossNavButtons } from "../components/CrossNavButtons";
import { PageHeader } from "../components/PageHeader";
import { ResultTips } from "../components/ResultTips";

interface BodyShapePageProps {
  onComplete: (bodyShape: string, result?: BodyShapeResult) => void;
  onNavigate: (page: Page) => void;
}

export function BodyShapePage({ onComplete, onNavigate }: BodyShapePageProps) {
  const [shoulderVsHip, setShoulderVsHip] = useState<BodyShapeAnswer>(0);
  const [waistDefinition, setWaistDefinition] = useState<BodyShapeAnswer>(0);
  const [upperLowerBalance, setUpperLowerBalance] = useState<BodyShapeAnswer>(0);
  const [fitIssue, setFitIssue] = useState<"shoulders" | "waist" | "hips" | "balanced" | "unsure">("unsure");
  const [weightGainArea, setWeightGainArea] = useState<"upper" | "middle" | "lower" | "even" | "unsure">("unsure");
  const [answerConfidence, setAnswerConfidence] = useState<0.6 | 0.8 | 1>(0.8);
  const [shoulder, setShoulder] = useState<string>("");
  const [waist, setWaist] = useState<string>("");
  const [hip, setHip] = useState<string>("");
  const [bodyResult, setBodyResult] = useState<BodyShapeResult | null>(null);

  const handleCalculate = () => {
    const measurements = {
      shoulder: shoulder ? parseFloat(shoulder) : undefined,
      waist: waist ? parseFloat(waist) : undefined,
      hip: hip ? parseFloat(hip) : undefined,
    };
    if (!measurements.shoulder || !measurements.waist || !measurements.hip) {
      alert("AI 70% 비율 반영을 위해 어깨, 허리, 골반 값을 모두 입력해 주세요.");
      return;
    }
    if (Object.values(measurements).some((value) => value !== undefined && (Number.isNaN(value) || value <= 0))) {
      alert("치수는 0보다 큰 숫자로 입력해 주세요.");
      return;
    }

    const res = calcBodyType({
      shoulderVsHip,
      waistDefinition,
      upperLowerBalance,
      fitIssue,
      weightGainArea,
      confidence: answerConfidence,
      measurements,
    });
    setBodyResult(res);
    onComplete(res.ko, res);
  };

  const ScaleButton = ({
    value,
    active,
    label,
    onClick,
  }: {
    value: BodyShapeAnswer;
    active: BodyShapeAnswer;
    label: string;
    onClick: (value: BodyShapeAnswer) => void;
  }) => (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`min-h-12 rounded-lg border px-3 py-2 text-[12px] leading-snug transition-colors ${
        active === value ? "border-black bg-black text-white" : "border-black/10 text-black/60 hover:border-black/30"
      }`}
    >
      {label}
    </button>
  );

  const NumberField = ({
    label,
    value,
    setValue,
  }: {
    label: string;
    value: string;
    setValue: (value: string) => void;
  }) => (
    <label className="space-y-2">
      <span className="text-[12px] text-black/55">{label}</span>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full rounded-lg border border-black/10 bg-black/[0.015] px-3 py-3 pr-10 text-[14px] outline-none transition-colors focus:border-black"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-black/35">cm</span>
      </div>
    </label>
  );

  return (
    <div className="mx-auto max-w-4xl">
      <BackButton onClick={() => onNavigate("main")} />
      <PageHeader
        num="Diagnosis 03"
        title="체형 실루엣 분석"
        sub="어깨·허리·골반 비율을 중심으로 AI/치수 분석 70%, 사용자 설문 30%를 합산합니다."
      />

      {!bodyResult ? (
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-lg border border-black/10 p-5 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">AI Ratio Input / 70%</p>
                <h3 className="mt-1 text-xl font-light">어깨·허리·골반 비율</h3>
                <p className="mt-2 text-[12px] leading-relaxed text-black/45">
                  사진 인식값이 있다면 그대로 입력하고, 없으면 직접 측정한 값을 넣어 AI 비율 분석값으로 사용합니다.
                </p>
              </div>
              <Ruler size={20} className="text-black/40" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <NumberField label="어깨 너비" value={shoulder} setValue={setShoulder} />
              <NumberField label="허리 둘레" value={waist} setValue={setWaist} />
              <NumberField label="골반 너비" value={hip} setValue={setHip} />
            </div>
            <div className="mt-5 rounded-lg border border-black/10 bg-black/[0.015] p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-black/35">분류 기준</p>
              <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-black/55">
                <li>- 어깨가 골반보다 넓으면 역삼각형 후보</li>
                <li>- 골반이 어깨보다 넓으면 삼각형 후보</li>
                <li>- 허리 비율이 낮으면 모래시계 후보</li>
                <li>- 허리 비율이 높으면 타원형 후보</li>
                <li>- 세 폭 차이가 작으면 직사각형 후보</li>
              </ul>
            </div>
          </section>

          <section className="rounded-lg border border-black/10 p-5 sm:p-6">
            <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">Survey Input / 30%</p>
            <div className="mt-5 space-y-6">
              <div className="space-y-3">
                <label className="text-[13px] text-black/70">어깨와 골반 폭을 비교하면?</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  <ScaleButton value={-2} active={shoulderVsHip} label="골반 훨씬 넓음" onClick={setShoulderVsHip} />
                  <ScaleButton value={-1} active={shoulderVsHip} label="골반 약간 넓음" onClick={setShoulderVsHip} />
                  <ScaleButton value={0} active={shoulderVsHip} label="거의 비슷함" onClick={setShoulderVsHip} />
                  <ScaleButton value={1} active={shoulderVsHip} label="어깨 약간 넓음" onClick={setShoulderVsHip} />
                  <ScaleButton value={2} active={shoulderVsHip} label="어깨 훨씬 넓음" onClick={setShoulderVsHip} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[13px] text-black/70">허리선은 얼마나 들어가 보이나요?</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  <ScaleButton value={-2} active={waistDefinition} label="거의 일자" onClick={setWaistDefinition} />
                  <ScaleButton value={-1} active={waistDefinition} label="약한 굴곡" onClick={setWaistDefinition} />
                  <ScaleButton value={0} active={waistDefinition} label="중간" onClick={setWaistDefinition} />
                  <ScaleButton value={1} active={waistDefinition} label="잘록한 편" onClick={setWaistDefinition} />
                  <ScaleButton value={2} active={waistDefinition} label="매우 뚜렷함" onClick={setWaistDefinition} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[13px] text-black/70">상체와 하체의 시각적 비중은?</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  <ScaleButton value={-2} active={upperLowerBalance} label="하체 훨씬 김" onClick={setUpperLowerBalance} />
                  <ScaleButton value={-1} active={upperLowerBalance} label="하체 약간 김" onClick={setUpperLowerBalance} />
                  <ScaleButton value={0} active={upperLowerBalance} label="균형" onClick={setUpperLowerBalance} />
                  <ScaleButton value={1} active={upperLowerBalance} label="상체 약간 큼" onClick={setUpperLowerBalance} />
                  <ScaleButton value={2} active={upperLowerBalance} label="상체 비중 큼" onClick={setUpperLowerBalance} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[13px] text-black/70">기성복이 먼저 불편한 부위</span>
                  <select
                    value={fitIssue}
                    onChange={(e) => setFitIssue(e.target.value as typeof fitIssue)}
                    className="w-full rounded-lg border border-black/10 bg-black/[0.015] px-3 py-3 text-[13px] outline-none transition-colors focus:border-black"
                  >
                    <option value="unsure">잘 모르겠음</option>
                    <option value="shoulders">어깨·가슴</option>
                    <option value="waist">허리·복부</option>
                    <option value="hips">골반·허벅지</option>
                    <option value="balanced">특정 부위 없이 균형</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-[13px] text-black/70">체중 변화가 먼저 보이는 부위</span>
                  <select
                    value={weightGainArea}
                    onChange={(e) => setWeightGainArea(e.target.value as typeof weightGainArea)}
                    className="w-full rounded-lg border border-black/10 bg-black/[0.015] px-3 py-3 text-[13px] outline-none transition-colors focus:border-black"
                  >
                    <option value="unsure">잘 모르겠음</option>
                    <option value="upper">상체·팔</option>
                    <option value="middle">허리·복부</option>
                    <option value="lower">골반·허벅지</option>
                    <option value="even">전체적으로 균등</option>
                  </select>
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] text-black/70">내 응답 확신도</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 0.6, label: "낮음" },
                    { value: 0.8, label: "보통" },
                    { value: 1, label: "높음" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setAnswerConfidence(item.value as 0.6 | 0.8 | 1)}
                      className={`rounded-lg border px-3 py-3 text-[12px] transition-colors ${
                        answerConfidence === item.value
                          ? "border-black bg-black text-white"
                          : "border-black/10 text-black/60 hover:border-black/30"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCalculate}
                className="w-full rounded-lg bg-black py-3 text-[12px] uppercase tracking-widest text-white transition-colors hover:bg-black/80"
              >
                AI 70% + 설문 30% 종합 판단
              </button>
            </div>
          </section>
        </div>
      ) : (
        <div className="rounded-lg border border-black p-6 sm:p-8">
          <div className="flex flex-col gap-4 border-b border-black/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">Result Name</p>
              <h2 className="mt-2 text-4xl font-light tracking-tight">{bodyResult.ko}</h2>
              <p className="mt-2 text-[12px] uppercase tracking-widest text-black/40">{bodyResult.type} Silhouette</p>
            </div>
            <div className="rounded-lg bg-black px-4 py-3 text-white">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/55">Confidence</p>
              <p className="mt-1 text-2xl font-light">{Math.round(bodyResult.confidence * 100)}%</p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-5">
              <p className="text-[15px] font-light leading-relaxed text-black/70">{bodyResult.desc}</p>
              <div className="rounded-lg border border-black/10 bg-black/[0.015] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">종합 점수</p>
                  <p className="text-[11px] text-black/45">
                    AI {bodyResult.blend.ai}% / 설문 {bodyResult.blend.survey}%
                  </p>
                </div>
                <div className="space-y-3">
                  {Object.entries(bodyResult.scores).map(([key, value]) => (
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
                <p className="mt-4 text-[12px] text-black/50">보조 후보: {bodyResult.secondaryType}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-black/10 p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">AI 비율 점수</p>
                  <div className="mt-3 space-y-2">
                    {Object.entries(bodyResult.aiScores).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-[12px] text-black/55">
                        <span>{key}</span>
                        <span>{value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-black/10 p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">설문 점수</p>
                  <div className="mt-3 space-y-2">
                    {Object.entries(bodyResult.surveyScores).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-[12px] text-black/55">
                        <span>{key}</span>
                        <span>{value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-black/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">분석 근거</p>
                <ul className="mt-3 space-y-2">
                  {bodyResult.reasons.map((reason) => (
                    <li key={reason} className="text-[12px] leading-relaxed text-black/60">
                      - {reason}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-black/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">추천 포인트</p>
                <ul className="mt-3 space-y-2">
                  {bodyResult.recommendationPoints.map((point) => (
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
                  {bodyResult.cautionPoints.map((point) => (
                    <li key={point} className="text-[12px] leading-relaxed text-black/60">
                      - {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <ResultTips tips={bodyResult.tips} />

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
              onClick={() => setBodyResult(null)}
              className="rounded-lg border border-black/20 px-5 py-3 text-[12px] uppercase text-black/60 transition-colors hover:border-black"
            >
              응답 수정
            </button>
          </div>
        </div>
      )}

      <CrossNavButtons current="body-shape" onNavigate={onNavigate} />
    </div>
  );
}
export default BodyShapePage;
