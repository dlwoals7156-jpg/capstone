import json
import re
from functools import lru_cache
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
    "미니멀": "minimal",
    "캐주얼": "casual",
    "스트릿": "street",
    "클래식": "classic",
    "페미닌": "feminine",
    "시크": "chic",
    "댄디": "dandy",
    "스포츠": "sporty",
    "럭셔리": "luxury",
    "모던": "modern",
    "러블리": "lovely",
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
    "블랙": ["black", "검정", "검은색"],
    "검정": ["black", "블랙", "검은색"],
    "검은": ["black", "블랙", "검정"],
    "black": ["black", "블랙", "검정"],
    "화이트": ["white", "흰색", "하얀색"],
    "흰색": ["white", "화이트", "아이보리"],
    "white": ["white", "화이트", "흰색"],
    "아이보리": ["ivory", "cream", "크림"],
    "크림": ["ivory", "cream", "아이보리"],
    "베이지": ["beige", "sand", "taupe"],
    "카멜": ["brown", "beige", "camel"],
    "브라운": ["brown", "초콜릿", "에스프레소"],
    "brown": ["brown", "브라운", "카멜"],
    "네이비": ["navy", "딥 네이비"],
    "navy": ["navy", "네이비"],
    "그레이": ["gray", "grey", "차콜"],
    "차콜": ["gray", "grey", "그레이"],
    "gray": ["gray", "grey", "그레이"],
    "핑크": ["pink", "로즈"],
    "pink": ["pink", "핑크", "로즈"],
    "레드": ["red", "빨강", "루비"],
    "red": ["red", "레드", "빨강"],
    "블루": ["blue", "파랑", "네이비"],
    "blue": ["blue", "블루", "파랑"],
    "그린": ["green", "초록", "올리브", "카키"],
    "카키": ["khaki", "olive", "올리브"],
    "올리브": ["khaki", "green", "카키"],
    "purple": ["purple", "퍼플", "보라", "라벤더"],
    "퍼플": ["purple", "보라", "라벤더"],
    "자켓": ["jacket", "blazer", "outer", "tailored_jacket", "cropped_jacket"],
    "재킷": ["jacket", "blazer", "outer", "tailored_jacket", "cropped_jacket"],
    "jacket": ["자켓", "재킷", "outer", "tailored_jacket", "cropped_jacket"],
    "블레이저": ["blazer", "jacket", "outer"],
    "blazer": ["블레이저", "자켓", "outer"],
    "코트": ["coat", "outer", "long_coat", "trench_coat"],
    "coat": ["코트", "outer", "long_coat", "trench_coat"],
    "셔츠": ["shirt", "top", "oxford_shirt", "stripe_shirt"],
    "shirt": ["셔츠", "top", "oxford_shirt", "stripe_shirt"],
    "블라우스": ["blouse", "top"],
    "blouse": ["블라우스", "top"],
    "티셔츠": ["t_shirt", "top"],
    "tshirt": ["티셔츠", "t_shirt", "top"],
    "t-shirt": ["티셔츠", "t_shirt", "top"],
    "니트": ["knit", "sweater", "top", "cardigan"],
    "knit": ["니트", "sweater", "cardigan"],
    "가디건": ["cardigan", "outer"],
    "cardigan": ["가디건", "outer"],
    "슬랙스": ["slacks", "bottom", "wide_slacks"],
    "slacks": ["슬랙스", "bottom", "wide_slacks"],
    "팬츠": ["pants", "bottom", "wide_pants", "jogger_pants"],
    "바지": ["pants", "bottom"],
    "pants": ["팬츠", "바지", "bottom"],
    "스커트": ["skirt", "bottom"],
    "skirt": ["스커트", "bottom"],
    "원피스": ["dress"],
    "dress": ["원피스"],
    "신발": ["shoes", "sneakers", "loafer", "boots"],
    "shoes": ["신발", "sneakers", "loafer", "boots"],
    "sneakers": ["스니커즈", "신발", "shoes"],
    "boots": ["부츠", "신발", "shoes"],
    "가방": ["bag"],
    "bag": ["가방"],
    "립": ["lip", "lipstick", "tint", "lip_gloss", "lip_lacquer"],
    "lip": ["립", "lipstick", "tint", "lip_gloss", "lip_lacquer"],
    "틴트": ["tint", "lip"],
    "tint": ["틴트", "lip"],
    "쿠션": ["cushion", "base"],
    "cushion": ["쿠션", "base"],
    "파운데이션": ["foundation", "base"],
    "foundation": ["파운데이션", "base"],
    "블러셔": ["blush", "cheek"],
    "blush": ["블러셔", "cheek"],
    "섀도우": ["shadow", "eye", "eye_palette"],
    "shadow": ["섀도우", "eye", "eye_palette"],
    "아이라이너": ["eyeliner", "eye"],
    "eyeliner": ["아이라이너", "eye"],
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

