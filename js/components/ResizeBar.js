import { useStore } from '../store.js';

export default {
  props: {
    show: Boolean,
  },

  setup() {
    return { store: useStore() }
  },

  template: `
    <div 
      class="resize-bar"
      :style="{ 
        left: store.divideX.toString() + 'px',
        display: store.settings.runExternal ? 'none' : 'block',
        backgroundColor: store.uiColors.resizeBar.backgroundColor,
      }"
      @mousedown="store.resizing = true"
      @mouseup="store.resizing = false"
    ></div>
  `,
};
    