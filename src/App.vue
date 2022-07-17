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

<script>
import logo from './assets/logo.png'
//import AwsCreds from './components/AwsCreds.vue'
//import Authenticated from './components/Authenticated.vue'
import Settings from './components/Settings.vue'
import Search from './components/Search.vue'

export default {
  name: 'App',

  components: {
    //AwsCreds,
    //Authenticated,
    Search,
    Settings,
  },

  data: () => {
    return { 
      logo, 
    }
  },
  methods: {
  },
}
</script>
