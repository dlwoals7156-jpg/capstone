import {
  AISkinAnalysis,
  BodyShapeInput,
  BodyShapeResult,
  CameraCheck,
  CameraFrameAnalysis,
  PCAnswer,
  PCResult,
  PersonalColorDetail,
  PersonalColorTypeKey,
  SkeletonAnswer,
  SkeletonResult,
  SkeletonTypeKey,
  SkinZoneSample,
} from "../types";
import { DEFAULT_SKIN_ANALYSIS, PC_QUESTIONS, PC_RESULTS, SKELETON_QUESTIONS } from "../constants/data";

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;
  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  const delta = max - min;
  let h = 0;

  if (delta !== 0) {
    if (max === nr) h = ((ng - nb) / delta) % 6;
    if (max === ng) h = (nb - nr) / delta + 2;
    if (max === nb) h = (nr - ng) / delta + 4;
  }

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  return {
    h,
    s: Math.round((max === 0 ? 0 : delta / max) * 100),
    v: Math.round(max * 100),
  };
}

export function rgbToLab(r: number, g: number, b: number): { l: number; a: number; b: number } {
  const pivotRgb = (value: number) => {
    const normalized = value / 255;
    return normalized > 0.04045 ? Math.pow((normalized + 0.055) / 1.055, 2.4) : normalized / 12.92;
  };
  const pivotXyz = (value: number) => (value > 0.008856 ? Math.cbrt(value) : value * 7.787 + 16 / 116);

  const rr = pivotRgb(r);
  const gg = pivotRgb(g);
  const bb = pivotRgb(b);
  const x = (rr * 0.4124 + gg * 0.3576 + bb * 0.1805) / 0.95047;
  const y = (rr * 0.2126 + gg * 0.7152 + bb * 0.0722) / 1.0;
  const z = (rr * 0.0193 + gg * 0.1192 + bb * 0.9505) / 1.08883;
  const fx = pivotXyz(x);
  const fy = pivotXyz(y);
  const fz = pivotXyz(z);

  return {
    l: Math.round((116 * fy - 16) * 10) / 10,
    a: Math.round((500 * (fx - fy)) * 10) / 10,
    b: Math.round((200 * (fy - fz)) * 10) / 10,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.round(clamp(c, 0, 255)).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function trimmedMean(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const trim = Math.floor(sorted.length * 0.1);
  const trimmed = sorted.slice(trim, sorted.length - trim || sorted.length);
  return trimmed.reduce((sum, value) => sum + value, 0) / Math.max(1, trimmed.length);
}

function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function isLikelySkin(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const y = luminance(r, g, b);
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  const hsv = rgbToHsv(r, g, b);

  return (
    r > 42 &&
    g > 32 &&
    b > 24 &&
    max - min > 10 &&
    y > 54 &&
    y < 238 &&
    cr >= 128 &&
    cr <= 182 &&
    cb >= 70 &&
    cb <= 140 &&
    hsv.s >= 6 &&
    hsv.s <= 72
  );
}

function getWhiteBalanceGains(data: Uint8ClampedArray) {
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += 40) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count++;
  }

  const avgR = r / Math.max(1, count);
  const avgG = g / Math.max(1, count);
  const avgB = b / Math.max(1, count);
  const gray = (avgR + avgG + avgB) / 3;

  return {
    rGain: clamp(gray / Math.max(1, avgR), 0.82, 1.18),
    gGain: clamp(gray / Math.max(1, avgG), 0.82, 1.18),
    bGain: clamp(gray / Math.max(1, avgB), 0.82, 1.18),
  };
}

function detailKo(detail: PersonalColorDetail) {
  return {
    Light: "라이트",
    Bright: "브라이트",
    Mute: "뮤트",
    Deep: "딥",
    True: "트루",
  }[detail];
}

function detailFromType(type: PersonalColorTypeKey): PersonalColorDetail {
  if (type.includes("Light")) return "Light";
  if (type.includes("Bright")) return "Bright";
  if (type.includes("Mute")) return "Mute";
  if (type.includes("Deep")) return "Deep";
  return "True";
}

function closeness(value: number, target: number, range = 42): number {
  return clamp(100 - Math.abs(value - target) * (100 / range), 0, 100);
}

