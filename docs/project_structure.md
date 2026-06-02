# Project Structure

이 문서는 DeepLook 캡스톤 프로젝트의 폴더 역할을 설명합니다.

## frontend

React 화면을 담당합니다. API 호출은 `frontend/services`에 모아 UI 코드와 통신 코드를 분리했습니다.

## backend

FastAPI 서버를 담당합니다. REST API는 `routes`, 비즈니스 로직은 `services`, 요청/응답 타입은 `models`에 둡니다.

## ai_model

AI 분석 로직을 보관합니다. 백엔드 라우터 안에 모델 코드를 직접 넣지 않고, 이 폴더의 analyzer/recommender를 호출합니다.

## docs

발표 자료, DB 설명, 구조 문서를 보관합니다.