GENERIC_QUERY_WORDS = {
    "추천",
    "어울리는",
    "맞는",
    "입을",
    "찾아줘",
    "보여줘",
    "코디",
    "상품",
    "아이템",
    "스타일",
    "룩",
}

COLOR_GROUP_LABELS = {
    "black": "블랙",
    "white": "화이트",
    "ivory": "아이보리",
    "beige": "베이지",
    "brown": "브라운",
    "gray": "그레이",
    "navy": "네이비",
    "blue": "블루",
    "green": "그린",
    "pink": "핑크",
    "red": "레드",
    "coral": "코랄",
    "orange": "오렌지",
    "purple": "퍼플",
    "yellow": "옐로우",
    "khaki": "카키",
    "burgundy": "버건디",
    "silver": "실버",
    "gold": "골드",
    "clear": "클리어",
}

CATEGORY_SEARCH_LABELS = {
    "top": "상의",
    "bottom": "하의",
    "outer": "아우터",
    "dress": "원피스",
    "shoes": "신발",
    "bag": "가방",
    "accessory": "액세서리",
    "base": "베이스",
    "lip": "립",
    "eye": "아이",
    "cheek": "치크",
    "skin_care": "스킨케어",
    "slacks": "슬랙스",
    "tailored_jacket": "자켓",
    "linen_shirt": "셔츠",
    "cardigan": "가디건",
    "pleated_skirt": "스커트",
    "wide_pants": "팬츠",
    "utility_jacket": "자켓",
    "wrap_dress": "원피스",
    "denim": "데님",
    "knit_vest": "니트",
    "oxford_shirt": "셔츠",
    "cropped_jacket": "자켓",
    "rib_knit": "니트",
    "blouse": "블라우스",
    "mini_dress": "원피스",
    "ankle_boots": "부츠",
    "loafer": "로퍼",
    "tote_bag": "가방",
    "knit_top": "니트",
    "midi_skirt": "스커트",
    "cargo_pants": "팬츠",
    "satin_blouse": "블라우스",
    "long_coat": "코트",
    "trench_coat": "코트",
    "shoulder_bag": "가방",
    "h_line_skirt": "스커트",
    "t_shirt": "티셔츠",
    "shirt_jacket": "자켓",
    "knit_dress": "원피스",
    "cropped_shirt": "셔츠",
    "flat_shoes": "신발",
    "sweater": "니트",
    "hoodie": "후디",
    "jogger_pants": "팬츠",
    "blazer": "자켓",
    "tie_blouse": "블라우스",
    "sneakers": "스니커즈",
    "straight_coat": "코트",
    "stripe_shirt": "셔츠",
    "structured_dress": "원피스",
    "cargo_skirt": "스커트",
    "knit_polo": "니트",
    "lipstick": "립스틱",
    "tint": "틴트",
    "powder_blush": "블러셔",
    "tone_up_base": "베이스",
    "cushion": "쿠션",
    "foundation": "파운데이션",
    "single_shadow": "섀도우",
    "highlighter": "하이라이터",
    "lip_gloss": "립글로스",
    "eyeliner": "아이라이너",
    "mascara": "마스카라",
    "brow_pencil": "브로우",
    "concealer": "컨실러",
    "liquid_blush": "블러셔",
    "cream_blush": "블러셔",
    "makeup_base": "베이스",
    "contour": "컨투어",
    "eye_palette": "섀도우",
    "powder": "파우더",
    "fixing_spray": "픽싱 스프레이",
    "brow_gel": "브로우",
    "lip_pencil": "립펜슬",
    "tone_up_sunscreen": "선크림",
    "primer": "프라이머",
    "brow_wax": "브로우",
    "lip_lacquer": "립",
}

