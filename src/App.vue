<template>
  <v-app>
    <v-main>
      <v-app-bar color="brown-darken-2" density="compact" flat>
        <v-app-bar-title > scv-server </v-app-bar-title>
        <v-spacer/>
        <Settings/>
      </v-app-bar>
      <v-card>
        <v-card-title>REST API Endpoints</v-card-title>
        <v-expansion-panels>
          <Search/>
        </v-expansion-panels>
      </v-card>
    </v-main>
  </v-app>
</template>

<script setup>
import * as LOGO from './assets/logo.png'
//import AwsCreds from './components/AwsCreds.vue'
//import Authenticated from './components/Authenticated.vue'
import Settings from './components/Settings.vue'
import { useSettingsStore } from './stores/settings'
import Search from './components/Search.vue'
import { onMounted, getCurrentInstance} from 'vue'
import * as vue from 'vue'

const logo = LOGO;
const vuetify = null;

//onMounted((obj)=>{
  //let { $vuetify } = vue.prototype;
//});


</script>
<script>
  export default {
    data: ()=>({
      vuetify: undefined,
      settings: useSettingsStore(),
      unsubscribe: undefined,
    }),
    mounted() {
      let { $vuetify, settings } = this;
      this.vuetify = $vuetify;
      this.unsubscribe = settings.$subscribe((mutation, state) => {
        $vuetify.theme.global.name = settings.theme;
      });
      console.log('Settings.mounted() subscribe', $vuetify);
    },
  }
</script>