function buildPersonalColorCandidates(
  brightness: number,
  saturation: number,
  temperature: number,
  contrast: number,
  balance: number,
) {
  const warm = temperature;
  const cool = 100 - temperature;
  const light = brightness;
  const deep = 100 - brightness;
  const bright = saturation;
  const mute = 100 - saturation;
  const lowContrast = 100 - contrast;
  const midLight = closeness(brightness, 64);
  const midSaturation = closeness(saturation, 42);

  return [
    {
      id: "springLight" as const,
      score: warm * 0.25 + light * 0.3 + bright * 0.12 + balance * 0.15 + lowContrast * 0.18,
    },
    {
      id: "springBright" as const,
      score: warm * 0.25 + bright * 0.3 + light * 0.1 + contrast * 0.15 + balance * 0.1 + midLight * 0.1,
    },
    {
      id: "springTrue" as const,
      score: warm * 0.42 + midLight * 0.18 + midSaturation * 0.14 + balance * 0.16 + lowContrast * 0.1,
    },
    {
      id: "summerLight" as const,
      score: cool * 0.28 + light * 0.3 + mute * 0.12 + balance * 0.18 + lowContrast * 0.12,
    },
    {
      id: "summerBright" as const,
      score: cool * 0.25 + bright * 0.25 + light * 0.12 + contrast * 0.16 + balance * 0.12 + midLight * 0.1,
    },
    {
      id: "summerMute" as const,
      score: cool * 0.25 + mute * 0.3 + lowContrast * 0.15 + balance * 0.18 + light * 0.12,
    },
    {
      id: "autumnMute" as const,
      score: warm * 0.25 + mute * 0.3 + midLight * 0.12 + balance * 0.18 + contrast * 0.15,
    },
    {
      id: "autumnTrue" as const,
      score: warm * 0.42 + midLight * 0.18 + midSaturation * 0.16 + balance * 0.14 + contrast * 0.1,
    },
    {
      id: "autumnDeep" as const,
      score: warm * 0.25 + deep * 0.3 + contrast * 0.18 + mute * 0.12 + balance * 0.1 + midSaturation * 0.05,
    },
    {
      id: "winterBright" as const,
      score: cool * 0.26 + bright * 0.28 + contrast * 0.22 + balance * 0.12 + light * 0.12,
    },
    {
      id: "winterTrue" as const,
      score: cool * 0.38 + contrast * 0.24 + balance * 0.15 + bright * 0.13 + midLight * 0.1,
    },
    {
      id: "winterDeep" as const,
      score: cool * 0.25 + deep * 0.32 + contrast * 0.24 + bright * 0.1 + balance * 0.09,
    },
  ].sort((a, b) => b.score - a.score);
}

type InternalZoneSample = SkinZoneSample & {
  count: number;
  inspected: number;
  luminanceValues: number[];
};

function sampleSkinZone(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  zone: { id: SkinZoneSample["id"]; label: string; x: number; y: number; w: number; h: number },
  gains: { rGain: number; gGain: number; bGain: number },
): InternalZoneSample {
  const minX = Math.max(0, Math.floor(width * (zone.x - zone.w / 2)));
  const maxX = Math.min(width - 1, Math.floor(width * (zone.x + zone.w / 2)));
  const minY = Math.max(0, Math.floor(height * (zone.y - zone.h / 2)));
  const maxY = Math.min(height - 1, Math.floor(height * (zone.y + zone.h / 2)));
  const rs: number[] = [];
  const gs: number[] = [];
  const bs: number[] = [];
  const lumas: number[] = [];
  let inspected = 0;

  for (let y = minY; y <= maxY; y += 2) {
    for (let x = minX; x <= maxX; x += 2) {
      inspected++;
      const idx = (y * width + x) * 4;
      const r = clamp(data[idx] * gains.rGain, 0, 255);
      const g = clamp(data[idx + 1] * gains.gGain, 0, 255);
      const b = clamp(data[idx + 2] * gains.bGain, 0, 255);
      if (!isLikelySkin(r, g, b)) continue;
      rs.push(r);
      gs.push(g);
      bs.push(b);
      lumas.push(luminance(r, g, b));
    }
  }

  const rgb = {
    r: Math.round(trimmedMean(rs)),
    g: Math.round(trimmedMean(gs)),
    b: Math.round(trimmedMean(bs)),
  };

  return {
    id: zone.id,
    label: zone.label,
    rgb,
    hsv: rgbToHsv(rgb.r, rgb.g, rgb.b),
    lab: rgbToLab(rgb.r, rgb.g, rgb.b),
    pixelRatio: Number((rs.length / Math.max(1, inspected)).toFixed(2)),
    count: rs.length,
    inspected,
    luminanceValues: lumas,
  };
}

