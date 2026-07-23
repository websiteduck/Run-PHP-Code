export default {
  props: {
    label: String,
    type: {
      type: String,
      default: 'button',
    },
    selected: Boolean,
  },

  template: `
    <div 
      class="menu__item"
      :class="{
        'menu__item_checkbox': type === 'checkbox',
        'menu__item_radio': type === 'radio',
      }"
    >
      <template v-if="type === 'checkbox'">
        <template v-if="selected">
          <svg viewBox="0 0 64 64">
            <use href="#svg-check-selected" />
          </svg>
        </template>
        <template v-else>
          <svg viewBox="0 0 64 64">
            <use href="#svg-check" />
          </svg>
        </template>
      </template>
      <template v-if="type === 'radio'">
        <template v-if="selected">
          <svg viewBox="0 0 64 64">
            <use href="#svg-radio-selected" />
          </svg>
        </template>
        <template v-else>
          <svg viewBox="0 0 64 64">
            <use href="#svg-radio" />
          </svg>
        </template>
      </template>
      {{ label }}
    </div>
  `,
};
