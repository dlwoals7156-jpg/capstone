import re
import traceback
from pathlib import Path
from typing import Any, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Deeplook Local Recommendation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
PRODUCT_SQL_PATH = BASE_DIR / "database" / "deeplook_product_database.sql"


class RecommendRequest(BaseModel):
    personal_color: str
    personal_color_detail: Optional[str] = None
    user_prompt: str
    skeleton_type: Optional[str] = "스트레이트"
    body_shape: Optional[str] = "모래시계"
    gender: Optional[str] = "female"
    height: Optional[float] = None
    weight: Optional[float] = None
    body_features: dict[str, Any] = Field(default_factory=dict)
    style_preferences: list[str] = Field(default_factory=list)
    wearing_purposes: list[str] = Field(default_factory=list)


PERSONAL_COLOR_KEYS = {
    "봄라이트": "spring_light",
    "봄브라이트": "spring_bright",
    "봄트루": "spring_true",
    "여름라이트": "summer_light",
    "여름브라이트": "summer_bright",
    "여름뮤트": "summer_mute",
    "가을뮤트": "autumn_mute",
    "가을트루": "autumn_true",
    "가을딥": "autumn_deep",
    "겨울브라이트": "winter_bright",
    "겨울트루": "winter_true",
    "겨울딥": "winter_deep",
}

SEASON_DEFAULT_COLOR = {
    "봄": "spring_light",
    "여름": "summer_light",
    "가을": "autumn_mute",
    "겨울": "winter_deep",
}

SKELETON_KEYS = {
    "스트레이트": "straight",
    "웨이브": "wave",
    "내추럴": "natural",
}

BODY_KEYS = {
    "역삼각형": "inverted_triangle",
    "삼각형": "pear",
    "직사각형": "rectangle",
    "모래시계": "hourglass",
    "타원형": "oval",
}

STYLE_KEYS = {
    "minimal": "minimal",
    "casual": "casual",
    "street": "street",
    "classic": "classic",
    "feminine": "feminine",
    "chic": "chic",
    "dandy": "dandy",
    "sports": "sporty",
    "sporty": "sporty",
    "luxury": "luxury",
    "modern": "modern",
    "natural": "natural",
    "elegant": "elegant",
    "lovely": "lovely",
}

PURPOSE_KEYS = {
    "daily": "daily",
    "school": "campus",
    "campus": "campus",
    "work": "office",
    "office": "office",
    "date": "date",
    "travel": "travel",
    "exercise": "workout",
    "workout": "workout",
    "interview": "interview",
    "wedding": "wedding_guest",
    "wedding_guest": "wedding_guest",
    "party": "party",
}

QUERY_SYNONYMS = {
    "자켓": ["jacket", "blazer", "outer", "tailored_jacket", "cropped_jacket"],
    "재킷": ["jacket", "blazer", "outer", "tailored_jacket", "cropped_jacket"],
    "블레이저": ["blazer", "jacket", "outer"],
    "코트": ["coat", "outer", "long_coat", "trench_coat"],
    "셔츠": ["shirt", "top", "oxford_shirt", "stripe_shirt"],
    "블라우스": ["blouse", "top"],
    "티셔츠": ["t_shirt", "top"],
    "니트": ["knit", "sweater", "top", "cardigan"],
    "가디건": ["cardigan", "outer"],
    "슬랙스": ["slacks", "bottom", "wide_slacks"],
    "팬츠": ["pants", "bottom", "wide_pants", "jogger_pants"],
    "바지": ["pants", "bottom"],
    "스커트": ["skirt", "bottom"],
    "원피스": ["dress"],
    "신발": ["shoes", "sneakers", "loafer", "boots"],
    "가방": ["bag"],
    "립": ["lip", "lipstick", "tint", "lip_gloss", "lip_lacquer"],
    "틴트": ["tint", "lip"],
    "쿠션": ["cushion", "base"],
    "파운데이션": ["foundation", "base"],
    "블러셔": ["blush", "cheek"],
    "섀도우": ["shadow", "eye", "eye_palette"],
    "아이라이너": ["eyeliner", "eye"],
    "뷰티": ["beauty"],
    "화장품": ["beauty"],
    "메이크업": ["beauty"],
    "패션": ["fashion"],
    "데일리": ["daily"],
    "학교": ["campus"],
    "캠퍼스": ["campus"],
    "직장": ["office"],
    "출근": ["office"],
    "오피스": ["office"],
    "데이트": ["date"],
    "소개팅": ["date"],
    "면접": ["interview"],
    "결혼식": ["wedding_guest"],
    "하객": ["wedding_guest"],
    "여행": ["travel"],
    "파티": ["party"],
    "운동": ["workout"],
    "미니멀": ["minimal"],
    "시크": ["chic"],
    "캐주얼": ["casual"],
    "스트릿": ["street"],
    "클래식": ["classic"],
    "페미닌": ["feminine"],
    "댄디": ["dandy"],
    "스포츠": ["sporty"],
    "럭셔리": ["luxury"],
    "모던": ["modern"],
    "러블리": ["lovely"],
    "내추럴": ["natural"],
}