POPULAR_SEARCHES = [
    "블랙 자켓",
    "가을 코트",
    "겨울 딥 립",
    "미니멀 셔츠",
    "시크 슬랙스",
    "데이트 원피스",
    "내추럴 셔츠",
    "브라운 코트",
]

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


@lru_cache(maxsize=8192)
def _normalize_search_text_cached(value: str) -> str:
    text = value.replace("_", " ").replace("-", " ").lower()
    return re.sub(r"\s+", " ", text).strip()


def normalize_search_text(value: Any) -> str:
    return _normalize_search_text_cached(str(value or ""))


@lru_cache(maxsize=8192)
def _compact_search_text_cached(value: str) -> str:
    return re.sub(r"[\s_+\-/]+", "", normalize_search_text(value))


def compact_search_text(value: Any) -> str:
    return _compact_search_text_cached(str(value or ""))


def query_contains(query: str, keyword: str) -> bool:
    normalized_query = normalize_search_text(query)
    compact_query = compact_search_text(query)
    normalized_keyword = normalize_search_text(keyword)
    compact_keyword = compact_search_text(keyword)
    return bool(
        normalized_keyword
        and (
            normalized_keyword in normalized_query
            or compact_keyword in compact_query
        )
    )


def unique_list(values: list[str]) -> list[str]:
    unique: list[str] = []
    seen: set[str] = set()
    for value in values:
        normalized = normalize_search_text(value)
        if normalized and normalized not in seen:
            unique.append(value)
            seen.add(normalized)
    return unique


def compact_match(haystack: Any, needle: Any) -> bool:
    compact_needle = compact_search_text(needle)
    return bool(compact_needle and compact_needle in compact_search_text(haystack))


def matched_terms(terms: list[str], text: Any) -> list[str]:
    matches: list[str] = []
    for term in terms:
        if len(compact_search_text(term)) >= 2 and compact_match(text, term):
            matches.append(term)
    return unique_list(matches)


def matched_terms_in_compact(terms: list[str], compact_text_value: str) -> list[str]:
    matches: list[str] = []
    for term in terms:
        compact_term = compact_search_text(term)
        if len(compact_term) >= 2 and compact_term in compact_text_value:
            matches.append(term)
    return unique_list(matches)


def collect_raw_query_tokens(query: str) -> list[str]:
    return [
        token.strip()
        for token in re.split(r"[\s,+/]+", normalize_search_text(query))
        if len(token.strip()) >= 2 and token.strip() not in GENERIC_QUERY_WORDS
    ]


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


def build_product_search_index(product: dict[str, Any]) -> dict[str, str]:
    list_fields = [
        " ".join(product.get("gender_target", [])),
        " ".join(product.get("personal_color_type", [])),
        " ".join(product.get("body_type", [])),
        " ".join(product.get("style_tag", [])),
        " ".join(product.get("season", [])),
        " ".join(product.get("situation", [])),
    ]
    color_text = f"{product.get('color_group', '')} {COLOR_GROUP_LABELS.get(product.get('color_group', ''), '')}"
    category_text = " ".join(
        [
            product.get("category", ""),
            product.get("sub_category", ""),
            CATEGORY_SEARCH_LABELS.get(product.get("category", ""), ""),
            CATEGORY_SEARCH_LABELS.get(product.get("sub_category", ""), ""),
        ]
    )
    full_text = " ".join(
        [
            product.get("product_name", ""),
            product.get("brand_name", ""),
            color_text,
            category_text,
            product.get("recommendation_reason", ""),
            product.get("search_text", ""),
            *list_fields,
        ]
    )
    return {
        "name": product.get("product_name", ""),
        "brand": product.get("brand_name", ""),
        "color": color_text,
        "category": category_text,
        "style": " ".join(product.get("style_tag", [])),
        "situation": " ".join(product.get("situation", [])),
        "full": full_text,
        "name_compact": compact_search_text(product.get("product_name", "")),
        "brand_compact": compact_search_text(product.get("brand_name", "")),
        "color_compact": compact_search_text(color_text),
        "category_compact": compact_search_text(category_text),
        "style_compact": compact_search_text(" ".join(product.get("style_tag", []))),
        "situation_compact": compact_search_text(" ".join(product.get("situation", []))),
        "full_compact": compact_search_text(full_text),
    }


