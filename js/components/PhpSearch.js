import { useStore } from '../store.js';

export default {
  setup() {
    return { store: useStore() }
  },

  data() {
    return {
      search: '',
      open: false,
      searchIndex: {},
      results: {
        functions: [],
        variables: [],
        exceptions: [],
        classes: [],
        extensions: [],
      },
      labels: {
        functions: 'Functions',
        variables: 'Variables',
        classes: 'Classes',
        exceptions: 'Exceptions',
        extensions: 'Extensions',
      },
      timeout: null,
    }
  },

  watch: {
    search(newValue) {
      this.open = (newValue.length > 0);

      if (this.timeout !== null) {
        clearTimeout(this.timeout);
      }

      this.timeout = setTimeout(this.phpSearch, 100);
    },
  },

  methods: {
    phpSearch() {
      for (let section in this.results) {
        this.results[section] = [];

        for (let key in this.searchIndex[section]) {
          let item = this.searchIndex[section][key];
          let lowerSearch = this.search.toLowerCase();
          
          if (item.name.toLowerCase().includes(this.search.toLowerCase())) {
            this.results[section].push(item);
          }

          if (this.results[section].length > 100) {
            break;
          }
        }
      }
    },

    openResult(key) {
      window.open('http://www.php.net/manual/en/' + key + '.php');
    },

    clickOutside(event) {
      if (!this.$refs.el.contains(event.target)) {
        this.open = false;
      }
    },
  },

  async mounted() {
    let response = await axios.get('php-search-index.json'); // ripped from php.net
    
    for (let section in this.results) {
      this.searchIndex[section] = [];
    }

    for (let key in response.data) {
      let item = response.data[key];
      let result = {
        'key': key,
        'name': item[0],
        'description': item[1],
      };

      switch (item[2]) {
        case 'refentry':
          this.searchIndex.functions.push(result);
          break;
        case 'phpdoc:varentry':
          this.searchIndex.variables.push(result);
          break;
        case 'phpdoc:exceptionref':
          this.searchIndex.exceptions.push(result);
          break;
        case 'phpdoc:classref':
          this.searchIndex.classes.push(result);
          break;
        case 'book':
        case 'reference':
        case 'set':
          this.searchIndex.extensions.push(result);
          break;
      }
    }

    for (let section in this.searchIndex) {
      this.searchIndex[section].sort(function (a, b) {
        // ripped from php.net
        let aName = a.name;
        let bName = b.name;

        let aIsMethod = (aName.indexOf("::") != -1);
        let bIsMethod = (bName.indexOf("::") != -1);

        // Methods are always after regular functions.
        if (aIsMethod && !bIsMethod) return 1;
        else if (bIsMethod && !aIsMethod) return -1;
        
        // If one function name is the exact prefix of the other, we want
        // to sort the shorter version first (mostly for things like date()
        // versus date_format()).
        if (aName.length > bName.length && aName.indexOf(bName) == 0) return 1;
        else if (bName.indexOf(aName) == 0) return -1;

        if (aName > bName) return 1;
        else if (aName < bName) return -1;
        return 0;
      });
    }

    window.addEventListener('click', this.clickOutside);
  },

  unmounted() {
    window.removeEventListener('click', this.clickOutside);
  },

  template: `
    <div
      ref="el"
      class="php-search"
      @blur="this.open = false"
    >
      <div class="php-search__logo">php</div>
      <input
        class="php-search__input"
        type="text" 
        v-model="search"
        @focus="this.open = (this.search.length > 0)"
        :style="{ 
          color: store.uiColors.topBar.phpSearch.color,
          backgroundColor: store.uiColors.topBar.phpSearch.backgroundColor,
          outlineColor: store.uiColors.topBar.phpSearch.outlineColor,
        }"
      />
      <Transition name="search">
        <div class="php-search__results" v-show="open">
          <template v-for="section in Object.keys(results)">
            <div class="php-search__section" v-if="results[section].length > 0">
              <div class="php-search__header">{{ labels[section] }}</div>
              <div class="php-search__items">
                <div 
                  class="php-search__result" 
                  v-for="item in results[section]"
                  @click="openResult(item.key)"
                >
                  <div>{{ item.name }}</div>
                  <div class="php-search__description">{{ item.description }}</div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </Transition>
    </div>
  `,
};