import { useState, useRef, useCallback, useEffect } from "react";
import { ArrowLeft, ArrowUpRight, ChevronDown, Search, ChevronRight, Upload, Camera } from "lucide-react";
import axios from "axios"; 

type Page = "main" | "personal-color" | "skeleton" | "body-shape" | "about";

// ─── Data ─────────────────────────────────────────────────────────────────────
const ITEMS_DB: Record<string, string[]> = {
  티셔츠: ["크루넥 코튼 티셔츠", "루즈핏 오버사이즈 티", "크롭 리브 티셔츠", "오프숄더 슬리브 티", "박시 그래픽 티", "V넥 슬림핏 티"],
  원피스: ["A라인 미디 원피스", "피트 앤 플레어 원피스", "맥시 플로우 원피스", "랩 플리츠 원피스", "시스 미니 원피스", "쉬폰 티어드 원피스"],
  자켓: ["테일러드 블레이저", "오버핏 크롭 자켓", "더블 브레스트 자켓", "린넨 노카라 자켓", "볼레로 숏 자켓", "트렌치 롱 자켓"],
  슬랙스: ["와이드 스트레이트 슬랙스", "하이웨이스트 플레어 슬랙스", "테이퍼드 슬림 슬랙스", "팔라초 루즈 슬랙스", "크롭 와이드 슬랙스", "부츠컷 슬랙스"],
  니트: ["크루넥 오버핏 니트", "터틀넥 슬림 니트", "케이블 카디건", "크롭 브이넥 니트", "오프숄더 드레이프 니트", "모크넥 박시 니트"],
  코트: ["클래식 울 코트", "A라인 체스터필드 코트", "오버핏 롱 코트", "크롭 쇼트 코트", "더블 캐시미어 코트", "벨티드 트렌치 코트"],
};
const HINTS = ["티셔츠", "원피스", "자켓", "슬랙스", "니트", "코트"];

// ─── Personal Color ────────────────────────────────────────────────────────────
type PCAnswer = "A" | "B" | "C";
interface PCQuestion { q: string; options: { label: PCAnswer; text: string; tone?: "warm" | "cool" | "light" | "deep" }[] }
const PC_QUESTIONS: PCQuestion[] = [
  {
    q: "피부 언더톤은 어느 쪽에 가깝나요?",
    options: [
      { label: "A", text: "노란빛·황토빛의 따뜻한 느낌", tone: "warm" },
      { label: "B", text: "핑크빛·파란빛의 차가운 느낌", tone: "cool" },
    ],
  },
  {
    q: "손목 안쪽 혈관 색은?",
    options: [
      { label: "A", text: "초록빛이 돈다", tone: "warm" },
      { label: "B", text: "파란빛·보라빛이 돈다", tone: "cool" },
      { label: "C", text: "잘 구분이 안 된다" },
    ],
  },
  {
    q: "햇볕에 노출됐을 때 피부 반응은?",
    options: [
      { label: "A", text: "잘 타고 골든·브론즈빛으로 변한다", tone: "warm" },
      { label: "B", text: "잘 타지 않거나 금방 빨개진다", tone: "cool" },
    ],
  },
  {
    q: "가장 잘 어울리는 금속 장신구는?",
    options: [
      { label: "A", text: "골드·로즈골드", tone: "warm" },
      { label: "B", text: "실버·화이트골드", tone: "cool" },
    ],
  },
  {
    q: "피부의 전체적인 명도(밝기)는?",
    options: [
      { label: "A", text: "밝고 맑은 편", tone: "light" },
      { label: "B", text: "어둡고 깊은 편", tone: "deep" },
      { label: "C", text: "중간 정도" },
    ],
  },
];

type PCResult = { season: string; sub: string; en: string; desc: string; colors: string[]; tips: string[] };
const PC_RESULTS: Record<string, PCResult> = {
  "봄": { season: "봄", sub: "Spring", en: "Warm & Bright", desc: "생기 넘치고 따뜻한 봄빛 피부. 맑고 밝은 컬러가 피부를 생동감 있게 만들어줍니다.", colors: ["코럴", "피치", "아이보리", "카멜", "옐로우 그린"], tips: ["너무 탁하거나 어두운 색은 피할 것", "골드 액세서리와 잘 어울림", "파스텔보다 맑고 선명한 봄 컬러 선택"] },
  "여름": { season: "여름", sub: "Summer", en: "Cool & Muted", desc: "부드럽고 시원한 여름빛 피부. 그레이시한 쿨톤 컬러가 청순하고 세련된 인상을 줍니다.", colors: ["라벤더", "파우더 블루", "로즈", "라이트 핑크", "민트"], tips: ["강렬한 원색보다 뮤트하고 부드러운 쿨톤 선택", "실버 액세서리가 잘 어울림", "대비가 강한 코디는 자제"] },
  "가을": { season: "가을", sub: "Autumn", en: "Warm & Deep", desc: "깊고 풍부한 가을빛 피부. 어스 톤 계열 컬러가 성숙하고 우아한 분위기를 연출합니다.", colors: ["카멜", "테라코타", "올리브", "버건디", "모스 그린"], tips: ["비비드하고 차가운 색은 피할 것", "골드 계열 액세서리 추천", "풍부하고 깊은 어스톤 위주로 코디"] },
  "겨울": { season: "겨울", sub: "Winter", en: "Cool & Clear", desc: "선명하고 차가운 겨울빛 피부. 대비가 강한 순색 또는 딥컬러가 세련미를 극대화합니다.", colors: ["퓨어 화이트", "블랙", "로얄 블루", "버건디", "에메랄드"], tips: ["탁하거나 흐린 색은 피할 것", "실버·플래티넘 액세서리 추천", "모노톤·강한 컬러 대비 코디가 잘 어울림"] },
};

const AI_MOCK_TYPES = ["봄", "여름", "가을", "겨울"] as const;

// ─── Image Analysis ───────────────────────────────────────────────────────────
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

