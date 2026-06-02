import base64
import io
import math
from typing import Any


# Backend personal-color analyzer.
# It scores 12 personal color types from skin-zone RGB samples and color-space
# metrics. The frontend sends forehead, cheek, and chin samples from the camera.

try:
    from PIL import Image
except Exception:  # pragma: no cover - Pillow is optional for local demo installs.
    Image = None


PersonalColorKey = str

PERSONAL_COLOR_RESULTS: dict[PersonalColorKey, dict[str, Any]] = {
    "springLight": {
        "id": "springLight",
        "name": "봄 라이트",
        "season": "봄",
        "sub": "Spring Light",
        "en": "Light Warm Clear",
        "desc": "밝고 투명한 피치빛이 잘 어울리는 타입입니다. 얼굴 주변은 가볍고 맑은 컬러일수록 생기가 살아납니다.",
        "colors": ["피치", "라이트 코럴", "아이보리", "크림 옐로우", "민트 그린"],
        "tips": ["검정·딥 브라운처럼 무거운 색은 얼굴에서 멀리 배치", "밝은 골드나 로즈골드 액세서리 추천", "상의는 맑고 밝은 웜 컬러 중심으로 선택"],
    },
    "springBright": {
        "id": "springBright",
        "name": "봄 브라이트",
        "season": "봄",
        "sub": "Spring Bright",
        "en": "Warm Vivid Clear",
        "desc": "맑고 선명한 웜 컬러가 피부를 가장 생동감 있게 만드는 타입입니다. 탁한 색보다 깨끗한 고채도가 강점입니다.",
        "colors": ["비비드 코럴", "애플 그린", "클리어 옐로우", "아쿠아", "웜 레드"],
        "tips": ["회색기가 섞인 뮤트 컬러는 피하기", "작은 면적의 선명한 포인트 컬러 활용", "화이트보다 크림·아이보리 베이스 추천"],
    },
    "springTrue": {
        "id": "springTrue",
        "name": "봄 트루",
        "season": "봄",
        "sub": "True Spring",
        "en": "True Warm Fresh",
        "desc": "따뜻하고 맑은 봄 색을 폭넓게 소화하는 타입입니다. 노란기와 생기 있는 색감이 얼굴을 편안하게 보이게 합니다.",
        "colors": ["코랄 핑크", "웜 베이지", "선라이트 옐로우", "라이트 카멜", "웜 그린"],
        "tips": ["차갑고 푸른 색은 얼굴을 창백하게 만들 수 있음", "골드 계열 주얼리와 궁합 좋음", "따뜻한 밝기와 중간 채도를 유지"],
    },
    "summerLight": {
        "id": "summerLight",
        "name": "여름 라이트",
        "season": "여름",
        "sub": "Summer Light",
        "en": "Light Cool Soft",
        "desc": "밝고 시원한 파스텔 계열이 잘 맞는 타입입니다. 부드러운 쿨 컬러가 피부를 맑고 깨끗하게 보여줍니다.",
        "colors": ["파우더 블루", "라이트 라벤더", "쿨 핑크", "소프트 민트", "실버 그레이"],
        "tips": ["어둡고 강한 대비는 줄이기", "실버·화이트골드 액세서리 추천", "상하의 대비보다 은은한 톤온톤 추천"],
    },
    "summerBright": {
        "id": "summerBright",
        "name": "여름 브라이트",
        "season": "여름",
        "sub": "Summer Bright",
        "en": "Cool Clear Bright",
        "desc": "차갑고 맑은 컬러 중에서도 적당히 선명한 색이 잘 어울립니다. 여름의 부드러움과 겨울의 깨끗함이 함께 보입니다.",
        "colors": ["쿨 체리 핑크", "아이스 블루", "맑은 라벤더", "쿨 민트", "라즈베리"],
        "tips": ["노란기 강한 색은 피하기", "너무 탁한 회색보다 맑은 쿨 컬러 선택", "실버 포인트로 깨끗한 인상 강화"],
    },
    "summerMute": {
        "id": "summerMute",
        "name": "여름 뮤트",
        "season": "여름",
        "sub": "Summer Mute",
        "en": "Cool Muted Soft",
        "desc": "그레이시하고 부드러운 쿨 컬러가 잘 받는 타입입니다. 강한 원색보다 차분한 색이 세련된 인상을 만듭니다.",
        "colors": ["더스티 로즈", "모브", "그레이 블루", "라벤더 그레이", "소프트 네이비"],
        "tips": ["비비드 원색과 강한 대비는 줄이기", "매트한 실버·진주 액세서리 추천", "부드러운 소재와 톤온톤 배색 활용"],
    },
    "autumnMute": {
        "id": "autumnMute",
        "name": "가을 뮤트",
        "season": "가을",
        "sub": "Autumn Mute",
        "en": "Warm Muted Soft",
        "desc": "차분하고 부드러운 어스톤이 잘 어울리는 타입입니다. 너무 선명한 색보다 따뜻하게 눌린 색이 안정적입니다.",
        "colors": ["세이지", "카키 베이지", "더스티 오렌지", "토프", "웜 그레이"],
        "tips": ["형광기·쨍한 색은 피하기", "무광 골드·브론즈 액세서리 추천", "린넨·스웨이드 같은 질감과 잘 맞음"],
    },
    "autumnTrue": {
        "id": "autumnTrue",
        "name": "가을 트루",
        "season": "가을",
        "sub": "True Autumn",
        "en": "True Warm Earthy",
        "desc": "따뜻한 골드·브라운·카멜 계열을 가장 안정적으로 소화하는 타입입니다. 깊이와 온기가 모두 중요합니다.",
        "colors": ["카멜", "테라코타", "올리브", "머스타드", "웜 브라운"],
        "tips": ["차갑고 푸른 색은 얼굴을 어둡게 만들 수 있음", "골드·우드·레더 소재 추천", "따뜻한 중명도 어스톤 중심으로 코디"],
    },
    "autumnDeep": {
        "id": "autumnDeep",
        "name": "가을 딥",
        "season": "가을",
        "sub": "Autumn Deep",
        "en": "Warm Deep Rich",
        "desc": "깊고 풍부한 웜 컬러가 분위기를 살리는 타입입니다. 브라운, 버건디, 딥 올리브처럼 농도 있는 색이 강점입니다.",
        "colors": ["에스프레소", "딥 올리브", "브릭 레드", "다크 카멜", "웜 버건디"],
        "tips": ["밝은 파스텔은 얼굴이 떠 보일 수 있음", "짙은 골드·브론즈 액세서리 추천", "무게감 있는 소재와 깊은 배색 활용"],
    },
    "winterBright": {
        "id": "winterBright",
        "name": "겨울 브라이트",
        "season": "겨울",
        "sub": "Winter Bright",
        "en": "Cool Vivid Clear",
        "desc": "차갑고 선명한 고채도 컬러가 얼굴을 또렷하게 만드는 타입입니다. 맑은 대비와 깨끗한 색감이 핵심입니다.",
        "colors": ["푸시아", "코발트 블루", "아이스 화이트", "클리어 레드", "에메랄드"],
        "tips": ["탁한 베이지·카키는 피하기", "실버·화이트골드와 선명한 보석 컬러 추천", "흑백 대비에 비비드 포인트 활용"],
    },
    "winterTrue": {
        "id": "winterTrue",
        "name": "겨울 트루",
        "season": "겨울",
        "sub": "True Winter",
        "en": "True Cool High Contrast",
        "desc": "차가움과 대비감이 가장 중요한 타입입니다. 블랙, 화이트, 쿨 레드처럼 명확한 색이 인상을 선명하게 합니다.",
        "colors": ["블랙", "퓨어 화이트", "로얄 블루", "쿨 레드", "차콜"],
        "tips": ["노란기 많은 아이보리·카멜은 피하기", "플래티넘·실버 액세서리 추천", "명도 대비를 또렷하게 유지"],
    },
    "winterDeep": {
        "id": "winterDeep",
        "name": "겨울 딥",
        "season": "겨울",
        "sub": "Winter Deep",
        "en": "Cool Deep Dramatic",
        "desc": "깊고 차가운 색이 세련된 분위기를 만드는 타입입니다. 어두운 색을 입어도 얼굴이 묻히지 않고 또렷하게 살아납니다.",
        "colors": ["블랙", "딥 네이비", "와인", "딥 퍼플", "포레스트 그린"],
        "tips": ["흐린 파스텔과 탁한 브라운은 피하기", "실버·블랙 메탈 액세서리 추천", "깊은 컬러와 선명한 대비를 함께 활용"],
    },
}


