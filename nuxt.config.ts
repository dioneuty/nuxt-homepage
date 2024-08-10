export default defineNuxtConfig({
  css: ['~/assets/css/main.css', '~/assets/css/quill-custom.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  compatibilityDate: '2024-08-04',
})