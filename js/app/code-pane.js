import { shadeColor } from './helpers.js';

export default {
	template: `
		<div class="code-pane">
			{{ $store.state.hello }}
			<button @click="testBtn">Test</button>
		</div>
	`,
	name: 'code-pane',
	props: [],
	data: function() {
		return {
			settings: this.$root.$data.settings
		};
	},
	methods: {
		shadeColor: shadeColor,
		testBtn() {
			this.$store.state.hello = Math.random(1,10);
		}
	},
	computed: {
	}
}