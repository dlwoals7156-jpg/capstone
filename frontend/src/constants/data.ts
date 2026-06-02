import {
  AISkinAnalysis,
  PCQuestion,
  PCResult,
  PersonalColorTypeKey,
  SkeletonQuestion,
  StylePreference,
  UserProfile,
} from "../types";

export const ITEMS_DB: Record<string, string[]> = {
  티셔츠: ["크루넥 코튼 티셔츠", "루즈핏 오버사이즈 티", "크롭 리브 티셔츠", "오프숄더 슬리브 티", "박시 그래픽 티", "V넥 슬림핏 티"],
  원피스: ["A라인 미디 원피스", "피트 앤 플레어 원피스", "맥시 플로우 원피스", "랩 플리츠 원피스", "시스 미니 원피스", "쉬폰 티어드 원피스"],
  자켓: ["테일러드 블레이저", "오버핏 크롭 자켓", "더블 브레스트 자켓", "린넨 노카라 자켓", "볼레로 숏 자켓", "트렌치 롱 자켓"],
  슬랙스: ["와이드 스트레이트 슬랙스", "하이웨이스트 플레어 슬랙스", "테이퍼드 슬림 슬랙스", "팔라초 루즈 슬랙스", "크롭 와이드 슬랙스", "부츠컷 슬랙스"],
  니트: ["크루넥 오버핏 니트", "터틀넥 슬림 니트", "케이블 카디건", "크롭 브이넥 니트", "오프숄더 드레이프 니트", "모크넥 박시 니트"],
  코트: ["클래식 울 코트", "A라인 체스터필드 코트", "오버핏 롱 코트", "크롭 쇼트 코트", "더블 캐시미어 코트", "벨티드 트렌치 코트"],
};

