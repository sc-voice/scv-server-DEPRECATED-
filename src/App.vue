<template>
  <v-app>
    <v-main>
      <v-app-bar color="primary" density="compact" flat>
        <v-app-bar-title> scv-server </v-app-bar-title>
      </v-app-bar>
      <AwsCreds/>
    </v-main>
  </v-app>
</template>

<script>
import logo from './assets/logo.png'
import AwsCreds from './components/AwsCreds.vue'

export default {
  name: 'App',

  components: {
    AwsCreds,
  },

  data: () => ({
    logo,
  }),
}
</script>