export function analyzeImageForPersonalColor(imageUrl: string): Promise<AISkinAnalysis> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 960 / Math.max(img.width, img.height));
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(DEFAULT_SKIN_ANALYSIS);
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const gains = getWhiteBalanceGains(data);
      const zones = [
        { id: "forehead" as const, label: "이마", x: 0.5, y: 0.29, w: 0.2, h: 0.1 },
        { id: "leftCheek" as const, label: "왼쪽 볼", x: 0.36, y: 0.48, w: 0.17, h: 0.14 },
        { id: "rightCheek" as const, label: "오른쪽 볼", x: 0.64, y: 0.48, w: 0.17, h: 0.14 },
        { id: "chin" as const, label: "턱", x: 0.5, y: 0.68, w: 0.18, h: 0.11 },
      ];
      const sampledZones = zones.map((zone) => sampleSkinZone(data, canvas.width, canvas.height, zone, gains));
      const validZones = sampledZones.filter((zone) => zone.count >= 24);
      const totalSkinPixels = validZones.reduce((sum, zone) => sum + zone.count, 0);
      const totalInspected = sampledZones.reduce((sum, zone) => sum + zone.inspected, 0);

      if (validZones.length < 3 || totalSkinPixels < 90) {
        resolve({
          ...DEFAULT_SKIN_ANALYSIS,
          zones: sampledZones.map(({ count, inspected, luminanceValues, ...zone }) => zone),
          warnings: ["이마·양 볼·턱 중 충분한 피부 영역을 찾지 못했습니다. 얼굴 전체가 보이는 정면 사진으로 다시 촬영해 주세요."],
          evidence: ["피부 검출 영역이 3개 미만이거나 유효 피부 픽셀이 부족했습니다."],
          metrics: {
            ...DEFAULT_SKIN_ANALYSIS.metrics,
            skinPixelRatio: Number((totalSkinPixels / Math.max(1, totalInspected)).toFixed(2)),
          },
        });
        return;
      }

      const weightedAverage = (channel: "r" | "g" | "b") =>
        Math.round(validZones.reduce((sum, zone) => sum + zone.rgb[channel] * zone.count, 0) / Math.max(1, totalSkinPixels));
      const avgR = weightedAverage("r");
      const avgG = weightedAverage("g");
      const avgB = weightedAverage("b");
      const hsl = rgbToHsl(avgR, avgG, avgB);
      const hsv = rgbToHsv(avgR, avgG, avgB);
      const lab = rgbToLab(avgR, avgG, avgB);
      const lumaValues = validZones.flatMap((zone) => zone.luminanceValues);
      const avgLuma = lumaValues.reduce((sum, value) => sum + value, 0) / Math.max(1, lumaValues.length);
      const variance = lumaValues.reduce((sum, value) => sum + Math.pow(value - avgLuma, 2), 0) / Math.max(1, lumaValues.length);
      const shadowVariance = Math.sqrt(variance);
      const zoneDelta =
        validZones.reduce((sum, zone) => {
          const dL = zone.lab.l - lab.l;
          const dA = zone.lab.a - lab.a;
          const dB = zone.lab.b - lab.b;
          return sum + Math.sqrt(dL * dL + dA * dA + dB * dB);
        }, 0) / Math.max(1, validZones.length);
      const warmCoolScore = lab.b * 1.25 + (avgR - avgB) * 0.24 + (hsv.h >= 16 && hsv.h <= 52 ? 7 : -5);
      const temperature = clamp(50 + warmCoolScore, 0, 100);
      const brightness = clamp(lab.l, 0, 100);
      const saturation = clamp(hsv.s, 0, 100);
      const contrast = clamp(shadowVariance * 1.25 + zoneDelta * 2.1, 0, 100);
      const balance = clamp(100 - zoneDelta * 4.2, 0, 100);
      const candidates = buildPersonalColorCandidates(brightness, saturation, temperature, contrast, balance);
      const primary = candidates[0];
      const secondary = candidates[1];
      const result = PC_RESULTS[primary.id];
      const secondaryResult = PC_RESULTS[secondary.id];
      const resultName = result.name;
      const secondaryName = secondaryResult.name;
      const primaryDetail = detailFromType(primary.id);
      const secondaryDetail = detailFromType(secondary.id);
      const scoreMargin = primary.score - secondary.score;
      const skinPixelRatio = totalSkinPixels / Math.max(1, totalInspected);

      const warnings: string[] = [];
      if (brightness < 45) warnings.push("조명이 부족해 피부 명도 판정 신뢰도가 낮아질 수 있습니다.");
      if (brightness > 88) warnings.push("과노출 가능성이 있어 실제 피부 색보다 밝게 분석될 수 있습니다.");
      if (shadowVariance > 38) warnings.push("얼굴 그림자 차이가 커서 대비감과 색온도 판단이 흔들릴 수 있습니다.");
      if (skinPixelRatio < 0.24) warnings.push("검출된 피부 픽셀 비율이 낮습니다. 얼굴을 더 크게 중앙에 맞춰 주세요.");
      if (Math.abs(temperature - 50) < 8) warnings.push("웜/쿨 경계값에 가까워 보조 결과도 함께 참고해 주세요.");
      if (balance < 62) warnings.push("이마·볼·턱의 색 균형 차이가 커서 메이크업, 그림자, 필터 영향을 의심할 수 있습니다.");

      const qualityPenalty =
        (brightness < 45 || brightness > 88 ? 0.1 : 0) +
        (shadowVariance > 38 ? 0.1 : 0) +
        (skinPixelRatio < 0.24 ? 0.08 : 0) +
        (balance < 62 ? 0.08 : 0) +
        (Math.abs(temperature - 50) < 8 ? 0.07 : 0);
      const confidence = clamp(0.7 + scoreMargin / 180 + skinPixelRatio * 0.08 - qualityPenalty, 0.48, 0.94);
      const secondaryConfidence = clamp(confidence - scoreMargin / 220 - 0.05, 0.38, 0.84);
      const toneLabel = temperature >= 53 ? "웜톤 (노란빛·골드 베이스 우세)" : "쿨톤 (핑크빛·블루 베이스 우세)";
      const brightnessLabel =
        primaryDetail === "Light"
          ? "밝고 투명한 라이트 톤"
          : primaryDetail === "Bright"
            ? "선명하고 생기 있는 브라이트 톤"
            : primaryDetail === "Mute"
              ? "차분하고 부드러운 뮤트 톤"
              : primaryDetail === "Deep"
                ? "깊고 대비감 있는 딥 톤"
                : "온도감이 명확한 트루 톤";

      resolve({
        result,
        resultName,
        detailTone: primaryDetail,
        secondaryResult: {
          name: secondaryName,
          season: secondaryResult.season,
          detailTone: secondaryDetail,
          confidence: Number(secondaryConfidence.toFixed(2)),
        },
        hex: rgbToHex(avgR, avgG, avgB),
        rgb: { r: avgR, g: avgG, b: avgB },
        hsl,
        hsv,
        lab,
        zones: sampledZones.map(({ count, inspected, luminanceValues, ...zone }) => zone),
        isWarm: temperature >= 53,
        isLight: brightness >= 64,
        toneLabel,
        brightnessLabel,
        confidence: Number(confidence.toFixed(2)),
        qualityLabel: confidence >= 0.78 ? "촬영 품질 양호" : confidence >= 0.62 ? "촬영 품질 보통" : "재촬영 권장",
        warnings,
        evidence: [
          `이마·양 볼·턱 ${validZones.length}개 영역에서 피부 픽셀만 추출했습니다.`,
          `평균 RGB ${avgR}/${avgG}/${avgB}, HSV ${hsv.h}/${hsv.s}/${hsv.v}, LAB ${lab.l}/${lab.a}/${lab.b}`,
          `피부 명도 ${Math.round(brightness)} / 채도 ${Math.round(saturation)} / 색온도 ${Math.round(temperature)} / 대비 ${Math.round(contrast)}`,
        ],
        recommendationPoints: [
          `${resultName} 팔레트에 맞춰 ${result.colors.slice(0, 3).join(", ")} 계열을 우선 추천합니다.`,
          `${brightnessLabel}이므로 상의와 얼굴 주변 액세서리 색을 먼저 맞추면 효과가 큽니다.`,
          `보조 후보 ${secondaryName}도 ${Math.round(secondaryConfidence * 100)}%로 참고할 수 있습니다.`,
        ],
        cautionPoints: warnings.length
          ? warnings
          : ["강한 필터, 진한 색조 메이크업, 역광 환경에서는 웜/쿨 판정이 달라질 수 있습니다."],
        metrics: {
          brightness: Math.round(brightness),
          saturation: Math.round(saturation),
          temperature: Math.round(temperature),
          contrast: Math.round(contrast),
          balance: Math.round(balance),
          shadowVariance: Math.round(shadowVariance),
          skinPixelRatio: Number(skinPixelRatio.toFixed(2)),
          warmCoolScore: Math.round(warmCoolScore),
        },
      });
    };
    img.onerror = () => {
      resolve(DEFAULT_SKIN_ANALYSIS);
    };
    img.src = imageUrl;
  });
}