export const PC_QUESTIONS: PCQuestion[] = [
  {
    q: "민낯 피부의 기본 바탕색은 어느 쪽에 가장 가깝나요?",
    options: [
      {
        label: "A",
        text: "복숭아·아이보리처럼 밝고 따뜻한 느낌",
        tone: "warm",
        scores: { springLight: 3, springBright: 2, springTrue: 2 },
        reason: "밝은 피치·아이보리 베이스는 봄 계열 가능성을 높입니다.",
      },
      {
        label: "B",
        text: "핑크·로즈빛이 돌고 차분한 느낌",
        tone: "cool",
        scores: { summerLight: 3, summerMute: 2, summerBright: 1 },
        reason: "핑크·로즈 베이스는 여름 계열 가능성을 높입니다.",
      },
      {
        label: "C",
        text: "베이지·올리브·골드빛이 돌고 깊은 느낌",
        tone: "warm",
        scores: { autumnTrue: 3, autumnMute: 2, autumnDeep: 2 },
        reason: "베이지·올리브·골드 베이스는 가을 계열 가능성을 높입니다.",
      },
      {
        label: "D",
        text: "붉거나 푸른 기가 선명하고 대비가 강한 느낌",
        tone: "cool",
        scores: { winterTrue: 3, winterBright: 2, winterDeep: 2 },
        reason: "차갑고 선명한 피부 대비는 겨울 계열 가능성을 높입니다.",
      },
    ],
  },
  {
    q: "얼굴 가까이에 올렸을 때 생기가 가장 좋아지는 색감은?",
    options: [
      {
        label: "A",
        text: "피치, 코럴, 라이트 옐로우처럼 맑고 밝은 색",
        tone: "light",
        scores: { springLight: 3, springBright: 2, summerLight: 1 },
        reason: "맑고 밝은 따뜻한 색이 잘 받으면 봄 라이트·브라이트 후보가 올라갑니다.",
      },
      {
        label: "B",
        text: "라벤더, 로즈, 파우더 블루처럼 부드럽고 시원한 색",
        tone: "cool",
        scores: { summerLight: 3, summerMute: 2, summerBright: 1 },
        reason: "부드러운 쿨 컬러가 잘 받으면 여름 계열 후보가 올라갑니다.",
      },
      {
        label: "C",
        text: "카멜, 올리브, 테라코타처럼 차분하고 따뜻한 색",
        tone: "warm",
        scores: { autumnMute: 3, autumnTrue: 3, autumnDeep: 1 },
        reason: "차분한 어스톤이 잘 받으면 가을 뮤트·트루 후보가 올라갑니다.",
      },
      {
        label: "D",
        text: "블랙, 퓨어 화이트, 로얄 블루처럼 대비가 강한 색",
        tone: "cool",
        scores: { winterBright: 3, winterTrue: 3, winterDeep: 2 },
        reason: "강한 대비 컬러가 잘 받으면 겨울 계열 후보가 올라갑니다.",
      },
    ],
  },
  {
    q: "피해야 한다고 느낀 색상은 어떤 쪽인가요?",
    options: [
      {
        label: "A",
        text: "검정이나 너무 어두운 색을 입으면 얼굴이 눌려 보인다",
        tone: "light",
        scores: { springLight: 3, summerLight: 3, springBright: 1 },
        reason: "어두운 색이 부담스럽다면 라이트 계열 가능성이 높습니다.",
      },
      {
        label: "B",
        text: "파스텔을 입으면 힘이 빠지고 흐려 보인다",
        tone: "deep",
        scores: { winterDeep: 3, autumnDeep: 3, winterTrue: 1 },
        reason: "파스텔이 흐려 보이면 딥 또는 강한 대비 계열 후보가 올라갑니다.",
      },
      {
        label: "C",
        text: "비비드 원색을 입으면 피부가 붉거나 피곤해 보인다",
        scores: { summerMute: 3, autumnMute: 3, summerLight: 1 },
        reason: "비비드 원색이 부담스럽다면 뮤트 계열 후보가 올라갑니다.",
      },
      {
        label: "D",
        text: "회색빛·탁한 색을 입으면 칙칙해 보인다",
        scores: { springBright: 3, winterBright: 3, springTrue: 1, winterTrue: 1 },
        reason: "탁한 색이 칙칙하면 브라이트 또는 트루 계열 후보가 올라갑니다.",
      },
    ],
  },
  {
    q: "눈동자·머리색·피부의 전체 대비감은?",
    options: [
      {
        label: "A",
        text: "전체적으로 밝고 부드러워 대비가 낮다",
        tone: "light",
        scores: { springLight: 3, summerLight: 3, summerMute: 1 },
        reason: "낮은 대비감은 라이트 계열을 강하게 지지합니다.",
      },
      {
        label: "B",
        text: "중간 정도이고 따뜻한 갈색·베이지 인상이 있다",
        scores: { springTrue: 2, autumnTrue: 3, autumnMute: 2 },
        reason: "중간 대비와 따뜻한 인상은 트루 웜·가을 후보를 지지합니다.",
      },
      {
        label: "C",
        text: "눈·머리색이 선명해서 얼굴 대비가 또렷하다",
        scores: { springBright: 2, winterBright: 3, winterTrue: 3 },
        reason: "또렷한 대비는 브라이트·겨울 트루 후보를 지지합니다.",
      },
      {
        label: "D",
        text: "머리와 눈동자가 깊고 어두워 무게감이 있다",
        tone: "deep",
        scores: { autumnDeep: 3, winterDeep: 3, winterTrue: 1 },
        reason: "깊은 눈·머리색은 딥 계열 후보를 지지합니다.",
      },
    ],
  },
  {
    q: "가장 자연스럽게 어울리는 립/블러셔 색은?",
    options: [
      {
        label: "A",
        text: "피치, 살구, 코럴처럼 따뜻하고 생기 있는 색",
        tone: "warm",
        scores: { springLight: 2, springBright: 3, springTrue: 2 },
        reason: "피치·코럴 메이크업이 자연스러우면 봄 계열 후보가 올라갑니다.",
      },
      {
        label: "B",
        text: "쿨 핑크, 로즈, 모브처럼 푸른 기가 있는 색",
        tone: "cool",
        scores: { summerLight: 2, summerBright: 2, summerMute: 3 },
        reason: "로즈·모브 메이크업이 자연스러우면 여름 계열 후보가 올라갑니다.",
      },
      {
        label: "C",
        text: "브릭, 테라코타, 칠리처럼 깊은 오렌지 브라운",
        tone: "warm",
        scores: { autumnTrue: 3, autumnDeep: 3, autumnMute: 1 },
        reason: "브릭·테라코타가 자연스러우면 가을 계열 후보가 올라갑니다.",
      },
      {
        label: "D",
        text: "체리, 버건디, 플럼처럼 선명하거나 깊은 쿨 레드",
        tone: "cool",
        scores: { winterBright: 3, winterTrue: 2, winterDeep: 3 },
        reason: "체리·플럼 계열이 자연스러우면 겨울 계열 후보가 올라갑니다.",
      },
    ],
  },
  {
    q: "액세서리 금속은 어느 쪽이 얼굴색을 더 깨끗하게 보이나요?",
    options: [
      {
        label: "A",
        text: "밝고 반짝이는 골드·로즈골드",
        tone: "warm",
        scores: { springLight: 2, springBright: 3, springTrue: 2 },
        reason: "밝고 반짝이는 골드는 봄 계열과 잘 맞는 신호입니다.",
      },
      {
        label: "B",
        text: "실버·화이트골드·플래티넘",
        tone: "cool",
        scores: { summerLight: 2, summerBright: 2, winterBright: 2, winterTrue: 2 },
        reason: "실버 계열은 쿨톤 후보를 지지합니다.",
      },
      {
        label: "C",
        text: "무광 골드·앤틱 골드·브론즈",
        tone: "warm",
        scores: { autumnMute: 3, autumnTrue: 3, autumnDeep: 2 },
        reason: "앤틱 골드·브론즈는 가을 계열 후보를 지지합니다.",
      },
      {
        label: "D",
        text: "진한 실버, 블랙 메탈, 선명한 보석 세팅",
        tone: "cool",
        scores: { winterBright: 2, winterTrue: 3, winterDeep: 3 },
        reason: "강한 금속 대비는 겨울 계열 후보를 지지합니다.",
      },
    ],
  },
  {
    q: "옷의 채도는 어느 정도가 가장 잘 받나요?",
    options: [
      {
        label: "A",
        text: "맑지만 너무 강하지 않은 밝은 색",
        tone: "light",
        scores: { springLight: 3, summerLight: 3, springTrue: 1 },
        reason: "밝고 맑은 저중채도는 라이트 후보를 지지합니다.",
      },
      {
        label: "B",
        text: "눈에 띄게 선명하고 깨끗한 색",
        scores: { springBright: 3, summerBright: 2, winterBright: 3 },
        reason: "선명한 고채도 색이 잘 받으면 브라이트 후보가 올라갑니다.",
      },
      {
        label: "C",
        text: "그레이가 섞인 듯한 차분하고 부드러운 색",
        scores: { summerMute: 3, autumnMute: 3 },
        reason: "그레이시한 색이 잘 받으면 뮤트 후보가 올라갑니다.",
      },
      {
        label: "D",
        text: "진하고 무게감 있는 깊은 색",
        tone: "deep",
        scores: { autumnDeep: 3, winterDeep: 3, winterTrue: 1 },
        reason: "진하고 깊은 색이 잘 받으면 딥 후보가 올라갑니다.",
      },
    ],
  },
  {
    q: "햇빛을 받았을 때 피부 반응은 어떤 편인가요?",
    options: [
      {
        label: "A",
        text: "쉽게 붉어지고 원래 피부가 밝게 유지된다",
        tone: "cool",
        scores: { summerLight: 3, summerBright: 1, springLight: 1 },
        reason: "쉽게 붉어지고 밝게 유지되면 라이트 쿨 후보가 올라갑니다.",
      },
      {
        label: "B",
        text: "붉어졌다가 금방 가라앉고 맑은 생기가 돈다",
        scores: { springBright: 2, summerBright: 2, winterBright: 1 },
        reason: "맑은 생기가 도는 반응은 브라이트 후보를 지지합니다.",
      },
      {
        label: "C",
        text: "골든·브론즈빛으로 자연스럽게 탄다",
        tone: "warm",
        scores: { autumnTrue: 3, autumnDeep: 2, springTrue: 1 },
        reason: "골든·브론즈 태닝은 웜 트루·가을 후보를 지지합니다.",
      },
      {
        label: "D",
        text: "잘 타거나 어두워졌을 때 깊은 색이 더 잘 어울린다",
        tone: "deep",
        scores: { autumnDeep: 3, winterDeep: 2, autumnTrue: 1 },
        reason: "태닝 후 깊은 색이 잘 받으면 딥 후보가 올라갑니다.",
      },
    ],
  },
];

