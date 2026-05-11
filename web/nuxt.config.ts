export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  ssr: false,

  modules: ['nuxt-quasar-ui', '@pinia/nuxt'],

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  quasar: {
    plugins: ['Notify', 'Dialog'],
    extras: {
      fontIcons: ['material-icons'],
    },
    config: {
      dark: true,
      brand: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#6366f1',
        dark: '#1e1e2e',
        positive: '#10b981',
        negative: '#ef4444',
        info: '#60a5fa',
        warning: '#f59e0b',
      },
    },
  },

  pinia: {
    storesDirs: ['./app/stores/**'],
  },

  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:3000/api',
    },
  },

  app: {
    titleTemplate: '%s - SocialPlace',
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      htmlAttrs: { lang: 'it' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  devtools: { enabled: true },

  compatibilityDate: '2025-05-11',
})
