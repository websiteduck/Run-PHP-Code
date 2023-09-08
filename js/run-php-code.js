/**
 * Run PHP Code
 * 
 * This script gives you the ability to quickly test snippets of PHP code locally.
 *
 * @copyright  Copyright 2011-2022, Website Duck LLC (https://www.websiteduck.com)
 * @link       https://github.com/websiteduck/Run-PHP-Code Run PHP Code
 * @license    MIT License (https://www.opensource.org/licenses/mit-license.php)
 */

import Code from './components/Code.js';
import Menu from './components/Menu.js';
import SamplesMenu from './components/SamplesMenu.js';
import ResizeBar from './components/ResizeBar.js';
import Result from './components/Result.js';
import TopBar from './components/TopBar.js';
import { useStore } from './store.js';

const utf8Decoder = new TextDecoder('utf-8');

const errorReportingValues = {
  fatal: 'E_ERROR | E_PARSE | E_COMPILE_ERROR',
  warning: 'E_ERROR | E_PARSE | E_COMPILE_ERROR | E_WARNING',
  deprecated: 'E_ERROR | E_PARSE | E_COMPILE_ERROR | E_WARNING | E_DEPRECATED | E_USER_DEPRECATED',
  notice: 'E_ERROR | E_PARSE | E_COMPILE_ERROR | E_WARNING | E_DEPRECATED | E_USER_DEPRECATED | E_NOTICE',
  all: '-1',
  none: '0',
};