export const PC_RESULTS: Record<PersonalColorTypeKey, PCResult> = {
  springLight: { id: "springLight", name: "봄 라이트", season: "봄", sub: "Spring Light", en: "Light Warm Clear", desc: "밝고 투명한 피치빛이 잘 어울리는 타입입니다. 얼굴 주변은 가볍고 맑은 컬러일수록 생기가 살아납니다.", colors: ["피치", "라이트 코럴", "아이보리", "크림 옐로우", "민트 그린"], tips: ["검정·딥 브라운처럼 무거운 색은 얼굴에서 멀리 배치", "밝은 골드나 로즈골드 액세서리 추천", "상의는 맑고 밝은 웜 컬러 중심으로 선택"] },
  springBright: { id: "springBright", name: "봄 브라이트", season: "봄", sub: "Spring Bright", en: "Warm Vivid Clear", desc: "맑고 선명한 웜 컬러가 피부를 가장 생동감 있게 만드는 타입입니다. 탁한 색보다 깨끗한 고채도가 강점입니다.", colors: ["비비드 코럴", "애플 그린", "클리어 옐로우", "아쿠아", "웜 레드"], tips: ["회색기가 섞인 뮤트 컬러는 피하기", "작은 면적의 선명한 포인트 컬러 활용", "화이트보다 크림·아이보리 베이스 추천"] },
  springTrue: { id: "springTrue", name: "봄 트루", season: "봄", sub: "True Spring", en: "True Warm Fresh", desc: "따뜻하고 맑은 봄 색을 폭넓게 소화하는 타입입니다. 노란기와 생기 있는 색감이 얼굴을 편안하게 보이게 합니다.", colors: ["코랄 핑크", "웜 베이지", "선라이트 옐로우", "라이트 카멜", "웜 그린"], tips: ["차갑고 푸른 색은 얼굴을 창백하게 만들 수 있음", "골드 계열 주얼리와 궁합 좋음", "따뜻한 밝기와 중간 채도를 유지"] },
  summerLight: { id: "summerLight", name: "여름 라이트", season: "여름", sub: "Summer Light", en: "Light Cool Soft", desc: "밝고 시원한 파스텔 계열이 잘 맞는 타입입니다. 부드러운 쿨 컬러가 피부를 맑고 깨끗하게 보여줍니다.", colors: ["파우더 블루", "라이트 라벤더", "쿨 핑크", "소프트 민트", "실버 그레이"], tips: ["어둡고 강한 대비는 줄이기", "실버·화이트골드 액세서리 추천", "상하의 대비보다 은은한 톤온톤 추천"] },
  summerBright: { id: "summerBright", name: "여름 브라이트", season: "여름", sub: "Summer Bright", en: "Cool Clear Bright", desc: "차갑고 맑은 컬러 중에서도 적당히 선명한 색이 잘 어울립니다. 여름의 부드러움과 겨울의 깨끗함이 함께 보입니다.", colors: ["쿨 체리 핑크", "아이스 블루", "맑은 라벤더", "쿨 민트", "라즈베리"], tips: ["노란기 강한 색은 피하기", "너무 탁한 회색보다 맑은 쿨 컬러 선택", "실버 포인트로 깨끗한 인상 강화"] },
  summerMute: { id: "summerMute", name: "여름 뮤트", season: "여름", sub: "Summer Mute", en: "Cool Muted Soft", desc: "그레이시하고 부드러운 쿨 컬러가 잘 받는 타입입니다. 강한 원색보다 차분한 색이 세련된 인상을 만듭니다.", colors: ["더스티 로즈", "모브", "그레이 블루", "라벤더 그레이", "소프트 네이비"], tips: ["비비드 원색과 강한 대비는 줄이기", "매트한 실버·진주 액세서리 추천", "부드러운 소재와 톤온톤 배색 활용"] },
  autumnMute: { id: "autumnMute", name: "가을 뮤트", season: "가을", sub: "Autumn Mute", en: "Warm Muted Soft", desc: "차분하고 부드러운 어스톤이 잘 어울리는 타입입니다. 너무 선명한 색보다 따뜻하게 눌린 색이 안정적입니다.", colors: ["세이지", "카키 베이지", "더스티 오렌지", "토프", "웜 그레이"], tips: ["형광기·쨍한 색은 피하기", "무광 골드·브론즈 액세서리 추천", "린넨·스웨이드 같은 질감과 잘 맞음"] },
  autumnTrue: { id: "autumnTrue", name: "가을 트루", season: "가을", sub: "True Autumn", en: "True Warm Earthy", desc: "따뜻한 골드·브라운·카멜 계열을 가장 안정적으로 소화하는 타입입니다. 깊이와 온기가 모두 중요합니다.", colors: ["카멜", "테라코타", "올리브", "머스타드", "웜 브라운"], tips: ["차갑고 푸른 색은 얼굴을 어둡게 만들 수 있음", "골드·우드·레더 소재 추천", "따뜻한 중명도 어스톤 중심으로 코디"] },
  autumnDeep: { id: "autumnDeep", name: "가을 딥", season: "가을", sub: "Autumn Deep", en: "Warm Deep Rich", desc: "깊고 풍부한 웜 컬러가 분위기를 살리는 타입입니다. 브라운, 버건디, 딥 올리브처럼 농도 있는 색이 강점입니다.", colors: ["에스프레소", "딥 올리브", "브릭 레드", "다크 카멜", "웜 버건디"], tips: ["밝은 파스텔은 얼굴이 떠 보일 수 있음", "짙은 골드·브론즈 액세서리 추천", "무게감 있는 소재와 깊은 배색 활용"] },
  winterBright: { id: "winterBright", name: "겨울 브라이트", season: "겨울", sub: "Winter Bright", en: "Cool Vivid Clear", desc: "차갑고 선명한 고채도 컬러가 얼굴을 또렷하게 만드는 타입입니다. 맑은 대비와 깨끗한 색감이 핵심입니다.", colors: ["푸시아", "코발트 블루", "아이스 화이트", "클리어 레드", "에메랄드"], tips: ["탁한 베이지·카키는 피하기", "실버·화이트골드와 선명한 보석 컬러 추천", "흑백 대비에 비비드 포인트 활용"] },
  winterTrue: { id: "winterTrue", name: "겨울 트루", season: "겨울", sub: "True Winter", en: "True Cool High Contrast", desc: "차가움과 대비감이 가장 중요한 타입입니다. 블랙, 화이트, 쿨 레드처럼 명확한 색이 인상을 선명하게 합니다.", colors: ["블랙", "퓨어 화이트", "로얄 블루", "쿨 레드", "차콜"], tips: ["노란기 많은 아이보리·카멜은 피하기", "플래티넘·실버 액세서리 추천", "명도 대비를 또렷하게 유지"] },
  winterDeep: { id: "winterDeep", name: "겨울 딥", season: "겨울", sub: "Winter Deep", en: "Cool Deep Dramatic", desc: "깊고 차가운 색이 세련된 분위기를 만드는 타입입니다. 어두운 색을 입어도 얼굴이 묻히지 않고 또렷하게 살아납니다.", colors: ["블랙", "딥 네이비", "와인", "딥 퍼플", "포레스트 그린"], tips: ["흐린 파스텔과 탁한 브라운은 피하기", "실버·블랙 메탈 액세서리 추천", "깊은 컬러와 선명한 대비를 함께 활용"] },
};