def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def rgb_to_hsl(r: int, g: int, b: int) -> dict[str, int]:
    nr, ng, nb = r / 255, g / 255, b / 255
    max_value = max(nr, ng, nb)
    min_value = min(nr, ng, nb)
    lightness = (max_value + min_value) / 2
    hue = 0.0
    saturation = 0.0
    if max_value != min_value:
        delta = max_value - min_value
        saturation = delta / (2 - max_value - min_value) if lightness > 0.5 else delta / (max_value + min_value)
        if max_value == nr:
            hue = (ng - nb) / delta + (6 if ng < nb else 0)
        elif max_value == ng:
            hue = (nb - nr) / delta + 2
        else:
            hue = (nr - ng) / delta + 4
        hue /= 6
    return {"h": round(hue * 360), "s": round(saturation * 100), "l": round(lightness * 100)}


def rgb_to_hsv(r: int, g: int, b: int) -> dict[str, int]:
    nr, ng, nb = r / 255, g / 255, b / 255
    max_value = max(nr, ng, nb)
    min_value = min(nr, ng, nb)
    delta = max_value - min_value
    hue = 0.0
    if delta:
        if max_value == nr:
            hue = ((ng - nb) / delta) % 6
        elif max_value == ng:
            hue = (nb - nr) / delta + 2
        else:
            hue = (nr - ng) / delta + 4
    hue = round(hue * 60)
    if hue < 0:
        hue += 360
    return {
        "h": hue,
        "s": round((0 if max_value == 0 else delta / max_value) * 100),
        "v": round(max_value * 100),
    }


