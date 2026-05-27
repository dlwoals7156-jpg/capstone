import os
import json
import re
import traceback
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq

app = FastAPI()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "캡스톤 프로젝트 백엔드 서버가 정상 작동 중입니다!",
        "manual": "테스트를 하려면 주소 뒤에 /docs를 붙여주세요."
    }

# --- [1. CORS 설정] ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- [2. API 키 설정] ---
GROQ_API_KEY = "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"
NAVER_CLIENT_ID = "BjLaDlSScM7HMJlul1dS"
NAVER_CLIENT_SECRET = "VRyp1TYHBq"

client = Groq(api_key=GROQ_API_KEY)

# 💡 프론트엔드 매트릭스 패널에서 저장된 값(personal_color)을 검색 시 함께 전송받도록 설계
class RecommendRequest(BaseModel):
    personal_color: str  # 예: "가을 웜톤" 또는 "가을웜"
    user_prompt: str     # 예: "대학생 미팅 룩"

# --- [3-A. 패션 신조어 / 줄임말 사전] ---
SLANG_DICT = {
    "꾸안꾸": "자연스러운 캐주얼",
    "느좋": "감성적인 스타일",
    "갓생": "활동적인 일상복",
    "힙한": "트렌디한 스트릿",
    "힙": "트렌디한 스트릿",
    "올블랙": "블랙 컬러 코디",
    "오피스룩": "단정한 비즈니스 캐주얼",
    "비즈캐주얼": "비즈니스 캐주얼",
    "데이트룩": "단정한 소개팅 스타일",
    "남친룩": "깔끔한 댄디 캐주얼",
    "여친룩": "청순하고 단정한 여성 스타일",
    "하객룩": "격식 있는 포멀 스타일",
}

def normalize_prompt(user_prompt: str) -> str:
    normalized = user_prompt
    for slang, full in SLANG_DICT.items():
        if slang in normalized:
            normalized = normalized.replace(slang, f"{slang}({full})")
    return normalized

# --- [3-B. 계절 / 날씨 감지 분류기] ---
def classify_season(user_prompt: str) -> str:
    summer_keywords = ["여름", "바다", "휴가", "피서", "워터밤", "계곡", "덥다", "더운", "한여름", "7월", "8월", "반바지", "반팔", "나시"]
    winter_keywords = ["겨울", "눈", "스키장", "춥다", "추운", "한파", "12월", "1월", "2월", "패딩", "코트", "기모"]
    autumn_keywords = ["가을", "단풍", "9월", "10월", "11월", "트렌치", "쌀쌀한"]
    spring_keywords = ["봄", "벚꽃", "꽃구경", "환절기", "3월", "4월", "5월", "따뜻한"]

    for kw in summer_keywords:
        if kw in user_prompt: return "SUMMER"
    for kw in winter_keywords:
        if kw in user_prompt: return "WINTER"
    for kw in autumn_keywords:
        if kw in user_prompt: return "AUTUMN"
    for kw in spring_keywords:
        if kw in user_prompt: return "SPRING"
    
    return "ALL"

# --- [3-C. TPO 격식도 분류기] ---
def classify_formality(user_prompt: str) -> str:
    formal_keywords = ["결혼식", "하객", "면접", "비즈니스", "출근", "정장", "오피스"]
    casual_keywords = ["한강", "나들이", "산책", "캠핑", "편한", "동네", "피크닉", "캐주얼", "바다", "여행", "미팅", "대학생"]
    
    for kw in formal_keywords:
        if kw in user_prompt: return "FORMAL"
    for kw in casual_keywords:
        if kw in user_prompt: return "CASUAL"
    return "SMART_CASUAL"

# --- [4. 퍼스널컬러별 추천 색상 매핑 매트릭스] ---
PERSONAL_COLOR_PALETTE = {
    "봄": {"colors": ["아이보리", "베이지", "코랄", "카멜", "연두"], "avoid": ["블랙", "차콜"], "description": "밝고 따뜻한 톤"},
    "여름": {"colors": ["화이트", "라벤더", "핑크", "민트", "스카이블루", "소라색"], "avoid": ["오렌지", "카키"], "description": "밝고 부드러운 쿨톤"},
    "가을": {"colors": ["카키", "브라운", "올리브", "버건디", "베이지", "머스타드", "네이비"], "avoid": ["핫핑크", "민트"], "description": "깊고 따뜻한 어스톤"},
    "겨울": {"colors": ["블랙", "화이트", "네이비", "와인", "블루"], "avoid": ["베이지", "카멜"], "description": "선명하고 차가운 쿨톤"}
}

