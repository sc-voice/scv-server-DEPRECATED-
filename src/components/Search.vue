<template>
  <v-expansion-panel variant="popout">
    <v-expansion-panel-title>
      GET /scv/search/:pattern/:lang
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <v-container>
        <v-row centered>
          <v-col >
            <v-text-field v-model="search" 
              clearable density="compact" variant="underlined"
              label="pattern"
              @click:append="onSearch"
              @click:clear="onSearchCleared"
              @keypress="onSearchKey"
              :append-icon="search ? 'mdi-magnify' : ''"
              hint="Required"
              placeholder="Enter sutta id or search text">
            </v-text-field>
            <v-text-field v-model="settings.lang" 
              clearable density="compact" variant="underlined"
              label="lang" 
              @click:append="onSearch"
              @click:clear="onSearchCleared"
              @keypress="onSearchKey"
              hint="Optional"
              placeholder="Enter two-letter ISO language code">
            </v-text-field>
          </v-col>
        </v-row>
        <a v-if="search" :href="url" target="_blank">{{url}}</a>
        <v-progress-linear v-if="loading"
          indeterminate color="white" class="mb-0"/>
        <v-row v-if="results">
          <v-col>
            <h3>Search results ({{search}})</h3>
            <pre>{{
  JSON.stringify(results,null,2)
            }}</pre>
          </v-col>
        </v-row>
      </v-container>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useSettingsStore } from "../stores/settings";

  const search = ref('');
  const loading = ref(false);
  const results = ref(undefined);
  const settings = useSettingsStore(); 

  const url = computed(()=>{
    let pattern = search.value && search.value.toLowerCase().trim();
    let url = [
      settings.serverUrl,
      `search`,
      encodeURIComponent(pattern),
    ].join('/');
    return settings.lang ?  `${url}/${lang}` : url;
  })

  onMounted(()=>{
    console.log("Search.mounted()");
  })

  function onSearchCleared(evt) {
    results.value = undefined;
  }

  async function onSearch(evt) {
    let res;
    try {
      console.log('onSearch() url:', url.value);
      results.value = undefined;
      loading.value = true;
      res = await fetch(url.value);
      results.value = res.ok
        ? await res.json()
        : res;
    } catch(e) {
      console.error("onSearch() ERROR:", res, e);
      results.value = `ERROR: ${url.value} ${e.message}`;
    } finally {
      loading.value = false;
    }
  }

  function onSearchKey(evt) {
    if (evt.code === "Enter") {
      search && onSearch(evt);
      evt.preventDefault();
    }
  }

</script>