def rgb_to_lab(r: int, g: int, b: int) -> dict[str, float]:
    def pivot_rgb(value: int) -> float:
        normalized = value / 255
        return ((normalized + 0.055) / 1.055) ** 2.4 if normalized > 0.04045 else normalized / 12.92

    def pivot_xyz(value: float) -> float:
        return value ** (1 / 3) if value > 0.008856 else value * 7.787 + 16 / 116

    rr, gg, bb = pivot_rgb(r), pivot_rgb(g), pivot_rgb(b)
    x = (rr * 0.4124 + gg * 0.3576 + bb * 0.1805) / 0.95047
    y = rr * 0.2126 + gg * 0.7152 + bb * 0.0722
    z = (rr * 0.0193 + gg * 0.1192 + bb * 0.9505) / 1.08883
    fx, fy, fz = pivot_xyz(x), pivot_xyz(y), pivot_xyz(z)
    return {
        "l": round((116 * fy - 16) * 10) / 10,
        "a": round((500 * (fx - fy)) * 10) / 10,
        "b": round((200 * (fy - fz)) * 10) / 10,
    }


def rgb_to_hex(r: int, g: int, b: int) -> str:
    return f"#{round(clamp(r, 0, 255)):02X}{round(clamp(g, 0, 255)):02X}{round(clamp(b, 0, 255)):02X}"


def luminance(r: int, g: int, b: int) -> float:
    return 0.299 * r + 0.587 * g + 0.114 * b


def closeness(value: float, target: float, spread: float = 42) -> float:
    return clamp(100 - abs(value - target) * (100 / spread), 0, 100)


def detail_from_type(type_id: str) -> str:
    if "Light" in type_id:
        return "Light"
    if "Bright" in type_id:
        return "Bright"
    if "Mute" in type_id:
        return "Mute"
    if "Deep" in type_id:
        return "Deep"
    return "True"


