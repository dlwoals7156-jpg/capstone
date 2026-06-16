# DeepLook Capstone

AI 기반 퍼스널컬러 + 골격체형 분석 및 패션/뷰티 추천 웹 서비스입니다.  
프로젝트는 유지보수와 AWS 배포를 고려해 `frontend`, `backend`, `ai_model`로 역할을 분리했습니다.

## 프로젝트 구조

```text
capstone-main/
├── frontend/                 # React + Vite 프론트엔드
│   ├── src/                  # 앱 진입점, 공통 타입, 상수, 유틸
│   ├── components/           # 여러 화면에서 재사용하는 UI 컴포넌트
│   ├── pages/                # 메인, 진단, 로그인, 회원가입 화면
│   ├── assets/               # 이미지/정적 리소스 보관 위치
│   ├── styles/               # 전역 CSS와 Tailwind 스타일
│   └── services/             # 백엔드 API 호출 로직
│
├── backend/                  # FastAPI 백엔드
│   ├── app/                  # 설정, 보안/JWT 헬퍼
│   ├── routes/               # REST API 엔드포인트
│   ├── models/               # Pydantic 요청/응답 모델
│   ├── services/             # 비즈니스 로직, 추천/사용자/분석 저장
│   ├── database/             # SQLite 스키마, 상품 DB SQL
│   └── main.py               # FastAPI 실행 진입점
│
├── ai_model/                 # AI 분석 모듈 분리 영역
│   ├── personal_color/
│   ├── body_type/
│   └── recommendation/
│
├── docs/                     # 발표/설계 문서
├── .env.example              # 환경변수 예시
├── requirements.txt          # 백엔드 Python 패키지
├── package.json              # 루트 실행 스크립트
└── README.md
```

## 주요 기능

- React 기반 심플 모던 UI
- 카메라 촬영 기반 퍼스널컬러 분석 화면
- 퍼스널컬러 자가진단 화면
- 골격체형 분석 화면
- 로그인 및 회원가입 화면
- 자체 상품 DB 기반 추천 결과 화면
- FastAPI REST API
- 회원가입/로그인 API
- JWT 토큰 발급
- 사용자 정보 저장 API
- 퍼스널컬러, 골격체형 결과 저장 API
- 추천 결과 제공 API
- AI 모델 연동용 `/ai/*` 엔드포인트

## 개발 환경 준비

### 1. 백엔드 가상환경 만들기

```bash
cd /Users/sbp/Downloads/capstone-main
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
---------------------------------------------------------------
## 윈도우
1단계: Node.js (프론트엔드/작업 공간) 의존성 설치 및 실행

Bash
# 1. 필요한 자바스크립트 패키지들을 한 번에 설치합니다.
pnpm install

# 2. 프로젝트를 실행합니다. (package.json 내부 스크립트에 따라 dev 또는 start)
pnpm dev
# (만약 dev가 없다면 pnpm start 를 시도해 보세요)
실행이 성공하면 터미널에 http://localhost:5173이나 http://localhost:3000 같은 주소가 뜰 겁니다. 브라우저로 접속하시면 됩니다.

2단계: Python (백엔드) 의존성 설치 및 실행
requirements.txt가 있는 것을 보니 Python 서버(FastAPI, Flask 등)도 함께 구동되어야 정상 작동할 것입니다. 터미널 창을 새로 하나 더 열어서 아래 과정을 진행하세요.

Bash
# 1. (선택/권장) 파이썬 가상환경 생성 및 활성화
python -m venv venv
# Windows 가상환경 활성화 명령어:
.\venv\Scripts\activate

# 2. 파이썬 라이브러리 일괄 설치
pip install -r requirements.txt

# 3. 백엔드 서버 실행
# (보통 main.py, app.py, 혹은 cap.py 등의 파일이 있을 겁니다. 파일명을 확인해 보세요)
python main.py
---------------------------------------------------------------------
이미 `.venv`가 만들어져 있다면 아래만 실행하면 됩니다.

```bash
source .venv/bin/activate
```

### 2. 프론트엔드 패키지 설치

```bash
cd /Users/sbp/Downloads/capstone-main/frontend
pnpm install
```

## 실행 방법

터미널을 2개 열어 각각 실행합니다.

### 터미널 1: 백엔드 실행

```bash
cd /Users/sbp/Downloads/capstone-main
source .venv/bin/activate
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