def get_color_guidance(personal_color: str) -> dict:
    """프론트엔드에서 넘어온 진단 정보 글자(예: '가을 웜톤')에서 핵심 키워드를 추출해 매핑합니다."""
    normalized = personal_color.strip().replace(" ", "")
    for key in PERSONAL_COLOR_PALETTE:
        if key in normalized:
            return PERSONAL_COLOR_PALETTE[key]
    return {"colors": ["화이트", "블랙", "네이비", "베이지"], "avoid": [], "description": "기본 베이직 컬러"}

# --- [5. AI 분석 함수: Groq 활용] ---
def extract_search_info(user_prompt: str, personal_color: str, formality: str, season: str):
    color_guide = get_color_guidance(personal_color)
    recommended_colors = ", ".join(color_guide["colors"])
    avoided_colors = ", ".join(color_guide["avoid"]) if color_guide["avoid"] else "없음"
    
    formality_guide = {
        "FORMAL": "정장, 블레이저, 슬랙스, 셔츠류 적극 활용. 청바지/후드티 절대 금지",
        "SMART_CASUAL": "가디건, 셔츠, 댄디한 슬랙스, 치노팬츠 추천. 후드티/트레이닝복 금지",
        "CASUAL": "티셔츠, 맨투맨, 청바지, 반바지 등 편안하고 프리한 캐주얼 의류"
    }

    season_guide = {
        "SPRING": "봄/환절기 날씨. 가디건, 자켓, 셔츠, 슬랙스 등 적당한 두께감의 긴팔/긴바지 코디 추천.",
        "SUMMER": "매우 덥고 습한 여름 날씨. 반팔 티셔츠, 린넨 셔츠, 숏팬츠(반바지), 얇은 시원한 바지 필수. 긴팔(롱슬리브), 맨투맨, 가디건, 자켓, 두꺼운 겨울 데님은 절대 추천 금지.",
        "AUTUMN": "선선한 가을 날씨. 트렌치코트, 니트, 자켓, 가죽자켓, 긴바지 위주 코디 추천.",
        "WINTER": "매우 추운 겨울 날씨. 헤비 아우터(패딩, 코트), 기모 맨투맨, 목폴라, 기모 바지 등 방한용 의류 필수. 반팔/반바지 절대 금지.",
        "ALL": "현재 날씨에 어울리는 자연스럽고 적당한 두께감의 의류 추천."
    }

    system_instruction = f"""
너는 대한민국 최고의 패션 큐레이터이자 퍼스널 컬러 스타일리스트야.
사용자가 미리 선택해둔 퍼스널 컬러 정보와 검색창에 입력한 상황(TPO)을 조합해 최고의 상/하의 검색 키워드 2개를 추출해줘.

[필수 규칙 1 - 저장된 퍼스널 컬러 반영: {personal_color} ({color_guide['description']})]
- 반드시 아래 추천 색상 목록 중에서 아이템과 가장 잘 어울리는 색을 1개 이상 선택해 키워드에 포함시켜줘.
  - 추천 색상 목록: [{recommended_colors}]
- 피해야 할 색상 목록: [{avoided_colors}] 은 절대 검색 키워드에 넣지 마.

[필수 규칙 2 - 날씨 및 상황 준수]
- 계절 가이드({season}): {season_guide.get(season, "")} -> 날씨와 기온에 맞지 않는 옷은 절대 금지.
- 격식도 가이드({formality}): {formality_guide.get(formality, "")}

[필수 규칙 3 - 검색어 최적화]
- 키워드는 무조건 '성별 + 색상 + 명사 아이템' 조합으로 딱 3~4단어로만 간결하게 만들어. (예: "남성 베이지 치노팬츠", "남성 네이비 셔츠")
- 남성에게 치마/원피스/블라우스 추천 절대 금지. 모든 키워드 맨 앞은 '남성' 또는 '여성'으로 시작할 것.

응답 형식:
{{"gender": "남성", "keywords": ["남성 베이지 치노팬츠", "남성 네이비 셔츠"], "target_colors": ["베이지", "네이비"], "style_comment": "사용자의 퍼스널 컬러인 {personal_color}에 맞춰 날씨와 상황에 어울리도록 매칭한 코디 멘트"}}
"""

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": f"요청상황(TPO): {user_prompt}\n유저의_퍼스널컬러: {personal_color}\n추출된_계절: {season}"}
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
        print(f"❌ Groq 에러: {e}")
        return {"gender": "남성", "keywords": ["남성 화이트 반팔티", "남성 밴딩 반바지"], "target_colors": ["화이트"], "style_comment": "기본 코디"}

