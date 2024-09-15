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
  }
})