function failedCameraAnalysis(): CameraFrameAnalysis {
  const check = (key: CameraCheck["key"], label: string, detail: string): CameraCheck => ({
    key,
    label,
    passed: false,
    value: "대기",
    detail,
  });

  return {
    canAnalyze: false,
    centerOffset: 1,
    faceSizeRatio: 0,
    tiltDegrees: 0,
    checks: [
      check("front", "정면 응시", "얼굴 중심과 좌우 균형을 확인 중입니다."),
      check("fullFace", "얼굴 전체 노출", "이마부터 턱까지 피부 영역을 확인 중입니다."),
      check("faceSize", "얼굴 크기", "가이드 프레임 안에 얼굴을 맞춰 주세요."),
      check("tilt", "얼굴 기울기", "고개 기울기를 확인 중입니다."),
      check("mask", "마스크 미착용", "하관 피부 영역을 확인 중입니다."),
      check("hat", "모자 미착용", "이마 피부 영역을 확인 중입니다."),
      check("shadow", "강한 그림자 없음", "좌우 밝기 차이를 확인 중입니다."),
      check("light", "조명 충분", "전체 밝기를 확인 중입니다."),
      check("filter", "필터 없음", "비정상 채도와 색 균형을 확인 중입니다."),
    ],
  };
}