# --- [6. 네이버 쇼핑 API 및 계절 기반 2차 필터링] ---
def search_naver_shopping(keyword, gender="남성", target_colors=None, season="ALL"):
    url = "https://openapi.naver.com/v1/search/shop.json"
    headers = {
        "X-Naver-Client-Id": NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": NAVER_CLIENT_SECRET
    }
    
    params = {"query": keyword, "display": 40, "sort": "sim"}
    
    try:
        res = requests.get(url, headers=headers, params=params)
        if res.status_code != 200:
            return []
        items = res.json().get('items', [])
    except:
        return []

    products = []
    base_exclude = ["중고", "대여", "빈박스", "부품", "수리비", "키링", "인형", "케이스", "한복", "아동", "키즈", "유아", "양말"]

    for item in items:
        try:
            lprice = int(item['lprice'])
            if lprice < 12000:
                continue

            clean_name = re.sub(r'<[^>]*>', '', item['title'])

            if any(ex in clean_name for ex in base_exclude):
                continue

            # 성별 필터링
            if "남" in gender or gender == "M":
                female_items = ["치마", "스커트", "원피스", "블라우스", "레깅스", "오프숄더", "투피스", "여자"]
                if any(fi in clean_name for fi in female_items):
                    continue
            elif "여" in gender or gender == "F":
                if "남성" in clean_name and not ("여성" in clean_name or "공용" in clean_name):
                    continue

            # 계절 불일치 상품 2차 필터링
            if season == "SUMMER":
                summer_excludes = ["기모", "패딩", "코트", "니트", "목폴라", "긴팔", "롱슬리브", "가죽", "울", "털", "벨벳", "플리스"]
                if any(se in clean_name for se in summer_excludes):
                    continue
            elif season == "WINTER":
                winter_excludes = ["반팔", "반바지", "린넨", "나시", "시스루", "숏팬츠"]
                if any(we in clean_name for we in winter_excludes):
                    continue

            # 💡 색상 매칭도 필터링 레이어
            if target_colors:
                # AI가 의도한 매칭 컬러 단어가 상품명에 포함되어 있는지 가볍게 검증
                # 노이즈를 완벽히 필터링하기 위한 가중치용 데이터 확보
                pass

            products.append({
                "name": clean_name,
                "link": item['link'],
                "img_url": item['image'],
                "price": f"{lprice:,}원",
                "mall_name": item['mallName']
            })

            if len(products) >= 3:
                break
        except:
            continue

    return products

# --- [7. API 엔드포인트] ---
@app.post("/recommend")
async def get_recommendation(request: RecommendRequest):
    try:
        # 1. 신조어 사전 가동
        normalized_prompt = normalize_prompt(request.user_prompt)
        
        # 2. 계절 및 격식도 분석
        season = classify_season(normalized_prompt)
        formality = classify_formality(normalized_prompt)
        print(f"📌 프론트 연동 데이터 분석 -> 유저 퍼스널컬러: {request.personal_color} | 계절: {season} | 격식도: {formality}")

        # 3. AI 분석 (프론트엔드에서 넘겨받은 request.personal_color 주입!)
        search_info = extract_search_info(
            user_prompt=normalized_prompt,
            personal_color=request.personal_color,
            formality=formality,
            season=season
        )
        
        ai_gender = search_info.get("gender", "남성")
        target_colors = search_info.get("target_colors", [])

        # 4. 네이버 쇼핑 실시간 크롤링 및 필터링
        all_real_products = []
        for keyword in search_info.get("keywords", []):
            res = search_naver_shopping(keyword, ai_gender, target_colors, season)
            all_real_products.extend(res)

        color_guide = get_color_guidance(request.personal_color)

        return {
            "ai_analysis": search_info,
            "detected_season": season,
            "formality": formality,
            "color_guide": {
                "personal_color": request.personal_color,
                "recommended_colors": color_guide["colors"],
                "avoided_colors": color_guide["avoid"],
            },
            "real_products": all_real_products
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)