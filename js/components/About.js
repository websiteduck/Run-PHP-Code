import { useStore } from '../store.js';

export default {
  setup() {
    return { store: useStore() }
  },

  template: `
    <div class="about">
      <div class="about__info">
        <div class="about__title">
          Run PHP Code
        </div>
        <img class="about__logo" src="img/website-duck.png" alt="Website Duck" />
        <div class="about__copyright">© Website Duck LLC</div>
        <a class="about__github" href="https://github.com/websiteduck/Run-PHP-Code">
          <svg viewBox="0 0 64 64">
            <use href="#svg-github-octicon" />
          </svg>
          GitHub Repo
        </a>
        <div class="about__header">Contributors</div>
        <div class="about__section">
          <a 
            class="about__contributor"
            v-for="contributor in store.contributors"
            :href="contributor.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img :src="contributor.avatar_url + '&s=24'" />{{ contributor.login }}
          </a>
        </div>
        <div class="about__header">Attributions</div>
        <div class="about__section">
          <a class="about__attribution" href="https://ace.c9.io" target="_blank" rel="noopener noreferrer">Ace</a>
          <a class="about__attribution" href="https://vuejs.org" target="_blank" rel="noopener noreferrer">Vue.js</a>
          <a class="about__attribution" href="https://pinia.vuejs.org" target="_blank" rel="noopener noreferrer">Pinia</a>
          <a class="about__attribution" href="https://axios-http.com" target="_blank" rel="noopener noreferrer">Axios</a>
        </div>
      </div>
    </div>
  `,
};
