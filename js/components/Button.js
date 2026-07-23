export default {
  props: {
    title: String,
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  template: `
    <button 
      class="top-bar__button"
      :title="title"
      :disabled="disabled"
    >
      <slot></slot>
    </button>
  `,
};