interface AISkinAnalysis {
  result: PCResult;
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  isWarm: boolean;
  isLight: boolean;
  toneLabel: string;
  brightnessLabel: string;
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.max(0, Math.min(255, c)).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

const DEFAULT_SKIN_ANALYSIS: AISkinAnalysis = {
  result: PC_RESULTS["봄"],
  hex: "#F5C396",
  rgb: { r: 245, g: 195, b: 150 },
  hsl: { h: 28, s: 78, l: 77 },
  isWarm: true,
  isLight: true,
  toneLabel: "웜톤 (따뜻한 옐로우 베이스)",
  brightnessLabel: "밝고 생기 있는 피부톤",
};

function analyzeImageForPersonalColor(imageUrl: string): Promise<AISkinAnalysis> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(DEFAULT_SKIN_ANALYSIS); return; }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const centerX = Math.floor(canvas.width * 0.5);
      const centerY = Math.floor(canvas.height * 0.45);
      const sampleSize = Math.min(canvas.width, canvas.height) * 0.1;
      
      let rSum = 0, gSum = 0, bSum = 0, count = 0;

      for (let dy = -sampleSize / 2; dy < sampleSize / 2; dy += 2) {
        for (let dx = -sampleSize / 2; dx < sampleSize / 2; dx += 2) {
          const x = Math.floor(centerX + dx);
          const y = Math.floor(centerY + dy);
          if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
            const idx = (y * canvas.width + x) * 4;
            rSum += data[idx];
            gSum += data[idx + 1];
            bSum += data[idx + 2];
            count++;
          }
        }
      }

      const avgR = count > 0 ? Math.round(rSum / count) : 245;
      const avgG = count > 0 ? Math.round(gSum / count) : 195;
      const avgB = count > 0 ? Math.round(bSum / count) : 150;

      const hsl = rgbToHsl(avgR, avgG, avgB);
      const isWarm = hsl.h >= 22 && hsl.h <= 45;
      const isLight = hsl.l > 60;

      let result: PCResult;
      let toneLabel = "";
      let brightnessLabel = "";

      if (isWarm) {
        toneLabel = "웜톤 (따뜻한 옐로우 베이스)";
        if (isLight) { result = PC_RESULTS["봄"]; brightnessLabel = "맑고 화사한 라이트 톤"; }
        else { result = PC_RESULTS["가을"]; brightnessLabel = "차분하고 깊이 있는 딥 톤"; }
      } else {
        toneLabel = "쿨톤 (시원한 핑크 베이스)";
        if (isLight) { result = PC_RESULTS["여름"]; brightnessLabel = "맑고 깨끗한 뮤트 라이트 톤"; }
        else { result = PC_RESULTS["겨울"]; brightnessLabel = "선명하고 존재감 있는 클리어 다크 톤"; }
      }

      resolve({
        result,
        hex: rgbToHex(avgR, avgG, avgB),
        rgb: { r: avgR, g: avgG, b: avgB },
        hsl, isWarm, isLight, toneLabel, brightnessLabel
      });
    };
    img.onerror = () => { resolve(DEFAULT_SKIN_ANALYSIS); };
    img.src = imageUrl;
  });
}

