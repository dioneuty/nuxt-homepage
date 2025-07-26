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
  - **주의**: 개발 서버 실행 전 기존 프로세스 확인 필요
  - 포트 3000이 사용 중일 경우 자동으로 3001로 변경됨
  - 이미 실행 중인 프로세스가 있으면 중복 실행하지 말 것
- 빌드: `npm run build`
- 타입 체크: `npm run typecheck` (있는 경우)
- 린트: `npm run lint` (있는 경우)

#### Prisma 관련
- `npm run prisma:migrate` - 스키마 변경사항 적용
- `npm run prisma:generate` - 클라이언트 생성
- `npm run prisma:studio` - DB 시각적 관리
- `npm run prisma:reset` - DB 초기화

## 주요 기능
- 아웃라이너 (outliner): 계층적 텍스트 편집기
- 드래프트 자동 저장 기능
- 명령 팔레트 (CommandPalette)
- 파일 업로드 및 압축

## 데이터베이스 스키마 (Prisma)

### 데이터베이스 환경
- **Supabase** - 백엔드 서비스 (PostgreSQL)
- **Better SQLite3** - 로컬 데이터베이스 (개발용)
- **인덱스 설정**: `supabase_indexes_corrected.sql` 참조

### 주요 데이터 모델
- **User**: 사용자 관리 (username, email, role, chats 관계)
- **BlogPost**: 블로그 게시글 (Category 관계)
- **BoardPost**: 게시판 글 (계층형 답글 지원 - parentId/replies)
- **GalleryItem, AdminGalleryItem**: 갤러리 시스템 (tags, comments)
- **OutlineItem**: 아웃라이너 (계층 구조 - parent/children 관계)
- **Wiki**: 위키 페이지 (title, content, 작성자 추적)
- **Chat**: AI 채팅 (screenId, messages JSON, User 관계)
- **Guestbook**: 방명록 (익명 지원, 댓글 시스템)
- **HumorPost, QnA**: 유머게시판, Q&A 시스템
- **Category, Holiday**: 카테고리, 공휴일 관리

### Prisma 개발 명령어
- `npm run prisma:migrate` - 데이터베이스 스키마 변경사항 적용
- `npm run prisma:generate` - Prisma 클라이언트 생성
- `npm run prisma:studio` - Prisma Studio 실행 (DB 시각적 관리)
- `npm run prisma:reset` - 데이터베이스 초기화 및 마이그레이션 재적용
- `npx prisma migrate dev --name [이름]` - 새로운 마이그레이션 생성

### 데이터베이스 특징
- **계층형 구조**: BoardPost(답글), OutlineItem(아웃라이너) 지원
- **JSON 저장**: Chat.messages, OutlineState.state
- **익명 시스템**: Guestbook, GuestbookComment 비밀번호 보호
- **Base64 이미지**: content 필드에 직접 저장 (성능 최적화 필요)

## 기술 스택

### 프론트엔드
- **Nuxt.js 3.12.4** - Vue.js 3 기반 풀스택 프레임워크
- **Vue 3** - Composition API 사용
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **DaisyUI** - Tailwind CSS 컴포넌트 라이브러리
- **Pinia** - Vue 상태 관리 라이브러리

### 백엔드 & 데이터베이스
- **Prisma ORM** - 데이터베이스 ORM
- **Supabase** - 백엔드 서비스 (PostgreSQL)
- **Better SQLite3** - 로컬 데이터베이스 (개발용)

### 주요 라이브러리
- **@vueup/vue-quill** - 리치 텍스트 에디터
- **@fullcalendar/vue3** - 캘린더 컴포넌트
- **vuedraggable** - 드래그 앤 드롭 기능
- **axios** - HTTP 클라이언트
- **marked** - 마크다운 파서
- **bcrypt** - 비밀번호 해싱
- **jose** - JWT 처리
- **sharp** - 이미지 처리
- **multer** - 파일 업로드

## 프로젝트 구조