export function evaluateCameraFrame(video: HTMLVideoElement | null): CameraFrameAnalysis | null {
  if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) return null;

  const width = 360;
  const height = Math.max(1, Math.round((video.videoHeight / video.videoWidth) * width));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(video, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);
  const gains = getWhiteBalanceGains(data);
  const centerX = width / 2;
  const centerY = height / 2;
  const faceArea = { minX: width * 0.2, maxX: width * 0.8, minY: height * 0.08, maxY: height * 0.92 };

  let inspected = 0;
  let skinCount = 0;
  let sumX = 0;
  let sumY = 0;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let leftCount = 0;
  let rightCount = 0;
  let upperCount = 0;
  let lowerCount = 0;
  let foreheadCount = 0;
  let leftY = 0;
  let rightY = 0;
  let leftLuma = 0;
  let rightLuma = 0;
  const lumas: number[] = [];
  const sats: number[] = [];

  for (let y = Math.floor(faceArea.minY); y < faceArea.maxY; y += 3) {
    for (let x = Math.floor(faceArea.minX); x < faceArea.maxX; x += 3) {
      inspected++;
      const idx = (y * width + x) * 4;
      const r = clamp(data[idx] * gains.rGain, 0, 255);
      const g = clamp(data[idx + 1] * gains.gGain, 0, 255);
      const b = clamp(data[idx + 2] * gains.bGain, 0, 255);
      if (!isLikelySkin(r, g, b)) continue;

      const luma = luminance(r, g, b);
      const hsv = rgbToHsv(r, g, b);
      skinCount++;
      sumX += x;
      sumY += y;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      lumas.push(luma);
      sats.push(hsv.s);

      if (x < centerX) {
        leftCount++;
        leftY += y;
        leftLuma += luma;
      } else {
        rightCount++;
        rightY += y;
        rightLuma += luma;
      }
      if (y < height * 0.5) upperCount++;
      if (y > height * 0.58) lowerCount++;
      if (y < height * 0.34) foreheadCount++;
    }
  }

  if (skinCount < 36) return failedCameraAnalysis();

  const avgX = sumX / skinCount;
  const avgY = sumY / skinCount;
  const faceW = Math.max(1, maxX - minX);
  const faceH = Math.max(1, maxY - minY);
  const skinRatio = skinCount / Math.max(1, inspected);
  const centerOffset = Math.sqrt(Math.pow((avgX - centerX) / width, 2) + Math.pow((avgY - centerY) / height, 2));
  const leftRightRatio = leftCount / Math.max(1, rightCount);
  const leftAvgY = leftY / Math.max(1, leftCount);
  const rightAvgY = rightY / Math.max(1, rightCount);
  const tiltDegrees = Math.atan2(leftAvgY - rightAvgY, faceW) * (180 / Math.PI);
  const avgLuma = lumas.reduce((sum, value) => sum + value, 0) / Math.max(1, lumas.length);
  const variance = lumas.reduce((sum, value) => sum + Math.pow(value - avgLuma, 2), 0) / Math.max(1, lumas.length);
  const shadowVariance = Math.sqrt(variance);
  const leftRightLumaDiff = Math.abs(leftLuma / Math.max(1, leftCount) - rightLuma / Math.max(1, rightCount));
  const avgSat = sats.reduce((sum, value) => sum + value, 0) / Math.max(1, sats.length);
  const faceSizeRatio = faceH / height;
  const lowerUpperRatio = lowerCount / Math.max(1, upperCount);
  const foreheadRatio = foreheadCount / Math.max(1, skinCount);
  const edgeSafe = minX > width * 0.17 && maxX < width * 0.83 && minY > height * 0.05 && maxY < height * 0.94;

  const checks: CameraCheck[] = [
    {
      key: "front",
      label: "정면 응시",
      passed: centerOffset < 0.2 && leftRightRatio > 0.55 && leftRightRatio < 1.75,
      value: `${Math.round((1 - clamp(centerOffset * 3, 0, 1)) * 100)}%`,
      detail: "얼굴 중심과 좌우 피부 분포를 기준으로 정면성을 추정합니다.",
    },
    {
      key: "fullFace",
      label: "얼굴 전체 노출",
      passed: skinRatio > 0.1 && edgeSafe,
      value: `${Math.round(skinRatio * 100)}%`,
      detail: "이마부터 턱까지 중앙 영역의 피부 검출 비율과 화면 잘림을 확인합니다.",
    },
    {
      key: "faceSize",
      label: "얼굴 크기",
      passed: faceSizeRatio >= 0.36 && faceSizeRatio <= 0.78,
      value: `${Math.round(faceSizeRatio * 100)}%`,
      detail: "가이드 프레임 안에서 얼굴이 너무 작거나 크지 않은지 확인합니다.",
    },
    {
      key: "tilt",
      label: "얼굴 기울기",
      passed: Math.abs(tiltDegrees) <= 10,
      value: `${Math.round(tiltDegrees)}°`,
      detail: "좌우 피부 영역의 높이 차이로 고개 기울기를 추정합니다.",
    },
    {
      key: "mask",
      label: "마스크 미착용",
      passed: lowerUpperRatio > 0.38 && lowerCount / Math.max(1, skinCount) > 0.16,
      value: `${Math.round(lowerUpperRatio * 100)}%`,
      detail: "턱과 하관 피부 영역이 충분히 보이는지 확인합니다.",
    },
    {
      key: "hat",
      label: "모자 미착용",
      passed: foreheadRatio > 0.08,
      value: `${Math.round(foreheadRatio * 100)}%`,
      detail: "이마 피부 영역이 가려지지 않았는지 확인합니다.",
    },
    {
      key: "shadow",
      label: "강한 그림자 없음",
      passed: shadowVariance < 42 && leftRightLumaDiff < 30,
      value: `${Math.round(leftRightLumaDiff)}`,
      detail: "얼굴 좌우 밝기 차이와 피부 밝기 분산을 확인합니다.",
    },
    {
      key: "light",
      label: "조명 충분",
      passed: avgLuma >= 84 && avgLuma <= 220,
      value: `${Math.round(avgLuma)}`,
      detail: "피부색이 어둡거나 날아가지 않는 밝기인지 확인합니다.",
    },
    {
      key: "filter",
      label: "필터 없음",
      passed: avgSat >= 8 && avgSat <= 66,
      value: `${Math.round(avgSat)}%`,
      detail: "비정상적으로 낮거나 높은 채도는 필터 또는 보정 가능성으로 봅니다.",
    },
  ];

  return {
    canAnalyze: checks.every((check) => check.passed),
    centerOffset: Number(centerOffset.toFixed(2)),
    faceSizeRatio: Number(faceSizeRatio.toFixed(2)),
    tiltDegrees: Math.round(tiltDegrees),
    checks,
  };
}

