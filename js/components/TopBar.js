import Button from './Button.js';
import PhpSearch from './PhpSearch.js';
import { useStore } from '../store.js';

export default {
  components: {
    Button,
    PhpSearch,
  },

  props: {
    themes: Array,
    settings: Object,
  },

  setup() {
    return { store: useStore() }
  },

  template: `
    <div 
      class="top-bar"
      :style="{ 
        color: store.uiColors.topBar.color,
        backgroundColor: store.uiColors.topBar.backgroundColor,
        borderBottomColor: store.uiColors.topBar.borderColor,
      }"
    >
      <div 
        class="top-bar__title"
        :style="{ 
          borderRightColor: store.uiColors.topBar.borderColor,
        }"
      >
        Run PHP Code
      </div>
      <div class="top-bar__actions">
        <Button 
          class="top-bar__button"
          title="Open"
          @click="$emit('open')"
        >
          <svg viewBox="0 0 64 64">
            <use href="#svg-open" />
          </svg>
        </Button>
        <Button 
          class="top-bar__button"
          title="Save"
          @click="$emit('save')"
        >
          <svg viewBox="0 0 64 64">
            <use href="#svg-save" />
          </svg>
        </Button>
        <Button 
          class="top-bar__button top-bar__button_icon-left"
          title="Clear"
          @click="$emit('clear')"
        >
          <svg viewBox="0 0 64 64">
            <use href="#svg-eraser" />
          </svg>
          Clear
        </Button>
        <Button 
          class="top-bar__button top-bar__button_icon-right"
          title="Run (Ctrl+Enter)"
          @click="$emit('run')"
        >
          Run
          <svg viewBox="0 0 64 64">
            <use href="#svg-play" />
          </svg>
        </Button>
      </div>
      <div class="flex-fill"></div>
      <PhpSearch />
      <div class="flex-fill"></div>
      <div 
        class="top-bar__icon-button"
        :style="{
          backgroundColor: (store.menuOpen ? store.uiColors.menu.backgroundColor : 'transparent'),
        }"
        @click="store.menuOpen = !store.menuOpen"
      >
        <svg viewBox="0 0 64 64">
          <use href="#svg-menu" />
        </svg>
      </div>
    </div>
  `,
};