### 컴포넌트 구조 (53개)
```
components/
├── admin/ (8개) - 관리자 전용 컴포넌트
├── blog/ (5개) - 블로그 관련 컴포넌트
├── board/ (5개) - 게시판 관련 컴포넌트
├── common/ (12개) - 공통 UI 컴포넌트
├── gallery/ (3개) - 갤러리 관련 컴포넌트
├── home/ (5개) - 홈페이지 섹션 컴포넌트
├── wiki/ (3개) - 위키 관련 컴포넌트
├── youtubeGallery/ (3개) - 유튜브 갤러리 컴포넌트
└── 기타 공통 컴포넌트 (9개)
```

### 페이지 구조 (67개)
```
pages/
├── adminpage/ (12개) - 관리자 페이지
├── blog/ (4개) - 블로그 페이지
├── board/ (3개) - 게시판 페이지
├── contactboard/ (3개) - 문의 게시판
├── humor/ (3개) - 유머 게시판
├── qna/ (3개) - Q&A 게시판
├── wiki/ (4개) - 위키 페이지
├── test/ (2개) - 테스트 페이지
└── 기타 페이지 (33개)
```

### API 엔드포인트 (66개)
```
server/api/
├── admin/ (45개) - 관리자 API
│   ├── db/ (12개) - 데이터베이스 관리
│   ├── gallery/ (4개) - 갤러리 관리
│   ├── posts/ (4개) - 포스트 관리
│   ├── users/ (5개) - 사용자 관리
│   └── 기타 관리 API
├── guestbook/ (4개) - 방명록 API
├── outline-item/ (2개) - 아웃라이너 API
└── 기타 공용 API (15개)
```

### Composables (25개)
- 인증: `useAuth.js`
- 데이터 관리: `useBlogPosts.js`, `useBoardPosts.js`, `useOutlineItems.js` 등
- UI 상태: `useModal.js`, `useToast.js`, `useCommandPalette.js` 등
- 유틸리티: `useIsMobile.js`, `usePagination.js`, `useDraftSave.js` 등

### Stores (5개)
- `categoryStore.js` - 카테고리 관리
- `galleryStore.js` - 갤러리 상태
- `layout.js` - 레이아웃 상태
- `navStore.js` - 네비게이션 상태
- `menu.js` - 메뉴 관리

### 미들웨어 (3개)
- `admin-auth.js` - 관리자 인증
- `auth.global.js` - 전역 인증
- `layout.global.js` - 레이아웃 설정

## 주요 기능 상세

### 1. 아웃라이너 (Outliner)
- 계층적 텍스트 편집기
- 드래그 앤 드롭으로 항목 재정렬
- 실시간 드래프트 저장
- 관련 컴포넌트: `OutlineItem.vue`, `OutlineModal.vue`, `OutlineDetailViewer.vue`

### 2. 다중 게시판 시스템
- 블로그, 일반게시판, Q&A, 유머, 문의게시판
- 카테고리별 분류 및 검색
- 댓글 및 답글 기능
- 관리자 승인 시스템

### 3. 갤러리 시스템
- 이미지 업로드 및 압축
- 모달 뷰어 및 편집 기능
- 관리자 갤러리 관리

### 4. 위키 시스템
- Quill 에디터 기반 위키 편집
- 마크다운 지원
- 문법 가이드 제공

### 5. 관리자 패널
- 사용자 관리 (생성, 수정, 삭제, 비밀번호 재설정)
- 컨텐츠 관리 (포스트, 갤러리, 메뉴)
- 데이터베이스 백업/복원
- 테마 설정

### 6. 기타 기능
- AI 채팅 (OpenAI API 연동)
- 유튜브 갤러리
- 캘린더 (FullCalendar)
- 명령 팔레트 (Cmd+K)
- 다크/라이트 모드
- 반응형 디자인

## 라우팅 설정

### 정적 페이지 (Prerender)
- `/about`, `/services`, `/related-sites`, `/contact`, `/under-construction`

