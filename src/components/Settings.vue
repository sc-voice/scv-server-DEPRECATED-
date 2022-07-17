
<template>
  <!--v-row justify="center"-->
    <v-dialog v-model="dialog">
      <template v-slot:activator="{ props }">
        <v-btn icon="mdi-cog" v-bind="props" /> 
      </template>
      <v-card>
        <v-toolbar compact>
          Settings
          <v-spacer/>
          <v-btn icon @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-list class="mx-auto" max-width="600">
          <v-list-item>
            <v-list-item-header>
              <v-list-item-title>
                Theme
              </v-list-item-title>
              <v-list-item-subtitle>
                <v-collection>
                  <v-row>
                    <v-col cols="6">
                      <v-btn variant="outlined" 
                        @click="$vuetify.theme.global.name='dark'">
                        Dark
                      </v-btn>
                    </v-col>
                    <v-col cols="6">
                      <v-btn variant="outlined" 
                        @click="$vuetify.theme.global.name='light'">
                        Light
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-collection>
              </v-list-item-subtitle>
            </v-list-item-header>
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>
  <!--/v-row-->
</template>

<script>
const TODO = 1
import * as VuetifyMod from "vuetify";

export default {
  name: 'Settings',
  data: () => ({
    dialog: false,
  }),
  methods: {
  },
  mounted() {
  },
  components: {
  },
}
</script>

<style scoped>
</style>
