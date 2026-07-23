import MenuItem from './MenuItem.js';
import { useStore } from '../store.js';

export default {
  components: {
    MenuItem,
  },

  methods: {
    closeSamples() {
      this.store.samplesOpen = false;
    },

    loadSample(id) {
      this.$emit('load-sample', id);
      this.closeSamples();
    },
  },

  setup() {
    return { store: useStore() };
  },

  template: `
    <Transition name="menu">
      <div 
        class="menu"
        v-show="store.samplesOpen"
      >
        <div class="menu__header">
          Samples
        </div>
        <div class="menu__section">
          <MenuItem
            v-for="sample in store.samples"
            :key="sample.id"
            :label="sample.label"
            @click="loadSample(sample.id)"
          />
        </div>
      </div>
    </Transition>
  `,
};