### SWR (60초 캐시)
- `/`, `/blog/**`, `/gallery/**`, `/wiki/**` 등 동적 콘텐츠

### 클라이언트 사이드 렌더링
- `/outliner/**`, `/adminpage/**` 등 인터랙티브 페이지

## 개발 환경 설정

### 빌드 최적화
- Terser 압축 (콘솔 로그 제거)
- Vue3-quill, @iconify/vue 트랜스파일
- 이미지 최적화 (WebP 포맷, 지연 로딩)

### CSS 설정
- Tailwind CSS + DaisyUI
- 커스텀 CSS: `main.css`, `quill-custom.css`, `calendar.css`
- 다크 모드 지원 (`class` 전략)

### 플러그인
- `v-html-img.js` - HTML 이미지 처리
- `v-html-img-one.js` - 단일 이미지 처리

## 주의사항
- 보안: API 키나 민감한 정보는 환경 변수에 저장
- 성능: 대용량 데이터 처리 시 페이지네이션 고려
- 사용자 경험: 로딩 상태 및 에러 처리 필수

## API 참조 및 문서화

### 주요 API 엔드포인트
- **통합 검색 API**: `POST /api/search` - 게시판, 블로그, 위키, 갤러리 통합 검색
- **아웃라이너 API**: `GET/POST /api/outline` - 상태 저장/조회
- **아웃라인 아이템 API**: `/api/outline-item` - 아이템별 CRUD
- **관리자 API**: `/api/admin/*` - 사용자, DB, 갤러리 관리
- **콘텐츠 API**: 각 게시판별 CRUD 엔드포인트

### API 문서 위치
상세 API 명세는 `memory-bank/api-docs/` 폴더 참조:
- `search-api.md` - 통합 검색 API 상세 명세
- `outline-api.md` - 아웃라이너 API 상세 명세
- 기타 21개 API 문서 (각 기능별 상세 명세)

### API 공통 사항
- **오류 처리**: `server/utils/apiErrorHandlers.js`의 `handleApiError` 공통 함수 사용
- **인증**: JWT 기반 (jose 라이브러리)
- **권한**: 역할 기반 접근 제어 (RBAC)

## 구현 세부사항

### 오류 처리 시스템
- **handleApiError**: `server/utils/apiErrorHandlers.js`의 공통 오류 처리 함수
- 모든 API 엔드포인트에서 일관된 오류 로깅 및 응답 제공
- 기존 `createError` + `console.error` 패턴을 `handleApiError(event, statusCode, message, error)` 호출로 통합

### 다크모드 구현 방식
- **기술 스택**: `@nuxtjs/color-mode` + Tailwind CSS `darkMode: 'class'`
- **동작 원리**: 
  - `@nuxtjs/color-mode`가 시스템 색상 모드 감지
  - `<html>` 태그에 `dark` 클래스 자동 토글
  - Tailwind `dark:` 프리픽스 유틸리티 클래스 적용
- **사용자 제어**: 라이트/다크/시스템 모드 수동 전환 UI 제공

### 갤러리 관리 시스템
- **라우팅 방식**: 페이지 기반 라우팅으로 `/adminpage/gallery` 처리
- **API 통합**: 단일/목록 조회를 하나의 엔드포인트에서 처리
- **데이터 안정성**: 옵셔널 체이닝으로 `TypeError` 방지

---

# 📚 메모리뱅크 컨텍스트

## 현재 작업 컨텍스트

### 🎯 현재 작업 초점
- **UX 개선 및 생산성 향상**: Command Palette 시스템, 임시저장 기능, Pull-to-Refresh 등 현대적인 UX 패턴을 통해 사용자 경험을 대폭 향상하는 데 초점을 맞추고 있습니다.
- 기존 시스템 안정화는 완료되었으며, 이제 사용자 편의성과 생산성 향상이 주요 목표입니다.

### ✅ 최근 완료 작업 (2025년 1월)

