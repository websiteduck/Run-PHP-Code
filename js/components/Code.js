import { useStore } from '../store.js';

export default {
  props: {
    theme: String,
  },

  setup() {
    return { store: useStore() };
  },

  data() {
    return {
      editor: null,
    }
  },

  mounted() {
    this.editor = ace.edit(this.$refs.codeDiv);
    this.editor.getSession().setMode('ace/mode/php');
    this.editor.setShowPrintMargin(false);
    this.editor.$blockScrolling = Infinity;
    this.editor.commands.addCommand({
      name: 'runCode',
      bindKey: {win: 'Ctrl-Enter',  mac: 'Command-Enter'},
      exec: (editor) => {
        this.$emit('run');
      }
    });
    this.editor.on('change', () => {
      if (window.onbeforeunload == null) {
        window.onbeforeunload = () => "You have made changes in your editor.";
      }
    });
    this.setTheme(this.store.settings.theme);

    Vue.watch(
      () => this.store.settings.theme,
      (theme) => this.setTheme(theme),
    );
  },

  unmounted() {
    this.editor.destroy();
  },

  methods: {
    resize() {
      this.editor.resize();
    },

    reset() {
      this.editor.setValue("<?php\n\n");
      this.editor.gotoLine(3);
      this.editor.focus();
      window.onbeforeunload = null;
    },

    setTheme(theme) {
      this.editor.setTheme('ace/theme/' + theme, () => {
        let codeElement = this.$refs.codeDiv;
        let gutterElement = codeElement.getElementsByClassName('ace_gutter')[0];
        let color = getComputedStyle(codeElement).color;
        let backgroundColor = getComputedStyle(gutterElement).backgroundColor;

        if (/^rgba/i.test(backgroundColor)) {
          backgroundColor = getComputedStyle(codeElement).backgroundColor;
        }

        this.store.generateUiColors(color, backgroundColor);
        this.store.loadedTheme = theme;
      });
    },
  },

  watch: {
    theme(theme) {
        this.setTheme(theme);
    },
  },

  template: `
    <div 
      class="code" 
      ref="codeDiv"
      :style="{
        width: (store.settings.runExternal ? store.screenWidth.toString() : store.divideX.toString()) + 'px',
      }"
      @click="store.menuOpen = false"
    ></div>
  `,
};