FASHION_ITEM_HINTS = {
    "date": ["자켓", "블라우스", "원피스"],
    "interview": ["블레이저", "셔츠", "슬랙스"],
    "office": ["셔츠", "슬랙스", "블레이저"],
    "campus": ["셔츠", "티셔츠", "가디건"],
    "travel": ["팬츠", "자켓", "스니커즈"],
    "party": ["원피스", "블라우스", "스카프"],
    "wedding_guest": ["원피스", "블라우스", "스커트"],
    "daily": ["티셔츠", "셔츠", "팬츠"],
}

COLOR_GUIDE = {
    "봄": {"colors": ["코럴", "피치", "아이보리", "라이트 옐로우"], "avoid": ["탁한 그레이", "무거운 블랙"]},
    "여름": {"colors": ["라벤더", "파우더 블루", "로즈 핑크", "실버 그레이"], "avoid": ["강한 오렌지", "진한 카멜"]},
    "가을": {"colors": ["카멜", "테라코타", "올리브", "웜 브라운"], "avoid": ["퓨어 화이트", "비비드 블루"]},
    "겨울": {"colors": ["블랙", "퓨어 화이트", "로얄 블루", "버건디"], "avoid": ["흐린 파스텔", "노란기 많은 베이지"]},
}


@app.get("/")
def read_root():
    return {"status": "online", "message": "Deeplook 자체 상품 DB 추천 서버가 켜져 있습니다."}


