
<template>
<div>
  <h3>Settings</h3>
  <v-btn @click="debug()">Debug</v-btn>
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
</div>
</template>

<script>
const TODO = 1
import * as VuetifyMod from "vuetify";

export default {
  name: 'Settings',
  data: () => {
    return {}
  },
  methods: {
    debug() {
      console.log('debug', 
        "VuetifyMod", Object.keys(VuetifyMod),
      );
    },
  },
  mounted() {
  },
  components: {
  },
}
</script>

<style scoped>
</style>