export function calcPCResult(answers: (PCAnswer | null)[]): PCResult {
  const scores = Object.fromEntries(
    (Object.keys(PC_RESULTS) as PersonalColorTypeKey[]).map((key) => [key, 0]),
  ) as Record<PersonalColorTypeKey, number>;

  answers.forEach((ans, qi) => {
    if (ans === null) return;
    const opt = PC_QUESTIONS[qi].options.find((o) => o.label === ans);
    if (!opt?.scores) return;
    Object.entries(opt.scores).forEach(([key, value]) => {
      scores[key as PersonalColorTypeKey] += value ?? 0;
    });
  });

  const ranked = (Object.entries(scores) as [PersonalColorTypeKey, number][]).sort((a, b) => b[1] - a[1]);
  return PC_RESULTS[ranked[0]?.[0] || "springLight"];
}

const SKELETON_META: Record<SkeletonTypeKey, Omit<SkeletonResult, "confidence" | "secondaryType" | "scores" | "rawScores" | "reasons" | "recommendationPoints" | "cautionPoints" | "isMixed">> = {
  straight: {
    type: "스트레이트",
    en: "Straight",
    desc: "탄탄하고 직선적인 실루엣입니다. 상체 입체감과 정돈된 핏이 강점입니다.",
    tips: ["V넥·U넥으로 목선을 정리", "두께감 있는 소재와 깔끔한 재단", "세미 슬림 또는 스트레이트 핏", "상체 장식은 줄이고 선을 명확하게"],
  },
  wave: {
    type: "웨이브",
    en: "Wave",
    desc: "얇고 부드러운 곡선형 실루엣입니다. 허리선과 하체 비율을 살리면 균형이 좋아집니다.",
    tips: ["크롭 기장과 하이웨이스트 조합", "가볍고 부드러운 소재", "허리선을 강조하는 벨트·셔링", "상체에 은은한 볼륨 추가"],
  },
  natural: {
    type: "내추럴",
    en: "Natural",
    desc: "프레임과 관절선이 살아 있는 입체형 실루엣입니다. 여유 있는 핏과 텍스처가 잘 어울립니다.",
    tips: ["오버핏·루즈핏으로 프레임 완화", "린넨·데님·트윌처럼 결이 있는 소재", "와이드 팬츠와 긴 기장", "레이어링으로 구조감 만들기"],
  },
};

export function calcSkeletonResult(answers: SkeletonAnswer[]): SkeletonResult {
  const rawScores: Record<SkeletonTypeKey, number> = { straight: 0, wave: 0, natural: 0 };
  const reasons: string[] = [];

  answers.forEach((answer, index) => {
    const option = SKELETON_QUESTIONS[index]?.options.find((item) => item.label === answer);
    if (!option) return;
    Object.entries(option.weights).forEach(([key, value]) => {
      rawScores[key as SkeletonTypeKey] += value ?? 0;
    });
    reasons.push(option.reason);
  });

  const total = Object.values(rawScores).reduce((sum, score) => sum + score, 0) || 1;
  const ranked = (Object.entries(rawScores) as [SkeletonTypeKey, number][]).sort((a, b) => b[1] - a[1]);
  const [primaryKey, primaryScore] = ranked[0];
  const [secondaryKey, secondaryScore] = ranked[1];
  const primaryPercent = Math.round((primaryScore / total) * 100);
  const secondaryPercent = Math.round((secondaryScore / total) * 100);
  const isMixed = secondaryPercent >= 30 && primaryPercent - secondaryPercent <= 18;
  const primary = SKELETON_META[primaryKey];
  const secondary = SKELETON_META[secondaryKey];
  const type = isMixed ? `${primary.type} + ${secondary.type} 혼합형` : primary.type;
  const confidence = clamp((primaryPercent + Math.max(0, primaryPercent - secondaryPercent) * 0.45) / 100, 0.54, 0.93);
  const mergedTips = isMixed ? [...primary.tips.slice(0, 2), ...secondary.tips.slice(0, 2)] : primary.tips;

  return {
    ...primary,
    type,
    en: isMixed ? `${primary.en} + ${secondary.en}` : primary.en,
    desc: isMixed
      ? `${primary.type}의 중심축에 ${secondary.type} 특성이 함께 보입니다. 한 가지 핏만 고정하기보다 소재와 여유감을 조절하는 혼합형 스타일링이 적합합니다.`
      : primary.desc,
    tips: mergedTips,
    confidence: Number(confidence.toFixed(2)),
    secondaryType: secondary.type,
    scores: {
      스트레이트: Math.round((rawScores.straight / total) * 100),
      내추럴: Math.round((rawScores.natural / total) * 100),
      웨이브: Math.round((rawScores.wave / total) * 100),
    },
    rawScores,
    reasons: [...new Set(reasons)].slice(0, 6),
    recommendationPoints: mergedTips.slice(0, 3),
    cautionPoints: [
      isMixed ? "혼합형은 한 가지 골격 공식만 적용하면 핏이 딱딱해질 수 있습니다." : `${primary.type} 장점을 살리되 과한 장식은 균형을 깨뜨릴 수 있습니다.`,
      "골격 결과는 체형 비율과 다르므로 체형 분석 결과와 함께 추천에 반영됩니다.",
    ],
    isMixed,
  };
}