백엔드 확인:

```bash
curl http://127.0.0.1:8000/
```

정상 응답:

```json
{"status":"online","message":"Deeplook FastAPI backend is running."}
```

### 터미널 2: 프론트엔드 실행

```bash
cd /Users/sbp/Downloads/capstone-main
pnpm frontend:dev
```

브라우저 접속:

```text
http://localhost:5173/
```

## 자주 쓰는 명령어

```bash
# 프론트 개발 서버
pnpm frontend:dev

# 프론트 빌드
pnpm frontend:build

# 백엔드 개발 서버
pnpm backend:dev
```

## 백엔드 API 요약

```text
POST /auth/signup                회원가입
GET  /auth/check-email           이메일 중복 확인
POST /auth/login                 로그인 및 JWT 발급
GET  /users/me                   현재 로그인 사용자 조회
GET  /users/me/dashboard         마이페이지 분석/추천 이력 조회
PUT  /users/{user_id}            사용자 정보 수정
POST /analysis/personal-color    퍼스널컬러 결과 저장
POST /analysis/skeleton-type     골격 분석 결과 저장
POST /analysis/body-shape        체형 분석 결과 저장
POST /analysis/body-type         기존 호환용 골격체형 결과 저장
POST /recommendations            추천 결과 제공
GET  /search/suggestions         검색창 자동완성 추천어 제공
POST /recommend                  기존 프론트 호환용 추천 API
POST /ai/personal-color          AI 퍼스널컬러 모델 연동 지점
POST /ai/body-type               AI 골격체형 모델 연동 지점
```

## 데이터베이스

개발용 사용자 DB는 SQLite를 사용합니다.

```text
backend/database/app.db
```

서버 시작 시 다음 테이블이 자동 생성됩니다.

- `users`
- `personal_color_results`
- `body_type_results`
- `skeleton_type_results`
- `body_shape_results`
- `analysis_results`
- `recommendations`

상품 추천용 샘플 DB SQL은 아래 파일에 있습니다.

```text
backend/database/deeplook_product_database.sql
```

추천 API는 런타임에서 SQL 문자열을 직접 파싱하지 않고, 아래 JSON 카탈로그를 우선 사용합니다. SQL 파일은 MySQL 테이블 생성과 샘플 데이터 설명용으로 유지합니다.

```text
backend/database/product_catalog.json
```

## AI 모델 폴더 역할

`ai_model/`은 실제 AI 모델 코드를 백엔드 라우터와 분리하기 위한 영역입니다.

```text
ai_model/personal_color/analyzer.py
ai_model/body_type/analyzer.py
ai_model/recommendation/recommender.py
```

퍼스널컬러 분석은 현재 카메라 이미지의 피부 영역 RGB/HSV/LAB 계산값을 사용합니다. 골격 분석은 설문 응답과 신체 특징을 점수화하는 규칙 기반 엔진입니다. 추후 실제 자세/신체 비율 모델을 이 폴더에 연결하면 됩니다.

## 인증 보안 메모

현재 캡스톤 시연 버전에서는 JWT를 LocalStorage에 저장하고 있으며, 실제 서비스 운영 시에는 HttpOnly Cookie 기반 인증 방식으로 전환할 예정입니다. Production 환경에서는 `JWT_SECRET` 또는 `JWT_SECRET_KEY`가 설정되지 않으면 서버가 실행되지 않도록 보호합니다.

## AWS 배포를 위한 구조 메모

- `frontend/`는 정적 빌드 후 S3 + CloudFront 배포 가능
- `backend/`는 EC2, ECS, Elastic Beanstalk, Lambda 컨테이너 등으로 배포 가능
- 개발용 SQLite는 운영 시 RDS MySQL/PostgreSQL로 교체 권장
- 환경변수는 `.env.example`을 기준으로 AWS Parameter Store 또는 Secrets Manager에 분리 권장

## GitHub 협업 기준

- `.venv/`, `node_modules/`, `dist/`, `.env`, `backend/database/app.db`는 Git에 올리지 않습니다.
- 기능별로 브랜치를 나누는 것을 권장합니다.
- API 로직은 `backend/routes`와 `backend/services`를 분리해 수정합니다.
- 프론트 API 호출은 `frontend/services`에서만 관리합니다.
