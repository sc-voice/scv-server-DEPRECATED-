<template>
  <v-app>
    <v-main>
      <v-app-bar color="brown-darken-2" density="compact" flat>
        <v-app-bar-title > scv-server </v-app-bar-title>
      </v-app-bar>
      <v-card>
        <v-card-title> Settings </v-card-title>
        <v-card-text>
          <v-container>
            <v-row >
              <v-col cols="2">
                <v-btn @click="$vuetify.theme.global.name='dark'">
                  Dark</v-btn>
              </v-col>
              <v-col cols="2">
                <v-btn @click="$vuetify.theme.global.name='light'">
                  Light</v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
      <!--AwsCreds/-->
      <!--Authenticated/-->
      <Settings/>
    </v-main>
  </v-app>
</template>

<script>
import logo from './assets/logo.png'
//import AwsCreds from './components/AwsCreds.vue'
//import Authenticated from './components/Authenticated.vue'
import Settings from './components/Settings.vue'

export default {
  name: 'App',

  components: {
    //AwsCreds,
    //Authenticated,
    Settings,
  },

  data: () => {
    return { logo, aFlag: true, }
  },
  activated: ()=>{
    console.log('App.activated() $vuetify', this);
  },
}
</script>
