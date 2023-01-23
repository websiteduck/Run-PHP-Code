/**
 * Run PHP Code
 * 
 * This script gives you the ability to quickly test snippets of PHP code locally.
 *
 * @copyright  Copyright 2011-2022, Website Duck LLC (http://www.websiteduck.com)
 * @link       http://github.com/websiteduck/Run-PHP-Code Run PHP Code
 * @license    MIT License (http://www.opensource.org/licenses/mit-license.php)
 */

import Code from './components/Code.js';
import Menu from './components/Menu.js';
import ResizeBar from './components/ResizeBar.js';
import Result from './components/Result.js';
import TopBar from './components/TopBar.js';
import { useStore } from './store.js';

Vue.createApp({
  components: {
    Code,
    Menu,
    ResizeBar,
    Result,
    TopBar,
  },

  setup() {
    return { store: useStore() }
  },

  methods: {
    run() {
      let form = this.$refs.form;
      let input = form.querySelector('[name="runphp_data"]');
      
      input.value = JSON.stringify({
        code: this.$refs.code.editor.getValue(),
        action: 'run',
        settings: this.store.settings,
        color: this.store.uiColors.color,
        background_color: this.store.uiColors.backgroundColor,
      });

      this.store.showingPhpInfo = false;

      form.submit();
    },

    clear() {
      let answer = confirm('Are you sure you want to clear the editor?');

      if (answer) { 
        this.$refs.code.reset();
        this.run();
      }
    },

    async open() {
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
        if (e instanceof DOMException && e.code === DOMException.ABORT_ERR) {
          //
        } else {
          throw e;
        }
      }
    },

    async save() {
      if (!this.checkSecureContext()) {
        return;
      }

      try {
        let fileHandle = await window.showSaveFilePicker();
        let writeStream = await fileHandle.createWritable();
        await writeStream.write(this.$refs.code.editor.getValue());
        await writeStream.close();
      } catch (e) {
        if (e instanceof DOMException && e.code === DOMException.ABORT_ERR) {
          //
        } else {
          throw e;
        }
      }
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
          this.loadSample(props);
          break;
      }
    },

    mouseMove(e) {
      if (this.store.resizing) {
        let x = e.pageX;
        
        if (x < 100) {
          x = 100;
        }

        if (x > (this.screenWidth - 100)) {
          x = this.screenWidth - 100;
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
      let form = this.$refs.form;
      let input = form.querySelector('[name="runphp_data"]');
      let cloneSettings = { ...this.store.settings };
      cloneSettings.colorize = false;

      input.value = JSON.stringify({
        code: '<' + '?php phpinfo();',
        action: 'run',
        settings: cloneSettings,
      });

      this.store.showingPhpInfo = true;

      form.submit();
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
      let response;
      this.$refs.code.editor.setValue('Loading Code...');
      
      if (codeUrl.toLowerCase().indexOf('github.com') !== -1) {
        response = await axios.get('proxy.php', { params: { url: 'https://api.github.com/gists/' + codeId } });
        Object.values(response.data.files).forEach((file) => {
          content += file.content + '\n';
        });
      }
      else if (codeUrl.toLowerCase().indexOf('pastebin.com') !== -1) {
        response = await axios.get('proxy.php', { params: { url: 'http://pastebin.com/raw/' + codeId } });
        content = response.data;
      }
      else if (codeUrl.toLowerCase().indexOf('pastie.org') !== -1) {
        response = await axios.get('proxy.php', { params: { url: 'http://pastie.org/p/' + codeId + '/raw' } });
        content = response.data;
      }

      this.$refs.code.editor.setValue(content);
    },

    async loadSample(filename) {
      this.$refs.code.reset();
      this.run();
      let response = await axios.get('proxy.php', { params: { url: `./samples/${filename}.php` } });
      this.$refs.code.editor.setValue(response.data);
    },
  },

  mounted() {
    this.loadSettings();
    window.addEventListener('mousemove', this.mouseMove);
    window.addEventListener('resize', this.windowResize);
    this.$refs.code.reset();
    this.run();
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
    <Result />
    <Menu @menu="menu" />
    <form 
      ref="form" 
      method="POST" 
      action="run.php"
      :target="(store.settings.runExternal ? 'result-external' : 'result-frame')"
    >
      <input type="hidden" name="runphp_data" value="" />
    </form>
  `
})
  .use(Pinia.createPinia())
  .mount('#app');