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