export const AI_MOCK_TYPES = Object.keys(PC_RESULTS) as PersonalColorTypeKey[];

export const DEFAULT_SKIN_ANALYSIS: AISkinAnalysis = {
  result: PC_RESULTS.springLight,
  resultName: "봄 라이트",
  detailTone: "Light",
  secondaryResult: {
    name: "여름 라이트",
    season: "여름",
    detailTone: "Light",
    confidence: 0.38,
  },
  hex: "#F5C396",
  rgb: { r: 245, g: 195, b: 150 },
  hsl: { h: 28, s: 78, l: 77 },
  hsv: { h: 28, s: 39, v: 96 },
  lab: { l: 82, a: 13, b: 28 },
  zones: [],
  isWarm: true,
  isLight: true,
  toneLabel: "웜톤 (따뜻한 옐로우 베이스)",
  brightnessLabel: "밝고 생기 있는 피부톤",
  confidence: 0.45,
  qualityLabel: "기본값 사용: 이미지를 안정적으로 분석하지 못했습니다.",
  warnings: ["정면 얼굴 사진과 자연광 환경에서 다시 촬영하면 정확도가 올라갑니다."],
  evidence: ["피부 영역 검출량이 부족해 기본 라이트 웜 후보를 사용했습니다."],
  recommendationPoints: ["밝은 아이보리, 피치, 코럴 계열을 우선 테스트해 보세요."],
  cautionPoints: ["어두운 조명, 필터, 얼굴 일부 가림이 있으면 결과가 크게 흔들립니다."],
  metrics: {
    brightness: 82,
    saturation: 39,
    temperature: 66,
    contrast: 18,
    balance: 50,
    shadowVariance: 0,
    skinPixelRatio: 0,
    warmCoolScore: 0,
  },
};

