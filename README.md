# My Nuxt 3 Blog and Board Application

This project is a modern web application built with Nuxt 3, featuring a blog and a board system. It demonstrates the use of Vue 3 composition API, server-side rendering, and responsive design with Tailwind CSS.

## Features

- Blog system with post creation and listing
- Board system for community discussions
- Responsive design for mobile and desktop
- Dark mode support
- Server-side rendering for improved SEO and performance

## Tech Stack

- Nuxt 3
- Vue 3
- Tailwind CSS
- SQLite (for data storage)

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

After installing the dependencies, if there is no database.sqlite, initialize the database and add sample data:

```bash
node /server/db/init.js
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

-----

# 블로그 프로젝트

이 프로젝트는 Nuxt 3를 사용한 현대적인 웹 애플리케이션으로, 블로그와 게시판 시스템을 포함하고 있습니다. Vue 3 컴포지션 API, 서버 사이드 렌더링, 그리고 Tailwind CSS를 이용한 반응형 디자인을 보여줍니다.

## 주요 기능

- 블로그 글 작성, 수정, 삭제
- 커뮤니티 토론을 위한 게시판 시스템
- 카테고리 관리
- 모바일과 데스크톱을 위한 반응형 디자인
- 다크 모드 지원
- SEO와 성능 향상을 위한 서버 사이드 렌더링

## 기술 스택

- Nuxt 3
- Vue 3
- Tailwind CSS
- SQLite (데이터 저장용)

## 프로젝트 구조

- `components/blog/`: 블로그 관련 Vue 컴포넌트
- `pages/blog/`: 블로그 페이지
- `middleware/`: Nuxt.js 미들웨어
- `layouts/`: 레이아웃 파일
- `composables/`: 재사용 가능한 Vue 컴포지션 함수

## 주요 컴포넌트

### BlogIndex

블로그 글 목록을 표시하는 컴포넌트입니다.

### BlogView

개별 블로그 글을 표시하는 컴포넌트입니다.

### BlogWrite

블로그 글 작성 및 수정 기능을 제공하는 컴포넌트입니다.

### BlogEditCategory

카테고리 관리 기능을 제공하는 컴포넌트입니다.

## 설치 및 실행 방법

(영문 섹션의 Setup, Development Server, Production 부분과 동일)

## 🔄 최근 리팩터링 (2025년 1월)

이 프로젝트는 코드 재사용성과 유지보수성을 향상시키기 위한 대규모 리팩터링을 완료했습니다.

### 서버 사이드 리팩터링

- **📊 페이지네이션 유틸리티**: 모든 API에서 일관된 페이지네이션 처리
- **🔍 검색 조건 빌더**: 동적 검색 및 필터링 로직 통합
- **⚠️ 오류 처리 통일**: handleApiError 패턴 표준화
- **📝 폼 제출 통합**: 중복된 폼 로직 제거 및 확장성 향상
- **🔧 코드 중복 제거**: 총 150줄 이상의 중복 코드 제거

### 프론트엔드 리팩터링 (신규)

- **🎨 테마 설정 통합**: 4개 파일의 중복 API 호출을 1개로 통합 (95% 코드 감소)
- **📋 목록 컴포넌트 통합**: BlogIndex와 BoardIndex의 공통 로직을 useListData 컴포저블로 추상화
- **🔄 UI 상태 관리**: 로딩, 에러, 성공 상태를 useUIStates 컴포저블로 통합
- **📱 반응형 최적화**: 모바일 무한스크롤 + 데스크톱 페이지네이션 하이브리드 지원
- **🚀 성능 향상**: 불필요한 API 호출 제거 및 캐싱 최적화

### 새로운 유틸리티 및 컴포저블

**서버 사이드**:
- `server/utils/pagination.js`: 서버 사이드 페이지네이션
- `server/utils/queryBuilder.js`: 검색 조건 빌더
- `composables/useFormSubmit.js`: 통합된 폼 제출 컴포저블

**프론트엔드**:
- `composables/useThemeSettings.js`: 테마 설정 관리
- `composables/useListData.js`: 범용 목록 데이터 관리
- `composables/useUIStates.js`: 공통 UI 상태 관리

### 리팩터링 성과

| 구분 | 기존 | 개선 후 | 개선율 |
|------|------|---------|--------|
| **테마 설정 중복 코드** | 80줄 | 4줄 | 95% 감소 |
| **BoardIndex 코드 라인** | 406줄 | 250줄 | 38% 감소 |
| **API 호출 최적화** | 4개 중복 | 1개 캐싱 | 75% 감소 |
| **전체 중복 코드 제거** | 300줄+ | - | 대폭 감소 |

자세한 내용은 다음 문서들을 참조하세요:
- [서버 사이드 리팩터링](./REFACTORING_SUMMARY.md)
- [프론트엔드 리팩터링](./FRONTEND_REFACTORING_SUMMARY.md)

## 대화방식
한국어로 설명해줘
