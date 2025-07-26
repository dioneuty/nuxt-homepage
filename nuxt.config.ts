export default defineNuxtConfig({
  css: ['~/assets/css/main.css', '~/assets/css/quill-custom.css', '@/assets/css/calendar.css'],

  app: {
    head: {
      title: 'Dion',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Dion' },
        { name: 'author', content: 'Dion' },
        { name: 'keywords', content: 'Dion' },
        { name: 'robots', content: 'index, follow' },
        { name: 'google', content: 'notranslate' },
        { name: 'msapplication-TileColor', content: '#da532c' },
        { name: 'theme-color', content: '#ffffff' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
      script: [
        // PDF.js 라이브러리 CDN 통합
        { src: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.12.6/build/pdf.min.js', defer: true },
      ]
    },
  },

  plugins: [
    '~/plugins/v-html-img.js',
    '~/plugins/v-html-img-one.js'
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY
    }
  },

  compatibilityDate: '2024-08-04',

  vite: {
    optimizeDeps: {
      include: ['vue3-quill']
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true
        }
      },
    }
  },

  build: {
    transpile: ['vue3-quill', '@iconify/vue', 'bcryptjs', 'jose'],
  },


  modules: [
    '@pinia/nuxt',
    '@nuxt/image',
    '@nuxt/devtools',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
    'pinia-plugin-persistedstate',
    '@nuxtjs/color-mode',
  ],

  image: {
    inject: true,
    defaultLazy: true,
    observerOptions: {
      rootMargin: '50px',
      threshold: 0.1
    },
    format: ['webp'],
    screens: {
      'sm': 640,
      'md': 768,
      'lg': 1024,
      'xl': 1280,
      '2xl': 1536,
    },
  },

  colorMode: {
    preference: 'system', // 기본 설정
    fallback: 'light', // 시스템 설정을 사용할 수 없을 때의 폴백
    hid: 'nuxt-color-mode-script',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    classSuffix: '',
    storageKey: 'nuxt-color-mode'
  },

  routeRules: {
    // 정적으로 생성할 페이지들 - about, services, related-sites, contact, under-construction
    '/about': { prerender: true },
    '/services': { prerender: true },
    '/related-sites': { prerender: true },
    '/contact': { prerender: true },
    '/under-construction': { prerender: true },
    
    // 동적 콘텐츠 (증분 정적 재생성 - 60초마다 갱신)
    '/': { swr: 60 },
    '/qna': { swr: 60 },
    '/contactboard': { swr: 60 },
    '/board': { swr: 60 },
    '/blog/**': { swr: 60 },
    '/gallery/**': { swr: 60 },
    '/wiki/**': { swr: 60 },
    '/ai-chat/**': { swr: 60 },
    '/search/**': { swr: 60 },
    '/youtube-gallery/**': { swr: 60 },
    '/humor/**': { swr: 60 },
    '/guestbook/**': { swr: 60 },

    // API 라우트
    '/api/**': { cors: true, headers: { 'access-control-allow-methods': 'GET, POST, PUT, DELETE' } },

    // 클라이언트 사이드 렌더링 - outliner, personal-info, admin, adminboard, admingallery
    '/outliner/**': { ssr: false },
    '/personal-info/**': { ssr: false },
    '/adminpage/**': { ssr: false },
    '/adminboard/**': { ssr: false },
    '/admingallery/**': { ssr: false },

    // 주기적으로 업데이트되는 페이지 (증분 정적 재생성)
    //'/frequently-updated/**': { isr: 60 } // 60초마다 재생성
  },

  // 보안 헤더 설정
  nitro: {
    routeRules: {
      '/**': {
        headers: {
          // XSS 보호
          'X-XSS-Protection': '1; mode=block',
          // 콘텐츠 타입 스니핑 방지
          'X-Content-Type-Options': 'nosniff',
          // 클릭재킹 공격 방지
          'X-Frame-Options': 'DENY',
          // 리퍼러 정책
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          // 권한 정책 (카메라, 마이크 등 차단)
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
          // CSP (Content Security Policy) - 이미지와 유튜브를 위해 조정됨
          'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://www.youtube.com https://s.ytimg.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https: blob:",
            "media-src 'self' data: https:",
            "connect-src 'self' https:",
            "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
            "worker-src 'self' blob:",
            "child-src 'self' https://www.youtube.com",
            "form-action 'self'",
            "base-uri 'self'",
            "manifest-src 'self'"
          ].join('; ')
        }
      },
      // API 라우트는 CORS 허용
      '/api/**': {
        cors: true,
        headers: {
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Origin': '*'
        }
      }
    },
    externals: {
      inline: ['bcryptjs', 'jose']
    }
  }
})