def split_set(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


def parse_sql_row(line: str) -> list[str]:
    cleaned = line.strip().removeprefix("(").rstrip(",").removesuffix(")")
    values: list[str] = []
    current = ""
    quoted = False

    for char in cleaned:
        if char == "'":
            quoted = not quoted
            continue
        if char == "," and not quoted:
            values.append(current.strip())
            current = ""
            continue
        current += char

    values.append(current.strip())
    return values


def extract_insert_rows(sql: str, table_name: str) -> list[str]:
    match = re.search(rf"INSERT INTO {table_name}[\s\S]*?VALUES\n([\s\S]*?);", sql)
    if not match:
        return []
    return [line for line in match.group(1).splitlines() if line.strip().startswith("(")]


def load_product_catalog() -> list[dict[str, Any]]:
    sql = PRODUCT_SQL_PATH.read_text(encoding="utf-8")
    catalog: list[dict[str, Any]] = []

    for index, line in enumerate(extract_insert_rows(sql, "fashion_products"), start=1):
        values = parse_sql_row(line)
        (
            product_name,
            brand_name,
            gender_target,
            category,
            sub_category,
            fit_type,
            color_name,
            color_group,
            personal_color_type,
            body_type,
            style_tag,
            season,
            situation,
            price,
            image_url,
            recommendation_reason,
        ) = values

        search_text = " ".join(
            [
                product_name,
                brand_name,
                category,
                sub_category,
                fit_type,
                color_name,
                color_group,
                personal_color_type,
                body_type,
                style_tag,
                season,
                situation,
                "fashion 패션 상품",
            ]
        ).lower()

        catalog.append(
            {
                "id": f"fashion-{index}",
                "product_type": "fashion",
                "product_name": product_name,
                "brand_name": brand_name,
                "gender_target": split_set(gender_target),
                "category": category,
                "sub_category": sub_category,
                "color_group": color_group,
                "personal_color_type": split_set(personal_color_type),
                "body_type": split_set(body_type),
                "style_tag": split_set(style_tag),
                "season": split_set(season),
                "situation": split_set(situation),
                "price": int(price),
                "image_url": image_url,
                "recommendation_reason": recommendation_reason,
                "search_text": search_text,
            }
        )

    for index, line in enumerate(extract_insert_rows(sql, "beauty_products"), start=1):
        values = parse_sql_row(line)
        (
            product_name,
            brand_name,
            gender_target,
            category,
            sub_category,
            shade_name,
            color_group,
            skin_tone,
            personal_color_type,
            finish_type,
            style_tag,
            season,
            situation,
            price,
            image_url,
            recommendation_reason,
        ) = values

        search_text = " ".join(
            [
                product_name,
                brand_name,
                category,
                sub_category,
                shade_name,
                color_group,
                skin_tone,
                personal_color_type,
                finish_type,
                style_tag,
                season,
                situation,
                "beauty 뷰티 화장품",
            ]
        ).lower()

        catalog.append(
            {
                "id": f"beauty-{index}",
                "product_type": "beauty",
                "product_name": product_name,
                "brand_name": brand_name,
                "gender_target": split_set(gender_target),
                "category": category,
                "sub_category": sub_category,
                "color_group": color_group,
                "skin_tone": skin_tone,
                "personal_color_type": split_set(personal_color_type),
                "body_type": [],
                "style_tag": split_set(style_tag),
                "season": split_set(season),
                "situation": split_set(situation),
                "price": int(price),
                "image_url": image_url,
                "recommendation_reason": recommendation_reason,
                "search_text": search_text,
            }
        )

    return catalog


PRODUCT_CATALOG = load_product_catalog()


def detect_personal_color(request: RecommendRequest) -> str:
    text = f"{request.personal_color_detail or ''} {request.personal_color} {request.user_prompt}"
    normalized = re.sub(r"\s+", "", text)

    for label, key in PERSONAL_COLOR_KEYS.items():
        if label in normalized:
            return key

    for season, key in SEASON_DEFAULT_COLOR.items():
        if season in normalized:
            return key

    return "spring_light"


def get_season_label(request: RecommendRequest) -> str:
    text = f"{request.personal_color_detail or ''} {request.personal_color}"
    for season in ["봄", "여름", "가을", "겨울"]:
        if season in text:
            return season
    return "봄"


def detect_skeleton_keys(text: str, selected: Optional[str]) -> list[str]:
    keys = [value for label, value in SKELETON_KEYS.items() if label in text]
    if keys:
        return keys
    return [value for label, value in SKELETON_KEYS.items() if selected and label in selected]


def detect_body_key(text: str, selected: Optional[str]) -> Optional[str]:
    for label, value in BODY_KEYS.items():
        if label in text:
            return value
    for label, value in BODY_KEYS.items():
        if selected and label in selected:
            return value
    return None


def normalize_gender(gender: Optional[str], query: str) -> str:
    if any(word in query for word in ["남성", "남자", "남친", "mens", "male"]):
        return "male"
    if any(word in query for word in ["여성", "여자", "여친", "womens", "female"]):
        return "female"
    if gender in ["male", "female"]:
        return gender
    return "unisex"


def collect_query_tokens(query: str) -> list[str]:
    lowered = query.lower()
    tokens = [token.strip() for token in re.split(r"[\s,+/]+", lowered) if len(token.strip()) >= 2]

    for keyword, values in QUERY_SYNONYMS.items():
        if keyword in lowered:
            tokens.extend([keyword, *values])

    return list(dict.fromkeys(tokens))


def detect_situations(query: str, request: RecommendRequest) -> list[str]:
    situations = [PURPOSE_KEYS[purpose] for purpose in request.wearing_purposes if purpose in PURPOSE_KEYS]
    for keyword, values in QUERY_SYNONYMS.items():
        if keyword in query:
            situations.extend([value for value in values if value in PURPOSE_KEYS.values()])
    return list(dict.fromkeys(situations))


def detect_style_tags(query: str, request: RecommendRequest) -> list[str]:
    styles = [STYLE_KEYS[style] for style in request.style_preferences if style in STYLE_KEYS]
    for keyword, values in QUERY_SYNONYMS.items():
        if keyword in query:
            styles.extend([value for value in values if value in STYLE_KEYS.values()])
    return list(dict.fromkeys(styles))


def infer_items(query: str, situations: list[str]) -> list[str]:
    found = []
    for keyword in QUERY_SYNONYMS:
        if keyword in query and keyword not in ["패션", "뷰티", "화장품", "메이크업"]:
            found.append(keyword)

    if found:
        return found[:3]

    for situation in situations:
        if situation in FASHION_ITEM_HINTS:
            return FASHION_ITEM_HINTS[situation]

    return ["셔츠", "슬랙스", "립"]


def score_product(product: dict[str, Any], request: RecommendRequest) -> tuple[int, list[str]]:
    query = request.user_prompt
    personal_color = detect_personal_color(request)
    skeleton_keys = detect_skeleton_keys(query, request.skeleton_type)
    body_key = detect_body_key(query, request.body_shape)
    gender = normalize_gender(request.gender, query)
    situations = detect_situations(query, request)
    styles = detect_style_tags(query, request)
    tokens = collect_query_tokens(query)
    reasons = []
    score = 0

    if personal_color in product["personal_color_type"]:
        score += 34
        reasons.append("퍼스널컬러 팔레트와 색감이 잘 맞아요")

    if gender in product["gender_target"] or "unisex" in product["gender_target"]:
        score += 10
        reasons.append("선택한 성별/공용 착용 조건에 맞아요")

    if styles and any(style in product["style_tag"] for style in styles):
        score += 16
        reasons.append("선호 스타일 태그와 겹쳐요")

    if situations and any(situation in product["situation"] for situation in situations):
        score += 16
        reasons.append("입을 상황과 자연스럽게 연결돼요")

    if product["product_type"] == "fashion":
        if skeleton_keys and any(key in product["body_type"] for key in skeleton_keys):
            score += 18
            reasons.append("골격 타입에 맞는 핏으로 분류돼 있어요")
        if body_key and body_key in product["body_type"]:
            score += 14
            reasons.append("체형 보완 조건과도 맞아요")
    elif any(word in query for word in ["뷰티", "화장품", "메이크업", "립", "쿠션", "블러셔", "섀도우"]):
        score += 12
        reasons.append("뷰티 검색 의도와 맞는 상품이에요")

    for token in tokens:
        if token in product["search_text"]:
            score += 8 if len(token) >= 4 else 5

    if not reasons:
        reasons.append("기본 프로필과 검색어를 기준으로 가까운 후보를 골랐어요")

    return score, reasons[:4]


def search_products(request: RecommendRequest) -> list[dict[str, Any]]:
    ranked = []
    for product in PRODUCT_CATALOG:
        score, reasons = score_product(product, request)
        ranked.append({"product": product, "score": score, "reasons": reasons})

    ranked.sort(key=lambda item: (-item["score"], item["product"]["price"]))
    matched = [item for item in ranked if item["score"] > 0]
    source = matched if matched else ranked

    return [
        {
            "id": item["product"]["id"],
            "productType": item["product"]["product_type"],
            "title": item["product"]["product_name"],
            "mallName": f"{item['product']['brand_name']} · 자체 상품 DB",
            "lprice": item["product"]["price"],
            "link": f"#{item['product']['id']}",
            "imagePath": item["product"]["image_url"],
            "recommendationReason": item["product"]["recommendation_reason"],
            "matchScore": item["score"],
            "matchReasons": item["reasons"],
            "category": item["product"]["category"],
            "subCategory": item["product"]["sub_category"],
        }
        for item in source[:12]
    ]


def get_color_guidance(request: RecommendRequest) -> dict[str, list[str]]:
    season = get_season_label(request)
    return COLOR_GUIDE.get(season, COLOR_GUIDE["봄"])


def get_tone_best_color(request: RecommendRequest) -> str:
    guide = get_color_guidance(request)
    return guide["colors"][0]


def build_style_note(request: RecommendRequest, products: list[dict[str, Any]]) -> dict[str, Any]:
    query = request.user_prompt.strip() or "맞춤 추천"
    situations = detect_situations(query, request)
    styles = detect_style_tags(query, request)
    target_items = infer_items(query, situations)
    gender = normalize_gender(request.gender, query)
    gender_label = {"male": "남성", "female": "여성", "unisex": "공용"}.get(gender, "공용")
    personal_color_label = request.personal_color_detail or request.personal_color
    top_item = products[0]["title"] if products else "기본 아이템"
    situation_text = situations[0] if situations else "daily"
    style_text = ", ".join(styles[:3]) if styles else "사용자 취향"

    reason = (
        f"'{query}' 요청은 {situation_text} 상황에서 바로 입거나 사용할 수 있는 후보를 먼저 봤어요. "
        f"{personal_color_label}, {request.skeleton_type}, {request.body_shape} 정보를 함께 놓고 보니 "
        f"첫 번째로는 '{top_item}'이 가장 자연스럽습니다. "
        f"스타일은 {style_text} 흐름을 살리되, 너무 과하게 꾸민 느낌보다 실제로 고르기 쉬운 상품을 앞쪽에 배치했어요."
    )

    return {
        "gender": gender_label,
        "keywords": target_items,
        "target_colors": [get_tone_best_color(request)],
        "body_shape": request.body_shape,
        "skeleton_type": request.skeleton_type,
        "style_preferences": styles,
        "wearing_purposes": situations,
        "reason": reason,
    }


@app.post("/recommend")
def recommend_fashion(request: RecommendRequest):
    try:
        products = search_products(request)
        color_guide = get_color_guidance(request)
        ai_analysis = build_style_note(request, products)

        return {
            "ai_analysis": ai_analysis,
            "color_guide": {
                "personal_color": request.personal_color_detail or request.personal_color,
                "recommended_colors": color_guide["colors"],
                "avoided_colors": color_guide["avoid"],
            },
            "real_products": products,
            "source": "local_product_database",
            "catalog_size": len(PRODUCT_CATALOG),
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