#### 1. **Command Palette 시스템 구현 완료**
- Cmd+K/Ctrl+K 키보드 단축키로 활성화되는 통합 검색 및 네비게이션 시스템
- 기존 `/api/search` API와 완벽 통합
- 글래스모피즘 디자인으로 7개 기본 명령어 (홈, 블로그 작성, 게시물 작성, 위키 작성, 갤러리, 검색, 아웃라이너) 제공
- 실시간 검색 결과와 키보드 네비게이션 (↑↓ Enter ESC) 지원
- 메뉴 시스템과 통합하여 모든 접근 가능한 메뉴 항목 검색 가능
- 권한 기반 필터링으로 사용자 권한에 따른 메뉴만 표시

#### 2. **수동 임시저장 시스템 구현 완료**
- 사용자가 버튼 클릭 시에만 저장하는 수동 방식
- localStorage 기반으로 폼별 고유 키로 데이터 격리
- 7일 자동 만료 및 토스트 메시지 피드백
- BlogWrite, BoardWrite, WikiEditor에 완전 적용
- 초안 복구 프롬프트: "복원하기" / "삭제하기" 2버튼 모달
- 폼 제출 성공 시 초안 자동 삭제 및 상태 관리

#### 3. **YouTube 갤러리 카테고리 시스템 구현 완료** (2025년 7월)
- `YouTubeVideoCategory` 모델 추가 및 관계 설정
- 관리자 카테고리 CRUD API (`/api/admin/youtube-categories`)
- 공개 카테고리 조회 API (`/api/youtube-categories`)
- 드래그앤드롭 카테고리 관리 페이지 (`/pages/adminpage/youtube-categories.vue`)
- 비디오 관리 모달에 카테고리 선택 드롭다운 추가
- 메인 갤러리 페이지에 카테고리 필터 및 검색 기능
- 비디오 카드에 카테고리 태그 표시
- URL 파라미터 지원 (`?category=categoryId`)

#### 4. **API 오류 처리 시스템 통합 완료**
- `server/utils/apiErrorHandlers.js`의 `handleApiError` 공통 함수 도입
- 전체 API 엔드포인트 (66개)에서 일관된 오류 처리 적용
- 기존 개별 오류 처리 로직을 표준화된 함수로 통합
- 일관된 로깅 및 에러 응답 형식 구축

#### 5. **PIP 유튜브 플레이어 시스템 구현 완료** (2025년 7월)
- 플로팅 유튜브 플레이어 컴포넌트 (`FloatingYouTubePlayer.vue`)
- Pinia 스토어 (`floatingPlayer.js`) 상태 관리
- 메인 레이아웃에 토글 버튼 통합
- 비디오 목록 표시/숨김 기능
- 드래그 가능한 플로팅 윈도우 
- 최소화/복원, 이전/다음 비디오 컨트롤
- API 엔드포인트 (`/api/youtube-videos`) 생성
- 유튜브 갤러리와 완전 연동

### 🚀 진행중인 쉬림프 태스크 (3/8 완료, 37.5%)

#### ✅ 완료된 태스크
1. **Command Palette 시스템** - 85점으로 완료
2. **스마트 폼 자동저장 시스템** - 90점으로 완료 
3. **수동 임시저장 버튼 시스템** - 90점으로 완료

#### ⏳ 대기중인 태스크
4. **개인화 대시보드 위젯 시스템** - 드래그앤드롭으로 위젯 배치, 기존 index.vue 섹션 시스템 확장
5. **향상된 모바일 제스처 시스템** - Pull-to-Refresh 구현, 스와이프 네비게이션, 터치 제스처 최적화
6. **PWA 완전 구현** - 오프라인 지원, 푸시 알림, 앱 설치 기능
7. **실시간 알림 시스템 기초** - WebSocket 연결, 실시간 댓글 알림
8. **사용자 설정 및 접근성 개선** - 키보드 네비게이션, 고대비 모드, 폰트 크기 조절

## 제품 컨텍스트

