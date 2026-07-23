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
        window.removeEventListener('pointerup', stopResize);
      };
      window.addEventListener('mouseup', stopResize);
      window.addEventListener('pointerup', stopResize);
    },
  },

  template: `
    <div 
      class="resize-bar"
      @mousedown="startResize"
    ></div>
  `,
};
