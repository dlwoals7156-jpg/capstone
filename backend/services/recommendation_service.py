import json
import re
from html import escape
from typing import Any
from urllib.parse import quote_plus

from backend.app.config import PRODUCT_CATALOG_JSON_PATH, PRODUCT_SQL_PATH, PUBLIC_API_BASE_URL
from backend.models.schemas import RecommendRequest


# The recommendation service owns product catalog loading and scoring.
# Route handlers call this layer instead of touching SQL/product logic directly.
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
    "straight": "straight",
    "웨이브": "wave",
    "wave": "wave",
    "내추럴": "natural",
    "natural": "natural",
}
BODY_KEYS = {
    "역삼각형": "inverted_triangle",
    "invertedtriangle": "inverted_triangle",
    "inverted_triangle": "inverted_triangle",
    "삼각형": "pear",
    "triangle": "pear",
    "pear": "pear",
    "직사각형": "rectangle",
    "rectangle": "rectangle",
    "모래시계": "hourglass",
    "hourglass": "hourglass",
    "타원형": "oval",
    "oval": "oval",
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

COLOR_SWATCHES = {
    "black": "#191817",
    "white": "#F8F7F2",
    "ivory": "#F3E8D0",
    "beige": "#CDBB9C",
    "brown": "#76513E",
    "gray": "#8D8F91",
    "navy": "#1E2D48",
    "blue": "#316CA8",
    "green": "#6F7F55",
    "pink": "#DDA1AE",
    "red": "#A63434",
    "coral": "#E68C76",
    "orange": "#C6753E",
    "purple": "#6F537B",
    "yellow": "#E7C85B",
    "khaki": "#707054",
    "burgundy": "#743144",
    "silver": "#C8C8C6",
    "gold": "#CBAA59",
    "clear": "#E9EEF2",
}

CATEGORY_LABELS = {
    "top": "TOP",
    "bottom": "BOTTOM",
    "outer": "OUTER",
    "dress": "DRESS",
    "shoes": "SHOES",
    "bag": "BAG",
    "accessory": "ACC",
    "base": "BASE",
    "lip": "LIP",
    "eye": "EYE",
    "cheek": "CHEEK",
    "skin_care": "SKIN",
    "tool": "TOOL",
}

COLOR_GUIDE = {
    "봄": {"colors": ["코럴", "피치", "아이보리", "라이트 옐로우"], "avoid": ["탁한 그레이", "무거운 블랙"]},
    "여름": {"colors": ["라벤더", "파우더 블루", "로즈 핑크", "실버 그레이"], "avoid": ["강한 오렌지", "진한 카멜"]},
    "가을": {"colors": ["카멜", "테라코타", "올리브", "웜 브라운"], "avoid": ["퓨어 화이트", "비비드 블루"]},
    "겨울": {"colors": ["블랙", "퓨어 화이트", "로얄 블루", "버건디"], "avoid": ["흐린 파스텔", "노란기 많은 베이지"]},
}


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
    if PRODUCT_CATALOG_JSON_PATH.exists():
        return json.loads(PRODUCT_CATALOG_JSON_PATH.read_text(encoding="utf-8"))

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
        search_text = " ".join(values[:13] + ["fashion 패션 상품"]).lower()
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
                "product_url": None,
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
        search_text = " ".join(values[:13] + ["beauty 뷰티 화장품"]).lower()
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
                "product_url": None,
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


def detect_skeleton_keys(text: str, selected: str | None) -> list[str]:
    normalized = text.lower().replace(" ", "").replace("-", "_")
    keys = [value for label, value in SKELETON_KEYS.items() if label in normalized or label in text]
    if keys:
        return keys
    selected_normalized = (selected or "").lower().replace(" ", "").replace("-", "_")
    return [value for label, value in SKELETON_KEYS.items() if label in selected_normalized or (selected and label in selected)]


def detect_body_key(text: str, selected: str | None) -> str | None:
    normalized = text.lower().replace(" ", "").replace("-", "_")
    for label, value in BODY_KEYS.items():
        if label in normalized or label in text:
            return value
    selected_normalized = (selected or "").lower().replace(" ", "").replace("-", "_")
    for label, value in BODY_KEYS.items():
        if label in selected_normalized or (selected and label in selected):
            return value
    return None


def normalize_gender(gender: str | None, query: str) -> str:
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


def detect_situations(query: str) -> list[str]:
    situations = []
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


def clamp_number(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def camera_quality_penalty(request: RecommendRequest) -> int:
    quality = request.camera_quality or {}
    penalty = 0
    confidence = quality.get("confidence")
    if isinstance(confidence, (int, float)) and confidence < 0.62:
        penalty += 8
    warnings = quality.get("warnings") or []
    if isinstance(warnings, list):
        penalty += min(8, len(warnings) * 2)
    metrics = quality.get("metrics") or {}
    if isinstance(metrics, dict):
        if float(metrics.get("shadowVariance") or 0) > 38:
            penalty += 5
        skin_pixel_ratio = metrics.get("skinPixelRatio")
        if skin_pixel_ratio is not None and float(skin_pixel_ratio) < 0.24:
            penalty += 5
    camera_frame = quality.get("cameraFrame") or {}
    if isinstance(camera_frame, dict):
        failed_checks = camera_frame.get("failedChecks") or []
        if isinstance(failed_checks, list):
            penalty += min(8, len(failed_checks) * 2)
    return min(18, penalty)


def confidence_from_score(score: int, request: RecommendRequest | None = None) -> int:
    confidence = int(clamp_number(round(score), 32, 98))
    if request:
        confidence -= camera_quality_penalty(request)
    return int(clamp_number(confidence, 28, 98))


def build_search_keywords(product: dict[str, Any], request: RecommendRequest) -> list[str]:
    personal_color = request.personal_color_detail or request.personal_color
    styles = detect_style_tags(request.user_prompt, request)
    style_text = " ".join(styles[:2])
    keywords = [
        f"{personal_color} {product['product_name']}",
        f"{personal_color} {product['sub_category']} 추천",
        f"{request.skeleton_type or ''} {request.body_shape or ''} {product['category']} 코디".strip(),
    ]
    if style_text:
        keywords.insert(1, f"{style_text} {product['product_name']}")
    return list(dict.fromkeys([keyword for keyword in keywords if keyword.strip()]))


def build_external_search_url(keyword: str) -> str:
    return f"https://search.shopping.naver.com/search/all?query={quote_plus(keyword)}"


def product_image_url(product_id: str) -> str:
    return f"{PUBLIC_API_BASE_URL}/product-images/{product_id}.svg"


def resolve_product_url(product_url: str | None) -> str | None:
    if not product_url:
        return None
    if product_url.startswith("/"):
        return f"{PUBLIC_API_BASE_URL}{product_url}"
    return product_url


def score_product(product: dict[str, Any], request: RecommendRequest) -> tuple[int, list[str]]:
    query = request.user_prompt
    personal_color = detect_personal_color(request)
    skeleton_keys = detect_skeleton_keys(query, request.skeleton_type)
    body_key = detect_body_key(query, request.body_shape)
    gender = normalize_gender(request.gender, query)
    situations = detect_situations(query)
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
        reasons.append("검색어에 담긴 상황 맥락과 자연스럽게 연결돼요")
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
        build_product_response(item["product"], item["score"], item["reasons"], request)
        for item in source[:12]
    ]


def build_product_response(product: dict[str, Any], score: int, reasons: list[str], request: RecommendRequest) -> dict[str, Any]:
    search_keywords = build_search_keywords(product, request)
    fallback_url = build_external_search_url(search_keywords[0])
    product_url = resolve_product_url(product.get("product_url"))
    link = product_url or fallback_url
    return {
        "id": product["id"],
        "productType": product["product_type"],
        "title": product["product_name"],
        "mallName": f"{product['brand_name']} · 자체 상품 DB",
        "lprice": product["price"],
        "productUrl": product_url,
        "externalSearchUrl": fallback_url,
        "externalSearchKeywords": search_keywords,
        "link": link,
        "linkType": "product_url" if product_url else "search_fallback",
        "image": product_image_url(product["id"]),
        "imagePath": product["image_url"],
        "recommendationReason": product["recommendation_reason"],
        "matchScore": score,
        "matchConfidence": confidence_from_score(score, request),
        "matchReasons": reasons,
        "category": product["category"],
        "subCategory": product["sub_category"],
        "colorGroup": product["color_group"],
        "brandName": product["brand_name"],
    }


def get_color_guidance(request: RecommendRequest) -> dict[str, list[str]]:
    return COLOR_GUIDE.get(get_season_label(request), COLOR_GUIDE["봄"])


def build_style_note(request: RecommendRequest, products: list[dict[str, Any]]) -> dict[str, Any]:
    query = request.user_prompt.strip() or "맞춤 추천"
    situations = detect_situations(query)
    styles = detect_style_tags(query, request)
    top_item = products[0]["title"] if products else "기본 아이템"
    top_confidence = products[0].get("matchConfidence", 0) if products else 0
    context_sentence = (
        f"'{query}' 요청에서 {situations[0]} 맥락을 감지했어요."
        if situations
        else f"'{query}' 요청은 선택한 스타일과 진단 결과를 중심으로 봤어요."
    )
    style_text = ", ".join(styles[:3]) if styles else "사용자 취향"
    personal_color_label = request.personal_color_detail or request.personal_color
    guide = get_color_guidance(request)
    quality = request.camera_quality or {}
    quality_text = ""
    if quality.get("qualityLabel"):
        quality_text = f" 카메라 품질({quality['qualityLabel']})과 경고 개수도 추천 신뢰도에 반영했습니다."
    return {
        "gender": normalize_gender(request.gender, query),
        "keywords": infer_items(query, situations),
        "target_colors": [guide["colors"][0]],
        "body_shape": request.body_shape,
        "skeleton_type": request.skeleton_type,
        "style_preferences": styles,
        "detected_contexts": situations,
        "match_confidence": top_confidence,
        "search_mode": "direct_product_match" if top_confidence >= 60 else "fallback_search_assisted",
        "external_search_keywords": products[0].get("externalSearchKeywords", infer_items(query, situations)) if products else infer_items(query, situations),
        "reason": (
            f"{context_sentence} "
            f"{personal_color_label}, {request.skeleton_type}, {request.body_shape} 정보를 백엔드 점수로 계산한 결과 "
            f"'{top_item}'이 {top_confidence}% 매칭으로 가장 자연스럽습니다. 스타일은 {style_text} 흐름을 살리되 실제로 고르기 쉬운 상품을 앞쪽에 배치했어요.{quality_text}"
        ),
    }


def build_recommendation_response(request: RecommendRequest) -> dict[str, Any]:
    products = search_products(request)
    color_guide = get_color_guidance(request)
    return {
        "ai_analysis": build_style_note(request, products),
        "color_guide": {
            "personal_color": request.personal_color_detail or request.personal_color,
            "recommended_colors": color_guide["colors"],
            "avoided_colors": color_guide["avoid"],
        },
        "real_products": products,
        "source": "local_product_database",
        "catalog_size": len(PRODUCT_CATALOG),
    }


def find_product(product_id: str) -> dict[str, Any] | None:
    return next((product for product in PRODUCT_CATALOG if product["id"] == product_id), None)


def generate_product_svg(product_id: str) -> str:
    product = find_product(product_id) or {
        "product_name": "DeepLook Product",
        "brand_name": "DeepLook",
        "product_type": "fashion",
        "category": "top",
        "sub_category": "item",
        "color_group": "gray",
    }
    base = COLOR_SWATCHES.get(product.get("color_group"), "#D8D2C8")
    category = product.get("category", "top")
    category_label = CATEGORY_LABELS.get(category, str(category).upper())
    title = escape(str(product["product_name"]))
    brand = escape(str(product["brand_name"]))

    if product.get("product_type") == "beauty":
        object_markup = f"""
        <ellipse cx="300" cy="360" rx="118" ry="42" fill="rgba(0,0,0,0.10)"/>
        <rect x="232" y="168" width="136" height="236" rx="32" fill="{base}"/>
        <rect x="248" y="132" width="104" height="74" rx="26" fill="#1A1A1A"/>
        <rect x="262" y="222" width="76" height="124" rx="18" fill="rgba(255,255,255,0.34)"/>
        <circle cx="300" cy="284" r="34" fill="rgba(255,255,255,0.28)"/>
        """
    elif category == "bottom":
        object_markup = f"""
        <ellipse cx="300" cy="390" rx="132" ry="34" fill="rgba(0,0,0,0.10)"/>
        <path d="M232 136h136l-18 276h-70l-8-180-8 180h-70z" fill="{base}"/>
        <path d="M232 136h136v44H232z" fill="rgba(255,255,255,0.22)"/>
        <path d="M272 170v242" stroke="rgba(0,0,0,0.20)" stroke-width="7"/>
        """
    elif category == "outer":
        object_markup = f"""
        <ellipse cx="300" cy="390" rx="146" ry="34" fill="rgba(0,0,0,0.10)"/>
        <path d="M194 174l62-42h88l62 42 38 232h-90l-24-164-30 76-30-76-24 164h-90z" fill="{base}"/>
        <path d="M256 132l44 186 44-186" fill="none" stroke="rgba(255,255,255,0.46)" stroke-width="10"/>
        <path d="M300 318v88" stroke="rgba(0,0,0,0.18)" stroke-width="8"/>
        """
    elif category == "dress":
        object_markup = f"""
        <ellipse cx="300" cy="390" rx="136" ry="34" fill="rgba(0,0,0,0.10)"/>
        <path d="M254 128h92l28 122 64 162H162l64-162z" fill="{base}"/>
        <path d="M254 128l46 112 46-112" fill="rgba(255,255,255,0.22)"/>
        <path d="M214 276h172" stroke="rgba(0,0,0,0.16)" stroke-width="8"/>
        """
    elif category == "shoes":
        object_markup = f"""
        <ellipse cx="300" cy="386" rx="152" ry="34" fill="rgba(0,0,0,0.10)"/>
        <path d="M146 314c74 10 126-14 166-64 18 42 72 76 144 86 10 48-18 70-84 64H178c-44-2-56-32-32-86z" fill="{base}"/>
        <path d="M210 334h218" stroke="rgba(255,255,255,0.38)" stroke-width="10"/>
        """
    elif category == "bag":
        object_markup = f"""
        <ellipse cx="300" cy="394" rx="130" ry="32" fill="rgba(0,0,0,0.10)"/>
        <rect x="184" y="202" width="232" height="188" rx="36" fill="{base}"/>
        <path d="M236 214c0-62 128-62 128 0" fill="none" stroke="#1A1A1A" stroke-width="18"/>
        <rect x="220" y="246" width="160" height="78" rx="22" fill="rgba(255,255,255,0.22)"/>
        """
    else:
        object_markup = f"""
        <ellipse cx="300" cy="390" rx="136" ry="34" fill="rgba(0,0,0,0.10)"/>
        <path d="M208 158l54-34h76l54 34 46 70-64 42-22-38v176H248V232l-22 38-64-42z" fill="{base}"/>
        <path d="M262 124l38 64 38-64" fill="rgba(255,255,255,0.24)"/>
        <path d="M248 232h104" stroke="rgba(0,0,0,0.14)" stroke-width="8"/>
        """

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#F8F6F0"/>
          <stop offset="1" stop-color="#E7E1D8"/>
        </linearGradient>
      </defs>
      <rect width="600" height="800" fill="url(#bg)"/>
      <rect x="52" y="54" width="496" height="692" rx="32" fill="rgba(255,255,255,0.46)" stroke="rgba(0,0,0,0.08)"/>
      <text x="76" y="104" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#191817">{brand}</text>
      <text x="76" y="136" font-family="Arial, sans-serif" font-size="15" letter-spacing="3" fill="rgba(0,0,0,0.42)">{category_label}</text>
      {object_markup}
      <rect x="76" y="602" width="80" height="80" rx="20" fill="{base}" stroke="rgba(0,0,0,0.12)"/>
      <text x="176" y="626" font-family="Arial, sans-serif" font-size="25" font-weight="700" fill="#191817">{title}</text>
      <text x="176" y="662" font-family="Arial, sans-serif" font-size="16" fill="rgba(0,0,0,0.48)">AI matched product visual</text>
      <text x="76" y="710" font-family="Arial, sans-serif" font-size="14" letter-spacing="4" fill="rgba(0,0,0,0.35)">DEEPLOOK LOCAL DB</text>
    </svg>"""


def generate_product_detail_html(product_id: str) -> str:
    product = find_product(product_id)
    if not product:
        title = "DeepLook Product Not Found"
        body = "<main class=\"page\"><section class=\"content\"><h1>상품 정보를 찾을 수 없습니다.</h1></section></main>"
    else:
        title = escape(str(product["product_name"]))
        brand = escape(str(product["brand_name"]))
        reason = escape(str(product.get("recommendation_reason", "")))
        category = escape(str(product.get("category", "")))
        sub_category = escape(str(product.get("sub_category", "")))
        price = f"{int(product.get('price', 0)):,}원"
        image = product_image_url(product_id)
        body = f"""
        <main class="page">
          <img class="image" src="{image}" alt="{title}" />
          <section class="content">
            <p class="eyebrow">DeepLook Local Product DB</p>
            <h1>{title}</h1>
            <p class="brand">{brand} · {category} / {sub_category}</p>
            <p class="price">{price}</p>
            <div class="box">
              <p class="label">Recommendation Reason</p>
              <p>{reason}</p>
            </div>
          </section>
        </main>
        """

    return f"""<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title} · DeepLook</title>
  <style>
    body {{ margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #111; background: #fff; }}
    .page {{ max-width: 980px; margin: 0 auto; padding: 40px 20px; display: grid; gap: 28px; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); }}
    .image {{ width: 100%; border: 1px solid rgba(0,0,0,.08); border-radius: 8px; background: #f7f7f7; }}
    .content {{ padding: 8px 0; }}
    .eyebrow {{ font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: rgba(0,0,0,.38); }}
    h1 {{ margin: 12px 0 0; font-weight: 300; font-size: clamp(32px, 5vw, 56px); letter-spacing: 0; }}
    .brand {{ margin-top: 12px; color: rgba(0,0,0,.55); }}
    .price {{ margin-top: 24px; font-size: 24px; font-weight: 600; }}
    .box {{ margin-top: 28px; border: 1px solid rgba(0,0,0,.1); border-radius: 8px; padding: 18px; line-height: 1.7; color: rgba(0,0,0,.65); }}
    .label {{ margin: 0 0 8px; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: rgba(0,0,0,.35); }}
    @media (max-width: 720px) {{ .page {{ grid-template-columns: 1fr; padding-top: 20px; }} }}
  </style>
</head>
<body>{body}</body>
</html>"""
