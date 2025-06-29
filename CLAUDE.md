# 프로젝트 메모리 및 규칙

## 프로젝트 개요
- Nuxt.js 프로젝트 (Vue.js 기반)
- 아웃라이너 기능이 포함된 웹 애플리케이션
- Supabase를 데이터베이스로 사용

## 코딩 규칙

### 스타일 가이드
- Vue 3 Composition API 사용
- TypeScript 또는 JavaScript 사용
- 컴포넌트명은 PascalCase 사용
- 파일명은 kebab-case 또는 PascalCase 사용
- composables는 `use`로 시작하는 camelCase 사용

### 폴더 구조
- `components/` - Vue 컴포넌트
- `composables/` - 재사용 가능한 로직
- `pages/` - 페이지 컴포넌트
- `server/api/` - API 엔드포인트

### 명명 규칙
- 변수: camelCase
- 함수: camelCase
- 상수: SNAKE_CASE
- 컴포넌트: PascalCase

### 개발 명령어
- 개발 서버: `npm run dev`
- 빌드: `npm run build`
- 타입 체크: `npm run typecheck` (있는 경우)
- 린트: `npm run lint` (있는 경우)

## 주요 기능
- 아웃라이너 (outliner): 계층적 텍스트 편집기
- 드래프트 자동 저장 기능
- 명령 팔레트 (CommandPalette)
- 파일 업로드 및 압축

## 데이터베이스
- Supabase 사용
- 인덱스 설정은 `supabase_indexes_corrected.sql` 참조

## 주의사항
- 보안: API 키나 민감한 정보는 환경 변수에 저장
- 성능: 대용량 데이터 처리 시 페이지네이션 고려
- 사용자 경험: 로딩 상태 및 에러 처리 필수