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
🚀 DeepLook 캡스톤 프로젝트 처음부터 실행하는 마스터 가이드
1단계: 필수 프로그램 준비하기 (딱 2개)
1. Node.js 설치 (프론트엔드용)
구글에 Node.js를 검색하거나 공식 홈페이지(https://nodejs.org)에 접속합니다.

왼쪽의 LTS 라고 적힌 안정화 버전을 다운로드하여 설치합니다. (설치 중 나오는 옵션은 전부 Next 누르시면 됩니다.)

2. Python 임베디드 버전 준비 (백엔드용)
우리가 성공했던 가장 확실한 방식입니다.

파이썬 공식 홈페이지 다운로드 페이지에서 Windows embeddable package (64-bit) zip 파일을 다운로드합니다.

다운로드한 압축 파일을 D:\python-3.14.6-embed-amd64 경로에 압축 해제합니다.

압축을 푼 폴더 안에 들어가서 python314._pth 파일을 메모장으로 엽니다.

맨 밑에 있는 #import site 맨 앞의 #을 지우고 import site로 수정한 뒤 저장합니다.

2단계: 프론트엔드(Frontend) 세팅 및 실행
윈도우 터미널(CMD)을 새로 열고, 프로젝트 폴더로 이동합니다.

DOS
cd D:\capstone\capstone-main
패키지 매니저인 pnpm을 전역으로 설치합니다.

DOS
npm install -g pnpm
프론트엔드 소스코드가 모여있는 frontend 폴더로 이동합니다.

DOS
cd frontend
프론트엔드 구동에 필요한 패키지들을 일괄 설치합니다.

DOS
pnpm install
빌드 스크립트 실행 권한을 승인해 줍니다.

DOS
pnpm approve-builds
프론트엔드 서버를 실행합니다.

DOS
pnpm dev
정상 실행되면 터미널에 http://localhost:5173 주소가 뜹니다. 인터넷 창을 열고 이 주소로 접속해 둡니다.

3단계: 백엔드(Backend) 세팅 및 실행 (터미널 새로 열기!)
⚠️ [중요] 프론트엔드가 켜져 있는 터미널 창은 그대로 켜두고, 새로운 윈도우 터미널(CMD) 창을 하나 더 켭니다.

새 터미널 창에서 임베디드 파이썬 폴더로 이동하여 pip(패키지 설치 프로그램)를 주입해 줍니다.

DOS
cd D:\python-3.14.6-embed-amd64
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python.exe get-pip.py
다시 프로젝트의 루트 폴더로 이동합니다.

DOS
cd D:\capstone\capstone-main
임베디드 파이썬 명령어를 직접 찔러서 백엔드 필수 라이브러리(fastapi, uvicorn 등)를 일괄 설치합니다.

DOS
D:\python-3.14.6-embed-amd64\python.exe -m pip install -r requirements.txt
마지막으로 백엔드 서버를 구동합니다.

DOS
D:\python-3.14.6-embed-amd64\python.exe -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
터미널에 Uvicorn running on http://127.0.0.1:8000 문구가 뜨면 백엔드까지 완벽하게 성공한 것입니다.

4단계: 확인 및 시연
이제 터미널 창 2개가 동시에 열려 있고 둘 다 정상 작동 중인 상태입니다.

아까 2단계에서 열어두었던 http://localhost:5173 웹 브라우저 창으로 이동합니다.

새로고침(F5)을 누릅니다.

화면에 떠 있던 "백엔드 연결을 확인해 주세요" 경고창이 깔끔하게 사라지고, 지역 연계 패션 브랜드 상품 추천 및 AI 퍼스널컬러/체형 진단 기능이 정상적으로 맞물려 돌아가는지 확인합니다.

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
