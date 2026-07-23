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
        let response = await axios.post(
          'run.php',
          new URLSearchParams({ runphp_data: JSON.stringify(payload) }),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
        );

        if (token !== this.store.runToken) {
          return;
        }

        let data = response.data;

        if (typeof data !== 'object' || data === null) {
          throw new Error('Invalid response from run.php');
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
        case 'remote_import':
          this.remoteImport();
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

    async remoteImport() {  
      let codeUrl = prompt(`
        Always make sure imported code is safe before running!!!\n
        Supported services: gist.GitHub.com, PasteBin.com, Pastie.org\n
        Enter URL:
      `);

      if (codeUrl === null || codeUrl === '') {
        return;
      }

      this.$refs.code.reset();
      this.run();

      let codeId = codeUrl.split('/').pop();
      let content = '';
      let urlLower = codeUrl.toLowerCase();
      this.$refs.code.editor.setValue('Loading Code...');

      try {
        if (urlLower.indexOf('github.com') !== -1) {
          let response = await axios.get('proxy.php', { params: { url: 'https://api.github.com/gists/' + codeId } });

          if (typeof response.data !== 'object' || response.data === null || !response.data.files) {
            throw new Error('Import failed.');
          }

          Object.values(response.data.files).forEach((file) => {
            content += file.content + '\n';
          });
        }
        else if (urlLower.indexOf('pastebin.com') !== -1) {
          let response = await axios.get('proxy.php', { params: { url: 'https://pastebin.com/raw/' + codeId } });

          if (typeof response.data !== 'string' || response.data === 'Import failed.') {
            throw new Error('Import failed.');
          }

          content = response.data;
        }
        else if (urlLower.indexOf('pastie.org') !== -1) {
          let response = await axios.get('proxy.php', { params: { url: 'https://pastie.org/p/' + codeId + '/raw' } });

          if (typeof response.data !== 'string' || response.data === 'Import failed.') {
            throw new Error('Import failed.');
          }

          content = response.data;
        }
        else {
          this.$refs.code.editor.setValue('');
          alert('Unsupported URL. Use a GitHub Gist, PasteBin, or Pastie link.');
          return;
        }
      } catch (e) {
        this.$refs.code.editor.setValue('');
        alert('Import failed.');
        return;
      }

      this.$refs.code.editor.setValue(content);
    },

    async loadSample(filename) {
      if (!filename) {
        return;
      }

      try {
        let response = await axios.get('proxy.php', {
          params: { url: `./samples/${filename}.php` },
        });

        if (typeof response.data !== 'string' || response.data === 'Import failed.') {
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
    <TopBar
      @open="open"
      @save="save"
      @clear="clear"
      @run="run"
    />
    <Code
      ref="code"
      @run="run"
    />
    <ResizeBar />
    <Result ref="result" />
    <div v-if="store.resizing" class="resize-overlay"></div>
    <SamplesMenu @load-sample="loadSample" />
    <Menu @menu="menu" />
  `
})
  .use(Pinia.createPinia())
  .mount('#app');