def index_product_catalog(catalog: list[dict[str, Any]]) -> list[dict[str, Any]]:
    for product in catalog:
        product["_search_index"] = build_product_search_index(product)
    return catalog


PRODUCT_CATALOG = index_product_catalog(load_product_catalog())


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
    tokens = collect_raw_query_tokens(query)
    for keyword, values in QUERY_SYNONYMS.items():
        if query_contains(query, keyword):
            tokens.extend([keyword, *values])
    return unique_list([normalize_search_text(token) for token in tokens])


def detect_situations(query: str) -> list[str]:
    situations = []
    for keyword, values in QUERY_SYNONYMS.items():
        if query_contains(query, keyword):
            situations.extend([value for value in values if value in PURPOSE_KEYS.values()])
    return list(dict.fromkeys(situations))


def detect_style_tags(query: str, request: RecommendRequest) -> list[str]:
    styles = [STYLE_KEYS[style] for style in request.style_preferences if style in STYLE_KEYS]
    for keyword, values in QUERY_SYNONYMS.items():
        if query_contains(query, keyword):
            styles.extend([value for value in values if value in STYLE_KEYS.values()])
    return list(dict.fromkeys(styles))


def infer_items(query: str, situations: list[str]) -> list[str]:
    found = []
    for keyword in QUERY_SYNONYMS:
        if query_contains(query, keyword) and keyword not in ["패션", "뷰티", "화장품", "메이크업"]:
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


def product_search_text(product: dict[str, Any]) -> str:
    return product.get("_search_index", {}).get("full", product.get("search_text", ""))


def score_text_relevance(product: dict[str, Any], query: str, tokens: list[str]) -> tuple[int, list[str], dict[str, Any]]:
    query_compact = compact_search_text(query)
    if not query_compact:
        return 0, [], {"matched_terms": []}

    index = product.get("_search_index") or build_product_search_index(product)
    product_name = index.get("name", product.get("product_name", ""))
    brand_name = index.get("brand", product.get("brand_name", ""))
    name_compact = index.get("name_compact", compact_search_text(product_name))
    brand_compact = index.get("brand_compact", compact_search_text(brand_name))

    score = 0
    reasons: list[str] = []
    matched: list[str] = []

    if query_compact == name_compact:
        score += 90
        reasons.append("상품명이 검색어와 완전히 일치해요")
        matched.append(product_name)
    elif query_compact and query_compact in name_compact:
        score += 68
        reasons.append("상품명에 검색어가 직접 포함돼요")
        matched.append(product_name)
    elif name_compact and name_compact in query_compact:
        score += 46
        reasons.append("검색어가 특정 상품명을 포함하고 있어요")
        matched.append(product_name)

    if brand_compact and (query_compact == brand_compact or brand_compact in query_compact or query_compact in brand_compact):
        score += 46
        reasons.append("브랜드명이 검색어와 일치해요")
        matched.append(brand_name)

    name_matches = matched_terms_in_compact(tokens, name_compact)
    if name_matches:
        score += min(48, len(name_matches) * 18)
        if "상품명 키워드가 검색어와 맞아요" not in reasons:
            reasons.append("상품명 키워드가 검색어와 맞아요")
        matched.extend(name_matches)

    color_matches = matched_terms_in_compact(tokens, index.get("color_compact", ""))
    if color_matches:
        score += 30
        reasons.append("검색한 색상 조건과 맞아요")
        matched.extend(color_matches)

    category_matches = matched_terms_in_compact(tokens, index.get("category_compact", ""))
    if category_matches:
        score += 34
        reasons.append("검색한 아이템/카테고리와 맞아요")
        matched.extend(category_matches)

    brand_matches = matched_terms_in_compact(tokens, brand_compact)
    if brand_matches and not any("브랜드명" in reason for reason in reasons):
        score += 30
        reasons.append("브랜드명 일부가 검색어와 맞아요")
        matched.extend(brand_matches)

    style_matches = matched_terms_in_compact(tokens, index.get("style_compact", ""))
    if style_matches:
        score += 14
        reasons.append("검색한 스타일 키워드와 연결돼요")
        matched.extend(style_matches)

    situation_matches = matched_terms_in_compact(tokens, index.get("situation_compact", ""))
    if situation_matches:
        score += 12
        reasons.append("검색한 상황 키워드와 연결돼요")
        matched.extend(situation_matches)

    matched_normalized = {normalize_search_text(item) for item in matched}
    full_matches = [
        term
        for term in matched_terms_in_compact(tokens, index.get("full_compact", compact_search_text(product_search_text(product))))
        if normalize_search_text(term) not in matched_normalized
    ]
    if full_matches:
        score += min(18, len(full_matches) * 4)
        matched.extend(full_matches)

    return score, reasons[:4], {"matched_terms": unique_list(matched), "query_tokens": tokens}


