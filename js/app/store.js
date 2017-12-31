import Vue from '../lib/vue.esm.browser.js';
import Vuex from '../lib/vuex.esm.js';

Vue.use(Vuex);

const state = {
	hello: 'World'	
};

export default new Vuex.Store({
	state
})