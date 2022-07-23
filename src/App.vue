<template>
  <v-app>
    <v-main>
      <v-app-bar color="brown-darken-2" flat >
        <v-app-bar-title > 
          scv-server 
          <!-- debug1 -->
          <div class="text-caption" style="margin-top:-5px"> 
            {{settings.server.title}}
          </div>
        </v-app-bar-title>
        <v-spacer/>
        <Settings/>
      </v-app-bar>
      <v-progress-linear v-if="volatile.waiting"
        indeterminate color="secondary" class="mb-0"/>
      <v-alert v-if="!settings.isLocalStorage" type="warning">
        This site requires localStorage/cookies for preferences and performance.
        Enable settings (store in web browser localStorage/cookies)?
        <v-btn @click="allowLocalStorage" dark>
          Allow
        </v-btn>
      </v-alert>
      <v-card v-if="settings.isLocalStorage">
        <v-card-title> 
          REST API Endpoints
        </v-card-title>
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
import { onMounted, ref } from 'vue'
import * as vue from 'vue'

const showMenu = ref(false);

function onMenu(value) {
  showMenu.value = !showMenu.value;
  console.log('App.onMenu()', value, showMenu.value);
}

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
