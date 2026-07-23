import { useStore } from '../store.js';

const AUTOSAVE_KEY = 'runphpcode_code';
const AUTOSAVE_DELAY_MS = 400;
const DEFAULT_CODE = "<?php\n\n";

function readAutosave() {
  try {
    let raw = localStorage.getItem(AUTOSAVE_KEY);

    if (raw === null) {
      return null;
    }

    try {
      let parsed = JSON.parse(raw);

      if (parsed && typeof parsed === 'object' && typeof parsed.code === 'string') {
        return {
          code: parsed.code,
          savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : null,
        };
      }
    } catch (e) {
      // Legacy plain-string drafts
    }

    return { code: raw, savedAt: null };
  } catch (e) {
    return null;
  }
}

function formatSavedAt(savedAt) {
  if (!savedAt) {
    return null;
  }

  let date = new Date(savedAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

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
      autosaveTimer: null,
      showAutosaveNotice: false,
      autosaveSavedAtLabel: null,
      suppressAutosave: false,
      userHasEdited: false,
    }
  },

  mounted() {
    this.editor = ace.edit(this.$refs.codeDiv);
    this.editor.getSession().setMode('ace/mode/php');
    this.editor.setShowPrintMargin(false);
    this.editor.commands.addCommand({
      name: 'runCode',
      bindKey: {win: 'Ctrl-Enter',  mac: 'Command-Enter'},
      exec: (editor) => {
        if (this.store.runStatus !== 'running') {
          this.$emit('run');
        }
      }
    });
    this.editor.on('change', () => {
      if (this.suppressAutosave) {
        return;
      }

      this.userHasEdited = true;

      if (this.store.settings.autosave) {
        if (window.onbeforeunload == null) {
          window.onbeforeunload = () => "You have made changes in your editor.";
        }
        this.scheduleAutosave();
      } else if (window.onbeforeunload == null) {
        window.onbeforeunload = () => "You have made changes in your editor.";
      }
    });
    this.setTheme(this.store.settings.theme);

    Vue.watch(
      () => this.store.settings.theme,
      (theme) => this.setTheme(theme),
    );

    Vue.watch(
      () => this.store.settings.autosave,
      (enabled) => {
        if (enabled) {
          this.persistCode();
        } else {
          clearTimeout(this.autosaveTimer);
          this.autosaveTimer = null;
        }
      },
    );

    Vue.watch(
      () => this.showAutosaveNotice,
      () => this.$nextTick(() => this.resize()),
    );

    window.addEventListener('pagehide', this.flushAutosave);
  },

  unmounted() {
    window.removeEventListener('pagehide', this.flushAutosave);
    clearTimeout(this.autosaveTimer);
    this.editor.destroy();
  },

  methods: {
    resize() {
      this.editor.resize();
    },

    reset({ persist = false } = {}) {
      this.suppressAutosave = true;
      this.editor.setValue(DEFAULT_CODE);
      this.editor.gotoLine(3);
      this.editor.focus();
      window.onbeforeunload = null;
      this.$nextTick(() => {
        this.suppressAutosave = false;
        if (persist) {
          this.userHasEdited = true;
          this.persistCode({ force: true });
        }
      });
    },

    scheduleAutosave() {
      if (this.suppressAutosave || !this.userHasEdited) {
        return;
      }

      clearTimeout(this.autosaveTimer);
      this.autosaveTimer = setTimeout(() => this.persistCode(), AUTOSAVE_DELAY_MS);
    },

    flushAutosave() {
      if (!this.userHasEdited) {
        return;
      }

      clearTimeout(this.autosaveTimer);
      this.autosaveTimer = null;
      this.persistCode();
    },

    persistCode({ force = false } = {}) {
      if (this.suppressAutosave || !this.store.settings.autosave || !this.editor) {
        return;
      }

      if (!force && !this.userHasEdited) {
        return;
      }

      try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({
          code: this.editor.getValue(),
          savedAt: new Date().toISOString(),
        }));
        window.onbeforeunload = null;
      } catch (e) {
        //
      }
    },

    offerAutosaveRestore() {
      let draft = readAutosave();

      if (!draft || draft.code === DEFAULT_CODE) {
        this.showAutosaveNotice = false;
        this.autosaveSavedAtLabel = null;
        return;
      }

      this.autosaveSavedAtLabel = formatSavedAt(draft.savedAt);
      this.showAutosaveNotice = true;
    },

    loadAutosave() {
      let draft = readAutosave();

      if (!draft) {
        this.showAutosaveNotice = false;
        this.autosaveSavedAtLabel = null;
        return;
      }

      this.suppressAutosave = true;
      this.editor.setValue(draft.code, -1);
      this.editor.focus();
      window.onbeforeunload = null;
      this.showAutosaveNotice = false;
      this.autosaveSavedAtLabel = null;
      this.$nextTick(() => {
        this.suppressAutosave = false;
      });
    },

    dismissAutosaveNotice() {
      this.showAutosaveNotice = false;
      this.autosaveSavedAtLabel = null;
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
      :style="{
        width: (store.settings.runExternal ? store.screenWidth.toString() : store.divideX.toString()) + 'px',
      }"
      @click="store.menuOpen = false; store.samplesOpen = false"
    >
      <div
        v-if="showAutosaveNotice"
        class="code__autosave-notice"
        :style="{
          color: store.uiColors.color,
          backgroundColor: store.uiColors.menu.backgroundColor,
          borderBottomColor: store.uiColors.topBar.borderColor,
        }"
        @click.stop
      >
        <span>
          Autosaved code available<span v-if="autosaveSavedAtLabel"> (saved {{ autosaveSavedAtLabel }})</span>.
        </span>
        <button
          type="button"
          class="code__autosave-notice-action"
          :style="{ color: store.uiColors.color }"
          @click="loadAutosave"
        >Restore</button>
        <button
          type="button"
          class="code__autosave-notice-dismiss"
          :style="{ color: store.uiColors.color }"
          title="Dismiss"
          @click="dismissAutosaveNotice"
        >&times;</button>
      </div>
      <div class="code__editor" ref="codeDiv"></div>
    </div>
  `,
};
