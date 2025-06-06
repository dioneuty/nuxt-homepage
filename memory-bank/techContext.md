# 기술 컨텍스트

## 사용 기술
1. 프론트엔드
   - Nuxt.js 3.x
   - Vue.js 3.x
   - Tailwind CSS
   - @vueup/vue-quill
   - @iconify/vue
   - quill-markdown-shortcuts

2. 백엔드
   - Nuxt.js 서버
   - Prisma ORM (상세 모델은 `dbModels.md` 참조)
   - Node.js
   - JWT (jose)
   - bcryptjs

## 개발 환경 설정
1. 필수 도구
   - Node.js
   - npm/yarn
   - Git
   - VS Code

2. 환경 변수
   - .env 파일 설정
   - 데이터베이스 연결 정보
   - API 키 설정
   - JWT 시크릿 키

## 기술적 제약사항
1. 브라우저 지원
   - 최신 버전의 Chrome, Firefox, Safari
   - IE 지원 제외
   - 모바일 브라우저 지원

2. 성능 요구사항
   - 초기 로딩 시간 최적화
   - 반응형 디자인 지원
   - SEO 최적화
   - 다크 모드 지원

## 의존성
1. 핵심 패키지
   ```json
   {
     "dependencies": {
       "@vueup/vue-quill": "latest",
       "nuxt": "3.x",
       "prisma": "latest",
       "tailwindcss": "latest",
       "@iconify/vue": "latest",
       "quill-markdown-shortcuts": "latest",
       "jose": "latest",
       "bcryptjs": "latest"
     }
   }
   ```

2. 개발 도구
   - ESLint
   - Prettier
   - TypeScript
   - @nuxt/devtools
   - @nuxtjs/tailwindcss
   - @nuxtjs/i18n
   - @nuxtjs/color-mode 

## 데이터베이스 스키마
프로젝트의 전체 데이터베이스 모델 및 관계는 다음 문서에서 확인할 수 있습니다.
- [[dbModels.md]] 