export const SKELETON_QUESTIONS: SkeletonQuestion[] = [
  {
    q: "쇄골이 보이는 편인가요?",
    options: [
      { label: "A", text: "매우 그렇다. 얇고 길게 드러난다.", weights: { wave: 2 }, reason: "쇄골 노출이 뚜렷해 웨이브 점수가 크게 반영되었습니다." },
      { label: "B", text: "보통이다. 살짝 보이는 정도다.", weights: { wave: 1, straight: 0.5 }, reason: "쇄골 노출이 중간이라 웨이브와 스트레이트에 나누어 반영되었습니다." },
      { label: "C", text: "아니다. 쇄골보다 상체 볼륨이 먼저 보인다.", weights: { straight: 1.5 }, reason: "쇄골이 덜 드러나 상체 볼륨형인 스트레이트 점수가 반영되었습니다." },
    ],
  },
  {
    q: "손목 뼈가 두꺼운 편인가요?",
    options: [
      { label: "A", text: "매우 그렇다. 뼈대가 또렷하다.", weights: { natural: 2 }, reason: "손목 뼈 존재감이 강해 내추럴 점수가 크게 반영되었습니다." },
      { label: "B", text: "보통이다. 너무 가늘지도 두껍지도 않다.", weights: { straight: 1 }, reason: "손목 뼈가 중간 범위라 스트레이트 점수가 반영되었습니다." },
      { label: "C", text: "아니다. 손목이 가늘고 부드럽다.", weights: { wave: 1.5 }, reason: "손목이 가늘고 부드러워 웨이브 점수가 반영되었습니다." },
    ],
  },
  {
    q: "상체의 첫인상은 어느 쪽인가요?",
    options: [
      { label: "A", text: "탄탄하고 입체적이며 목이 짧아 보일 때가 있다.", weights: { straight: 2 }, reason: "상체 입체감이 강해 스트레이트 점수가 반영되었습니다." },
      { label: "B", text: "어깨·관절의 선이 크고 프레임이 잘 보인다.", weights: { natural: 2 }, reason: "프레임과 관절감이 강해 내추럴 점수가 반영되었습니다." },
      { label: "C", text: "상체가 얇고 곡선적이며 부드러운 느낌이다.", weights: { wave: 2 }, reason: "상체가 얇고 곡선적이라 웨이브 점수가 반영되었습니다." },
    ],
  },
  {
    q: "허리와 골반의 연결감은 어떤가요?",
    options: [
      { label: "A", text: "허리 위치가 높고 몸통이 짧게 느껴진다.", weights: { straight: 1.5 }, reason: "몸통이 짧고 중심이 위에 있어 스트레이트 점수가 반영되었습니다." },
      { label: "B", text: "허리선이 낮고 하체가 길게 흐르는 느낌이다.", weights: { wave: 1.5 }, reason: "하체 중심의 부드러운 흐름이 웨이브 점수에 반영되었습니다." },
      { label: "C", text: "허리보다 전체 프레임과 관절선이 먼저 보인다.", weights: { natural: 1.5 }, reason: "프레임 우선 인상이 내추럴 점수에 반영되었습니다." },
    ],
  },
  {
    q: "무릎·팔꿈치 등 관절은 어떻게 보이나요?",
    options: [
      { label: "A", text: "작고 둥글며 살성이 부드럽다.", weights: { wave: 1.5 }, reason: "관절이 작고 둥글어 웨이브 점수가 반영되었습니다." },
      { label: "B", text: "크지 않고 매끈하며 몸선이 탄탄하다.", weights: { straight: 1.5 }, reason: "관절보다 탄탄한 몸선이 보여 스트레이트 점수가 반영되었습니다." },
      { label: "C", text: "관절이 크고 뼈의 각이 잘 보인다.", weights: { natural: 2 }, reason: "관절의 각과 크기가 내추럴 점수에 크게 반영되었습니다." },
    ],
  },
  {
    q: "잘 어울리는 소재감은 무엇에 가깝나요?",
    options: [
      { label: "A", text: "적당히 힘 있는 정장 소재와 깔끔한 핏", weights: { straight: 1.5 }, reason: "힘 있는 깔끔한 소재 선호가 스트레이트 점수에 반영되었습니다." },
      { label: "B", text: "얇고 부드럽게 흐르는 소재", weights: { wave: 1.5 }, reason: "얇고 부드러운 소재 선호가 웨이브 점수에 반영되었습니다." },
      { label: "C", text: "린넨, 데님처럼 텍스처가 있는 여유 핏", weights: { natural: 1.5 }, reason: "텍스처와 여유 핏 선호가 내추럴 점수에 반영되었습니다." },
    ],
  },
];

export const STYLE_OPTIONS: { value: StylePreference; label: string }[] = [
  { value: "minimal", label: "미니멀" },
  { value: "casual", label: "캐주얼" },
  { value: "street", label: "스트릿" },
  { value: "classic", label: "클래식" },
  { value: "feminine", label: "페미닌" },
  { value: "chic", label: "시크" },
  { value: "dandy", label: "댄디" },
  { value: "sports", label: "스포츠" },
  { value: "luxury", label: "럭셔리" },
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  gender: "female",
  height: "",
  weight: "",
  stylePreferences: ["minimal", "casual"],
};
