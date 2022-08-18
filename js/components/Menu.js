import About from './About.js';
import MenuItem from './MenuItem.js';
import { useStore } from '../store.js';

export default {
  components: {
    About,
    MenuItem,
  },

  props: {
    themes: Array,
  },

  methods: {
    closeMenu() {
      this.store.menuOpen = false;
    },
  },

  mounted() {
    Vue.watch(
      () => this.store.menuOpen,
      () => this.store.loadContributors(),
    );
  },

  setup() {
    return { store: useStore() };
  },

  template: `
    <Transition name="menu">
      <div 
        class="menu"
        v-show="store.menuOpen"
        :style="{
          color: store.uiColors.menu.color,
          backgroundColor: store.uiColors.menu.backgroundColor,
        }"
      >
        <div class="menu__section">
          <MenuItem label="phpinfo()" @click="$emit('menu', 'php_info'); closeMenu();" />
          <MenuItem label="Remote Import..." @click="$emit('menu', 'remote_import'); closeMenu();" />
        </div>
        <div class="menu__header">
          Settings
        </div>
        <div class="menu__section">
          <MenuItem
            type="checkbox"
            :selected="store.settings.colorize"
            label="Colorize"
            @click="store.settings.colorize = !store.settings.colorize" 
          />
          <MenuItem
            type="checkbox"
            :selected="store.settings.runExternal"
            label="External Window"
            @click="store.settings.runExternal = !store.settings.runExternal" 
          />
          <MenuItem
            type="checkbox"
            :selected="store.settings.preWrap"
            label="<pre> Wrap"
            @click="store.settings.preWrap = !store.settings.preWrap" 
          />
        </div>
        <div class="menu__header">
          Error Reporting
        </div>
        <div class="menu__section">
          <MenuItem 
            v-for="errorReport in store.errorReports"
            type="radio"
            :selected="store.settings.errorReporting === errorReport.value"
            :label="errorReport.label"
            @click="store.settings.errorReporting = errorReport.value"
          />
        </div>
        <div class="menu__header">
          Themes
        </div>
        <div class="menu__subheader">
          Light
        </div>
        <div class="menu__section">
          <MenuItem 
            v-for="theme in store.themes.light"
            type="radio"
            :selected="store.settings.theme === theme.theme"
            :label="theme.title"
            @click="store.settings.theme = theme.theme"
          />
        </div>
        <div class="menu__subheader">
          Dark
        </div>
        <div class="menu__section">
          <MenuItem 
            v-for="theme in store.themes.dark"
            type="radio"
            :selected="store.settings.theme === theme.theme"
            :label="theme.title"
            @click="store.settings.theme = theme.theme"
          />
        </div>
        <About class="menu__about" />
      </div>
    </Transition>
  `,
};
