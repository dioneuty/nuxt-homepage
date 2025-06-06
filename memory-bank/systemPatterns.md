# 시스템 패턴

## 시스템 아키텍처
1. 프론트엔드
   - Nuxt.js 기반 SPA
   - Vue.js 컴포넌트 구조
   - Tailwind CSS 스타일링
   - 다크 모드 지원

2. 백엔드
   - Nuxt.js 서버 사이드
   - Prisma ORM
   - RESTful API 구조
   - JWT 인증

## 주요 기술 결정
1. 텍스트 에디터
   - Quill Editor 선택 이유
     * 풍부한 기능 지원
     * 커스터마이징 용이
     * 안정적인 성능
     * 마크다운 지원

2. 데이터베이스
   - Prisma ORM 선택 이유
     * 타입 안정성
     * 쉬운 마이그레이션
     * 효율적인 쿼리
     * 스키마 관리 용이

## 디자인 패턴
1. 컴포넌트 구조
   - 재사용 가능한 컴포넌트
   - 단일 책임 원칙
   - Props/Events 기반 통신
   - 컴포지션 API 활용

2. 상태 관리
   - Vue의 반응형 시스템
   - Props/Events 흐름
   - Pinia 스토어 활용
   - 컴포저블 함수 활용

## 컴포넌트 관계
1. CommonQuillEditor
   - 독립적인 에디터 컴포넌트
   - Props를 통한 데이터 전달
   - Events를 통한 상태 변경
   - 다크 모드 지원

2. WikiQuillEditor
   - CommonQuillEditor 확장
   - 마크다운 기능 추가
   - 클립보드 최적화
   - 최소 높이 설정

3. 레이아웃 구조
   - 페이지 레이아웃
   - 네비게이션 컴포넌트
   - 공통 UI 요소
   - 반응형 디자인 

## API 문서
- API 관련 문서는 `memory-bank/api-docs/` 디렉토리에 저장되어 있습니다.
- 각 파일은 API 엔드포인트, 요청/응답 형식, 그리고 사용 예제를 포함합니다. 