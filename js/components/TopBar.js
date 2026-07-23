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

  methods: {
    toggleSamples() {
      this.store.samplesOpen = !this.store.samplesOpen;

      if (this.store.samplesOpen) {
        this.store.menuOpen = false;
      }
    },

    toggleMenu() {
      this.store.menuOpen = !this.store.menuOpen;

      if (this.store.menuOpen) {
        this.store.samplesOpen = false;
      }
    },
  },

  template: `
    <div class="top-bar">
      <div class="top-bar__title">
        Run PHP Code
      </div>
      <div class="top-bar__actions">
        <Button 
          title="Open"
          @click="$emit('open')"
        >
          <svg viewBox="0 0 64 64">
            <use href="#svg-open" />
          </svg>
        </Button>
        <Button 
          title="Save"
          @click="$emit('save')"
        >
          <svg viewBox="0 0 64 64">
            <use href="#svg-save" />
          </svg>
        </Button>
        <Button 
          class="top-bar__button_icon-left"
          title="Clear"
          @click="$emit('clear')"
        >
          <svg viewBox="0 0 64 64">
            <use href="#svg-eraser" />
          </svg>
          Clear
        </Button>
        <Button 
          class="top-bar__button_icon-right"
          title="Run (Ctrl+Enter)"
          :disabled="store.runStatus === 'running'"
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
      <div class="top-bar__side-buttons">
        <div 
          class="top-bar__icon-button top-bar__samples-button"
          :class="{ 'top-bar__icon-button_active': store.samplesOpen }"
          title="Samples"
          @click="toggleSamples"
        >
          Samples
        </div>
        <div 
          class="top-bar__icon-button"
          :class="{ 'top-bar__icon-button_active': store.menuOpen }"
          title="Settings"
          @click="toggleMenu"
        >
          <svg viewBox="0 0 64 64">
            <use href="#svg-menu" />
          </svg>
        </div>
      </div>
    </div>
  `,
};
