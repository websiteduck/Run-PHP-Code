import { useStore } from '../store.js';
import { adjustColor } from '../utilities.js';

export default {
  props: {
    color: String,
    backgroundColor: String,
  },

  setup() {
    return { store: useStore() }
  },

  mounted() {
    Vue.watch(
      () => this.store.loadedTheme,
      () => this.applyColors(false),
    );

    Vue.watch(
      () => this.store.settings.colorize,
      () => this.applyColors(false),
    );
  },

  methods: {
    applyColors(firstRun) {
      if (this.$refs.iframe) {
        let iframe = this.$refs.iframe;
        let iframeDocument = iframe.contentWindow.document;
        let htmlElement = iframeDocument.getElementsByTagName('html')[0];
        let style = iframeDocument.getElementById('runphpcode-style');

        iframe.style.backgroundColor = (this.store.settings.colorize ? this.store.uiColors.backgroundColor : '#ffffff');

        // Enable or disable the style tag that was injected by run.php
        // This is necessary if someone turns off the colorize setting after the result is already loaded
        if (style) {
          style.media = (this.store.settings.colorize ? 'all' : 'not all');
        }

        if (htmlElement) {
          if (this.store.settings.colorize && !this.store.showingPhpInfo) {
            htmlElement.style.color = this.store.uiColors.color;
            htmlElement.style.backgroundColor = this.store.uiColors.backgroundColor;
            htmlElement.animate([
              { backgroundColor: adjustColor(this.store.uiColors.backgroundColor, 10) },
              { backgroundColor: this.store.uiColors.backgroundColor },
            ], 250);
          } else {
            htmlElement.style.color = null;
            htmlElement.style.backgroundColor = null;
          }

          if (this.store.showingPhpInfo && firstRun) {
            // The table elements in phpinfo() have some default width applied, we set it to 100% to avoid the 
            // horizontal scrollbar when the result window is too narrow
            let css = iframeDocument.createTextNode('table { width: 100%; max-width: 934px; }');
            let style = iframeDocument.createElement('style');
            style.type = 'text/css';
            style.appendChild(css);
            htmlElement.appendChild(style);
          }
        }
      }
    },
  },

  template: `
    <div 
      class="result"
      :style="{ 
        left: (store.divideX + 4).toString() + 'px',
        display: (store.settings.runExternal ? 'none' : 'block'),
        width: (store.screenWidth - store.divideX - 4).toString() + 'px',
        pointerEvents: store.resizing ? 'none' : 'auto',
      }"
    >
      <iframe
        ref="iframe"
        class="result__frame"
        name="result-frame"
        @load="applyColors(true)"
      >
      </iframe>
    </div>
  `,
};