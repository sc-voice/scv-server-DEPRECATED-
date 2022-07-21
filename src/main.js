import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'

const pinia = createPinia();

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

//NEXT import { createI18n, useI18n } from 'vue-i18n'
import { en, de } from 'vuetify/locale'
//NEXT const i18n = createI18n({
  //NEXT legacy: false,
  //NEXT locale: en,
  //NEXT fallbackLocale: de,
  //NEXT messages: { en, de },
//NEXT })

// Vuetify
import { createVuetify, } from "vuetify"

//NEXT import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'
const vuetify = createVuetify({
  theme: {
    defaultTheme: 'dark',
  },
  //NEXT locale: createVueI18nAdapter({ i18n, useI18n })
})

import { loadFonts } from './plugins/webfontloader'
loadFonts()

var app = createApp(App);
app.use(pinia);
//NEXT app.use(i18n)
//NEXT console.log(`main.js i18n:`, Object.keys(app));
app.use(vuetify)
app.mount('#app')
