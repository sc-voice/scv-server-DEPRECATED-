
<template>
  <v-expansion-panel variant="popout">
    <v-expansion-panel-title expand-icon="mdi-dots-vertical">
      GET /scv/play/segment/:sutta_uid/:langTrans/:translator/:scid/:vnameTrans
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <v-form :disabled="volatile.waiting">
        <v-container>
          <v-row centered>
            <v-col >
              <v-text-field v-model="sutta_uid" 
                clearable density="compact" variant="underlined"
                label="sutta_uid"
                :append-icon="valid ? 'mdi-magnify' : ''"
                @click:append="onFetch"
                @keypress="onFetchKey"
                hint="E.g.: thig1.1"
                required
                placeholder="Enter sutta id (e.g., thig1.1">
              </v-text-field>
              <v-text-field v-model="settings.langTrans" 
                clearable density="compact" variant="underlined"
                :append-icon="valid ? 'mdi-magnify' : ''"
                @click:append="onFetch"
                @keypress="onFetchKey"
                label="langTrans" 
                required
                placeholder="Enter two-letter ISO language code">
              </v-text-field>
              <v-text-field v-model="settings.translator" 
                clearable density="compact" variant="underlined"
                :append-icon="valid ? 'mdi-magnify' : ''"
                @click:append="onFetch"
                @keypress="onFetchKey"
                label="translator" 
                required
                placeholder='E.g., "sujato"'>
              </v-text-field>
              <v-text-field v-model="scid" 
                clearable density="compact" variant="underlined"
                :append-icon="valid ? 'mdi-magnify' : ''"
                @click:append="onFetch"
                @keypress="onFetchKey"
                label="scid (segment id)" 
                required
                placeholder='E.g., "thig1.1:1.1"'>
              </v-text-field>
              <v-text-field v-model="settings.vnameTrans" 
                clearable density="compact" variant="underlined"
                :append-icon="valid ? 'mdi-magnify' : ''"
                @click:append="onFetch"
                @keypress="onFetchKey"
                label="vnameTrans (AWS Polly voice)" 
                required
                placeholder='E.g., "Amy"'>
              </v-text-field>
            </v-col>
          </v-row>
          <a v-if="valid" :href="url" target="_blank">{{url}}</a>
          <v-btn :disabled="!valid" @click="onFetch">
            GET
          </v-btn>
          <v-row v-if="results">
            <v-col>
              <h3>Results</h3>
              <pre>{{ JSON.stringify(results,null,2) }}</pre>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useSettingsStore } from "../stores/settings";
  import { useVolatileStore } from "../stores/volatile";

  const sutta_uid = ref(undefined);
  const scid = ref(undefined);
  const results = ref(undefined);
  const settings = useSettingsStore(); 
  const volatile = useVolatileStore();

  const valid = computed(()=>{
    return sutta_uid.value != null
      && scid.value != null
      && settings.langTrans != null
      && settings.translator != null
      && settings.vnameTrans != null;
  })

  const url = computed(()=>{
    let url = [
      settings.serverUrl,
      `play/segment`,
      encodeURIComponent(sutta_uid.value),
      encodeURIComponent(settings.langTrans),
      encodeURIComponent(settings.translator),
      encodeURIComponent(scid.value),
      encodeURIComponent(settings.vnameTrans),
    ].join('/');
    return url;
  })

  onMounted(()=>{
    console.log("PlaySegment.mounted()");
  })

  async function onFetch(evt) {
    let res;
    try {
      console.log('PlaySegment.onFetch() url:', url.value);
      results.value = undefined;
      let json = await volatile.fetchJson(url.value);
      res = json;
    } catch(e) {
      console.error("PlaySegment.onFetch() ERROR:", res, e);
      res = `ERROR: ${url.value} ${e.message}`;
    } finally {
      results.value = res;
    }
  }

  function onFetchKey(evt) {
    if (evt.code === "Enter") {
      valid.value && onFetch(evt);
      evt.preventDefault();
    }
  }

</script>
