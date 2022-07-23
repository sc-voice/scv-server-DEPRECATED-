
<template>
  <!--v-row justify="center"-->
    <v-dialog v-model="dialog">
      <template v-slot:activator="{ props }">
        <v-btn v-if="settings.isLocalStorage" icon="mdi-cog" v-bind="props" /> 
      </template>
      <v-card>
        <v-toolbar compact>
          Settings {{Version}}
          <v-spacer/>
          <v-btn icon @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-list class="mx-auto" max-width="600">
          <v-list-item>
            <v-list-item-header>
              <v-list-item-title>
                Server
              </v-list-item-title>
              <v-list-item-subtitle>
                <v-container>
                  <v-row dense>
                    <v-col >
                      <v-select v-model="settings.serverUrl" :items="servers()" 
                        :hint='settings.serverUrl'
                      />
                    </v-col>
                  </v-row>
                </v-container>
              </v-list-item-subtitle>
            </v-list-item-header>
          </v-list-item>
          <v-list-item>
            <v-list-item-header>
              <v-list-item-title>
                Theme 
              </v-list-item-title>
              <v-list-item-subtitle>
                <v-container fluid>
                  <v-row dense>
                    <v-col>
                      <v-select v-model="settings.theme" :items="themes" />
                    </v-col>
                  </v-row>
                </v-container>
              </v-list-item-subtitle>
            </v-list-item-header>
          </v-list-item>
        </v-list>
        <v-expansion-panels>
          <v-expansion-panel >
            <v-expansion-panel-title expand-icon="mdi-dots-vertical">
              Advanced
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-btn @click="resetDefaults" variant="outlined" >
                Restore Defaults
              </v-btn>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card>
    </v-dialog>
  <!--/v-row-->
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useSettingsStore } from "../stores/settings";
import { Version } from "../version.mjs";

const dialog = ref(false);
const settings = useSettingsStore();
const host = ref(undefined);

const themes = [{
  title: "Dark",
  value: "dark",
},{
  title: "Light",
  value: "light",
}]

function servers() {
  return settings.servers.filter(s => {
    return host.value.startsWith("localhost") || !/localhost/.test(s);
  });
}

function resetDefaults() {
  settings.clear();
  dialog.value = false;
  console.log("Settings.resetDefaults()", settings);
}

onMounted(()=>{
  host.value = window.location.host;
  console.log('Settings.mounted() settings:', settings);
});

</script>

<style scoped>
</style>
