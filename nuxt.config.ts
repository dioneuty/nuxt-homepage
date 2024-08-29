export default defineNuxtConfig({
  css: ['~/assets/css/main.css', '~/assets/css/quill-custom.css'],

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
  app: {
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  vite: {
    optimizeDeps: {
      include: ['@vueup/vue-quill', 'quill-delta']
    },
    build: {
      commonjsOptions: {
        include: [/quill-delta/]
      }
    }
  },
  build: {
    transpile: ['@vueup/vue-quill', '@iconify/vue', 'bcryptjs', 'jose']
  },
  nitro: {
    externals: {
      inline: ['bcryptjs', 'jose']
    }
  },
  modules: [
    '@pinia/nuxt',
  ],
})