from typing import Any


SKELETON_WEIGHTS: list[dict[str, dict[str, float]]] = [
    {"A": {"wave": 2}, "B": {"wave": 1, "straight": 0.5}, "C": {"straight": 1.5}},
    {"A": {"natural": 2}, "B": {"straight": 1}, "C": {"wave": 1.5}},
    {"A": {"straight": 2}, "B": {"natural": 2}, "C": {"wave": 2}},
    {"A": {"straight": 1.5}, "B": {"wave": 1.5}, "C": {"natural": 1.5}},
    {"A": {"wave": 1.5}, "B": {"straight": 1.5}, "C": {"natural": 2}},
    {"A": {"straight": 1.5}, "B": {"wave": 1.5}, "C": {"natural": 1.5}},
]

SKELETON_LABELS = {
    "straight": {"result_name": "Straight", "korean_name": "스트레이트"},
    "natural": {"result_name": "Natural", "korean_name": "내추럴"},
    "wave": {"result_name": "Wave", "korean_name": "웨이브"},
}


def _add(scores: dict[str, float], key: str, value: float) -> None:
    if key in scores:
        scores[key] += value


def _normalize_choice(value: Any) -> str:
    return str(value or "").strip().lower()


def analyze_body_type(payload: dict[str, Any] | None = None) -> dict[str, Any]:
    """Rule-based skeletal type analyzer.

    Inputs can include survey_answers plus optional physical features:
    shoulder_width, neck_length, joint_size, upper_lower_ratio.
    """
    payload = payload or {}
    measurements = payload.get("measurements") or {}
    answers = payload.get("survey_answers") or payload.get("answers") or []
    scores = {"straight": 0.0, "natural": 0.0, "wave": 0.0}
    evidence: list[str] = []

    for index, answer in enumerate(answers[: len(SKELETON_WEIGHTS)]):
        weights = SKELETON_WEIGHTS[index].get(str(answer).upper(), {})
        for key, value in weights.items():
            _add(scores, key, value)
        if weights:
            evidence.append(f"Q{index + 1} 응답 {str(answer).upper()} 반영: {weights}")

    shoulder_width = _normalize_choice(payload.get("shoulder_width") or measurements.get("shoulder_width"))
    neck_length = _normalize_choice(payload.get("neck_length") or measurements.get("neck_length"))
    joint_size = _normalize_choice(payload.get("joint_size") or measurements.get("joint_size"))
    upper_lower_ratio = payload.get("upper_lower_ratio") or measurements.get("upper_lower_ratio")

    if shoulder_width in {"wide", "broad", "large", "넓음", "넓은"}:
        _add(scores, "natural", 1.4)
        evidence.append("어깨 폭이 넓어 Natural 점수를 가산했습니다.")
    elif shoulder_width in {"narrow", "small", "좁음", "좁은"}:
        _add(scores, "wave", 1.0)
        evidence.append("어깨 폭이 좁고 부드러운 인상으로 Wave 점수를 가산했습니다.")

    if neck_length in {"short", "짧음", "짧은"}:
        _add(scores, "straight", 1.1)
        evidence.append("목이 짧은 편이라 Straight 점수를 가산했습니다.")
    elif neck_length in {"long", "긴", "김", "길음"}:
        _add(scores, "wave", 1.0)
        evidence.append("목이 긴 편이라 Wave 점수를 가산했습니다.")

    if joint_size in {"large", "big", "thick", "큼", "큰", "두꺼움"}:
        _add(scores, "natural", 1.8)
        evidence.append("관절 크기가 커 Natural 점수를 크게 가산했습니다.")
    elif joint_size in {"small", "thin", "작음", "작은", "얇음"}:
        _add(scores, "wave", 1.2)
        evidence.append("관절이 작고 얇아 Wave 점수를 가산했습니다.")
    elif joint_size in {"medium", "normal", "보통"}:
        _add(scores, "straight", 0.7)
        evidence.append("관절 크기가 보통이라 Straight 점수를 소폭 가산했습니다.")

    try:
        ratio = float(upper_lower_ratio)
        if ratio >= 1.08:
            _add(scores, "straight", 1.0)
            evidence.append("상체 비율이 상대적으로 커 Straight 점수를 가산했습니다.")
        elif ratio <= 0.92:
            _add(scores, "wave", 1.0)
            evidence.append("하체 비율이 상대적으로 길어 Wave 점수를 가산했습니다.")
        else:
            _add(scores, "natural", 0.5)
            evidence.append("상하체 비율이 균형적이라 Natural 점수를 소폭 가산했습니다.")
    except (TypeError, ValueError):
        pass

    if not any(scores.values()):
        scores = {"straight": 1.0, "natural": 1.0, "wave": 1.0}
        evidence.append("입력값이 부족해 세 타입을 동일한 기본 후보로 두었습니다.")

    total = sum(scores.values()) or 1
    percentages = {key: round(value / total * 100) for key, value in scores.items()}
    ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    primary_key, primary_score = ranked[0]
    secondary_key, secondary_score = ranked[1]
    margin = (primary_score - secondary_score) / total
    is_mixed = percentages[secondary_key] >= 30 and percentages[primary_key] - percentages[secondary_key] <= 18

    primary = SKELETON_LABELS[primary_key]
    secondary = SKELETON_LABELS[secondary_key]
    result_name = (
        f"{primary['result_name']} + {secondary['result_name']}"
        if is_mixed
        else primary["result_name"]
    )
    korean_name = (
        f"{primary['korean_name']} + {secondary['korean_name']} 혼합형"
        if is_mixed
        else primary["korean_name"]
    )
    confidence = max(0.54, min(0.93, 0.64 + margin * 0.7 + primary_score / total * 0.12))

    return {
        "source": "rule_based_skeletal_analyzer",
        "result_name": result_name,
        "korean_name": korean_name,
        "skeleton_type": primary_key,
        "secondary_type": secondary["result_name"],
        "confidence": round(confidence, 2),
        "scores": {
            "Straight": percentages["straight"],
            "Natural": percentages["natural"],
            "Wave": percentages["wave"],
        },
        "raw_scores": scores,
        "is_mixed": is_mixed,
        "evidence": evidence[:8],
        "recommendation_points": [
            "골격 결과는 소재 두께, 핏 여유, 어깨선 위치 추천에 반영됩니다.",
            "체형 결과와 함께 사용하면 실루엣 추천 정확도가 높아집니다.",
        ],
    }
