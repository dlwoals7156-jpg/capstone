import { useMemo, useState } from "react";
import { Camera, CheckCircle2 } from "lucide-react";
import { Page } from "../src/types";
import { BackButton } from "../components/BackButton";
import { CrossNavButtons } from "../components/CrossNavButtons";
import { PageHeader } from "../components/PageHeader";

interface FaceShapePageProps {
  onNavigate: (page: Page) => void;
}

const faceShapes = ["타원형", "둥근형", "각진형", "하트형", "긴형"];

export function FaceShapePage({ onNavigate }: FaceShapePageProps) {
  const [selected, setSelected] = useState("타원형");
  const confidence = useMemo(() => 78 + faceShapes.indexOf(selected) * 3, [selected]);

  return (
    <section className="space-y-8">
      <BackButton onClick={() => onNavigate("main")} />
      <PageHeader
        num="Face Shape / AI Ready"
        title="얼굴형 분석"
        sub="현재는 설문 기반 프로토타입이며, ai_model/face_shape/analyzer.py와 연결할 수 있도록 구조를 분리했습니다."
      />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-black/10 p-5">
          <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-black/[0.025]">
            <div className="text-center">
              <Camera className="mx-auto text-black/35" size={34} />
              <p className="mt-3 text-[12px] text-black/45">카메라 촬영 모델 연결 영역</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-black/10 p-5">
          <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">Self Check</p>
          <div className="mt-4 grid gap-2">
            {faceShapes.map((shape) => (
              <button key={shape} type="button" onClick={() => setSelected(shape)}
                className={`rounded-lg border px-4 py-3 text-left text-[13px] ${selected === shape ? "border-black bg-black text-white" : "border-black/10 text-black/60"}`}>
                {shape}
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-lg bg-black/[0.025] p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <p className="text-[13px] font-medium">{selected} / 신뢰도 {confidence}%</p>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-black/55">헤어 라인, 턱선, 광대 폭을 함께 고려해 추천 화면에서 액세서리와 넥라인 선택에 반영할 수 있습니다.</p>
          </div>
        </div>
      </div>
      <CrossNavButtons current="face-shape" onNavigate={onNavigate} />
    </section>
  );
}
