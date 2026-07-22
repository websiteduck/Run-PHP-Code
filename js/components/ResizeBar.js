import { useStore } from '../store.js';

export default {
  props: {
    show: Boolean,
  },

  setup() {
    return { store: useStore() }
  },

  methods: {
    startResize() {
      this.store.resizing = true;
      const stopResize = () => {
        this.store.resizing = false;
        window.removeEventListener('mouseup', stopResize);
      };
      window.addEventListener('mouseup', stopResize);
    },
  },

  template: `
    <div 
      class="resize-bar"
      :style="{ 
        left: store.divideX.toString() + 'px',
        display: store.settings.runExternal ? 'none' : 'block',
        backgroundColor: store.uiColors.resizeBar.backgroundColor,
      }"
      @mousedown="startResize"
    ></div>
  `,
};
