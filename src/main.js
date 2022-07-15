import { createApp } from 'vue'
import App from './App.vue'
import { loadFonts } from './plugins/webfontloader'
//NEXT import { createI18n, useI18n } from 'vue-i18n'
import { en, de } from 'vuetify/locale'

//NEXT const i18n = createI18n({
  //NEXT legacy: false,
  //NEXT locale: en,
  //NEXT fallbackLocale: de,
  //NEXT messages: { en, de },
//NEXT })

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Vuetify
import { createVuetify } from 'vuetify'
//NEXT import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'dark',
  },
  //NEXT locale: createVueI18nAdapter({ i18n, useI18n })
})

loadFonts()

var app = createApp(App);
console.log(`main.js app:`, Object.keys(app));
//NEXT app.use(i18n)
//NEXT console.log(`main.js i18n:`, Object.keys(app));
app.use(vuetify)
console.log(`main.js vuetify:`, Object.keys(app));
app.mount('#app')
console.log(`main.js mount:`, Object.keys(app));