def score_product(product: dict[str, Any], request: RecommendRequest) -> tuple[int, list[str], dict[str, Any]]:
    query = request.user_prompt
    personal_color = detect_personal_color(request)
    skeleton_keys = detect_skeleton_keys(query, request.skeleton_type)
    body_key = detect_body_key(query, request.body_shape)
    gender = normalize_gender(request.gender, query)
    situations = detect_situations(query)
    styles = detect_style_tags(query, request)
    tokens = collect_query_tokens(query)
    text_score, text_reasons, text_meta = score_text_relevance(product, query, tokens)
    reasons = [*text_reasons]
    profile_score = 0
    breakdown = {
        "text": text_score,
        "personal_color": 0,
        "gender": 0,
        "style": 0,
        "situation": 0,
        "skeleton": 0,
        "body_shape": 0,
        "beauty_intent": 0,
        "matched_terms": text_meta.get("matched_terms", []),
    }

    if personal_color in product["personal_color_type"]:
        profile_score += 28
        breakdown["personal_color"] = 28
        reasons.append("퍼스널컬러 팔레트와 색감이 잘 맞아요")
    if gender in product["gender_target"] or "unisex" in product["gender_target"]:
        profile_score += 8
        breakdown["gender"] = 8
        reasons.append("선택한 성별/공용 착용 조건에 맞아요")
    if styles and any(style in product["style_tag"] for style in styles):
        profile_score += 14
        breakdown["style"] = 14
        reasons.append("선호 스타일 태그와 겹쳐요")
    if situations and any(situation in product["situation"] for situation in situations):
        profile_score += 12
        breakdown["situation"] = 12
        reasons.append("검색어에 담긴 상황 맥락과 자연스럽게 연결돼요")
    if product["product_type"] == "fashion":
        if skeleton_keys and any(key in product["body_type"] for key in skeleton_keys):
            profile_score += 16
            breakdown["skeleton"] = 16
            reasons.append("골격 타입에 맞는 핏으로 분류돼 있어요")
        if body_key and body_key in product["body_type"]:
            profile_score += 14
            breakdown["body_shape"] = 14
            reasons.append("체형 보완 조건과도 맞아요")
    elif any(word in query for word in ["뷰티", "화장품", "메이크업", "립", "쿠션", "블러셔", "섀도우"]):
        profile_score += 12
        breakdown["beauty_intent"] = 12
        reasons.append("뷰티 검색 의도와 맞는 상품이에요")

    if not reasons:
        reasons.append("기본 프로필과 검색어를 기준으로 가까운 후보를 골랐어요")
    breakdown["profile"] = profile_score
    breakdown["total"] = text_score + profile_score
    return text_score + profile_score, unique_list(reasons)[:5], breakdown


def search_products(request: RecommendRequest) -> list[dict[str, Any]]:
    ranked = []
    has_specific_query = bool(collect_raw_query_tokens(request.user_prompt))
    for product in PRODUCT_CATALOG:
        score, reasons, breakdown = score_product(product, request)
        ranked.append({"product": product, "score": score, "reasons": reasons, "breakdown": breakdown})
    ranked.sort(
        key=lambda item: (
            -item["breakdown"].get("text", 0),
            -item["score"],
            item["product"]["price"],
        )
    )
    matched = [
        item
        for item in ranked
        if item["score"] > 0 and (not has_specific_query or item["breakdown"].get("text", 0) > 0 or item["breakdown"].get("situation", 0) > 0 or item["breakdown"].get("style", 0) > 0)
    ]
    source = matched if matched else ranked
    return [
        build_product_response(item["product"], item["score"], item["reasons"], request, item["breakdown"])
        for item in source[:12]
    ]


