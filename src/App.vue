<template>
  <v-app>
    <v-main>
      <v-app-bar color="brown-darken-2" density="compact" flat>
        <v-app-bar-title > scv-server </v-app-bar-title>
        <v-spacer/>
        <Settings/>
      </v-app-bar>
      <v-progress-linear v-if="volatile.waiting"
        indeterminate color="secondary" class="mb-0"/>
      <v-alert v-if="!settings.isLocalStorage" type="warning">
        This site requires localStorage for preferences.
        <v-btn @click="allowLocalStorage" dark>
          Allow
        </v-btn>
      </v-alert>
      <v-card v-if="settings.isLocalStorage">
        <v-card-title> 
          {{settings.server.title}}
        </v-card-title>
        <v-card-subtitle> 
          REST API Endpoints
        </v-card-subtitle>
        <v-expansion-panels>
          <Search/>
        </v-expansion-panels>
      </v-card>
    </v-main>
  </v-app>
</template>

<script setup>
//import AwsCreds from './components/AwsCreds.vue'
//import Authenticated from './components/Authenticated.vue'
import Settings from './components/Settings.vue'
import { useSettingsStore } from './stores/settings'
import { useVolatileStore } from './stores/volatile'
import Search from './components/Search.vue'
import { onMounted, } from 'vue'
import * as vue from 'vue'

</script>
<script>
  export default {
    data: ()=>({
      settings: useSettingsStore(),
      volatile: useVolatileStore(),
      unsubscribe: undefined,
    }),
    methods: {
      allowLocalStorage() {
        let { settings } = this;
        settings.saveSettings();
        console.log("allowLocalStorage()", settings);
      },
    },
    mounted() {
      let { $vuetify, settings, } = this;
      $vuetify.theme.global.name = settings.theme === 'dark' ? 'dark' : 'light';;
      this.unsubscribe = settings.$subscribe((mutation, state) => {
        $vuetify.theme.global.name = settings.theme === 'dark' ? 'dark' : 'light';;
        console.debug("App.mounted() App.mounted() subscribe =>", {mutation, state});
        settings.isLocalStorage && settings.saveSettings();
      });
    },
  }
</script>
