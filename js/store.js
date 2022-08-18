import { adjustColor } from './utilities.js';

export const useStore = Pinia.defineStore('store', {
  state: () => ({
    settings: VueUse.useLocalStorage(
      'runphpcode_settings', 
      {
        colorize: true,
        dividePercent: 0.5,
        runExternal: false,
        theme: 'twilight',
        preWrap: false,
        errorReporting: 'fatal',
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

    uiColors: {
      color: null,
      backgroundColor: null,
      topBar: {
        color: null,
        backgroundColor: null,
        borderColor: null,
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
      uiColors.color = color;
      uiColors.backgroundColor = backgroundColor;

      uiColors.topBar.color = color;
      uiColors.topBar.backgroundColor = backgroundColor;
      uiColors.topBar.borderColor = adjustColor(backgroundColor, -10);

      uiColors.topBar.button.backgroundColor = color;
      uiColors.topBar.button.hoverBackgroundColor = adjustColor(color, (this.lightTheme ? 20 : -20));
      uiColors.topBar.button.color = backgroundColor;

      uiColors.topBar.phpSearch.color = color;
      uiColors.topBar.phpSearch.backgroundColor = adjustColor(backgroundColor, (this.lightTheme ? -10 : 10));
      uiColors.topBar.phpSearch.outlineColor = adjustColor(backgroundColor, (this.lightTheme ? -50 : 50));

      uiColors.resizeBar.backgroundColor = adjustColor(backgroundColor, -10);

      uiColors.menu.color = color;
      uiColors.menu.backgroundColor = adjustColor(backgroundColor, (this.lightTheme ? -10 : 10));
      uiColors.menu.hoverBackgroundColor = adjustColor(backgroundColor, (this.lightTheme ? -5 : 15));
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