function calcPCResult(answers: (PCAnswer | null)[]): PCResult {
  let warm = 0, cool = 0, light = 0, deep = 0;
  answers.forEach((ans, qi) => {
    if (ans === null) return;
    const opt = PC_QUESTIONS[qi].options.find((o) => o.label === ans);
    if (!opt?.tone) return;
    if (opt.tone === "warm") warm++;
    if (opt.tone === "cool") cool++;
    if (opt.tone === "light") light++;
    if (opt.tone === "deep") deep++;
  });
  const isWarm = warm >= cool;
  const isLight = light >= deep;
  if (isWarm && isLight) return PC_RESULTS["봄"];
  if (!isWarm && isLight) return PC_RESULTS["여름"];
  if (isWarm && !isLight) return PC_RESULTS["가을"];
  return PC_RESULTS["겨울"];
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
type SkeletonAnswer = "A" | "B" | "C";
const SKELETON_QUESTIONS = [
  { q: "어깨와 골반을 비교하면?", options: [{ label: "A" as SkeletonAnswer, text: "어깨가 골반보다 넓다" }, { label: "B" as SkeletonAnswer, text: "어깨와 골반이 비슷하거나 어깨가 약간 좁다" }, { label: "C" as SkeletonAnswer, text: "어깨가 골반보다 확연히 좁다" }] },
  { q: "쇄골의 모양은?", options: [{ label: "A" as SkeletonAnswer, text: "쇄골이 뚜렷하고 넓게 발달해 있다" }, { label: "B" as SkeletonAnswer, text: "쇄골이 굵고 존재감이 있다" }, { label: "C" as SkeletonAnswer, text: "쇄골이 가늘거나 잘 드러나지 않는다" }] },
  { q: "전체적인 체형 실루엣은?", options: [{ label: "A" as SkeletonAnswer, text: "전체적으로 직선적이고 탄탄한 느낌" }, { label: "B" as SkeletonAnswer, text: "골격이 크고 입체적인 느낌" }, { label: "C" as SkeletonAnswer, text: "곡선적이고 부드러운 느낌" }] },
  { q: "살이 찌면 주로 어디에 찌나요?", options: [{ label: "A" as SkeletonAnswer, text: "전체적으로 균등하게, 주로 허리·복부" }, { label: "B" as SkeletonAnswer, text: "하체(허벅지·엉덩이)에 먼저 찐다" }, { label: "C" as SkeletonAnswer, text: "상체·팔 쪽에 먼저 찐다" }] },
  { q: "무릎 모양은?", options: [{ label: "A" as SkeletonAnswer, text: "무릎이 작고 볼륨이 없다" }, { label: "B" as SkeletonAnswer, text: "무릎이 크고 뼈가 두드러진다" }, { label: "C" as SkeletonAnswer, text: "무릎이 둥글고 살이 있다" }] },
];

function calcSkeletonResult(answers: SkeletonAnswer[]) {
  const count = { A: 0, B: 0, C: 0 };
  answers.forEach((a) => count[a]++);
  if (count.A >= count.B && count.A >= count.C) return { type: "스트레이트", en: "Straight", desc: "탄탄하고 직선적인 실루엣. 상체에 볼륨감이 있고 허리가 짧게 느껴지는 편입니다.", tips: ["V넥·U넥으로 목선 강조", "허리 라인을 살리는 타이트 핏", "미니스커트·스트레이트 팬츠", "소재는 부드럽고 드레이프감 있는 것"] };
  if (count.B >= count.A && count.B >= count.C) return { type: "내추럴", en: "Natural", desc: "뼈대가 크고 입체적인 실루엣. 어깨와 골반 뼈가 뚜렷하고 전체적으로 건강한 인상입니다.", tips: ["오버사이즈·루즈핏으로 여유감", "텍스처감 있는 소재 (린넨·코듀로이)", "와이드 팬츠·A라인 스커트", "레이어링으로 볼륨 분산"] };
  return { type: "웨이브", en: "Wave", desc: "부드럽고 곡선적인 실루엣. 상체가 작고 하체에 볼륨이 있으며 전체적으로 여성스러운 인상입니다.", tips: ["허리를 강조하는 핏", "크롭 탑·하이웨이스트 조합", "플리츠·플레어 스커트로 하체 커버", "얇고 부드러운 소재 선택"] };
}

// ─── Body Shape ───────────────────────────────────────────────────────────────
function calcBodyType(s: number, b: number, w: number, h: number) {
  const whr = w / h; const bhr = b / h; const sbDiff = s - h;
  if (whr > 0.8 && bhr > 0.9) return { type: "Apple", ko: "사과형", desc: "허리와 복부에 볼륨이 집중되어 있고, 다리가 날씬한 편입니다.", tips: ["V넥·딥넥으로 시선을 위로", "A라인 스커트로 하체 강조", "허리를 가리는 루즈핏 탑", "다크 컬러 상의 + 밝은 하의"] };
  if (Math.abs(b - h) <= 5 && (b - w) >= 15 && (h - w) >= 15) return { type: "Hourglass", ko: "모래시계형", desc: "어깨와 골반이 균형 잡히고 허리가 잘록한 이상적인 비율입니다.", tips: ["바디콘·랩 드레스로 라인 강조", "하이웨이스트 팬츠 + 터킹", "벨티드 아우터 활용", "핏 앤 플레어 실루엣"] };
  if (h - b >= 8) return { type: "Pear", ko: "서양배형", desc: "골반이 어깨보다 넓고 하체에 볼륨이 집중된 여성스러운 실루엣입니다.", tips: ["보트넥·오프숄더로 어깨 강조", "A라인·미디스커트로 하체 커버", "밝은 색상·패턴은 상체에", "와이드 벨트로 허리 강조"] };
  if (sbDiff >= 8 || b - h >= 8) return { type: "Inverted Triangle", ko: "역삼각형", desc: "어깨와 상체가 넓고 하체가 슬림한 스포티한 실루엣입니다.", tips: ["와이드·플레어 팬츠로 하체 볼륨", "V넥으로 어깨선 완화", "하이웨이스트 스커트로 균형", "하체에 밝은 컬러 배치"] };
  if ((b - w) < 10 && (h - w) < 10) return { type: "Rectangle", ko: "직사각형", desc: "어깨·허리·골반이 비슷한 비율로 슬림하고 균형 잡힌 실루엣입니다.", tips: ["러플·퍼프소매로 곡선 연출", "크롭탑 + 하이웨이스트로 허리 강조", "레이어링으로 볼륨감 추가", "패턴·텍스처로 입체감"] };
  return { type: "Oval", ko: "타원형", desc: "전체적으로 부드럽고 둥근 실루엣. 허리 라인이 완만한 편입니다.", tips: ["세로 라인 강조 (줄무늬·버튼 라인)", "모노톤 코디로 시선 통일", "다크 컬러 원피스·팬츠슈트", "V넥으로 얼굴·목 선명하게"] };
}

// ─── Shared UI ─────────────────────────────────────────────────────────────────
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="mt-8 flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase text-black/35 hover:text-black transition-colors duration-200">
      <ArrowLeft size={12} /> Back
    </button>
  );
}

