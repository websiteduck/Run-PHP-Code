import { adjustColor, useLocalStorage } from './utilities.js';

export const useStore = Pinia.defineStore('store', {
  state: () => ({
    settings: useLocalStorage(
      'runphpcode_settings', 
      {
        colorize: true,
        dividePercent: 0.5,
        runExternal: false,
        theme: 'twilight',
        outputMode: 'html',
        errorReporting: 'fatal',
        autosave: true,
      }
    ),

    loadedTheme: null,
    resizing: false,
    showingPhpInfo: false,
    contributorsLoaded: false,
    contributors: [],
    divideX: visualViewport.width / 2,
    screenWidth: visualViewport.width,
    menuOpen: false,
    samplesOpen: false,
    runStatus: 'idle',
    runDurationMs: null,
    runMemoryBytes: null,
    runPhpVersion: null,
    runOutputMode: null,
    runAt: null,
    runFatalError: null,
    runToken: 0,

    uiColors: {
      color: null,
      backgroundColor: null,
      topBar: {
        color: null,
        backgroundColor: null,
        borderColor: null,
        iconHoverBackgroundColor: null,
        button: {
          color: null,
          backgroundColor: null,
          hoverBackgroundColor: null,
        },
        phpSearch: {
          color: null,
          backgroundColor: null,
          outlineColor: null,
        }
      },
      resizeBar: {
        backgroundColor: null,
      },
      menu: {
        color: null,
        backgroundColor: null,
      }
    },

    errorReports: [
      { value: 'none', label: 'None' },
      { value: 'fatal', label: 'Fatal' },
      { value: 'warning', label: 'Warning' },
      { value: 'deprecated', label: 'Deprecated' },
      { value: 'notice', label: 'Notice' },
      { value: 'all', label: 'All' },
    ],

    outputModes: [
      { value: 'html', label: 'HTML' },
      { value: 'console', label: 'Console' },
      { value: 'markdown', label: 'Markdown' },
    ],

    samples: [
      { id: 'float-money', label: 'Floats & Money' },
      { id: 'type-juggling', label: 'Type Juggling' },
      { id: 'foreach-reference', label: 'Foreach References' },
      { id: 'datetime-mutable', label: 'DateTime Mutability' },
      { id: 'oop-quirks', label: 'OOP Quirks' },
    ],

    themes: {
      light: [
        { title: 'Chrome', theme: 'chrome' },
        { title: 'Cloud9 Day', theme: 'cloud9_day' },
        { title: 'Clouds', theme: 'clouds' },
        { title: 'Crimson Editor', theme: 'crimson_editor' },
        { title: 'Dawn', theme: 'dawn' },
        { title: 'Dreamweaver', theme: 'dreamweaver' },
        { title: 'Eclipse', theme: 'eclipse' },
        { title: 'GitHub', theme: 'github' },
        { title: 'Gruvbox Light Hard', theme: 'gruvbox_light_hard' },
        { title: 'IPlastic', theme: 'iplastic' },
        { title: 'Katzenmilch', theme: 'katzenmilch' },
        { title: 'Kuroir', theme: 'kuroir' },
        { title: 'Solarized Light', theme: 'solarized_light' },
        { title: 'SQL Server', theme: 'sqlserver' },
        { title: 'TextMate', theme: 'textmate' },
        { title: 'Tomorrow', theme: 'tomorrow' },
        { title: 'XCode', theme: 'xcode' },
      ],
      dark: [
        { title: 'Ambiance', theme: 'ambiance' },
        { title: 'Chaos', theme: 'chaos' },
        { title: 'Cloud9 Night', theme: 'cloud9_night' },
        { title: 'Clouds Midnight', theme: 'clouds_midnight' },
        { title: 'Cobalt', theme: 'cobalt' },
        { title: 'Dracula', theme: 'dracula' },
        { title: 'Green on Black', theme: 'gob' },
        { title: 'Gruvbox', theme: 'gruvbox' },
        { title: 'Gruvbox Dark Hard', theme: 'gruvbox_dark_hard' },
        { title: 'idle Fingers', theme: 'idle_fingers' },
        { title: 'krTheme', theme: 'kr_theme' },
        { title: 'Merbivore', theme: 'merbivore' },
        { title: 'Merbivore Soft', theme: 'merbivore_soft' },
        { title: 'Mono Industrial', theme: 'mono_industrial' },
        { title: 'Monokai', theme: 'monokai' },
        { title: 'Nord Dark', theme: 'nord_dark' },
        { title: 'One Dark', theme: 'one_dark' },
        { title: 'Pastel on dark', theme: 'pastel_on_dark' },
        { title: 'Solarized Dark', theme: 'solarized_dark' },
        { title: 'Terminal', theme: 'terminal' },
        { title: 'Tomorrow Night', theme: 'tomorrow_night' },
        { title: 'Tomorrow Night Blue', theme: 'tomorrow_night_blue' },
        { title: 'Tomorrow Night Bright', theme: 'tomorrow_night_bright' },
        { title: 'Tomorrow Night 80s', theme: 'tomorrow_night_eighties' },
        { title: 'Twilight', theme: 'twilight' },
        { title: 'Vibrant Ink', theme: 'vibrant_ink' },
      ]
    },
  }),

  getters: {
    lightTheme: (state) => {
      let isLightTheme = false;

      state.themes.light.forEach((lightTheme) => {
        if (state.settings.theme === lightTheme.theme) {
          isLightTheme = true;
        }
      });

      return isLightTheme;
    },
  },

  actions: {
    generateUiColors(color, backgroundColor) {
      let uiColors = this.uiColors;
      let borderColor = adjustColor(backgroundColor, -10);
      let iconHover = adjustColor(backgroundColor, (this.lightTheme ? -4 : 4));
      let buttonHover = adjustColor(color, (this.lightTheme ? 20 : -20));
      let searchBg = adjustColor(backgroundColor, (this.lightTheme ? -10 : 10));
      let searchOutline = adjustColor(backgroundColor, (this.lightTheme ? -50 : 50));
      let resizeBg = adjustColor(backgroundColor, -10);
      let menuBg = adjustColor(backgroundColor, (this.lightTheme ? -10 : 10));
      let menuHover = adjustColor(backgroundColor, (this.lightTheme ? -5 : 15));

      uiColors.color = color;
      uiColors.backgroundColor = backgroundColor;

      uiColors.topBar.color = color;
      uiColors.topBar.backgroundColor = backgroundColor;
      uiColors.topBar.borderColor = borderColor;
      uiColors.topBar.iconHoverBackgroundColor = iconHover;

      uiColors.topBar.button.backgroundColor = color;
      uiColors.topBar.button.hoverBackgroundColor = buttonHover;
      uiColors.topBar.button.color = backgroundColor;

      uiColors.topBar.phpSearch.color = color;
      uiColors.topBar.phpSearch.backgroundColor = searchBg;
      uiColors.topBar.phpSearch.outlineColor = searchOutline;

      uiColors.resizeBar.backgroundColor = resizeBg;

      uiColors.menu.color = color;
      uiColors.menu.backgroundColor = menuBg;
      uiColors.menu.hoverBackgroundColor = menuHover;

      let root = document.documentElement;
      root.style.setProperty('--ui-fg', color);
      root.style.setProperty('--ui-bg', backgroundColor);
      root.style.setProperty('--ui-border', borderColor);
      root.style.setProperty('--ui-icon-hover', iconHover);
      root.style.setProperty('--ui-btn-bg', color);
      root.style.setProperty('--ui-btn-fg', backgroundColor);
      root.style.setProperty('--ui-btn-hover', buttonHover);
      root.style.setProperty('--ui-search-fg', color);
      root.style.setProperty('--ui-search-bg', searchBg);
      root.style.setProperty('--ui-search-outline', searchOutline);
      root.style.setProperty('--ui-resize', resizeBg);
      root.style.setProperty('--ui-menu-fg', color);
      root.style.setProperty('--ui-menu-bg', menuBg);
      root.style.setProperty('--ui-menu-hover', menuHover);
      root.style.setProperty('--ui-surface', menuBg);
    },

    async loadContributors() {
      if (!this.contributorsLoaded) {
        this.contributorsLoaded = true;
        let response = await axios.get('https://api.github.com/repos/websiteduck/Run-PHP-Code/contributors');

        response.data.forEach((contributor) => {
          this.contributors.push({
            url: contributor.html_url,
            avatar_url: contributor.avatar_url,
            login: contributor.login,
          });
        });
      }
    },
  }
});