def build_candidates(brightness: float, saturation: float, temperature: float, contrast: float, balance: float) -> list[dict[str, float | str]]:
    warm = temperature
    cool = 100 - temperature
    light = brightness
    deep = 100 - brightness
    bright = saturation
    mute = 100 - saturation
    low_contrast = 100 - contrast
    mid_light = closeness(brightness, 64)
    mid_saturation = closeness(saturation, 42)

    candidates = [
        {"id": "springLight", "score": warm * 0.25 + light * 0.3 + bright * 0.12 + balance * 0.15 + low_contrast * 0.18},
        {"id": "springBright", "score": warm * 0.25 + bright * 0.3 + light * 0.1 + contrast * 0.15 + balance * 0.1 + mid_light * 0.1},
        {"id": "springTrue", "score": warm * 0.42 + mid_light * 0.18 + mid_saturation * 0.14 + balance * 0.16 + low_contrast * 0.1},
        {"id": "summerLight", "score": cool * 0.28 + light * 0.3 + mute * 0.12 + balance * 0.18 + low_contrast * 0.12},
        {"id": "summerBright", "score": cool * 0.25 + bright * 0.25 + light * 0.12 + contrast * 0.16 + balance * 0.12 + mid_light * 0.1},
        {"id": "summerMute", "score": cool * 0.25 + mute * 0.3 + low_contrast * 0.15 + balance * 0.18 + light * 0.12},
        {"id": "autumnMute", "score": warm * 0.25 + mute * 0.3 + mid_light * 0.12 + balance * 0.18 + contrast * 0.15},
        {"id": "autumnTrue", "score": warm * 0.42 + mid_light * 0.18 + mid_saturation * 0.16 + balance * 0.14 + contrast * 0.1},
        {"id": "autumnDeep", "score": warm * 0.25 + deep * 0.3 + contrast * 0.18 + mute * 0.12 + balance * 0.1 + mid_saturation * 0.05},
        {"id": "winterBright", "score": cool * 0.26 + bright * 0.28 + contrast * 0.22 + balance * 0.12 + light * 0.12},
        {"id": "winterTrue", "score": cool * 0.38 + contrast * 0.24 + balance * 0.15 + bright * 0.13 + mid_light * 0.1},
        {"id": "winterDeep", "score": cool * 0.25 + deep * 0.32 + contrast * 0.24 + bright * 0.1 + balance * 0.09},
    ]
    return sorted(candidates, key=lambda item: float(item["score"]), reverse=True)


def normalize_zone(zone: dict[str, Any]) -> dict[str, Any] | None:
    rgb = zone.get("rgb") or {}
    try:
        r = round(float(rgb["r"]))
        g = round(float(rgb["g"]))
        b = round(float(rgb["b"]))
    except (KeyError, TypeError, ValueError):
        return None
    if min(r, g, b) <= 0:
        return None
    return {
        "id": zone.get("id", "zone"),
        "label": zone.get("label", "피부 영역"),
        "rgb": {"r": r, "g": g, "b": b},
        "hsv": rgb_to_hsv(r, g, b),
        "lab": rgb_to_lab(r, g, b),
        "pixelRatio": float(zone.get("pixelRatio") or 0.2),
    }


def average_from_zones(zones: list[dict[str, Any]]) -> tuple[dict[str, int], list[dict[str, Any]]]:
    normalized = [zone for zone in (normalize_zone(item) for item in zones) if zone]
    if not normalized:
        return {"r": 245, "g": 195, "b": 150}, []
    total_weight = sum(max(0.05, min(1.0, float(zone["pixelRatio"]))) for zone in normalized)
    return {
        "r": round(sum(zone["rgb"]["r"] * max(0.05, min(1.0, float(zone["pixelRatio"]))) for zone in normalized) / total_weight),
        "g": round(sum(zone["rgb"]["g"] * max(0.05, min(1.0, float(zone["pixelRatio"]))) for zone in normalized) / total_weight),
        "b": round(sum(zone["rgb"]["b"] * max(0.05, min(1.0, float(zone["pixelRatio"]))) for zone in normalized) / total_weight),
    }, normalized


