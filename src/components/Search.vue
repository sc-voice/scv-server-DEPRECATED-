<template>
  <v-form>
    {{search}}
    <v-container>
      <v-row centered>
        <v-col >
          <v-text-field label="Debug">
          </v-text-field>
          <v-text-field v-model="search" 
            clearable density="compact" variant="underlined"
            label="Search"
            @click:append="onSearch"
            @keypress="onSearchKey"
            append-icon="mdi-magnify"
            placeholder="Enter sutta id or search text">
          </v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <h2>Search results</h2>
        {{results}}
      </v-row>
    </v-container>
  </v-form>
</template>

<script>

export default {
  name: 'Search',

  components: {
  },

  data: () => {
    return { 
      search: '',
      results: [],
    }
  },
  mounted: ()=>{ 
    console.log("Search.mounted()");
  },
  methods: {
    async onSearch(evt) {
      let { search } = this;
      console.log("onSearch", {
        search, 
        evt: Object.assign({},evt)
      });
      evt.stopPropagation();

      let pattern = search && search.toLowerCase().trim();
      //let parsed = pattern && bilaraWeb.parseSuttaRef(pattern, lang);
      let url = [
        `https://voice.suttacentral.net`,
        `scv`,
        `search`,
        encodeURIComponent(pattern),
      ].join('/');
      console.log('onSearch() url:', url);
      let res = await fetch(url);
      this.results = await res.json();
    },
    onSearchKey(evt) {
      console.log("onSearchKey", evt);
      if (evt.code === "Enter") {
        this.onSearch(evt);
      }
    },
  },
}
</script>