const BODY_RESULTS: Record<string, Omit<BodyShapeResult, "confidence" | "scores" | "aiScores" | "surveyScores" | "reasons" | "secondaryType" | "recommendationPoints" | "cautionPoints" | "blend">> = {
  InvertedTriangle: {
    type: "Inverted Triangle",
    ko: "역삼각형",
    desc: "어깨 또는 상체 폭이 골반보다 강하게 보이고 하체가 비교적 슬림한 실루엣입니다.",
    tips: ["상체는 단순한 네크라인 선택", "와이드·플레어 팬츠로 하체 볼륨 보완", "하의에 밝은 컬러나 텍스처 배치", "어깨 장식과 퍼프소매는 줄이기"],
  },
  Triangle: {
    type: "Triangle",
    ko: "삼각형",
    desc: "골반과 하체 비중이 어깨보다 강하게 느껴지는 하체 중심 실루엣입니다.",
    tips: ["보트넥·오프숄더로 어깨 폭 보완", "상체에 밝은 컬러와 포인트 배치", "하의는 스트레이트 또는 A라인으로 정리", "허리선은 살리고 골반 부피는 매끈하게"],
  },
  Rectangle: {
    type: "Rectangle",
    ko: "직사각형",
    desc: "어깨·허리·골반 폭 차이가 작고 허리 굴곡이 완만한 직선형 실루엣입니다.",
    tips: ["벨트와 절개선으로 허리 포인트 만들기", "레이어링으로 상하체 입체감 추가", "크롭 기장과 하이웨이스트 조합", "패턴·텍스처로 시각적 곡선 만들기"],
  },
  Hourglass: {
    type: "Hourglass",
    ko: "모래시계",
    desc: "어깨와 골반 균형이 가깝고 허리선이 뚜렷하게 들어가는 균형형 실루엣입니다.",
    tips: ["랩 드레스·벨티드 아우터로 허리 강조", "상하의 볼륨을 비슷하게 유지", "하이웨이스트 팬츠와 터킹", "핏 앤 플레어 실루엣 활용"],
  },
  Oval: {
    type: "Oval",
    ko: "타원형",
    desc: "허리와 복부 중심 볼륨이 상대적으로 두드러지고 상하체 폭 차이는 크지 않은 실루엣입니다.",
    tips: ["V넥과 오픈 아우터로 세로선 만들기", "허리를 조이지 않는 스트레이트 핏", "상하의 톤을 길게 연결", "복부 중앙 장식보다 어깨·하의 포인트 활용"],
  },
};

const BODY_KEYS = ["InvertedTriangle", "Triangle", "Rectangle", "Hourglass", "Oval"] as const;
type BodyKey = (typeof BODY_KEYS)[number];

function emptyBodyScores(): Record<BodyKey, number> {
  return { InvertedTriangle: 0, Triangle: 0, Rectangle: 0, Hourglass: 0, Oval: 0 };
}

function normalizeBodyScores(scores: Record<BodyKey, number>): Record<string, number> {
  const total = Object.values(scores).reduce((sum, score) => sum + Math.max(0, score), 0) || 1;
  return Object.fromEntries(
    BODY_KEYS.map((key) => [BODY_RESULTS[key].ko, Math.round((Math.max(0, scores[key]) / total) * 100)]),
  );
}

