export type Page = "main" | "personal-color" | "skeleton" | "body-shape" | "login" | "signup" | "mypage" | "about";

export type PCAnswer = "A" | "B" | "C" | "D";
export type PersonalColorDetail = "Light" | "Bright" | "Mute" | "Deep" | "True";
export type PersonalColorTypeKey =
  | "springLight"
  | "springBright"
  | "springTrue"
  | "summerLight"
  | "summerBright"
  | "summerMute"
  | "autumnMute"
  | "autumnTrue"
  | "autumnDeep"
  | "winterBright"
  | "winterTrue"
  | "winterDeep";
export type Gender = "male" | "female";

export interface AuthUser {
  id: number;
  email: string;
  nickname: string;
  gender: Gender | null;
  created_at?: string;
}
export type StylePreference =
  | "minimal"
  | "casual"
  | "street"
  | "classic"
  | "feminine"
  | "chic"
  | "dandy"
  | "sports"
  | "luxury";
export interface PCQuestion {
  q: string;
  options: {
    label: PCAnswer;
    text: string;
    tone?: "warm" | "cool" | "light" | "deep";
    scores?: Partial<Record<PersonalColorTypeKey, number>>;
    reason?: string;
  }[];
}

export type PCResult = {
  id: PersonalColorTypeKey;
  name: string;
  season: string;
  sub: string;
  en: string;
  desc: string;
  colors: string[];
  tips: string[];
};

export interface SkinZoneSample {
  id: "forehead" | "leftCheek" | "rightCheek" | "chin";
  label: string;
  rgb: { r: number; g: number; b: number };
  hsv: { h: number; s: number; v: number };
  lab: { l: number; a: number; b: number };
  pixelRatio: number;
}

export interface AISkinAnalysis {
  result: PCResult;
  resultName: string;
  detailTone: PersonalColorDetail;
  secondaryResult: {
    name: string;
    season: string;
    detailTone: PersonalColorDetail;
    confidence: number;
  };
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
  lab: { l: number; a: number; b: number };
  zones: SkinZoneSample[];
  isWarm: boolean;
  isLight: boolean;
  toneLabel: string;
  brightnessLabel: string;
  confidence: number;
  qualityLabel: string;
  warnings: string[];
  evidence: string[];
  recommendationPoints: string[];
  cautionPoints: string[];
  cameraFrame?: {
    canAnalyze?: boolean | null;
    failedChecks?: string[];
    centerOffset?: number | null;
    faceSizeRatio?: number | null;
    tiltDegrees?: number | null;
  };
  metrics: {
    brightness: number;
    saturation: number;
    temperature: number;
    contrast: number;
    balance: number;
    shadowVariance: number;
    skinPixelRatio: number;
    warmCoolScore: number;
  };
}

export type SkeletonAnswer = "A" | "B" | "C";
export type SkeletonTypeKey = "straight" | "wave" | "natural";

export interface SkeletonQuestion {
  q: string;
  options: {
    label: SkeletonAnswer;
    text: string;
    weights: Partial<Record<SkeletonTypeKey, number>>;
    reason: string;
  }[];
}

export interface SkeletonResult {
  type: string;
  en: string;
  desc: string;
  tips: string[];
  confidence: number;
  secondaryType: string;
  scores: Record<string, number>;
  rawScores: Record<SkeletonTypeKey, number>;
  reasons: string[];
  recommendationPoints: string[];
  cautionPoints: string[];
  isMixed: boolean;
}

export interface BodyShapeResult {
  type: string;
  ko: string;
  desc: string;
  tips: string[];
  confidence: number;
  secondaryType?: string;
  scores: Record<string, number>;
  aiScores: Record<string, number>;
  surveyScores: Record<string, number>;
  reasons: string[];
  recommendationPoints: string[];
  cautionPoints: string[];
  blend: {
    ai: number;
    survey: number;
  };
}

export type BodyShapeAnswer = -2 | -1 | 0 | 1 | 2;

export interface BodyShapeInput {
  shoulderVsHip: BodyShapeAnswer;
  waistDefinition: BodyShapeAnswer;
  upperLowerBalance: BodyShapeAnswer;
  fitIssue: "shoulders" | "waist" | "hips" | "balanced" | "unsure";
  weightGainArea: "upper" | "middle" | "lower" | "even" | "unsure";
  confidence: 0.6 | 0.8 | 1;
  measurements?: {
    shoulder?: number;
    waist?: number;
    hip?: number;
  };
}

export interface UserProfile {
  gender: Gender;
  height: string;
  weight: string;
  stylePreferences: StylePreference[];
}

export interface RecommendationProduct {
  id: string;
  productType: "fashion" | "beauty";
  title: string;
  mallName: string;
  lprice: number;
  productUrl?: string | null;
  externalSearchUrl: string;
  externalSearchKeywords: string[];
  link: string;
  linkType: "product_url" | "search_fallback";
  image: string;
  imagePath: string;
  recommendationReason: string;
  matchScore: number;
  matchConfidence: number;
  searchRelevance?: number;
  rankingBreakdown?: Record<string, number | string[]>;
  matchReasons: string[];
  category: string;
  subCategory: string;
  colorGroup: string;
  brandName: string;
}

export interface SearchSuggestion {
  label: string;
  source: "popular" | "keyword" | "product" | "brand" | "attribute" | "category";
}

export interface MyPageRecommendation {
  id: number;
  recommended_style: string;
  recommended_items: RecommendationProduct[];
  created_at: string;
}

export interface MyPageDashboard {
  user: AuthUser;
  latest_personal_color: {
    id: number;
    season: string;
    tone: string;
    confidence: number;
    created_at: string;
  } | null;
  body_type_results: {
    id: number;
    body_type: string;
    confidence: number;
    created_at: string;
  }[];
  latest_skeleton_type: {
    id: number;
    skeleton_type: string;
    confidence: number;
    created_at: string;
  } | null;
  latest_body_shape: {
    id: number;
    body_shape: string;
    confidence: number;
    created_at: string;
  } | null;
  recommendations: MyPageRecommendation[];
}

export interface CameraCheck {
  key:
    | "front"
    | "fullFace"
    | "faceSize"
    | "tilt"
    | "mask"
    | "hat"
    | "shadow"
    | "light"
    | "filter";
  label: string;
  passed: boolean;
  value: string;
  detail: string;
}

export interface CameraFrameAnalysis {
  canAnalyze: boolean;
  centerOffset: number;
  faceSizeRatio: number;
  tiltDegrees: number;
  checks: CameraCheck[];
}

export interface CameraQualitySnapshot {
  confidence?: number;
  qualityLabel?: string;
  warnings?: string[];
  metrics?: AISkinAnalysis["metrics"];
  cameraFrame?: AISkinAnalysis["cameraFrame"] | CameraFrameAnalysis;
}
