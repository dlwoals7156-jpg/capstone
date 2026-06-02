import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Aperture,
  BadgeCheck,
  Camera,
  CheckCircle2,
  CircleDot,
  RotateCcw,
  ScanFace,
  Search,
  Sparkles,
  Upload,
} from "lucide-react";
import { AISkinAnalysis, CameraFrameAnalysis, Page, PCAnswer, PCResult } from "../src/types";
import { PC_QUESTIONS } from "../src/constants/data";
import { analyzeImageForPersonalColor, calcPCResult, evaluateCameraFrame } from "../src/utils/helpers";
import { BackButton } from "../components/BackButton";
import { CrossNavButtons } from "../components/CrossNavButtons";
import { PageHeader } from "../components/PageHeader";
import { ResultTips } from "../components/ResultTips";

interface PersonalColorPageProps {
  onComplete: (color: string) => void;
  onNavigate: (page: Page) => void;
}

function surveyResultName(result: PCResult) {
  return result.name;
}

function createEmptyPcAnswers() {
  return Array<PCAnswer | null>(PC_QUESTIONS.length).fill(null);
}

export function PersonalColorPage({ onComplete, onNavigate }: PersonalColorPageProps) {
  const [pcMode, setPcMode] = useState<"choose" | "test" | "camera" | "result">("choose");
  const [pcAnswers, setPcAnswers] = useState<(PCAnswer | null)[]>(createEmptyPcAnswers);
  const [currentPcQ, setCurrentPcQ] = useState<number>(0);
  const [pcResult, setPcResult] = useState<PCResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [skinAnalysis, setSkinAnalysis] = useState<AISkinAnalysis | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [frameAnalysis, setFrameAnalysis] = useState<CameraFrameAnalysis | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  const stopCamera = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => () => stopCamera(), []);

  const startPreflightLoop = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      const analysis = evaluateCameraFrame(videoRef.current);
      if (analysis) setFrameAnalysis(analysis);
    }, 450);
  };

  const startCamera = async () => {
    setPcMode("camera");
    setIsCameraActive(true);
    setCapturedImage(null);
    setSkinAnalysis(null);
    setFrameAnalysis(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      let attempts = 0;
      const bindStream = () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            startPreflightLoop();
          };
        } else if (attempts < 20) {
          attempts++;
          window.setTimeout(bindStream, 50);
        }
      };
      bindStream();
    } catch (err) {
      console.error("카메라 접근 실패:", err);
      setIsCameraActive(false);
      setPcMode("choose");
      alert("카메라 장치를 찾을 수 없거나 권한이 거부되었습니다.");
    }
  };

  const analyzeDataUrl = async (dataUrl: string) => {
    const analysis = await analyzeImageForPersonalColor(dataUrl);
    setSkinAnalysis(analysis);
    setPcResult(analysis.result);
    onComplete(analysis.resultName);
    setPcMode("result");
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    if (!frameAnalysis?.canAnalyze) {
      alert("촬영 전 체크가 모두 통과되어야 분석을 시작할 수 있습니다.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    setCapturedImage(dataUrl);
    stopCamera();
    await analyzeDataUrl(dataUrl);
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImage(dataUrl);
      await analyzeDataUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const CheckRow = ({ analysis }: { analysis: CameraFrameAnalysis | null }) => {
    const waitingChecks =
      analysis?.checks ||
      [
        "정면 응시",
        "얼굴 전체 노출",
        "얼굴 크기",
        "얼굴 기울기",
        "마스크 미착용",
        "모자 미착용",
        "강한 그림자 없음",
        "조명 충분",
        "필터 없음",
      ].map((label, index) => ({
        key: `waiting-${index}`,
        label,
        passed: false,
        value: "대기",
        detail: "카메라가 켜지면 자동으로 상태를 확인합니다.",
      }));

    return (
    <div className="grid gap-2 sm:grid-cols-2">
      {waitingChecks.map((check) => (
        <div
          key={check.key}
          className={`rounded-lg border px-3 py-3 ${
            check.passed ? "border-black/15 bg-white" : "border-black/10 bg-black/[0.015]"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-[12px] font-medium text-black/70">
              {check.passed ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {check.label}
            </span>
            <span className="text-[11px] text-black/40">{check.value}</span>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-black/42">{check.detail}</p>
        </div>
      ))}
    </div>
    );
  };

  return (
    <div className="mx-auto max-w-4xl">
      <BackButton onClick={() => onNavigate("main")} />
      <PageHeader
        num="Diagnosis 01"
        title="퍼스널 컬러 엔진"
        sub="이마, 양 볼, 턱의 피부 영역만 추출해 RGB·HSV·LAB 기반 12가지 퍼스널컬러 타입을 판정합니다."
      />

      {pcMode === "choose" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setPcMode("test");
                setPcAnswers(createEmptyPcAnswers());
                setCurrentPcQ(0);
                setSkinAnalysis(null);
              }}
              className="rounded-lg border border-black/10 p-7 text-left transition-colors hover:border-black/35"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-black text-white">
                <Search size={17} />
              </div>
              <h3 className="text-xl font-light">자가 진단 시뮬레이션</h3>
              <p className="mt-3 text-[13px] font-light leading-relaxed text-black/50">
                언더톤, 명도, 채도, 대비감, 메이크업 반응을 점수화해 12가지 타입 후보를 계산합니다.
              </p>
            </button>
            <button
              type="button"
              onClick={startCamera}
              className="rounded-lg border border-black/10 p-7 text-left transition-colors hover:border-black/35"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-black text-white">
                <Camera size={17} />
              </div>
              <h3 className="text-xl font-light">AI 비전 카메라 진단</h3>
              <p className="mt-3 text-[13px] font-light leading-relaxed text-black/50">
                얼굴 가이드, 촬영 전 체크, 피부 영역 샘플링을 거쳐 12타입 분석을 시작합니다.
              </p>
            </button>
          </div>

          <div className="flex flex-col gap-4 rounded-lg border border-black/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/35">Stable Image Option</p>
              <p className="mt-1 text-[12px] text-black/45">정면 얼굴 사진을 업로드하면 동일한 색공간 분석 로직으로 판정합니다.</p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/20 px-4 py-2.5 text-[12px] text-black/60 transition-colors hover:border-black"
            >
              <Upload size={14} /> 파일 선택
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
          </div>
        </div>
      )}

      {pcMode === "test" && (
        <div className="rounded-lg border border-black/10 p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between text-[11px] uppercase tracking-wider text-black/40">
            <span>
              Question {currentPcQ + 1} of {PC_QUESTIONS.length}
            </span>
            <div className="relative h-1 w-24 rounded-full bg-black/10">
              <div
                className="h-full rounded-full bg-black transition-all duration-300"
                style={{ width: `${((currentPcQ + 1) / PC_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>
          <h3 className="text-2xl font-light">{PC_QUESTIONS[currentPcQ].q}</h3>
          <div className="mt-7 space-y-2.5">
            {PC_QUESTIONS[currentPcQ].options.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => {
                  const next = [...pcAnswers];
                  next[currentPcQ] = opt.label;
                  setPcAnswers(next);
                  if (currentPcQ < PC_QUESTIONS.length - 1) {
                    setCurrentPcQ(currentPcQ + 1);
                  } else {
                    const res = calcPCResult(next);
                    setPcResult(res);
                    onComplete(surveyResultName(res));
                    setPcMode("result");
                  }
                }}
                className="w-full rounded-lg border border-black/10 p-4 text-left text-[14px] font-light transition-colors hover:border-black/30 hover:bg-black/[0.015]"
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {pcMode === "camera" && (
        <div className="grid gap-5 lg:grid-cols-[1.38fr_1fr]">
          <section className="overflow-hidden rounded-lg border border-black bg-black text-white">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">AI Beauty Camera</p>
                <p className="mt-1 text-[13px] leading-relaxed text-white/70">프레임 안에 얼굴을 맞추면 촬영 가능 상태를 자동으로 확인합니다.</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/10">
                <ScanFace size={19} className="text-white/80" />
              </div>
            </div>

            <div className="relative mx-3 mt-3 flex aspect-[4/5] items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] sm:mx-5 sm:mt-5 sm:aspect-[16/10]">
              {isCameraActive && <video ref={videoRef} autoPlay playsInline muted className="h-full w-full scale-x-[-1] object-cover" />}

              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-5 top-5 flex items-center justify-between">
                  <span className="h-8 w-8 rounded-tl-lg border-l border-t border-white/55" />
                  <span className="h-8 w-8 rounded-tr-lg border-r border-t border-white/55" />
                </div>
                <div className="absolute inset-x-5 bottom-5 flex items-center justify-between">
                  <span className="h-8 w-8 rounded-bl-lg border-b border-l border-white/55" />
                  <span className="h-8 w-8 rounded-br-lg border-b border-r border-white/55" />
                </div>
                <div className="absolute left-1/2 top-1/2 h-[68%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-[48%] border border-white/85 shadow-[0_0_0_999px_rgba(0,0,0,0.18)] sm:w-[36%]" />
                <div className="absolute left-1/2 top-[16%] h-[68%] w-px -translate-x-1/2 bg-white/28" />
                <div className="absolute left-[28%] top-1/2 h-px w-[44%] -translate-y-1/2 bg-white/28 sm:left-[32%] sm:w-[36%]" />
                <div className="absolute left-1/2 top-[8%] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white">
                  <Sparkles size={11} /> 12 Tone Scan
                </div>
                <div
                  className="absolute bottom-8 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-white/25"
                  style={{
                    transform: `translateX(-50%) rotate(${frameAnalysis?.tiltDegrees ?? 0}deg)`,
                  }}
                >
                  <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-lg border border-white/10 bg-black/45 px-3 py-2 text-[11px] text-white/70 backdrop-blur-sm">
                <span className="flex items-center gap-1.5">
                  <BadgeCheck size={13} />
                  {frameAnalysis?.canAnalyze ? "Ready to capture" : "Align your face"}
                </span>
                <span>{frameAnalysis ? `${Math.round(frameAnalysis.faceSizeRatio * 100)}% frame` : "stand by"}</span>
              </div>
            </div>

            <div className="mx-3 mt-4 grid grid-cols-3 gap-2 text-center sm:mx-5">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Center</p>
                <p className="mt-1 text-[15px] font-light text-white">{frameAnalysis ? `${Math.round((1 - frameAnalysis.centerOffset) * 100)}%` : "-"}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Size</p>
                <p className="mt-1 text-[15px] font-light text-white">{frameAnalysis ? `${Math.round(frameAnalysis.faceSizeRatio * 100)}%` : "-"}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Tilt</p>
                <p className="mt-1 text-[15px] font-light text-white">{frameAnalysis ? `${frameAnalysis.tiltDegrees}°` : "-"}</p>
              </div>
            </div>

            <div className="mx-3 mb-4 mt-4 flex items-center gap-3 sm:mx-5 sm:mb-5">
              <button
                type="button"
                onClick={capturePhoto}
                disabled={!frameAnalysis?.canAnalyze}
                className="group flex flex-1 items-center justify-center gap-3 rounded-lg bg-white py-3 text-[12px] uppercase tracking-widest text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/45"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-black text-white group-disabled:border-white/20 group-disabled:bg-white/10">
                  <Aperture size={15} />
                </span>
                촬영 후 12타입 분석
              </button>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setPcMode("choose");
                }}
                className="rounded-lg border border-white/15 px-5 py-3 text-[12px] uppercase text-white/65 transition-colors hover:border-white/40 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </section>

          <aside className="space-y-4 rounded-lg border border-black/10 p-4 sm:p-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">Pre-shot Checklist</p>
              <p className="mt-1 text-[13px] leading-relaxed text-black/50">모든 조건이 통과되어야 분석 버튼이 활성화됩니다.</p>
            </div>
            <CheckRow analysis={frameAnalysis} />
            <div className="rounded-lg border border-black/10 bg-black/[0.015] p-4">
              <p className="flex items-center gap-2 text-[12px] font-medium text-black/65">
                <CircleDot size={14} />
                촬영 팁
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-black/45">
                창가 자연광에서 얼굴을 프레임의 60% 정도로 맞추면 이마·양 볼·턱 샘플이 가장 안정적으로 잡힙니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-black/20 px-4 py-3 text-[12px] text-black/60 transition-colors hover:border-black"
            >
              <Upload size={14} /> 사진 업로드로 분석
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
          </aside>
        </div>
      )}

      {pcMode === "result" && pcResult && (
        <div className="rounded-lg border border-black p-6 sm:p-8">
          <div className="flex flex-col gap-4 border-b border-black/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">Result Name</p>
              <h2 className="mt-2 text-4xl font-light tracking-tight">{skinAnalysis?.resultName || surveyResultName(pcResult)}</h2>
              <p className="mt-2 text-[12px] uppercase tracking-widest text-black/40">
                {pcResult.en} / {pcResult.sub}
              </p>
            </div>
            <div className="rounded-lg bg-black px-4 py-3 text-white">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/55">Confidence</p>
              <p className="mt-1 text-2xl font-light">{Math.round((skinAnalysis?.confidence || 0.74) * 100)}%</p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              {capturedImage && (
                <img src={capturedImage} alt="분석 이미지" className="aspect-[4/3] w-full rounded-lg border border-black/10 object-cover" />
              )}
              <p className="text-[15px] font-light leading-relaxed text-black/70">{pcResult.desc}</p>
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-black/30">Best Matches Palette</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {pcResult.colors.map((color) => (
                    <div key={color} className="rounded-lg border border-black/5 bg-black/[0.015] px-3 py-3 text-center text-[12px] text-black/65">
                      {color}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {skinAnalysis && (
                <div className="rounded-lg border border-black/10 bg-black/[0.015] p-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-black/35">AI 분석 근거</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-black/60">
                    <span>평균 피부색</span>
                    <span className="h-6 w-12 rounded-md border border-black/10" style={{ backgroundColor: skinAnalysis.hex }} />
                    <span className="font-mono text-[11px]">{skinAnalysis.hex}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <div className="rounded-lg border border-black/5 bg-white px-3 py-2">
                      <p className="text-[10px] text-black/35">RGB</p>
                      <p className="text-[12px] text-black/65">
                        {skinAnalysis.rgb.r}/{skinAnalysis.rgb.g}/{skinAnalysis.rgb.b}
                      </p>
                    </div>
                    <div className="rounded-lg border border-black/5 bg-white px-3 py-2">
                      <p className="text-[10px] text-black/35">HSV</p>
                      <p className="text-[12px] text-black/65">
                        {skinAnalysis.hsv.h}/{skinAnalysis.hsv.s}/{skinAnalysis.hsv.v}
                      </p>
                    </div>
                    <div className="rounded-lg border border-black/5 bg-white px-3 py-2">
                      <p className="text-[10px] text-black/35">LAB</p>
                      <p className="text-[12px] text-black/65">
                        {skinAnalysis.lab.l}/{skinAnalysis.lab.a}/{skinAnalysis.lab.b}
                      </p>
                    </div>
                    <div className="rounded-lg border border-black/5 bg-white px-3 py-2">
                      <p className="text-[10px] text-black/35">명도</p>
                      <p className="text-[12px] text-black/65">{skinAnalysis.metrics.brightness}</p>
                    </div>
                    <div className="rounded-lg border border-black/5 bg-white px-3 py-2">
                      <p className="text-[10px] text-black/35">채도</p>
                      <p className="text-[12px] text-black/65">{skinAnalysis.metrics.saturation}</p>
                    </div>
                    <div className="rounded-lg border border-black/5 bg-white px-3 py-2">
                      <p className="text-[10px] text-black/35">색온도</p>
                      <p className="text-[12px] text-black/65">{skinAnalysis.metrics.temperature}</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-lg border border-black/5 bg-white p-3 text-[12px] leading-relaxed text-black/60">
                    <p>보조 결과: {skinAnalysis.secondaryResult.name} {Math.round(skinAnalysis.secondaryResult.confidence * 100)}%</p>
                    <p className="mt-1">촬영 품질: {skinAnalysis.qualityLabel}</p>
                  </div>
                </div>
              )}

              {skinAnalysis && (
                <div className="rounded-lg border border-black/10 p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">분석 영역</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {skinAnalysis.zones.map((zone) => (
                      <div key={zone.id} className="rounded-lg border border-black/5 bg-black/[0.015] px-3 py-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[12px] text-black/65">{zone.label}</span>
                          <span className="h-5 w-8 rounded border border-black/10" style={{ backgroundColor: `rgb(${zone.rgb.r}, ${zone.rgb.g}, ${zone.rgb.b})` }} />
                        </div>
                        <p className="mt-1 text-[10px] text-black/40">피부 픽셀 {Math.round(zone.pixelRatio * 100)}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-black/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">분석 근거</p>
              <ul className="mt-3 space-y-2">
                {(skinAnalysis?.evidence || [`자가 문항 결과 ${surveyResultName(pcResult)} 후보가 가장 높았습니다.`]).map((item) => (
                  <li key={item} className="text-[12px] leading-relaxed text-black/60">- {item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-black/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">추천 포인트</p>
              <ul className="mt-3 space-y-2">
                {(skinAnalysis?.recommendationPoints || pcResult.tips.slice(0, 3)).map((item) => (
                  <li key={item} className="text-[12px] leading-relaxed text-black/60">- {item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-black/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">주의 포인트</p>
              <ul className="mt-3 space-y-2">
                {(skinAnalysis?.cautionPoints || ["조명, 메이크업, 필터에 따라 실제 색감과 결과가 달라질 수 있습니다."]).map((item) => (
                  <li key={item} className="text-[12px] leading-relaxed text-black/60">- {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <ResultTips tips={pcResult.tips} />

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
                setPcMode("choose");
                setSkinAnalysis(null);
                setCapturedImage(null);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/20 px-5 py-3 text-[12px] uppercase text-black/60 transition-colors hover:border-black"
            >
              <RotateCcw size={14} /> 다시 진단
            </button>
          </div>
        </div>
      )}

      <CrossNavButtons current="personal-color" onNavigate={onNavigate} />
    </div>
  );
}
export default PersonalColorPage;
