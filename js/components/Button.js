import { useStore } from '../store.js';

export default {
  props: {
    title: String,
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
      :style="{
        color: store.uiColors.topBar.button.color,
        backgroundColor: (
          mouseOver ? 
          store.uiColors.topBar.button.hoverBackgroundColor : 
          store.uiColors.topBar.button.backgroundColor
        ),
      }"
      @mouseover="mouseOver = true"
      @mouseleave="mouseOver = false"
    >
      <slot></slot>
    </button>
  `,
};