Vue.createApp({
  components: {
    Code,
    Menu,
    SamplesMenu,
    ResizeBar,
    Result,
    TopBar,
  },

  setup() {
    return { store: useStore() }
  },

  methods: {
    runPhpWasm(code) {
      if (!PHPLoader.loaded) {
        throw new Error('PHP WebAssembly is still loading.');
      }

      PHPLoader.ccall('wasm_set_php_code', null, ['string'], [code]);
      PHPLoader.ccall('wasm_sapi_handle_request', 'number', [], []);
      return utf8Decoder.decode(PHPLoader.FS.readFile('/tmp/stdout'));
    },

    buildResultHtml(html, settings) {
      let outputMode = settings.outputMode || 'html';

      if (outputMode === 'console') {
        let escaped = html
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');

        html = '<style id="runphpcode-console-style">'
          + 'html { margin: 0; }'
          + 'body { margin: 0; padding: 8px; overflow-wrap: anywhere; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; line-height: 1.4; white-space: pre-wrap; }'
          + '</style>'
          + escaped;
      }

      if (settings.colorize) {
        let color = this.store.uiColors.color || '#000000';
        let background = this.store.uiColors.backgroundColor || '#ffffff';

        html += `
      <style id="runphpcode-style" media="all">
      html, body { background-color: ${background}; color: ${color}; }
      </style>
    `;
      }

      if (!html.startsWith('<!DOCTYPE')) {
        html = '<!DOCTYPE html>' + html;
      }

      return { html, outputMode };
    },

    async run(codeOverride = null, settingsOverride = null) {
      let token = ++this.store.runToken;
      let settings = settingsOverride || this.store.settings;

      if (this.$refs.code) {
        this.$refs.code.dismissAutosaveNotice();
      }

      this.store.runStatus = 'running';
      this.store.runDurationMs = null;
      this.store.runMemoryBytes = null;
      this.store.runOutputMode = null;
      this.store.runAt = null;
      this.store.runFatalError = null;
      this.store.showingPhpInfo = !!settingsOverride;

      try {
        let userCode = codeOverride != null ? codeOverride : this.$refs.code.editor.getValue();
        let reporting = errorReportingValues[settings.errorReporting] ?? errorReportingValues.none;
        let code = 'error_reporting(' + reporting + '); ?>' + userCode;
        let start = performance.now();
        let rawHtml = this.runPhpWasm(code);
        let durationMs = performance.now() - start;

        if (token !== this.store.runToken) {
          return;
        }

        let { html, outputMode } = this.buildResultHtml(rawHtml, settings);

        this.store.runDurationMs = Math.round(durationMs * 1000) / 1000;
        this.store.runMemoryBytes = null;
        this.store.runPhpVersion = '8.2 (WASM)';
        this.store.runOutputMode = outputMode;
        this.store.runAt = new Date();
        this.store.runFatalError = null;
        this.store.runStatus = 'done';

        if (this.store.settings.runExternal) {
          let external = window.open('', 'result-external');

          if (external) {
            external.document.open();
            external.document.write(html || '');
            external.document.close();
          }
        } else if (this.$refs.result) {
          this.$refs.result.setHtml(html || '');
        }
      } catch (e) {
        if (token !== this.store.runToken) {
          return;
        }

        this.store.runStatus = 'failed';
        this.store.runAt = new Date();
        this.store.runFatalError = e.message || 'Run failed.';
      }
    },

    clear() {
      let answer = confirm('Are you sure you want to clear the editor?');

      if (answer) { 
        this.$refs.code.reset({ persist: true });
        this.$refs.code.dismissAutosaveNotice();
        this.resetRunStatus();
      }
    },

    resetRunStatus() {
      this.store.runToken++;
      this.store.runStatus = 'idle';
      this.store.runDurationMs = null;
      this.store.runMemoryBytes = null;
      this.store.runPhpVersion = null;
      this.store.runOutputMode = null;
      this.store.runAt = null;
      this.store.runFatalError = null;
      this.store.showingPhpInfo = false;

      if (this.$refs.result) {
        this.$refs.result.setHtml('');
      }
    },

    async open() {
      if (typeof window.showOpenFilePicker !== 'function') {
        await this.openWithFileInput();
        return;
      }

      if (!this.checkSecureContext()) {
        return;
      }

      let fileHandle;

      try {
        [fileHandle] = await window.showOpenFilePicker({
          types: [
            {
              description: 'Code Files',
              accept: {
                'application/x-httpd-php': ['.php'],
                'text/*': ['.html', '.js', '.txt'],
              },
            }
          ],
          excludeAcceptAllOption: true,
          multiple: false,
        });

        let fileData = await fileHandle.getFile();
        let fileContents = await fileData.text();
        this.$refs.code.editor.setValue(fileContents);
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') {
          //
        } else {
          throw e;
        }
      }
    },

    openWithFileInput() {
      return new Promise((resolve) => {
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = '.php,.html,.js,.txt';

        input.addEventListener('change', async () => {
          let file = input.files?.[0];

          if (file) {
            let fileContents = await file.text();
            this.$refs.code.editor.setValue(fileContents);
          }

          resolve();
        });

        input.addEventListener('cancel', () => {
          resolve();
        });

        input.click();
      });
    },

    async save() {
      if (typeof window.showSaveFilePicker !== 'function') {
        this.saveWithDownload();
        return;
      }

      if (!this.checkSecureContext()) {
        return;
      }

      try {
        let fileHandle = await window.showSaveFilePicker();
        let writeStream = await fileHandle.createWritable();
        await writeStream.write(this.$refs.code.editor.getValue());
        await writeStream.close();
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') {
          //
        } else {
          throw e;
        }
      }
    },

    saveWithDownload() {
      let blob = new Blob([this.$refs.code.editor.getValue()], { type: 'text/plain' });
      let url = URL.createObjectURL(blob);
      let link = document.createElement('a');
      link.href = url;
      link.download = 'code.php';
      link.click();
      URL.revokeObjectURL(url);
    },

    checkSecureContext() {
      if (window.isSecureContext) {
        return true;
      } else {
        alert('This feature is only available in a secure context (https)');
        return false;
      }
    },

    menu(menuItem, ...props) {
      switch(menuItem) {
        case 'php_info':
          this.phpInfo();
          break;
        case 'load_sample':
          this.loadSample(props[0]);
          break;
      }
    },

    mouseMove(e) {
      if (this.store.resizing) {
        let x = e.pageX;
        
        if (x < 100) {
          x = 100;
        }

        if (x > (this.store.screenWidth - 100)) {
          x = this.store.screenWidth - 100;
        }

        this.store.divideX = x;
        this.store.settings.dividePercent = this.store.divideX / this.store.screenWidth;
      }
    },

    windowResize(e) {
      this.store.screenWidth = visualViewport.width;
      this.store.divideX = this.store.screenWidth * this.store.settings.dividePercent;
    },

    loadSettings() {
      this.store.divideX = this.store.screenWidth * this.store.settings.dividePercent;
      this.mouseMove({ pageX: this.store.divideX });
    },

    phpInfo() {
      let cloneSettings = { ...this.store.settings };
      cloneSettings.colorize = false;
      cloneSettings.outputMode = 'html';
      this.store.showingPhpInfo = true;
      this.run('<' + '?php phpinfo();', cloneSettings);
    },

    async loadSample(filename) {
      if (!filename) {
        return;
      }

      try {
        let response = await axios.get(`./samples/${filename}.php`, {
          responseType: 'text',
          transformResponse: [(data) => data],
        });

        if (typeof response.data !== 'string') {
          throw new Error('Import failed.');
        }

        this.$refs.code.editor.setValue(response.data, -1);
        this.$refs.code.dismissAutosaveNotice();
      } catch (e) {
        alert('Failed to load sample.');
      }
    },
  },

  mounted() {
    this.loadSettings();
    window.addEventListener('mousemove', this.mouseMove);
    window.addEventListener('resize', this.windowResize);
    this.$refs.code.reset();
    this.$refs.code.offerAutosaveRestore();
  },

  unmounted() {
    window.removeEventListener('mousemove', this.mouseMove);
    window.removeEventListener('resize', this.windowResize);
  },

  template: `
    <div class="app">
      <TopBar
        @open="open"
        @save="save"
        @clear="clear"
        @run="run"
      />
      <div
        class="workspace"
        :class="{ 'workspace_external': store.settings.runExternal }"
        :style="{ '--divide-x': store.divideX + 'px' }"
      >
        <Code
          ref="code"
          @run="run"
        />
        <ResizeBar />
        <Result ref="result" />
      </div>
      <div v-if="store.resizing" class="resize-overlay"></div>
      <SamplesMenu @load-sample="loadSample" />
      <Menu @menu="menu" />
    </div>
  `
})
  .use(Pinia.createPinia())
  .mount('#app');
