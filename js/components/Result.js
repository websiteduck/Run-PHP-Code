import { useStore } from '../store.js';
import { adjustColor } from '../utilities.js';

function formatDuration(ms) {
  if (ms == null || Number.isNaN(ms)) {
    return null;
  }

  if (ms >= 1000) {
    return (ms / 1000).toFixed(2) + ' s';
  }

  return ms.toFixed(2) + ' ms';
}

function formatBytes(bytes) {
  if (bytes == null || Number.isNaN(bytes)) {
    return null;
  }

  if (bytes >= 1048576) {
    return (bytes / 1048576).toFixed(2) + ' MB';
  }

  if (bytes >= 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  }

  return bytes + ' B';
}

function formatRunAt(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });
}

export default {
  props: {
    color: String,
    backgroundColor: String,
  },

  setup() {
    return { store: useStore() }
  },

  data() {
    return {
      boundIframeDocument: null,
    };
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

    this.$nextTick(() => this.bindIframeMenuClose());
  },

  computed: {
    statusLabel() {
      switch (this.store.runStatus) {
        case 'running':
          return 'Running…';
        case 'failed':
          return 'Failed';
        case 'done':
          return 'Done';
        default:
          return 'Idle';
      }
    },

    durationLabel() {
      return formatDuration(this.store.runDurationMs);
    },

    memoryLabel() {
      let value = formatBytes(this.store.runMemoryBytes);
      return value ? 'Mem ' + value : null;
    },

    phpVersionLabel() {
      return this.store.runPhpVersion ? 'PHP ' + this.store.runPhpVersion : null;
    },

    outputModeLabel() {
      if (!this.store.runOutputMode) {
        return null;
      }

      let mode = this.store.outputModes.find(
        (item) => item.value === this.store.runOutputMode
      );

      return mode ? mode.label : this.store.runOutputMode;
    },

    runAtLabel() {
      let value = formatRunAt(this.store.runAt);
      return value ? 'Ran ' + value : null;
    },
  },

  methods: {
    closeFlyoutMenus() {
      this.store.menuOpen = false;
      this.store.samplesOpen = false;
    },

    bindIframeMenuClose() {
      let iframe = this.$refs.iframe;
      let doc = iframe?.contentDocument;

      if (!doc || doc === this.boundIframeDocument) {
        return;
      }

      this.boundIframeDocument = doc;
      doc.addEventListener('pointerdown', this.closeFlyoutMenus);
    },

    setHtml(html) {
      let iframe = this.$refs.iframe;

      if (!iframe) {
        return;
      }

      iframe.srcdoc = html;
    },

    applyColors(firstRun) {
      if (this.$refs.iframe) {
        let iframe = this.$refs.iframe;
        let iframeDocument = iframe.contentWindow.document;
        let htmlElement = iframeDocument.getElementsByTagName('html')[0];
        let style = iframeDocument.getElementById('runphpcode-style');

        this.bindIframeMenuClose();

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
            if (this.store.uiColors.backgroundColor !== null) {
              htmlElement.animate([
                { backgroundColor: adjustColor(this.store.uiColors.backgroundColor, 10) },
                { backgroundColor: this.store.uiColors.backgroundColor },
              ], 250);
            }
          } else {
            htmlElement.style.color = null;
            htmlElement.style.backgroundColor = null;
          }

          if (this.store.showingPhpInfo && firstRun) {
            // The table elements in phpinfo() have some default width applied, we set it to 100% to avoid the 
            // horizontal scrollbar when the result window is too narrow
            let css = iframeDocument.createTextNode('table { width: 100%; max-width: 934px; }');
            let style = iframeDocument.createElement('style');
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
      @pointerdown="closeFlyoutMenus"
    >
      <div
        v-if="store.runFatalError"
        class="result__error"
        role="alert"
      >
        {{ store.runFatalError }}
      </div>
      <iframe
        ref="iframe"
        class="result__frame"
        name="result-frame"
        @load="applyColors(true)"
      >
      </iframe>
      <div class="result__status">
        <span class="result__status-state">{{ statusLabel }}</span>
        <span v-if="outputModeLabel" class="result__status-meta">{{ outputModeLabel }}</span>
        <span v-if="durationLabel" class="result__status-meta">{{ durationLabel }}</span>
        <span v-if="memoryLabel" class="result__status-meta">{{ memoryLabel }}</span>
        <span v-if="phpVersionLabel" class="result__status-meta">{{ phpVersionLabel }}</span>
        <span v-if="runAtLabel" class="result__status-meta result__status-meta_end">{{ runAtLabel }}</span>
      </div>
    </div>
  `,
};