def decode_image_zones(image_payload: str | None) -> list[dict[str, Any]]:
    if not image_payload or Image is None:
        return []
    try:
        raw = image_payload.split(",", 1)[1] if image_payload.startswith("data:") else image_payload
        image = Image.open(io.BytesIO(base64.b64decode(raw))).convert("RGB")
        image.thumbnail((960, 960))
    except Exception:
        return []

    width, height = image.size
    pixels = image.load()
    regions = [
        {"id": "forehead", "label": "이마", "x": 0.5, "y": 0.29, "w": 0.2, "h": 0.1},
        {"id": "leftCheek", "label": "왼쪽 볼", "x": 0.36, "y": 0.48, "w": 0.17, "h": 0.14},
        {"id": "rightCheek", "label": "오른쪽 볼", "x": 0.64, "y": 0.48, "w": 0.17, "h": 0.14},
        {"id": "chin", "label": "턱", "x": 0.5, "y": 0.68, "w": 0.18, "h": 0.11},
    ]
    zones = []
    for region in regions:
        min_x = max(0, int(width * (region["x"] - region["w"] / 2)))
        max_x = min(width - 1, int(width * (region["x"] + region["w"] / 2)))
        min_y = max(0, int(height * (region["y"] - region["h"] / 2)))
        max_y = min(height - 1, int(height * (region["y"] + region["h"] / 2)))
        samples = []
        inspected = 0
        for y in range(min_y, max_y + 1, 2):
            for x in range(min_x, max_x + 1, 2):
                inspected += 1
                r, g, b = pixels[x, y]
                if is_likely_skin(r, g, b):
                    samples.append((r, g, b))
        if not samples:
            continue
        samples.sort(key=lambda item: luminance(*item))
        trim = int(len(samples) * 0.1)
        trimmed = samples[trim : len(samples) - trim] or samples
        r = round(sum(item[0] for item in trimmed) / len(trimmed))
        g = round(sum(item[1] for item in trimmed) / len(trimmed))
        b = round(sum(item[2] for item in trimmed) / len(trimmed))
        zones.append(
            {
                "id": region["id"],
                "label": region["label"],
                "rgb": {"r": r, "g": g, "b": b},
                "pixelRatio": round(len(samples) / max(1, inspected), 2),
            }
        )
    return zones


def is_likely_skin(r: int, g: int, b: int) -> bool:
    max_value = max(r, g, b)
    min_value = min(r, g, b)
    y = luminance(r, g, b)
    cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b
    cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b
    hsv = rgb_to_hsv(r, g, b)
    return (
        r > 42
        and g > 32
        and b > 24
        and max_value - min_value > 10
        and 54 < y < 238
        and 128 <= cr <= 182
        and 70 <= cb <= 140
        and 6 <= hsv["s"] <= 72
    )


