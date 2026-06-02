# DeepLook Capstone

AI 기반 퍼스널컬러 + 골격체형 + 얼굴형 분석 및 패션/뷰티 추천 웹 서비스입니다.  
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
│   ├── face_shape/
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
- 얼굴형 분석 화면
- 로그인 및 회원가입 화면
- 자체 상품 DB 기반 추천 결과 화면
- FastAPI REST API
- 회원가입/로그인 API
- JWT 토큰 발급
- 사용자 정보 저장 API
- 퍼스널컬러, 골격체형, 얼굴형 결과 저장 API
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
POST /auth/login                 로그인 및 JWT 발급
PUT  /users/{user_id}            사용자 정보 수정
POST /analysis/personal-color    퍼스널컬러 결과 저장
POST /analysis/body-type         골격체형 결과 저장
POST /analysis/face-shape        얼굴형 결과 저장
POST /recommendations            추천 결과 제공
POST /recommend                  기존 프론트 호환용 추천 API
POST /ai/personal-color          AI 퍼스널컬러 모델 연동 지점
POST /ai/body-type               AI 골격체형 모델 연동 지점
POST /ai/face-shape              AI 얼굴형 모델 연동 지점
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
- `face_shape_results`
- `recommendations`

상품 추천용 샘플 DB SQL은 아래 파일에 있습니다.

```text
backend/database/deeplook_product_database.sql
```

## AI 모델 폴더 역할

`ai_model/`은 실제 AI 모델 코드를 백엔드 라우터와 분리하기 위한 영역입니다.

```text
ai_model/personal_color/analyzer.py
ai_model/body_type/analyzer.py
ai_model/face_shape/analyzer.py
ai_model/recommendation/recommender.py
```

현재는 캡스톤 시연용 placeholder 로직이며, 추후 이미지 분석 모델이나 추천 모델을 이 파일들에 연결하면 됩니다.

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
