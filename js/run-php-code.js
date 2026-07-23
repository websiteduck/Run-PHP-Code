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
import { PhpWeb } from '../lib/php-wasm/PhpWeb.mjs';

function eventText(detail) {
  if (Array.isArray(detail)) {
    return detail.join('');
  }

  return detail == null ? '' : String(detail);
}

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

  data() {
    return {
      php: null,
      phpPromise: null,
    };
  },

  methods: {
    async fetchPhpSource(path, marker, dumpKey) {
      let response = await fetch(path);
      let text = await response.text();

      if (text.includes(marker)) {
        return text;
      }

      // PHP servers execute .php on GET (often empty). Ask run.php to dump the source instead.
      let dumpResponse = await fetch('./run.php?wasm_source=' + encodeURIComponent(dumpKey));
      let dumpText = await dumpResponse.text();

      if (!dumpResponse.ok || !dumpText.includes(marker)) {
        throw new Error('Failed to load ' + path + ' for WebAssembly.');
      }

      return dumpText;
    },

    async ensurePhp() {
      if (this.php) {
        return this.php;
      }

      if (this.phpPromise) {
        return this.phpPromise;
      }

      this.phpPromise = (async () => {
        let php = new PhpWeb({
          version: '8.5',
          autoTransaction: false,
        });

        await new Promise((resolve, reject) => {
          let timeout = setTimeout(() => {
            reject(new Error('PHP WebAssembly failed to load.'));
          }, 60000);

          php.addEventListener('ready', () => {
            clearTimeout(timeout);
            resolve();
          }, { once: true });
        });

        let [runPhp, parsedown] = await Promise.all([
          this.fetchPhpSource('./run.php', 'runphp_data', 'run'),
          this.fetchPhpSource('./lib/Parsedown.php', 'class Parsedown', 'parsedown'),
        ]);

        for (let path of ['/lib', '/tmp']) {
          let info = await php.analyzePath(path);
          if (!info.exists) {
            await php.mkdir(path);
          }
        }

        await php.writeFile('/run.php', runPhp);
        await php.writeFile('/lib/Parsedown.php', parsedown);
        this.php = php;
        return php;
      })();

      try {
        return await this.phpPromise;
      } catch (e) {
        this.phpPromise = null;
        throw e;
      }
    },

    parseRunPhpOutput(raw) {
      let text = String(raw || '').replace(/^\uFEFF/, '').trim();

      if (!text) {
        throw new Error('Empty response from run.php');
      }

      let headerSep = text.indexOf('\r\n\r\n');
      if (headerSep === -1) {
        headerSep = text.indexOf('\n\n');
      }

      let body = headerSep !== -1 ? text.slice(headerSep).trim() : text;
      let start = body.indexOf('{');
      let end = body.lastIndexOf('}');

      if (start === -1 || end === -1 || end < start) {
        throw new Error('Invalid response from run.php');
      }

      let data = JSON.parse(body.slice(start, end + 1));

      if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid response from run.php');
      }

      return data;
    },

    async runViaWasm(payload) {
      let php = await this.ensurePhp();

      await php.writeFile('/tmp/runphp_data.txt', JSON.stringify(payload));

      let stdout = '';
      let stderr = '';
      let onOutput = (event) => {
        stdout += eventText(event.detail);
      };
      let onError = (event) => {
        stderr += eventText(event.detail);
      };

      php.addEventListener('output', onOutput);
      php.addEventListener('error', onError);

      try {
        await php.run(`<?php
error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);
$_SERVER['RUNPHP_WASM'] = '1';
$_POST['runphp_data'] = file_get_contents('/tmp/runphp_data.txt');
include '/run.php';
`);
        php.flush();
      } finally {
        php.removeEventListener('output', onOutput);
        php.removeEventListener('error', onError);

        // run.php calls die(); refresh so the next run gets a live runtime.
        try {
          await php.refresh();
        } catch (e) {
          //
        }
      }

      try {
        return this.parseRunPhpOutput(stdout);
      } catch (e) {
        if (stderr.trim()) {
          throw new Error(stderr.trim());
        }

        throw e;
      }
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

      let payload = {
        code: codeOverride != null ? codeOverride : this.$refs.code.editor.getValue(),
        action: 'run',
        settings,
        color: this.store.uiColors.color,
        background_color: this.store.uiColors.backgroundColor,
      };

      try {
        let data = await this.runViaWasm(payload);

        if (token !== this.store.runToken) {
          return;
        }

        this.store.runDurationMs = data.duration_ms;
        this.store.runMemoryBytes = data.memory_bytes;
        this.store.runPhpVersion = data.php_version || null;
        this.store.runOutputMode = data.output_mode || null;
        this.store.runAt = new Date();
        this.store.runFatalError = data.fatal_error || null;
        this.store.runStatus = data.fatal_error ? 'failed' : 'done';

        if (this.store.settings.runExternal) {
          let external = window.open('', 'result-external');

          if (external) {
            external.document.open();
            external.document.write(data.html || '');
            external.document.close();
          }
        } else if (this.$refs.result) {
          this.$refs.result.setHtml(data.html || '');
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
        let path = `./samples/${filename}.php`;
        let response = await axios.get(path, {
          responseType: 'text',
          transformResponse: [(data) => data],
        });
        let text = response.data;

        // PHP servers execute samples on GET, stripping the <?php preamble (and markdown hint).
        if (typeof text !== 'string' || !text.includes('@run-php-code')) {
          let dump = await axios.get('./run.php', {
            params: { wasm_source: 'sample', file: filename },
            responseType: 'text',
            transformResponse: [(data) => data],
          });
          text = dump.data;
        }

        if (typeof text !== 'string' || !text.includes('@run-php-code')) {
          throw new Error('Import failed.');
        }

        this.$refs.code.editor.setValue(text, -1);
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
    this.ensurePhp().catch(() => {
      // First run() will surface the error if preload fails.
    });
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
