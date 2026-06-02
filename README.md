# DeepLook

AI 기반 퍼스널 컬러, 골격, 체형 분석 결과를 사용자의 TPO 검색 문장과 결합해 패션 아이템을 추천하는 웹 서비스입니다.

## 실행 방법

프론트엔드:

```bash
pnpm run dev
```

접속 주소:

```text
http://localhost:5173
```

백엔드:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn cap:app --reload --host 127.0.0.1 --port 8000
```

백엔드 확인 주소:

```text
http://127.0.0.1:8000
```

## 프로젝트 구조

```text
.
├── cap.py                  # FastAPI 백엔드: 자체 상품 DB 기반 추천
├── database/               # MySQL 스키마와 상품 샘플 데이터
├── requirements.txt        # 백엔드 Python 의존성
├── index.html              # Vite 앱 진입 HTML
├── package.json            # 프론트엔드 의존성 및 실행 스크립트
├── vite.config.ts          # Vite 설정
├── tsconfig.json           # TypeScript 설정
├── postcss.config.mjs      # PostCSS 설정
├── pnpm-lock.yaml          # pnpm 잠금 파일
├── pnpm-workspace.yaml     # pnpm 워크스페이스 설정
├── dist/                   # 빌드 결과물, pnpm run build로 재생성 가능
└── src/
    ├── main.tsx            # React 앱 마운트
    ├── App.tsx             # 전체 페이지 라우팅, 추천 API 호출 상태 관리
    ├── index.css           # Tailwind import 및 공통 애니메이션
    ├── types/index.ts      # 공통 타입 정의
    ├── constants/data.ts   # 문항, 결과 설명, 팔레트, 추천 아이템 데이터
    ├── utils/helpers.ts    # 퍼스널컬러/골격/체형 계산 로직
    └── components/
        ├── pages/          # 화면 단위 페이지 컴포넌트
        └── shared/         # 공통 UI 컴포넌트
```

## 핵심 파일 설명

### `src/App.tsx`

앱의 중심입니다.

- 현재 페이지 상태 관리
- 선택된 퍼스널 컬러, 골격, 체형, 추천 핏 상태 관리
- 백엔드 `/recommend` API 호출 및 로컬 상품 DB fallback
- 메인/진단 페이지 라우팅

### `src/components/pages/MainPage.tsx`

메인 추천 화면입니다.

- 현재 진단 프로필 표시
- 퍼스널 컬러, 골격, 체형 진단 페이지 이동
- 성별, 체형 정보, 스타일 취향, 착용 목적 입력
- 검색어 입력 및 추천 결과 렌더링

### `src/components/pages/PersonalColorPage.tsx`

퍼스널 컬러 진단 화면입니다.

- 자가 설문 진단
- 카메라 촬영 진단
- 이미지 업로드 진단
- 분석 품질, 신뢰도, 경고 메시지 표시

### `src/components/pages/SkeletonPage.tsx`

골격 타입 자가 진단 화면입니다.

- 스트레이트
- 내추럴
- 웨이브

### `src/components/pages/BodyShapePage.tsx`

체형 실루엣 자가 진단 화면입니다.

- 어깨/골반 비율 응답
- 허리 굴곡 응답
- 상체/하체 밸런스 응답
- 옷이 불편한 부위
- 체중 변화 부위
- 선택 치수 입력
- 결과 신뢰도와 보조 후보 표시

### `src/utils/helpers.ts`

진단 계산 로직이 모여 있는 파일입니다.

- `analyzeImageForPersonalColor`: 이미지 기반 퍼스널 컬러 분석
- `calcPCResult`: 설문 기반 퍼스널 컬러 계산
- `calcSkeletonResult`: 골격 타입 계산
- `calcBodyType`: 체형 실루엣 가중치 계산

### `src/constants/data.ts`

화면에 쓰이는 고정 데이터입니다.

- 퍼스널 컬러 설문 문항
- 퍼스널 컬러 결과 설명
- 골격 설문 문항
- 기본 추천 카테고리

### `cap.py`

백엔드 서버입니다.

- FastAPI 앱 정의
- `database/deeplook_product_database.sql` 상품 데이터 읽기
- 검색어, 퍼스널컬러, 골격, 체형, 성별, 스타일, 상황 기반 점수 계산
- 추천 상품과 추천 이유, 매칭 점수 반환
- 외부 API 키 없이 자체 상품 DB만으로 동작

## 정리 기준

유지해야 하는 파일:

- `src/`
- `cap.py`
- `database/`
- `requirements.txt`
- `index.html`
- `package.json`
- `pnpm-lock.yaml`
- `vite.config.ts`
- `tsconfig.json`
- `postcss.config.mjs`
- `pnpm-workspace.yaml`

지워도 되는 파일:

- `__pycache__/`
- `*.pyc`
- `*.bak`

상황에 따라 지워도 되는 파일:

- `dist/`: 빌드 결과물입니다. 배포에 쓰지 않는다면 삭제 가능하며 `pnpm run build`로 다시 만들 수 있습니다.
- `node_modules/`: 의존성 폴더입니다. 삭제하면 `pnpm install`로 다시 설치해야 합니다.

## 빌드

```bash
pnpm run build
```

빌드 결과는 `dist/`에 생성됩니다.
