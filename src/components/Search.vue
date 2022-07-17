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
            <v-text-field v-model="lang" 
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
        <pre v-if="search" color="primary">{{url}}</pre>
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

<script>
export default {
  name: 'Search',

  components: {
  },

  data: () => {
    return { 
      search: '',
      lang: '',
      loading: false,
      results: undefined,
    }
  },
  mounted: ()=>{ 
    console.log("Search.mounted()");
  },
  methods: {
    onSearchCleared(evt) {
      this.results = undefined;
    },
    async onSearch(evt) {
      let res;
      try {
        let { url } = this;
        console.log('onSearch() url:', url);
        this.results = undefined;
        this.loading = true;
        res = await fetch(url);
        this.results = res.ok
          ? await res.json()
          : res;
      } catch(e) {
        console.log("onSearch() ERROR:", res, e);
      } finally {
        this.loading = false;
      }
    },
    onSearchKey(evt) {
      if (evt.code === "Enter") {
        this.search && this.onSearch(evt);
        evt.preventDefault();
      }
    },
  },
  computed: {
    url() {
      let { search, lang } = this;
      let pattern = search && search.toLowerCase().trim();
      let url = [
        `https://voice.suttacentral.net`,
        `scv`,
        `search`,
        encodeURIComponent(pattern),
      ].join('/');
      return lang ?  `${url}/${lang}` : url;
    }
  },
}
</script>