def build_product_response(product: dict[str, Any], score: int, reasons: list[str], request: RecommendRequest, breakdown: dict[str, Any]) -> dict[str, Any]:
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
        "searchRelevance": breakdown.get("text", 0),
        "rankingBreakdown": breakdown,
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
    top_search_relevance = products[0].get("searchRelevance", 0) if products else 0
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
        "search_mode": "direct_product_match" if top_search_relevance >= 45 else "profile_weighted_match",
        "search_relevance": top_search_relevance,
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


def canonical_suggestion_term(term: str) -> str:
    normalized = normalize_search_text(term)
    if normalized in COLOR_GROUP_LABELS:
        return COLOR_GROUP_LABELS[normalized]
    for color_key, color_label in COLOR_GROUP_LABELS.items():
        if normalized == color_label.lower():
            return color_label
        if normalized in [normalize_search_text(value) for value in QUERY_SYNONYMS.get(color_label, [])]:
            return color_label
        if normalized in [normalize_search_text(value) for value in QUERY_SYNONYMS.get(color_key, [])]:
            return color_label
    return term


def suggestion_query_variants(query: str) -> list[str]:
    base = compact_search_text(query)
    variants = {base}
    for keyword, values in QUERY_SYNONYMS.items():
        key_compact = compact_search_text(keyword)
        if not key_compact or key_compact not in base:
            continue
        for value in values:
            replacement = compact_search_text(canonical_suggestion_term(value))
            if replacement:
                variants.add(base.replace(key_compact, replacement))
    return [variant for variant in variants if variant]


def suggestion_score(label: str, query_variants: list[str], terms: list[str], base_weight: int) -> int:
    label_compact = compact_search_text(label)
    if not query_variants:
        return base_weight
    if any(label_compact.startswith(query_compact) for query_compact in query_variants):
        return base_weight + 120
    if any(query_compact in label_compact for query_compact in query_variants):
        return base_weight + 80
    term_hits = len(matched_terms(terms, label))
    return base_weight + (term_hits * 24)


def get_search_suggestions(query: str, limit: int = 8) -> dict[str, Any]:
    cleaned = query.strip()
    safe_limit = int(clamp_number(limit, 1, 12))
    query_variants = suggestion_query_variants(cleaned)
    query_terms = collect_query_tokens(cleaned)
    candidates: list[dict[str, Any]] = []

    def add_candidate(label: str, source: str, base_weight: int) -> None:
        normalized = normalize_search_text(label)
        if not normalized:
            return
        score = suggestion_score(label, query_variants, query_terms, base_weight)
        if cleaned and score <= base_weight:
            return
        candidates.append({"label": label, "source": source, "score": score})

    for suggestion in POPULAR_SEARCHES:
        add_candidate(suggestion, "popular", 60)

    for keyword in QUERY_SYNONYMS:
        if 1 <= len(keyword) <= 12 and not re.search(r"[a-z_]", keyword):
            add_candidate(keyword, "keyword", 48)

    for product in PRODUCT_CATALOG:
        add_candidate(product.get("product_name", ""), "product", 72)
        add_candidate(product.get("brand_name", ""), "brand", 64)
        color_label = COLOR_GROUP_LABELS.get(product.get("color_group", ""))
        item_label = CATEGORY_SEARCH_LABELS.get(product.get("sub_category", "")) or CATEGORY_SEARCH_LABELS.get(product.get("category", ""))
        if color_label and item_label:
            add_candidate(f"{color_label} {item_label}", "attribute", 58)
        if item_label:
            add_candidate(item_label, "category", 42)

    deduped: dict[str, dict[str, Any]] = {}
    for candidate in candidates:
        key = normalize_search_text(candidate["label"])
        if key not in deduped or candidate["score"] > deduped[key]["score"]:
            deduped[key] = candidate

    suggestions = sorted(deduped.values(), key=lambda item: (-item["score"], len(item["label"]), item["label"]))[:safe_limit]
    return {
        "query": cleaned,
        "suggestions": [
            {"label": item["label"], "source": item["source"]}
            for item in suggestions
        ],
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