function CrossNavButtons({ current, onNavigate }: { current: Page; onNavigate: (p: Page) => void }) {
  const all: { page: Page; label: string }[] = [
    { page: "personal-color", label: "퍼스널 컬러 진단" },
    { page: "skeleton", label: "골격 체형 진단" },
    { page: "body-shape", label: "몸 체형 진단" },
  ];
  return (
    <div className="mt-10 pt-8 border-t border-black/10">
      <p className="text-[9px] tracking-[0.25em] uppercase text-black/25 mb-4">다른 진단 바로가기</p>
      <div className="flex gap-3 flex-wrap">
        {all.filter((x) => x.page !== current).map((x) => (
          <button key={x.page} onClick={() => onNavigate(x.page)}
            className="flex items-center gap-2 text-[12px] text-black border border-black/20 px-4 py-2.5 hover:bg-black hover:text-white transition-all duration-200">
            {x.label}
            <ArrowUpRight size={12} />
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultTips({ tips }: { tips: string[] }) {
  return (
    <div className="mt-8">
      <p className="text-[9px] tracking-[0.25em] uppercase text-black/25 mb-4 flex items-center gap-3">
        스타일 추천 <span className="flex-1 h-px bg-black/8" />
      </p>
      <ul className="space-y-2">
        {tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-3 text-[13px] text-black/60 font-light">
            <ChevronRight size={12} className="mt-0.5 flex-shrink-0 text-black/25" />
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PageHeader({ num, title, sub }: { num: string; title: string; sub: string }) {
  return (
    <div className="pt-10 pb-8 border-b border-black/10 mb-10">
      <p className="text-[10px] tracking-[0.3em] uppercase text-black/30 mb-4 flex items-center gap-3">
        <span className="w-6 h-px bg-black/20" />{num}
      </p>
      <h1 className="text-4xl font-light leading-tight mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h1>
      <p className="text-[13px] text-black/40 leading-relaxed">{sub}</p>
    </div>
  );
}

// ─── Page: About ──────────────────────────────────────────────────────────────
function PageAbout({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-6 pb-20">
      <header className="flex items-center justify-between py-8 border-b border-black/10 mb-6">
        <div className="flex items-baseline gap-3 cursor-pointer select-none group" onClick={onBack}>
          <span className="text-base font-light tracking-widest uppercase group-hover:text-black/60 transition-colors duration-200" style={{ fontFamily: "'Playfair Display', serif" }}>Deeplook</span>
          <span className="text-[9px] tracking-[0.2em] uppercase text-black/40 border border-black/15 px-2 py-0.5 group-hover:border-black/30 transition-colors duration-200">AI Fashion Tech Lab</span>
        </div>
      </header>
      <BackButton onClick={onBack} />
      <PageHeader num="About Deeplook" title="소개" sub="AI Fashion Tech Lab에 대해" />
      <div className="space-y-10">
        <div>
          <p className="text-[9px] tracking-[0.25em] uppercase text-black/25 mb-4 flex items-center gap-3">What we do</p>
          <p className="text-[14px] text-black/70 font-light leading-relaxed">
            Deeplook은 사용자의 미세한 신체적 특징(퍼스널 컬러, 골격, 체형 비율)을 다각도로 분석하여 최상의 패션 스타일링을 도출하는 정교한 알고리즘 테크 연구소입니다.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Application Component ────────────────────────────────────────────────
export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("main");

  // ─── 상태값 통합 관리 ───────────────────────────────────────────────────────
  const [selectedColor, setSelectedColor] = useState<string>("봄 웜톤");
  const [selectedSkeleton, setSelectedSkeleton] = useState<string>("스트레이트");
  const [selectedBody, setSelectedBody] = useState<string>("모래시계형");
  
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("티셔츠");

  // ─── 백엔드 실시간 API 연동 상태 ───────────────────────────────────────────
  const [backendItems, setBackendItems] = useState<any[]>([]); // 실시간 상품 리스트
  const [aiGuidance, setAiGuidance] = useState<string>("");    // 그록 AI 스타일 코멘트
  const [isLoading, setIsLoading] = useState<boolean>(false);   // 로딩스피너 작동 상태
  const [isSearched, setIsSearched] = useState<boolean>(false); // 검색 수행 여부

  // ─── 1. 백엔드 통신 함수 (Axios) ───
  const handleBackendSearch = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsLoading(true);
    setIsSearched(true);
    setAiGuidance("");

    // 백엔드가 인식하는 4가지 시즌 문자열로 치환 ("봄", "여름", "가을", "겨울")
    let rawSeason = "봄";
    if (selectedColor.includes("여름")) rawSeason = "여름";
    if (selectedColor.includes("가을")) rawSeason = "가을";
    if (selectedColor.includes("겨울")) rawSeason = "겨울";

    try {
      const response = await axios.post("http://127.0.0.1:8000/recommend", {
        personal_color: rawSeason,
        user_prompt: `${queryText} (체형: ${selectedSkeleton}, 체각: ${selectedBody})`
      });

      if (response.data) {
        // 백엔드의 real_products 매핑
        setBackendItems(response.data.real_products || []);
        
        // 그록 AI 추천 코멘트 문구 가공
        const aiInfo = response.data.ai_analysis;
        if (aiInfo && aiInfo.reason) {
          setAiGuidance(aiInfo.reason);
        } else {
          setAiGuidance(`${selectedColor}과 체형에 아주 잘 매칭되는 패션 아이템 조합입니다.`);
        }
      }
    } catch (error) {
      console.error("백엔드 서버 통신 에러:", error);
      alert("백엔드 uvicorn 서버가 켜져 있는지 확인해 주세요!");
    } {
      // 💡 핵심 버그 수정: 성공하든 실패하든 무조건 로딩 스피너를 해제하여 다음 화면을 그리게 만듭니다.
      setIsLoading(false);
    }
  };

  // ─── Personal Color States ──────────────────────────────────────────────────
  const [pcMode, setPcMode] = useState<"choose" | "test" | "camera" | "result">("choose");
  const [pcAnswers, setPcAnswers] = useState<(PCAnswer | null)[]>([null, null, null, null, null]);
  const [currentPcQ, setCurrentPcQ] = useState<number>(0);
  const [pcResult, setPcResult] = useState<PCResult | null>(null);

  // Camera & Image Upload
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [skinAnalysis, setSkinAnalysis] = useState<AISkinAnalysis | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ─── Skeleton States ────────────────────────────────────────────────────────
  const [skAnswers, setSkAnswers] = useState<SkeletonAnswer[]>([]);
  const [skResult, setSkResult] = useState<any>(null);

  // ─── Body Shape States ──────────────────────────────────────────────────────
  const [shoulder, setShoulder] = useState<string>("95");
  const [bust, setBust] = useState<string>("90");
  const [waist, setWaist] = useState<string>("70");
  const [hip, setHip] = useState<string>("95");
  const [bodyResult, setBodyResult] = useState<any>(null);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const startCamera = async () => {
    setIsCameraActive(true);
    setCapturedImage(null);
    setSkinAnalysis(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("카메라 접근 실패:", err);
      setIsCameraActive(false);
      alert("카메라 장치를 찾을 수 없거나 권한이 거부되었습니다.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/png");
      setCapturedImage(dataUrl);
      stopCamera();
      const analysis = await analyzeImageForPersonalColor(dataUrl);
      setSkinAnalysis(analysis);
      setPcResult(analysis.result);
      setSelectedColor(`${analysis.result.season} ${analysis.result.isWarm ? "웜톤" : "쿨톤"}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImage(dataUrl);
      const analysis = await analyzeImageForPersonalColor(dataUrl);
      setSkinAnalysis(analysis);
      setPcResult(analysis.result);
      setSelectedColor(`${analysis.result.season} ${analysis.result.isWarm ? "웜톤" : "쿨톤"}`);
    };
    reader.readAsDataURL(file);
  };

  // ─── Render Page Router ──────────────────────────────────────────────────────
  if (currentPage === "about") return <PageAbout onBack={() => setCurrentPage("main")} />;

  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased selection:bg-black/5 selection:text-black">
      {/* Top Border Line */}
      <div className="h-1 bg-black w-full" />

      {/* Global Navigation Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 border-b border-black/5 flex items-center justify-between">
        <div className="flex items-baseline gap-3 cursor-pointer select-none group" onClick={() => { setCurrentPage("main"); setIsSearched(false); }}>
          <span className="text-xl font-light tracking-[0.2em] uppercase group-hover:text-black/60 transition-colors duration-200" style={{ fontFamily: "'Playfair Display', serif" }}>Deeplook</span>
          <span className="text-[9px] tracking-[0.15em] uppercase text-black/35 border border-black/10 px-2 py-0.5">AI Fashion Tech Lab</span>
        </div>
        <nav className="flex items-center gap-8 text-[11px] tracking-[0.15em] uppercase text-black/50">
          <button onClick={() => setCurrentPage("about")} className="hover:text-black transition-colors duration-200">About</button>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-black transition-colors duration-200 flex items-center gap-0.5">Lab <ArrowUpRight size={10} /></a>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {currentPage === "main" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Sidebar Control Panel */}
            <div className="lg:col-span-4 space-y-8 lg:border-r lg:border-black/5 lg:pr-12">
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-black/30 mb-2">01 / Profile Engine</p>
                <h2 className="text-2xl font-light tracking-tight mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>신체 정보 매트릭스</h2>
                <p className="text-[12px] text-black/40 leading-relaxed">각 진단 탭을 눌러 본인의 정밀 피지컬 데이터를 입력하거나 측정해 주세요.</p>
              </div>

              {/* Diagnostic Parameters Cards Selector */}
              <div className="space-y-3">
                {/* 1. Personal Color parameter */}
                <div className="p-4 border border-black/10 hover:border-black/30 transition-all duration-200 flex flex-col justify-between group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[9px] tracking-wider text-black/30 uppercase mb-0.5">Personal Color</p>
                      <p className="text-[15px] font-medium tracking-tight text-black">{selectedColor || "미진단"}</p>
                    </div>
                    <button onClick={() => { setCurrentPage("personal-color"); setPcMode("choose"); }}
                      className="text-[10px] tracking-wide uppercase text-black/40 group-hover:text-black flex items-center gap-1 transition-colors duration-200">
                      진단하기 <ChevronRight size={12} />
                    </button>
                  </div>
                  <div className="flex gap-1">
                    {AI_MOCK_TYPES.map((t) => (
                      <button key={t} onClick={() => setSelectedColor(`${t} 웜톤`)}
                        className={`flex-1 text-[10px] py-1 border ${selectedColor.startsWith(t) ? "bg-black text-white border-black" : "border-black/10 text-black/50 hover:border-black/30"} transition-all duration-150`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Skeleton Struct parameter */}
                <div className="p-4 border border-black/10 hover:border-black/30 transition-all duration-200 flex flex-col justify-between group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[9px] tracking-wider text-black/30 uppercase mb-0.5">Skeleton Struct</p>
                      <p className="text-[15px] font-medium tracking-tight text-black">{selectedSkeleton} 타입</p>
                    </div>
                    <button onClick={() => { setCurrentPage("skeleton"); setSkAnswers([]); setSkResult(null); }}
                      className="text-[10px] tracking-wide uppercase text-black/40 group-hover:text-black flex items-center gap-1 transition-colors duration-200">
                      진단하기 <ChevronRight size={12} />
                    </button>
                  </div>
                  <div className="flex gap-1">
                    {["스트레이트", "내추럴", "웨이브"].map((t) => (
                      <button key={t} onClick={() => setSelectedSkeleton(t)}
                        className={`flex-1 text-[10px] py-1 border ${selectedSkeleton === t ? "bg-black text-white border-black" : "border-black/10 text-black/50 hover:border-black/30"} transition-all duration-150`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Physical Proportion parameter */}
                <div className="p-4 border border-black/10 hover:border-black/30 transition-all duration-200 flex flex-col justify-between group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[9px] tracking-wider text-black/30 uppercase mb-0.5">Body Silhouette</p>
                      <p className="text-[15px] font-medium tracking-tight text-black">{selectedBody}</p>
                    </div>
                    <button onClick={() => { setCurrentPage("body-shape"); setBodyResult(null); }}
                      className="text-[10px] tracking-wide uppercase text-black/40 group-hover:text-black flex items-center gap-1 transition-colors duration-200">
                      진단하기 <ChevronRight size={12} />
                    </button>
                  </div>
                  <div className="flex gap-1">
                    {["모래시계형", "사과형", "서양배형", "역삼각형", "직사각형"].map((t) => (
                      <button key={t} onClick={() => setSelectedBody(t)}
                        className={`flex-1 text-[9px] py-1 border ${selectedBody === t ? "bg-black text-white border-black" : "border-black/10 text-black/50 hover:border-black/30"} transition-all duration-150`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Main Deep Match Recommendation Panel */}
            <div className="lg:col-span-8 space-y-10">
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-black/30 mb-2">02 / Deep Match Engine</p>
                <h1 className="text-4xl font-light tracking-tight mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>AI 스타일 큐레이션</h1>
                <p className="text-[13px] text-black/50 leading-relaxed max-w-xl">
                  선택한 매트릭스 정보(<span className="text-black font-medium">{selectedColor}</span>, <span className="text-black font-medium">{selectedSkeleton}</span>, <span className="text-black font-medium">{selectedBody}</span>)와 사용자의 TPO 검색 의도를 융합하여 Groq AI가 분석한 실제 쇼핑 아이템 결과를 연동합니다.
                </p>
              </div>

              {/* Search Container Box */}
              <div className="border border-black p-5 space-y-4">
                <div className="relative flex items-center">
                  <Search size={16} className="absolute left-4 text-black/40" />
                  <input type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleBackendSearch(searchQuery)}
                    placeholder="예: 대학생 미팅 나갈 때 입을 상큼한 셔츠 추천해줘"
                    className="w-full bg-black/[0.02] border border-black/10 pl-11 pr-24 py-3.5 text-[14px] text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-colors duration-150" />
                  <button onClick={() => handleBackendSearch(searchQuery)}
                    className="absolute right-2 bg-black text-white px-4 py-2 text-[11px] tracking-wider uppercase hover:bg-black/80 transition-colors duration-150">
                    Search
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] tracking-wider uppercase text-black/30 mr-2">추천 힌트:</span>
                  {HINTS.map((hint) => (
                    <button key={hint} onClick={() => { const q = `${selectedColor}에 어울리는 데일리 ${hint}`; setSearchQuery(q); handleBackendSearch(q); }}
                      className="text-[11px] text-black/60 hover:text-black border border-black/10 px-2.5 py-1 text-xs hover:border-black/30 transition-colors duration-150">
                      {hint}
                    </button>
                  ))}
                </div>
              </div>

              {/* ─── 💡 렌더링 조건부 구조 전면 개편 ─── */}
              {isLoading ? (
                /* 1단계: 통신 중일 때 무조건 로딩 인디케이터 노출 */
                <div className="p-12 border border-dashed border-black/15 text-center space-y-3">
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-[13px] text-black/60 font-light">
                    Grok AI와 네이버 쇼핑 엔진이 <span className="text-black font-medium">"{selectedColor}"</span> 및 신체 정보에 완벽한 옷을 매칭하고 있습니다. 잠시만 기다려주세요...
                  </p>
                </div>
              ) : isSearched ? (
                /* 2단계: 통신이 끝났고(isLoading=false), 검색을 실행한 적이 있다면(isSearched=true) 실제 API 결과를 노출 */
                <div className="space-y-6 animate-fadeIn">
                  {/* 그록 AI 스타일 코멘트 배너 */}
                  {aiGuidance && (
                    <div className="p-4 bg-black/[0.02] border-l-2 border-black text-[13px] text-black/70 leading-relaxed font-light">
                      <strong className="block text-[11px] tracking-wider uppercase text-black/40 mb-1">AI Styling Guidance</strong>
                      {aiGuidance}
                    </div>
                  )}

                  {/* 실시간 쇼핑몰 바인딩 */}
                  <div>
                    <h3 className="text-[11px] tracking-[0.2em] uppercase text-black/40 mb-4 flex items-center gap-3">
                      실시간 네이버 쇼핑 매칭 결과 ({backendItems.length}개) <span className="flex-1 h-px bg-black/5" />
                    </h3>
                    
                    {backendItems.length === 0 ? (
                      <p className="text-[13px] text-black/40 py-8 text-center font-light">검색어와 어울리는 실시간 매칭 아이템이 없습니다. 다른 키워드로 검색해 보세요.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {backendItems.map((item: any, i: number) => (
                          <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" 
                            className="group border border-black/10 overflow-hidden hover:border-black/30 transition-all duration-200 hover:-translate-y-0.5 flex flex-col h-full bg-white">
                            <div className="w-full aspect-[3/4] bg-black/[0.02] flex items-center justify-center overflow-hidden border-b border-black/5">
                              {item.image ? (
                                <img src={item.image} alt={item.title.replace(/<[^>]*>?/g, '')} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              ) : (
                                <span className="text-4xl opacity-40">👕</span>
                              )}
                            </div>
                            <div className="p-3 flex flex-col flex-1 justify-between">
                              <div>
                                <p className="text-[12px] font-medium text-black leading-snug mb-1 line-clamp-2" dangerouslySetInnerHTML={{ __html: item.title }} />
                                <p className="text-[10px] text-black/40">{item.mallName || "네이버 쇼핑"}</p>
                              </div>
                              <p className="text-[13px] font-semibold text-black mt-2">
                                {Number(item.lprice).toLocaleString()}원
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* 3단계: 초기 진입 상태 (검색을 한 번도 안 했을 때) ➡️ 기존 UI의 디폴트 그리드 노출 */
                <div>
                  <h3 className="text-[11px] tracking-[0.2em] uppercase text-black/40 mb-4 flex items-center gap-3">
                    추천 패션 카테고리 <span className="flex-1 h-px bg-black/5" />
                  </h3>
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-black/5">
                    {Object.keys(ITEMS_DB).map((cat) => (
                      <button key={cat} onClick={() => setSelectedCategory(cat)}
                        className={`text-[12px] px-3 py-1.5 whitespace-nowrap transition-all duration-150 ${selectedCategory === cat ? "border-b-2 border-black text-black font-medium" : "text-black/40 hover:text-black"}`}>
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {ITEMS_DB[selectedCategory]?.map((name, i) => (
                      <div key={i} onClick={() => { const q = `${selectedColor}에 어울리는 ${name}`; setSearchQuery(q); handleBackendSearch(q); }}
                        className="group border border-black/10 p-4 cursor-pointer hover:border-black/30 transition-all duration-200 hover:-translate-y-0.5 bg-white">
                        <div className="w-10 h-10 bg-black/[0.03] flex items-center justify-center mb-3">
                          <span className="text-xl opacity-60">{["👕", "👗", "🧥", "👖", "🧶", "🧣"][i % 6]}</span>
                        </div>
                        <p className="text-[12px] font-medium text-black leading-snug mb-0.5">{name}</p>
                        <p className="text-[10px] text-black/35">{selectedCategory}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Page: Personal Color Diagnosis ───────────────────────────────────── */}
        {currentPage === "personal-color" && (
          <div className="max-w-3xl mx-auto">
            <BackButton onClick={() => setCurrentPage("main")} />
            <PageHeader num="Diagnosis 01" title="퍼스널 컬러 엔진" sub="자가 설문 스크리닝 또는 실시간 비전 인공지능 분석 카메라 기법을 사용합니다." />

            {pcMode === "choose" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div onClick={() => { setPcMode("test"); setPcAnswers([null, null, null, null, null]); setCurrentPcQ(0); }}
                  className="border border-black/10 p-8 cursor-pointer hover:border-black transition-all duration-200 space-y-4 group">
                  <div className="w-10 h-10 bg-black flex items-center justify-center text-white"><Search size={16} /></div>
                  <h3 className="text-xl font-light">자가 진단 시뮬레이션</h3>
                  <p className="text-[13px] text-black/50 leading-relaxed font-light">피부 반응, 혈관 색상 등의 문항에 직접 응답하여 직관적인 톤을 검출합니다.</p>
                </div>
                <div onClick={startCamera}
                  className="border border-black/10 p-8 cursor-pointer hover:border-black transition-all duration-200 space-y-4 group">
                  <div className="w-10 h-10 bg-black flex items-center justify-center text-white"><Camera size={16} /></div>
                  <h3 className="text-xl font-light">AI 비전 카메라 인식</h3>
                  <p className="text-[13px] text-black/50 leading-relaxed font-light">컴퓨터 카메라를 구동하여 얼굴 중심부의 실시간 스킨 RGB 픽셀 데이터를 역산 분석합니다.</p>
                </div>
              </div>
            )}

            {pcMode === "test" && (
              <div className="border border-black/10 p-8 space-y-6">
                <div className="flex justify-between items-center text-[11px] tracking-wider uppercase text-black/40">
                  <span>Question {currentPcQ + 1} of {PC_QUESTIONS.length}</span>
                  <div className="w-24 h-1 bg-black/10 relative"><div className="h-full bg-black transition-all duration-300" style={{ width: `${((currentPcQ + 1) / PC_QUESTIONS.length) * 100}%` }} /></div>
                </div>
                <h3 className="text-2xl font-light">{PC_QUESTIONS[currentPcQ].q}</h3>
                <div className="space-y-2.5 pt-4">
                  {PC_QUESTIONS[currentPcQ].options.map((opt) => (
                    <button key={opt.label}
                      onClick={() => {
                        const next = [...pcAnswers]; next[currentPcQ] = opt.label; setPcAnswers(next);
                        if (currentPcQ < PC_QUESTIONS.length - 1) { setCurrentPcQ(currentPcQ + 1); }
                        else { const res = calcPCResult(next); setPcResult(res); setSelectedColor(`${res.season} ${res.season === "봄" || res.season === "가을" ? "웜톤" : "쿨톤"}`); setPcMode("result"); }
                      }}
                      className="w-full text-left p-4 border border-black/10 hover:bg-black/[0.02] text-[14px] transition-colors duration-150 font-light">
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {pcMode === "camera" && (
              <div className="border border-black/10 p-6 space-y-6">
                <p className="text-[11px] tracking-wider uppercase text-black/40">AI Vision Screen</p>
                <div className="w-full aspect-video bg-black/[0.03] relative flex items-center justify-center border border-black/5 overflow-hidden">
                  {isCameraActive && (
                    <>
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                      <div className="absolute w-24 h-24 border border-white/40 rounded-full flex items-center justify-center pointer-events-none">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={capturePhoto} className="flex-1 bg-black text-white py-3 text-[12px] tracking-widest uppercase hover:bg-black/80 transition-colors">Capture</button>
                  <button onClick={() => { stopCamera(); setPcMode("choose"); }} className="border border-black/20 px-6 py-3 text-[12px] uppercase text-black/60 hover:border-black transition-colors">Cancel</button>
                </div>
              </div>
            )}

            {isCameraActive && (
              <div className="mt-4 border border-black/10 p-6 space-y-4">
                <p className="text-[11px] tracking-wider uppercase text-black/40">Alternative: Upload File</p>
                <div className="flex items-center gap-4">
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 border border-black/20 px-4 py-2 text-[12px] text-black/60 hover:border-black transition-colors">
                    <Upload size={14} /> 파일 선택
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                  <p className="text-[11px] text-black/40">얼굴 정면 이미지를 업로드하셔도 실시간 RGB 분석이 연동됩니다.</p>
                </div>
              </div>
            )}

            {pcMode === "result" && pcResult && (
              <div className="border border-black p-8 space-y-8">
                <div className="flex justify-between items-baseline border-b border-black/10 pb-5">
                  <div>
                    <h2 className="text-4xl font-light mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{pcResult.season}</h2>
                    <p className="text-[12px] tracking-widest uppercase text-black/40">{pcResult.en} / {pcResult.sub}</p>
                  </div>
                  <span className="text-[11px] tracking-widest uppercase text-black border border-black px-3 py-1 bg-black text-white">Selected</span>
                </div>

                {skinAnalysis && (
                  <div className="p-4 bg-black/[0.02] border border-black/5 rounded space-y-2 text-[13px] font-light text-black/70">
                    <p className="text-[10px] tracking-widest uppercase text-black/40 font-bold">인공지능 비전 분석 리포트</p>
                    <div className="flex items-center gap-3">
                      <span>검출된 피부 평균 색상:</span>
                      <div className="w-12 h-5 border border-black/10" style={{ backgroundColor: skinAnalysis.hex }} />
                      <span className="font-mono text-[11px]">{skinAnalysis.hex} (RGB: {skinAnalysis.rgb.r}, {skinAnalysis.rgb.g}, {skinAnalysis.rgb.b})</span>
                    </div>
                    <p>• 판정 결과: {skinAnalysis.toneLabel} / {skinAnalysis.brightnessLabel}</p>
                  </div>
                )}

                <p className="text-[15px] font-light text-black/70 leading-relaxed">{pcResult.desc}</p>

                <div>
                  <p className="text-[9px] tracking-[0.25em] uppercase text-black/25 mb-3">Best Matches Palette</p>
                  <div className="flex gap-2">
                    {pcResult.colors.map((c, idx) => (
                      <div key={idx} className="flex-1 text-center py-4 bg-black/[0.02] border border-black/5 text-[12px] text-black/70 font-light">{c}</div>
                    ))}
                  </div>
                </div>

                <ResultTips tips={pcResult.tips} />
                
                <div className="pt-4 flex gap-3">
                  <button onClick={() => { setCurrentPage("main"); setIsSearched(false); }} className="flex-1 bg-black text-white py-3 text-[12px] tracking-widest uppercase hover:bg-black/80 transition-all duration-200">메인 스케줄러로 복귀</button>
                  <button onClick={() => setPcMode("choose")} className="border border-black/20 px-6 py-3 text-[12px] uppercase text-black/60 hover:border-black transition-colors">다시 진단하기</button>
                </div>
              </div>
            )}

            <CrossNavButtons current="personal-color" onNavigate={(p) => { setCurrentPage(p); setPcMode("choose"); setSkAnswers([]); setSkResult(null); setBodyResult(null); }} />
          </div>
        )}

        {/* ─── Page: Skeleton Structural Diagnosis ────────────────────────────────── */}
        {currentPage === "skeleton" && (
          <div className="max-w-3xl mx-auto">
            <BackButton onClick={() => setCurrentPage("main")} />
            <PageHeader num="Diagnosis 02" title="골격 체형 엔진" sub="어깨선, 골반, 무릎 관절 강도 등 프레임 뼈 구조를 역산하여 슬랙스 및 핏 무드를 도출합니다." />

            {!skResult ? (
              <div className="border border-black/10 p-8 space-y-6">
                <div className="flex justify-between items-center text-[11px] tracking-wider uppercase text-black/40">
                  <span>Question {skAnswers.length + 1} of {SKELETON_QUESTIONS.length}</span>
                  <div className="w-24 h-1 bg-black/10 relative"><div className="h-full bg-black transition-all duration-300" style={{ width: `${((skAnswers.length + 1) / SKELETON_QUESTIONS.length) * 100}%` }} /></div>
                </div>
                <h3 className="text-2xl font-light">{SKELETON_QUESTIONS[skAnswers.length].q}</h3>
                <div className="space-y-2.5 pt-4">
                  {SKELETON_QUESTIONS[skAnswers.length].options.map((opt) => (
                    <button key={opt.label}
                      onClick={() => {
                        const next = [...skAnswers, opt.label]; setSkAnswers(next);
                        if (next.length === SKELETON_QUESTIONS.length) { const res = calcSkeletonResult(next); setSkResult(res); setSelectedSkeleton(res.type); }
                      }}
                      className="w-full text-left p-4 border border-black/10 hover:bg-black/[0.02] text-[14px] transition-colors duration-150 font-light">
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border border-black p-8 space-y-6">
                <div className="flex justify-between items-baseline border-b border-black/10 pb-5">
                  <div>
                    <h2 className="text-4xl font-light mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{skResult.type}</h2>
                    <p className="text-[12px] tracking-widest uppercase text-black/40">{skResult.en} Architecture</p>
                  </div>
                  <span className="text-[11px] tracking-widest uppercase text-black border border-black px-3 py-1 bg-black text-white">Applied</span>
                </div>
                <p className="text-[15px] font-light text-black/70 leading-relaxed">{skResult.desc}</p>
                <ResultTips tips={skResult.tips} />
                <button onClick={() => { setCurrentPage("main"); setIsSearched(false); }} className="w-full bg-black text-white py-3 text-[12px] tracking-widest uppercase hover:bg-black/80 transition-all duration-200 mt-4">메인 스케줄러로 복귀</button>
              </div>
            )}

            <CrossNavButtons current="skeleton" onNavigate={(p) => { setCurrentPage(p); setPcMode("choose"); setSkAnswers([]); setSkResult(null); setBodyResult(null); }} />
          </div>
        )}

        {/* ─── Page: Body Proportion Silhouette Diagnosis ─────────────────────────── */}
        {currentPage === "body-shape" && (
          <div className="max-w-3xl mx-auto">
            <BackButton onClick={() => setCurrentPage("main")} />
            <PageHeader num="Diagnosis 03" title="몸 체형 실루엣 분석기" sub="어깨, 바스트, 허리, 골반 인치 치수를 바탕으로 글로벌 체형 인덱스 비율(WHR)을 연산합니다." />

            {!bodyResult ? (
              <div className="border border-black/10 p-8 space-y-6">
                <p className="text-[11px] tracking-wider uppercase text-black/40">신체 치수 데이터 패널 (cm단위 기입)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[12px] text-black/50">어깨 너비</label>
                    <input type="number" value={shoulder} onChange={(e) => setShoulder(e.target.value)} className="w-full bg-black/[0.02] border border-black/10 px-3 py-2 text-[14px] focus:outline-none focus:border-black" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] text-black/50">가슴 둘레 (Bust)</label>
                    <input type="number" value={bust} onChange={(e) => setBust(e.target.value)} className="w-full bg-black/[0.02] border border-black/10 px-3 py-2 text-[14px] focus:outline-none focus:border-black" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] text-black/50">허리 둘레 (Waist)</label>
                    <input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} className="w-full bg-black/[0.02] border border-black/10 px-3 py-2 text-[14px] focus:outline-none focus:border-black" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] text-black/50">엉덩이 둘레 (Hip)</label>
                    <input type="number" value={hip} onChange={(e) => setHip(e.target.value)} className="w-full bg-black/[0.02] border border-black/10 px-3 py-2 text-[14px] focus:outline-none focus:border-black" />
                  </div>
                </div>
                <button onClick={() => {
                  const s = parseFloat(shoulder); const b = parseFloat(bust); const w = parseFloat(waist); const h = parseFloat(hip);
                  if (isNaN(s) || isNaN(b) || isNaN(w) || isNaN(h)) { alert("모든 칸에 올바른 수치를 채워주세요."); return; }
                  const res = calcBodyType(s, b, w, h); setBodyResult(res); setSelectedBody(res.ko);
                }}
                  className="w-full bg-black text-white py-3 text-[12px] tracking-widest uppercase hover:bg-black/80 transition-colors">
                  비율 연산 매트릭스 도출
                </button>
              </div>
            ) : (
              <div className="border border-black p-8 space-y-6">
                <div className="flex justify-between items-baseline border-b border-black/10 pb-5">
                  <div>
                    <h2 className="text-4xl font-light mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{bodyResult.ko} ({bodyResult.type})</h2>
                    <p className="text-[12px] tracking-widest uppercase text-black/40">Proportion Silhouette Ratio</p>
                  </div>
                  <span className="text-[11px] tracking-widest uppercase text-black border border-black px-3 py-1 bg-black text-white">Applied</span>
                </div>
                <p className="text-[15px] font-light text-black/70 leading-relaxed">{bodyResult.desc}</p>
                <ResultTips tips={bodyResult.tips} />
                <button onClick={() => { setCurrentPage("main"); setIsSearched(false); }} className="w-full bg-black text-white py-3 text-[12px] tracking-widest uppercase hover:bg-black/80 transition-all duration-200 mt-4">메인 스케줄러로 복귀</button>
              </div>
            )}

            <CrossNavButtons current="body-shape" onNavigate={(p) => { setCurrentPage(p); setPcMode("choose"); setSkAnswers([]); setSkResult(null); setBodyResult(null); }} />
          </div>
        )}
      </main>

      {/* Global Minimalist Footer */}
      <footer className="max-w-7xl mx-auto px-6 mt-16 pt-6 pb-12 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-[10px] tracking-wide text-black/20">© 2026 AI Fashion Tech Lab / Deeplook Platform Project</span>
        <span className="flex items-center gap-2 text-[10px] text-black/25">
          <span className="w-1.5 h-1.5 rounded-full bg-black/40 animate-pulse" />
          AI & Crawling 백엔드 노드 가동 중
        </span>
      </footer>
    </div>
  );
}