def analyze_personal_color(
    image_payload: str | None = None,
    zones: list[dict[str, Any]] | None = None,
    client_metrics: dict[str, Any] | None = None,
    client_rgb: dict[str, Any] | None = None,
    camera_frame: dict[str, Any] | None = None,
) -> dict[str, Any]:
    image_zones = decode_image_zones(image_payload)
    sample_zones = zones or image_zones
    rgb, normalized_zones = average_from_zones(sample_zones)

    if client_rgb and not normalized_zones:
        try:
            rgb = {"r": round(float(client_rgb["r"])), "g": round(float(client_rgb["g"])), "b": round(float(client_rgb["b"]))}
        except (KeyError, TypeError, ValueError):
            pass

    hsv = rgb_to_hsv(rgb["r"], rgb["g"], rgb["b"])
    hsl = rgb_to_hsl(rgb["r"], rgb["g"], rgb["b"])
    lab = rgb_to_lab(rgb["r"], rgb["g"], rgb["b"])

    zone_delta = 0.0
    if normalized_zones:
        zone_delta = sum(
            math.sqrt(
                (float(zone["lab"]["l"]) - lab["l"]) ** 2
                + (float(zone["lab"]["a"]) - lab["a"]) ** 2
                + (float(zone["lab"]["b"]) - lab["b"]) ** 2
            )
            for zone in normalized_zones
        ) / max(1, len(normalized_zones))

    warm_cool_score = lab["b"] * 1.25 + (rgb["r"] - rgb["b"]) * 0.24 + (7 if 16 <= hsv["h"] <= 52 else -5)
    brightness = clamp(lab["l"], 0, 100)
    saturation = clamp(hsv["s"], 0, 100)
    temperature = clamp(50 + warm_cool_score, 0, 100)
    shadow_variance = float((client_metrics or {}).get("shadowVariance") or 0)
    contrast = clamp(shadow_variance * 1.25 + zone_delta * 2.1, 0, 100)
    balance = clamp(100 - zone_delta * 4.2, 0, 100)
    skin_pixel_ratio = float((client_metrics or {}).get("skinPixelRatio") or 0)
    if not skin_pixel_ratio and normalized_zones:
        skin_pixel_ratio = sum(float(zone["pixelRatio"]) for zone in normalized_zones) / len(normalized_zones)

    candidates = build_candidates(brightness, saturation, temperature, contrast, balance)
    primary = candidates[0]
    secondary = candidates[1]
    primary_result = PERSONAL_COLOR_RESULTS[str(primary["id"])]
    secondary_result = PERSONAL_COLOR_RESULTS[str(secondary["id"])]
    score_margin = float(primary["score"]) - float(secondary["score"])

    warnings = []
    if brightness < 45:
        warnings.append("조명이 부족해 피부 명도 판정 신뢰도가 낮아질 수 있습니다.")
    if brightness > 88:
        warnings.append("과노출 가능성이 있어 실제 피부 색보다 밝게 분석될 수 있습니다.")
    if shadow_variance > 38:
        warnings.append("얼굴 그림자 차이가 커서 대비감과 색온도 판단이 흔들릴 수 있습니다.")
    if skin_pixel_ratio and skin_pixel_ratio < 0.24:
        warnings.append("검출된 피부 픽셀 비율이 낮습니다. 얼굴을 더 크게 중앙에 맞춰 주세요.")
    if abs(temperature - 50) < 8:
        warnings.append("웜/쿨 경계값에 가까워 보조 결과도 함께 참고해 주세요.")
    if balance < 62:
        warnings.append("이마·볼·턱의 색 균형 차이가 커서 메이크업, 그림자, 필터 영향을 의심할 수 있습니다.")
    if len(normalized_zones) < 3:
        warnings.append("충분한 피부 영역이 부족해 결과 신뢰도가 낮습니다. 이마·양 볼·턱이 보이게 다시 촬영해 주세요.")

    failed_camera_checks: list[str] = []
    if camera_frame:
        checks = camera_frame.get("checks") or []
        failed_camera_checks = [
            str(check.get("label") or check.get("key"))
            for check in checks
            if isinstance(check, dict) and not check.get("passed")
        ]
        if camera_frame.get("canAnalyze") is False or failed_camera_checks:
            warnings.append(
                "촬영 전 체크에서 일부 조건이 낮게 평가되어 분석 신뢰도에 감점 반영했습니다: "
                + ", ".join(failed_camera_checks[:4])
            )

    camera_quality_penalty = min(0.18, len(failed_camera_checks) * 0.03)
    if camera_frame and camera_frame.get("canAnalyze") is False:
        camera_quality_penalty += 0.08

    quality_penalty = (
        (0.1 if brightness < 45 or brightness > 88 else 0)
        + (0.1 if shadow_variance > 38 else 0)
        + (0.08 if skin_pixel_ratio and skin_pixel_ratio < 0.24 else 0)
        + (0.08 if balance < 62 else 0)
        + (0.07 if abs(temperature - 50) < 8 else 0)
        + (0.12 if len(normalized_zones) < 3 else 0)
        + camera_quality_penalty
    )
    confidence = clamp(0.7 + score_margin / 180 + skin_pixel_ratio * 0.08 - quality_penalty, 0.42, 0.94)
    secondary_confidence = clamp(confidence - score_margin / 220 - 0.05, 0.34, 0.84)

    detail = detail_from_type(str(primary["id"]))
    secondary_detail = detail_from_type(str(secondary["id"]))
    tone_label = "웜톤 (노란빛·골드 베이스 우세)" if temperature >= 53 else "쿨톤 (핑크빛·블루 베이스 우세)"
    brightness_label = {
        "Light": "밝고 투명한 라이트 톤",
        "Bright": "선명하고 생기 있는 브라이트 톤",
        "Mute": "차분하고 부드러운 뮤트 톤",
        "Deep": "깊고 대비감 있는 딥 톤",
        "True": "온도감이 명확한 트루 톤",
    }[detail]

    return {
        "source": "backend_rgb_hsv_lab_analyzer",
        "engineVersion": "personal-color-v2",
        "result": primary_result,
        "resultName": primary_result["name"],
        "detailTone": detail,
        "secondaryResult": {
            "name": secondary_result["name"],
            "season": secondary_result["season"],
            "detailTone": secondary_detail,
            "confidence": round(secondary_confidence, 2),
        },
        "hex": rgb_to_hex(rgb["r"], rgb["g"], rgb["b"]),
        "rgb": rgb,
        "hsl": hsl,
        "hsv": hsv,
        "lab": lab,
        "zones": normalized_zones,
        "isWarm": temperature >= 53,
        "isLight": brightness >= 64,
        "toneLabel": tone_label,
        "brightnessLabel": brightness_label,
        "confidence": round(confidence, 2),
        "qualityLabel": "촬영 품질 양호" if confidence >= 0.78 else "촬영 품질 보통" if confidence >= 0.62 else "재촬영 권장",
        "warnings": warnings,
        "evidence": [
            f"이마·양 볼·턱 {len(normalized_zones)}개 영역의 피부 RGB 샘플을 분석했습니다.",
            f"평균 RGB {rgb['r']}/{rgb['g']}/{rgb['b']}, HSV {hsv['h']}/{hsv['s']}/{hsv['v']}, LAB {lab['l']}/{lab['a']}/{lab['b']}",
            f"피부 명도 {round(brightness)} / 채도 {round(saturation)} / 색온도 {round(temperature)} / 대비 {round(contrast)}",
        ],
        "recommendationPoints": [
            f"{primary_result['name']} 팔레트에 맞춰 {', '.join(primary_result['colors'][:3])} 계열을 우선 추천합니다.",
            f"{brightness_label}이므로 상의와 얼굴 주변 액세서리 색을 먼저 맞추면 효과가 큽니다.",
            f"보조 후보 {secondary_result['name']}도 {round(secondary_confidence * 100)}%로 참고할 수 있습니다.",
        ],
        "cautionPoints": warnings or ["강한 필터, 진한 색조 메이크업, 역광 환경에서는 웜/쿨 판정이 달라질 수 있습니다."],
        "cameraFrame": {
            "canAnalyze": camera_frame.get("canAnalyze") if camera_frame else None,
            "failedChecks": failed_camera_checks,
            "centerOffset": camera_frame.get("centerOffset") if camera_frame else None,
            "faceSizeRatio": camera_frame.get("faceSizeRatio") if camera_frame else None,
            "tiltDegrees": camera_frame.get("tiltDegrees") if camera_frame else None,
        },
        "metrics": {
            "brightness": round(brightness),
            "saturation": round(saturation),
            "temperature": round(temperature),
            "contrast": round(contrast),
            "balance": round(balance),
            "shadowVariance": round(shadow_variance),
            "skinPixelRatio": round(skin_pixel_ratio, 2),
            "warmCoolScore": round(warm_cool_score),
        },
        "candidates": [
            {
                "id": item["id"],
                "name": PERSONAL_COLOR_RESULTS[str(item["id"])]["name"],
                "score": round(float(item["score"]), 1),
            }
            for item in candidates[:4]
        ],
    }