### 문제 해결 목표
- 복잡한 텍스트 편집 기능이 필요한 웹 애플리케이션
- 반응형 디자인이 필요한 모바일/데스크톱 환경
- 데이터베이스 연동이 필요한 콘텐츠 관리
- 관리자가 웹사이트의 다양한 게시판 콘텐츠를 효율적으로 관리할 수 있는 기능

### 사용자 경험 목표
1. **직관적인 인터페이스**
   - 쉽게 이해할 수 있는 에디터 도구
   - 명확한 기능 구분
   - 직관적인 아이콘 사용
   - 관리자 친화적인 게시글 관리 인터페이스

2. **반응형 디자인**
   - 모바일 환경 최적화
   - 태블릿/데스크톱 지원
   - 다양한 화면 크기 대응

3. **성능 최적화**
   - 빠른 로딩 시간
   - 부드러운 편집 경험
   - 효율적인 데이터 처리

## 기술 컨텍스트

### 핵심 기술 스택
1. **프론트엔드**
   - Nuxt.js 3.x
   - Vue.js 3.x
   - Tailwind CSS
   - @vueup/vue-quill
   - quill-resize-module
   - @nuxtjs/color-mode
   - @iconify/vue
   - quill-markdown-shortcuts

2. **백엔드**
   - Nuxt.js 서버
   - Prisma ORM
   - Node.js
   - JWT (jose)
   - bcryptjs

### 주요 기술 결정사항
1. **텍스트 에디터**: @vueup/vue-quill + quill-resize-module + quill-markdown-shortcuts
2. **다크 모드**: `@nuxtjs/color-mode` 모듈과 Tailwind CSS의 `darkMode: 'class'` 설정 사용
3. **상태 관리**: Pinia + 25개의 고도화된 Composable 함수

## ⚠️ 현재 성능 병목점 및 주의사항

### 성능 이슈
- **Base64 이미지 저장**: 현재 가장 큰 성능 병목점 (85-90% 성능 개선 가능)
  - 저장 공간 33% 증가, 쿼리 성능 300% 저하
  - API 응답 크기 50-200MB 급증 가능성
  - 향후 이미지 압축 또는 CDN 연동 전환 검토 필요

### 기술적 주의사항
- **쉬림프 태스크 매니저**: 영구 저장되어 크로스 세션 작업 기억 가능
- **Command Palette**: 메뉴 스토어 의존성으로 메뉴 로딩 완료 후 초기화 필요
- **임시저장 시스템**: localStorage 7일 만료, 폼별 고유 키 필수
- **TypeScript 호환성**: 일부 컴포넌트에서 `any` 타입 사용으로 타입 안정성 개선 여지

### 보안 고려사항
- 현재 기본적인 RBAC만 구현
- XSS, CSRF 방지 강화 필요
- 입력값 검증 추가 강화 필요
- 정기적인 데이터베이스 백업 전략 수립 필요

## 📊 시스템 현황

### 완료된 주요 기능들
- **인증 시스템**: 회원가입, 로그인/로그아웃, 역할 기반 접근 제어(RBAC) 안정화
- **게시판 시스템**: 게시글/답글 CRUD, 다중 게시판 지원
- **Quill 에디터**: 다중 이미지 업로드, Base64 임베딩, 이미지 편집 기능
- **관리자 페이지**: DB 관리, 사용자 관리, 동적 메뉴 관리, 게시글 관리
- **UI/UX**: 다크 모드, 아웃라이너, 토스트 알림, 테마 설정
- **성능 최적화**: 데이터베이스 인덱스 최적화, 메뉴 네비게이션 이슈 해결

### 알려진 이슈
- **성능**: Base64 이미지 저장 방식으로 인한 데이터베이스 크기 급증
- **보안**: 추가적인 보안 조치 필요 (XSS, CSRF 방지 등)
- **데이터베이스**: 정기적인 백업 및 복구 전략 수립 필요