export function calcBodyType(input: BodyShapeInput): BodyShapeResult {
  const surveyScores = emptyBodyScores();
  const aiScores = emptyBodyScores();
  const reasons: string[] = [];
  const surveyWeight = input.confidence;

  const addSurvey = (type: BodyKey, value: number, reason?: string) => {
    surveyScores[type] += value * surveyWeight;
    if (reason && value >= 1) reasons.push(reason);
  };
  const addAi = (type: BodyKey, value: number, reason?: string) => {
    aiScores[type] += value;
    if (reason && value >= 1) reasons.push(reason);
  };

  if (input.shoulderVsHip >= 1) addSurvey("InvertedTriangle", input.shoulderVsHip * 2.2, "설문에서 어깨가 골반보다 넓다고 응답했습니다.");
  if (input.shoulderVsHip <= -1) addSurvey("Triangle", Math.abs(input.shoulderVsHip) * 2.2, "설문에서 골반이 어깨보다 넓다고 응답했습니다.");
  if (input.shoulderVsHip === 0) {
    addSurvey("Rectangle", 1.1, "설문에서 어깨와 골반 폭이 균형에 가깝다고 응답했습니다.");
    addSurvey("Hourglass", 1.0);
  }

  if (input.waistDefinition >= 1) addSurvey("Hourglass", input.waistDefinition * 2.2, "허리선이 뚜렷하다고 응답했습니다.");
  if (input.waistDefinition === 0) addSurvey("Rectangle", 1.3, "허리 굴곡이 중간 정도라고 응답했습니다.");
  if (input.waistDefinition <= -1) {
    addSurvey("Rectangle", Math.abs(input.waistDefinition) * 1.5, "허리 굴곡이 약하다고 응답했습니다.");
    addSurvey("Oval", Math.abs(input.waistDefinition) * 1.3);
  }

  if (input.upperLowerBalance >= 1) addSurvey("InvertedTriangle", input.upperLowerBalance * 0.8);
  if (input.upperLowerBalance <= -1) addSurvey("Triangle", Math.abs(input.upperLowerBalance) * 0.8);
  if (input.fitIssue === "shoulders") addSurvey("InvertedTriangle", 1.6, "기성복이 어깨·가슴에서 먼저 불편하다고 응답했습니다.");
  if (input.fitIssue === "hips") addSurvey("Triangle", 1.6, "기성복이 골반·허벅지에서 먼저 불편하다고 응답했습니다.");
  if (input.fitIssue === "waist") addSurvey("Oval", 1.8, "기성복이 허리·복부에서 먼저 불편하다고 응답했습니다.");
  if (input.fitIssue === "balanced") {
    addSurvey("Hourglass", 0.8);
    addSurvey("Rectangle", 0.8);
  }
  if (input.weightGainArea === "upper") addSurvey("InvertedTriangle", 1.1);
  if (input.weightGainArea === "middle") addSurvey("Oval", 1.6, "체중 변화가 복부 중심으로 나타난다고 응답했습니다.");
  if (input.weightGainArea === "lower") addSurvey("Triangle", 1.3);
  if (input.weightGainArea === "even") addSurvey("Rectangle", 1.0);

  const m = input.measurements;
  const hasAiRatio = Boolean(m?.shoulder && m?.waist && m?.hip);
  if (m?.shoulder && m?.waist && m?.hip) {
    const shoulderHipRatio = m.shoulder / m.hip;
    const waistAverageRatio = m.waist / ((m.shoulder + m.hip) / 2);
    const shoulderHipBalanced = shoulderHipRatio > 0.93 && shoulderHipRatio < 1.07;

    if (shoulderHipRatio >= 1.08) addAi("InvertedTriangle", 3.2, `AI/치수 어깨·골반 비율 ${shoulderHipRatio.toFixed(2)}로 상체 폭이 우세합니다.`);
    if (shoulderHipRatio <= 0.92) addAi("Triangle", 3.2, `AI/치수 어깨·골반 비율 ${shoulderHipRatio.toFixed(2)}로 하체 폭이 우세합니다.`);
    if (shoulderHipBalanced) {
      addAi("Rectangle", 1.4, "AI/치수에서 어깨와 골반 폭이 균형 범위입니다.");
      addAi("Hourglass", 1.2);
    }

    if (waistAverageRatio <= 0.74) addAi("Hourglass", 3.1, `AI/치수 허리 비율 ${waistAverageRatio.toFixed(2)}로 허리선이 뚜렷합니다.`);
    if (waistAverageRatio > 0.74 && waistAverageRatio < 0.88) addAi("Rectangle", 1.5);
    if (waistAverageRatio >= 0.88) addAi("Oval", 3.0, `AI/치수 허리 비율 ${waistAverageRatio.toFixed(2)}로 복부 중심 실루엣 가능성이 있습니다.`);
    if (shoulderHipBalanced && waistAverageRatio <= 0.76) addAi("Hourglass", 1.4);
    if (shoulderHipBalanced && waistAverageRatio >= 0.8 && waistAverageRatio < 0.9) addAi("Rectangle", 1.2);
  }

  const combinedScores = emptyBodyScores();
  BODY_KEYS.forEach((key) => {
    combinedScores[key] = hasAiRatio ? aiScores[key] * 0.7 + surveyScores[key] * 0.3 : surveyScores[key];
  });

  const ranked = BODY_KEYS.map((key) => [key, combinedScores[key]] as [BodyKey, number]).sort((a, b) => b[1] - a[1]);
  const [primaryType, primaryScore] = ranked[0];
  const [secondaryType, secondaryScore] = ranked[1];
  const normalizedScores = normalizeBodyScores(combinedScores);
  const total = Object.values(combinedScores).reduce((sum, score) => sum + Math.max(0, score), 0) || 1;
  const primaryPercent = Math.max(0, primaryScore) / total;
  const margin = Math.max(0, primaryScore - secondaryScore);
  const confidence = clamp(0.5 + primaryPercent * 0.32 + Math.min(margin / 10, 0.16) + (hasAiRatio ? 0.08 : 0), 0.48, 0.94);
  const result = BODY_RESULTS[primaryType];

  return {
    ...result,
    confidence: Number(confidence.toFixed(2)),
    secondaryType: BODY_RESULTS[secondaryType].ko,
    scores: normalizedScores,
    aiScores: normalizeBodyScores(aiScores),
    surveyScores: normalizeBodyScores(surveyScores),
    reasons: [...new Set(reasons)].slice(0, 6),
    recommendationPoints: result.tips.slice(0, 3),
    cautionPoints: [
      `${result.ko} 체형은 비율 보완이 핵심이므로 상의·하의 중 한쪽에만 볼륨이 몰리지 않게 조절하세요.`,
      hasAiRatio ? "사진 인식값 또는 치수 입력이 부정확하면 AI 70% 반영 결과도 달라질 수 있습니다." : "AI/치수 값이 없어 설문 기반으로만 계산되었습니다.",
    ],
    blend: hasAiRatio ? { ai: 70, survey: 30 } : { ai: 0, survey: 100 },
  };
}
