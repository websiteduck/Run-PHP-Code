import { useStore } from '../store.js';

export default {
  props: {
    title: String,
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      mouseOver: false,
    }
  },

  setup() {
    return { store: useStore() }
  },

  template: `
    <button 
      :title="title"
      :disabled="disabled"
      :style="{
        color: store.uiColors.topBar.button.color,
        backgroundColor: (
          mouseOver && !disabled ? 
          store.uiColors.topBar.button.hoverBackgroundColor : 
          store.uiColors.topBar.button.backgroundColor
        ),
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'default' : 'pointer',
      }"
      @mouseover="mouseOver = true"
      @mouseleave="mouseOver = false"
    >
      <slot></slot>
    </button>
  `,
};
