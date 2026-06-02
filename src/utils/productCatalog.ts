import productDatabaseSql from "../../database/deeplook_product_database.sql?raw";
import { UserProfile } from "../types";

type ProductKind = "fashion" | "beauty";

export interface LocalProductCard {
  id: string;
  productType: ProductKind;
  title: string;
  mallName: string;
  lprice: number;
  link: string;
  image?: string;
  imagePath: string;
  recommendationReason: string;
  matchScore: number;
  category: string;
  subCategory: string;
}

interface CatalogProduct {
  id: string;
  productType: ProductKind;
  productName: string;
  brandName: string;
  genderTarget: string[];
  category: string;
  subCategory: string;
  colorGroup: string;
  personalColorType: string[];
  bodyType: string[];
  styleTag: string[];
  season: string[];
  situation: string[];
  price: number;
  imageUrl: string;
  recommendationReason: string;
  searchText: string;
}

interface LocalSearchParams {
  selectedColor: string;
  selectedSkeleton: string;
  selectedBody: string;
  userProfile: UserProfile;
}

const PERSONAL_COLOR_KEYWORDS: Record<string, string> = {
  "봄 라이트": "spring_light",
  "봄 브라이트": "spring_bright",
  "봄 트루": "spring_true",
  "여름 라이트": "summer_light",
  "여름 브라이트": "summer_bright",
  "여름 뮤트": "summer_mute",
  "가을 뮤트": "autumn_mute",
  "가을 트루": "autumn_true",
  "가을 딥": "autumn_deep",
  "겨울 브라이트": "winter_bright",
  "겨울 트루": "winter_true",
  "겨울 딥": "winter_deep",
};

const SKELETON_KEYWORDS: Record<string, string[]> = {
  스트레이트: ["straight"],
  웨이브: ["wave"],
  내추럴: ["natural"],
};

const BODY_KEYWORDS: Record<string, string> = {
  역삼각형: "inverted_triangle",
  삼각형: "pear",
  직사각형: "rectangle",
  모래시계: "hourglass",
  타원형: "oval",
};

const PURPOSE_TO_SITUATION: Record<string, string> = {
  daily: "daily",
  school: "campus",
  work: "office",
  date: "date",
  travel: "travel",
  exercise: "workout",
  interview: "interview",
  wedding: "wedding_guest",
  party: "party",
};

const STYLE_TO_TAG: Record<string, string> = {
  minimal: "minimal",
  casual: "casual",
  street: "street",
  classic: "classic",
  feminine: "feminine",
  chic: "chic",
  dandy: "dandy",
  sports: "sporty",
  luxury: "luxury",
};

const QUERY_SYNONYMS: Record<string, string[]> = {
  자켓: ["jacket", "blazer", "outer", "coat"],
  재킷: ["jacket", "blazer", "outer", "coat"],
  코트: ["coat", "outer"],
  셔츠: ["shirt", "top"],
  블라우스: ["blouse", "top"],
  티셔츠: ["t_shirt", "top"],
  니트: ["knit", "sweater", "top"],
  슬랙스: ["slacks", "bottom"],
  팬츠: ["pants", "bottom"],
  바지: ["pants", "bottom"],
  스커트: ["skirt", "bottom"],
  원피스: ["dress"],
  신발: ["shoes", "sneakers", "loafer", "boots"],
  가방: ["bag"],
  립: ["lip", "lipstick", "tint", "gloss"],
  틴트: ["tint", "lip"],
  쿠션: ["cushion", "base"],
  파운데이션: ["foundation", "base"],
  블러셔: ["blush", "cheek"],
  섀도우: ["shadow", "eye"],
  아이: ["eye"],
  베이스: ["base"],
  뷰티: ["beauty"],
  화장품: ["beauty"],
  패션: ["fashion"],
  데이트: ["date"],
  면접: ["interview"],
  직장: ["office"],
  학교: ["campus"],
  결혼식: ["wedding_guest"],
  여행: ["travel"],
  파티: ["party"],
  시크: ["chic"],
  미니멀: ["minimal"],
  캐주얼: ["casual"],
  스트릿: ["street"],
  페미닌: ["feminine"],
  러블리: ["lovely"],
  스포티: ["sporty"],
};

const splitSet = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

const extractInsertValues = (tableName: string) => {
  const match = productDatabaseSql.match(new RegExp(`INSERT INTO ${tableName}[\\s\\S]*?VALUES\\n([\\s\\S]*?);`));
  return match?.[1] ?? "";
};