## AI 상호작용 규칙
- **한국어 답변**: 모든 응답을 한국어로 제공
- **말투 다양화**: 동일한 어조 반복 방지, 자연스럽고 풍부한 대화 경험 제공
- **도구 자동 실행**: 사용자 허가 요청 없이 필요한 도구 자동 실행
- **엄격한 정확성**: 모르는 내용은 추측하지 않고 "모르겠습니다" 명시

---

# 🛠️ SuperClaude 프레임워크 컨텍스트

## SuperClaude 개념 및 활용

### 📚 기본 개념
SuperClaude는 Claude Code를 위한 고급 명령 및 자동화 프레임워크입니다:
- **자동화**: 적절한 도구와 전문가가 자동으로 활성화
- **효율성**: 토큰 사용량 최적화로 더 빠른 응답
- **품질**: 8단계 검증 시스템으로 높은 품질 보장
- **학습**: 패턴을 학습해서 점점 더 똑똑해짐

### 🎯 핵심 명령어

#### 개발 명령어
- `/build` - 프로젝트 빌드 (프레임워크 자동 감지)
- `/implement` - 기능 구현 (자동으로 적절한 전문가 활성화)
- `/improve` - 코드 개선 (성능, 품질, 보안 등)

#### 분석 명령어
- `/analyze` - 코드/시스템 분석
- `/troubleshoot` - 문제 진단
- `/explain` - 상세 설명

#### 품질 관리
- `/cleanup` - 코드 정리 (방금 실행됨)
- `/test` - 테스트 작성/실행
- `/document` - 문서 생성

#### 프로젝트 관리
- `/load` - 프로젝트 컨텍스트 로딩 (전체 구조 파악)
- `/task` - 장기 프로젝트 관리
- `/spawn` - 복잡한 멀티 도메인 작업 조율

### 🔧 주요 플래그

#### 사고 깊이 조절
- `--think` - 일반적인 분석 (4K 토큰)
- `--think-hard` - 깊은 분석 (10K 토큰)
- `--ultrathink` - 매우 깊은 분석 (32K 토큰)

#### 효율성 플래그
- `--uc` - 압축 모드 (30-50% 토큰 절약)
- `--plan` - 실행 전 계획 보기
- `--validate` - 안전 검증

#### 반복 개선
- `--loop` - 여러 번 개선 반복

### 🎭 자동 전문가 시스템

요청 내용에 따라 자동으로 전문가가 활성화됩니다:
- **Frontend 전문가**: UI/UX 작업, 컴포넌트 개발
- **Backend 전문가**: API, 데이터베이스 작업
- **Security 전문가**: 보안 이슈, 취약점 분석
- **Performance 전문가**: 성능 최적화, 병목점 해결
- **Analyzer 전문가**: 문제 진단, 근본 원인 분석
- **Architect 전문가**: 시스템 설계, 아키텍처 결정

### 💡 Nuxt 프로젝트 활용 예시

```bash
# 현재 프로젝트 전체 분석
/analyze --think

# YouTube 갤러리 성능 개선
/improve pages/youtube-gallery.vue --perf --loop

# 새로운 컴포넌트 구현
/implement "드래그앤드롭 파일 업로더"

# 보안 취약점 검사
/analyze --focus security --think-hard

# 코드 정리 (방금 실행됨)
/cleanup --type all

# 프로젝트 컨텍스트 로딩
/load --focus frontend
```

## 현재 프로젝트에서의 SuperClaude 활용도

### ✅ 최근 성공적인 활용 사례
1. **YouTube 갤러리 카테고리 시스템** - `/implement` 명령어로 완전한 CRUD 시스템 구현
2. **API 오류 처리 통합** - `/improve` 명령어로 66개 API 엔드포인트 일관성 확보
3. **코드 클린업** - `/cleanup` 명령어로 TODO 주석 정리 및 디버그 로그 최적화

### 🎯 향후 활용 계획
- **PWA 구현**: `/implement "PWA 오프라인 지원"` 
- **성능 최적화**: `/improve --perf --focus database`
- **보안 강화**: `/analyze --focus security --ultrathink`
- **테스트 추가**: `/test --type integration`