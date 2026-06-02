# AI 뷰티 패션 추천 상품 DB 설계 가이드

## 설계 요약

- 패션 상품과 뷰티 상품은 추천 기준이 다르므로 `fashion_products`, `beauty_products`로 분리했습니다.
- 상품 구매, 결제, 배송 정보는 제외하고 추천에 필요한 속성만 남겼습니다.
- `personal_color_type`, `body_type`, `style_tag`, `season`, `situation`은 여러 조건을 동시에 저장할 수 있도록 MySQL `SET` 타입으로 설계했습니다.
- 퍼스널컬러는 앱에서 쓰기 쉬운 snake_case 12타입으로 저장합니다.
- 이미지 URL은 실제 외부 링크 대신 `/images/fashion/f001.jpg`, `/images/beauty/b001.jpg` 같은 placeholder 경로를 사용합니다.
- `product_url`은 실제 상품 상세 페이지를 연결할 때 사용합니다. 현재 런타임 카탈로그의 일부 상품은 `/products/{product_id}` 형태의 캡스톤용 상세 페이지 URL을 가지고, 값이 없으면 백엔드가 외부 쇼핑 검색 키워드와 검색 URL을 fallback으로 제공합니다.
- `recommendation_reason` 컬럼을 두어 추천 결과 화면에서 설명 가능한 추천 근거를 바로 보여줄 수 있습니다.
- 웹 서비스 추천 API는 `product_catalog.json`을 우선 읽어 SQL 문자열 파싱 의존을 줄이고, SQL은 DB 생성/발표용 설계 자료로 유지합니다.

## 퍼스널컬러 키

```text
spring_light
spring_bright
spring_true
summer_light
summer_bright
summer_mute
autumn_mute
autumn_true
autumn_deep
winter_bright
winter_true
winter_deep
```

## JSON 샘플 구조

웹사이트에서는 MySQL의 `SET` 문자열을 배열로 변환해서 내려주면 필터링과 렌더링이 편합니다.

```json
{
  "fashionProducts": [
    {
      "productId": 1,
      "productName": "블랙 슬림핏 슬랙스",
      "brandName": "Nero Studio",
      "genderTarget": ["unisex"],
      "category": "bottom",
      "subCategory": "slacks",
      "fitType": "slim",
      "colorName": "블랙",
      "colorGroup": "black",
      "personalColorType": ["winter_deep", "winter_bright", "winter_true"],
      "bodyType": ["straight", "rectangle"],
      "styleTag": ["minimal", "chic", "modern"],
      "season": ["all"],
      "situation": ["date", "office", "interview"],
      "price": 59000,
      "imageUrl": "/images/fashion/f001.jpg",
      "productUrl": null,
      "recommendationReason": "겨울 딥의 선명한 대비감과 잘 맞고 스트레이트 골격의 직선적인 실루엣을 살립니다."
    }
  ],
  "beautyProducts": [
    {
      "productId": 1,
      "productName": "딥 베리 벨벳 립스틱",
      "brandName": "Tone Lab",
      "genderTarget": ["female"],
      "category": "lip",
      "subCategory": "lipstick",
      "shadeName": "딥 베리",
      "colorGroup": "burgundy",
      "skinTone": "cool",
      "personalColorType": ["winter_deep", "winter_true"],
      "finishType": "velvet",
      "styleTag": ["chic", "elegant", "modern"],
      "season": ["fall", "winter"],
      "situation": ["date", "party"],
      "price": 26000,
      "imageUrl": "/images/beauty/b001.jpg",
      "productUrl": null,
      "recommendationReason": "겨울 딥의 깊은 대비감을 살리는 베리 컬러로 시크한 메이크업에 적합합니다."
    }
  ]
}
```

## 캡스톤 발표용 설계 이유

이 DB는 사용자 분석 결과와 상품 속성을 직접 매칭하기 위한 추천 중심 구조입니다. 패션 상품은 퍼스널컬러, 체형/골격, 스타일, 계절, 상황을 기준으로 필터링하고, 뷰티 상품은 피부톤과 퍼스널컬러, 제형, 상황을 중심으로 추천합니다. 복잡한 쇼핑몰 기능을 제외했기 때문에 캡스톤 프로젝트에서 구현 부담이 낮고, 추천 결과에는 `recommendation_reason`을 함께 제공해 사용자가 왜 추천되었는지 이해할 수 있습니다.
