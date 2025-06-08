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

  nitro: {
    externals: {
      inline: ['bcryptjs', 'jose']
    },
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
  }
})