const parseSqlRow = (line: string) => {
  const cleaned = line.trim().replace(/^\(/, "").replace(/\),?$/, "");
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (const char of cleaned) {
    if (char === "'") {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
};

const parseCatalog = () => {
  const fashionRows = extractInsertValues("fashion_products")
    .split("\n")
    .filter((line) => line.trim().startsWith("("));
  const beautyRows = extractInsertValues("beauty_products")
    .split("\n")
    .filter((line) => line.trim().startsWith("("));

  const fashionProducts: CatalogProduct[] = fashionRows.map((line, index) => {
    const values = parseSqlRow(line);
    const [
      productName,
      brandName,
      genderTarget,
      category,
      subCategory,
      fitType,
      colorName,
      colorGroup,
      personalColorType,
      bodyType,
      styleTag,
      season,
      situation,
      price,
      imageUrl,
      recommendationReason,
    ] = values;

    const searchText = [
      productName,
      brandName,
      category,
      subCategory,
      fitType,
      colorName,
      colorGroup,
      personalColorType,
      bodyType,
      styleTag,
      season,
      situation,
      "fashion",
      "패션",
      "상품",
    ].join(" ").toLowerCase();

    return {
      id: `fashion-${index + 1}`,
      productType: "fashion",
      productName,
      brandName,
      genderTarget: splitSet(genderTarget),
      category,
      subCategory,
      colorGroup,
      personalColorType: splitSet(personalColorType),
      bodyType: splitSet(bodyType),
      styleTag: splitSet(styleTag),
      season: splitSet(season),
      situation: splitSet(situation),
      price: Number(price),
      imageUrl,
      recommendationReason,
      searchText,
    };
  });

  const beautyProducts: CatalogProduct[] = beautyRows.map((line, index) => {
    const values = parseSqlRow(line);
    const [
      productName,
      brandName,
      genderTarget,
      category,
      subCategory,
      shadeName,
      colorGroup,
      skinTone,
      personalColorType,
      finishType,
      styleTag,
      season,
      situation,
      price,
      imageUrl,
      recommendationReason,
    ] = values;

    const searchText = [
      productName,
      brandName,
      category,
      subCategory,
      shadeName,
      colorGroup,
      skinTone,
      personalColorType,
      finishType,
      styleTag,
      season,
      situation,
      "beauty",
      "뷰티",
      "화장품",
    ].join(" ").toLowerCase();

    return {
      id: `beauty-${index + 1}`,
      productType: "beauty",
      productName,
      brandName,
      genderTarget: splitSet(genderTarget),
      category,
      subCategory,
      colorGroup,
      personalColorType: splitSet(personalColorType),
      bodyType: [],
      styleTag: splitSet(styleTag),
      season: splitSet(season),
      situation: splitSet(situation),
      price: Number(price),
      imageUrl,
      recommendationReason,
      searchText,
    };
  });

  return [...fashionProducts, ...beautyProducts];
};

const catalogProducts = parseCatalog();

const includesAny = (source: string[], target: string[]) => target.some((item) => source.includes(item));

const detectPersonalColor = (query: string, selectedColor: string) => {
  const normalized = query.replace(/\s+/g, "");
  const fromQuery = Object.entries(PERSONAL_COLOR_KEYWORDS).find(([label]) => normalized.includes(label.replace(/\s+/g, "")));
  return fromQuery?.[1] ?? PERSONAL_COLOR_KEYWORDS[selectedColor] ?? "spring_light";
};

const detectSkeletonTypes = (query: string, selectedSkeleton: string) => {
  const detected = Object.entries(SKELETON_KEYWORDS)
    .filter(([label]) => query.includes(label))
    .flatMap(([, values]) => values);

  if (detected.length) return detected;

  return Object.entries(SKELETON_KEYWORDS)
    .filter(([label]) => selectedSkeleton.includes(label))
    .flatMap(([, values]) => values);
};

const detectBodyType = (query: string, selectedBody: string) => {
  const detected = Object.entries(BODY_KEYWORDS).find(([label]) => query.includes(label));
  return detected?.[1] ?? BODY_KEYWORDS[selectedBody];
};

const collectQueryTokens = (query: string) => {
  const lowered = query.toLowerCase();
  const tokens = lowered
    .split(/[\s,+/]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

  Object.entries(QUERY_SYNONYMS).forEach(([keyword, values]) => {
    if (lowered.includes(keyword)) {
      tokens.push(keyword, ...values);
    }
  });

  return Array.from(new Set(tokens));
};

const scoreProduct = (product: CatalogProduct, query: string, params: LocalSearchParams) => {
  const personalColor = detectPersonalColor(query, params.selectedColor);
  const skeletonTypes = detectSkeletonTypes(query, params.selectedSkeleton);
  const bodyType = detectBodyType(query, params.selectedBody);
  const styleTags = params.userProfile.stylePreferences.map((style) => STYLE_TO_TAG[style] ?? style);
  const situations = params.userProfile.wearingPurposes.map((purpose) => PURPOSE_TO_SITUATION[purpose] ?? purpose);
  const queryTokens = collectQueryTokens(query);
  let score = 0;

  if (product.personalColorType.includes(personalColor)) score += 36;
  if (product.genderTarget.includes(params.userProfile.gender) || product.genderTarget.includes("unisex")) score += 10;
  if (styleTags.length && includesAny(product.styleTag, styleTags)) score += 16;
  if (situations.length && includesAny(product.situation, situations)) score += 16;

  if (product.productType === "fashion") {
    if (skeletonTypes.length && includesAny(product.bodyType, skeletonTypes)) score += 18;
    if (bodyType && product.bodyType.includes(bodyType)) score += 14;
  } else {
    if (query.includes("뷰티") || query.includes("화장품") || query.includes("립") || query.includes("쿠션")) score += 10;
  }

  queryTokens.forEach((token) => {
    if (product.searchText.includes(token)) score += token.length > 3 ? 8 : 5;
  });

  return score;
};

export const searchLocalProducts = (query: string, params: LocalSearchParams): LocalProductCard[] => {
  const ranked = catalogProducts
    .map((product) => ({ product, score: scoreProduct(product, query, params) }))
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price);

  const matched = ranked.filter((item) => item.score > 0);
  const source = matched.length ? matched : ranked;

  return source.slice(0, 18).map(({ product, score }) => ({
    id: product.id,
    productType: product.productType,
    title: product.productName,
    mallName: `${product.brandName} · ${product.productType === "fashion" ? "패션 로컬 DB" : "뷰티 로컬 DB"}`,
    lprice: product.price,
    link: `#${product.id}`,
    imagePath: product.imageUrl,
    recommendationReason: product.recommendationReason,
    matchScore: score,
    category: product.category,
    subCategory: product.subCategory,
  }));
};

export const LOCAL_PRODUCT_COUNT = catalogProducts.length;
