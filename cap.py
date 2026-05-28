import os
import json
import re
import traceback
import requests
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq

app = FastAPI()

@app.get("/")
def read_root():
    return {"status": "online", "message": "캡스톤 TPO 및 룩 스타일 인식 매칭 서버 작동 중"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = "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"
NAVER_CLIENT_ID = "BjLaDlSScM7HMJlul1dS"
NAVER_CLIENT_SECRET = "VRyp1TYHBq"

client = Groq(api_key=GROQ_API_KEY)

class RecommendRequest(BaseModel):
    personal_color: str
    user_prompt: str

# [황금 컬러 맵핑] 네이버 쇼핑에서 해당 톤 제품이 가장 많이 검색되는 대표 컬러칩
def get_tone_best_color(pc_string: str):
    if "봄" in pc_string:
        return "코랄"
    elif "여름" in pc_string:
        return "라벤더"
    elif "가을" in pc_string:
        return "카멜"
    else: # 겨울
        return "버건디"

def get_color_guidance(pc_string: str):
    if "봄" in pc_string:
        return {"colors": ["코럴", "피치", "아이보리", "옐로우 그린"], "avoid": ["탁한 그레이", "네이비"]}
    elif "여름" in pc_string:
        return {"colors": ["라벤더", "파우더 블루", "로즈 핑크"], "avoid": ["오렌지", "카멜"]}
    elif "가을" in pc_string:
        return {"colors": ["카멜", "테라코타", "올리브 그린"], "avoid": ["퓨어 화이트", "비비드 블루"]}
    else:
        return {"colors": ["퓨어 화이트", "블랙", "로얄 블루", "버건디"], "avoid": ["파스텔 톤", "오렌지"]}

# --- [3. Groq AI: TPO/상황/스타일 문장에서 알맹이 아이템 종류 추출] ---
def extract_apparel_intent(user_prompt: str):
    system_message = (
        "당신은 사용자의 다양한 상황(미팅, 소개팅, 데이트, 출근 등)이나 스타일 표현(데일리룩, 캠퍼스룩, 캐주얼 코디 등)이 담긴 문장에서 "
        "사용자가 궁극적으로 찾고자 하는 '핵심 의류 종류 명사(item)'를 1~2개 정확히 솎아내는 패션 언어학자 AI입니다.\n"
        "불필요한 상황 설명이나 '코디', '룩', '추천' 등의 단어는 제외하고, 실제 쇼핑몰 카테고리 명칭으로 매칭될 알맹이 단어만 추출하세요.\n\n"
        "🚨 [문맥 분석 규칙]\n"
        "1. 상황 + 아이템 지정: '소개팅 갈 때 입을 자켓 추천해줘' -> ['자켓'] 추출\n"
        "2. 상황/룩 + 아이템 미지정 (추상적 요청): \n"
        "   - '미팅 코디 알려줘', '소개팅 룩 추천해줘' -> 미팅/소개팅에 가장 잘 어울리고 무난한 상의인 ['셔츠'] 또는 ['블라우스']를 AI가 센스있게 판단하여 추천\n"
        "   - '새내기 캠퍼스룩 알려줘', '편한 데일리 코디' -> 대학생 일상 룩에 맞는 ['후드티'] 또는 ['맨투맨'] 또는 ['티셔츠']를 센스있게 추천\n"
        "   - '오피스룩 알려줘', '출근 코디' -> ['슬랙스'] 또는 ['셔츠'] 추천\n"
        "3. 복수 아이템: '셔츠랑 슬랙스 코디' -> ['셔츠', '슬랙스'] 추출\n"
        "4. gender: 문장에 남자, 남성, 남친 등이 있으면 '남성', 없거나 여성 중심 단어(블라우스, 원피스 등) 혹은 일반적인 상황이면 '여성'으로 분류하세요.\n\n"
        "반드시 아래의 완전한 JSON 구조로만 응답하세요.\n"
        "{\n"
        "  \"gender\": \"여성\" 또는 \"남성\",\n"
        "  \"items\": [\"자켓\", \"셔츠\"]\n"
        "}"
    )

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": f"유저 프롬프트 문장: '{user_prompt}'"}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        print(f"❌ Groq AI 의도 추출 예외 처리(Fallback) 작동: {e}")
        # 코드단 백업용 텍스트 필터링
        is_male = any(w in user_prompt for w in ["남자", "남성", "남친"])
        detected_item = "셔츠" # 소개팅/미팅 기본 백업 단어
        if "후드" in user_prompt or "맨투맨" in user_prompt or "캠퍼스" in user_prompt:
            detected_item = "후드티"
        elif "슬랙스" in user_prompt or "바지" in user_prompt:
            detected_item = "슬랙스"
        elif "자켓" in user_prompt or "코트" in user_prompt:
            detected_item = "자켓"
        elif "니트" in user_prompt or "스웨터" in user_prompt:
            detected_item = "니트"
            
        return {"gender": "남성" if is_male else "여성", "items": [detected_item]}

# --- [4. 네이버 쇼핑 안전 키워드 맵핑 조합기] ---
def search_naver_shopping(item_name: str, gender: str, personal_color: str):
    url = "https://openapi.naver.com/v1/search/shop.json"
    headers = {
        "X-Naver-Client-Id": NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": NAVER_CLIENT_SECRET
    }
    
    clean_item = item_name.strip()
    tone_color = get_tone_best_color(personal_color)

    # 조합 공식: [성별] + [퍼스널컬러 매칭 색상] + [그록이 솎아낸 카테고리 아이템]
    final_query = f"{gender} {tone_color} {clean_item}"
    print(f"👉 [네이버 API 최종 안전 전송 쿼리]: {final_query}")

    params = {
        "query": final_query,
        "display": 8,
        "start": 1,
        "sort": "sim"
    }
    
    try:
        time.sleep(0.4)
        res = requests.get(url, headers=headers, params=params)
        if res.status_code == 200:
            items = res.json().get("items", [])
            print(f"   └ 🔗 연결 성공: {len(items)}개의 상품을 완벽히 매칭하여 로드했습니다.")
            return items
        elif res.status_code == 429:
            time.sleep(0.6)
            res_retry = requests.get(url, headers=headers, params=params)
            return res_retry.json().get("items", []) if res_retry.status_code == 200 else []
        return []
    except Exception as e:
        print(f"❌ 네이버 연결 실패: {e}")
        return []

# --- [5. 메인 추천 엔드포인트] ---
@app.post("/recommend")
def recommend_fashion(request: RecommendRequest):
    try:
        print("\n==================== [새로운 요청 수신] ====================\n")
        raw_prompt = request.user_prompt
        
        # 골격 유형 파싱
        skeleton_match = re.search(r"체형:\s*([^\s,)]+)", raw_prompt)
        extracted_skeleton = skeleton_match.group(1) if skeleton_match else "스트레이트"
        
        # 프론트엔드가 괄호(신체정보)를 붙여서 보내므로 pure_prompt 추출
        pure_prompt = re.sub(r"\(.*\)", "", raw_prompt).strip()
        if not pure_prompt:
            pure_prompt = "소개팅 룩"

        # 1. 그록 AI 가 문맥을 분석하여 상황에 맞는 '핵심 명사 아이템' 종류 추출
        intent_res = extract_apparel_intent(pure_prompt)
        ai_gender = intent_res.get("gender", "여성")
        target_items = intent_res.get("items", [])
        
        if not target_items:
            target_items = ["셔츠"]

        print(f"🤖 [Groq AI 문맥 분석 완료]: 유저요청('{pure_prompt}') ➔ 추천 아이템 의도: {target_items} (성별: {ai_gender})")

        # 2. 백엔드가 안전한 황금 키워드로 조립하여 네이버 쇼핑 검색 돌리기
        all_real_products = []
        for item in target_items[:2]:
            products = search_naver_shopping(item, ai_gender, request.personal_color)
            if products:
                all_real_products.extend(products)

        # 3. 중복 처리
        seen_ids = set()
        unique_products = []
        for p in all_real_products:
            p_id = p.get("productId")
            if p_id and p_id not in seen_ids:
                seen_ids.add(p_id)
                unique_products.append(p)

        # 4. 동적 스타일링 가이드 가공 (상황 단어를 녹여 자연스럽게 가이드라인 빌드)
        main_item_name = target_items[0] if target_items else "아이템"
        tone_color_name = get_tone_best_color(request.personal_color)
        
        # 유저가 말한 상황 단어(소개팅, 미팅, 데일리 등)를 가이드에 그대로 녹여내기 위한 정제
        situation_keyword = "특별한 날"
        for word in ["소개팅", "미팅", "데이트", "출근", "데일리", "캠퍼스", "오피스"]:
            if word in pure_prompt:
                situation_keyword = f"{word} 자리" if word in ["소개팅", "미팅", "데이트"] else f"{word} 스타일"
                break

        dynamic_reason = (
            f"AI 분석 결과: 요청하신 '{situation_keyword}'에 가장 잘 어울리도록 과하지 않으면서도 세련된 인상을 주는 '{main_item_name}' 스타일링을 제안합니다. "
            f"{request.personal_color} 특유의 매력을 극대화하는 {tone_color_name} 컬러 포인트와, "
            f"상하체 밸런스를 깔끔하게 잡아주는 {extracted_skeleton} 골격 맞춤형 실루엣이 적용되어 매력적인 룩을 완성해 줍니다."
        )

        ai_analysis_response = {
            "gender": ai_gender,
            "keywords": target_items,
            "target_colors": [tone_color_name],
            "reason": dynamic_reason
        }

        color_guide = get_color_guidance(request.personal_color)
        print(f"📦 [최종 프론트엔드 전송 상품 개수]: {len(unique_products)}개")

        return {
            "ai_analysis": ai_analysis_response,
            "color_guide": {
                "personal_color": request.personal_color,
                "recommended_colors": color_guide["colors"],
                "avoided_colors": color_guide["avoid"],
            },
            "real_products": unique_products[:9]
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
