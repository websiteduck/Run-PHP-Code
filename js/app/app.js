import DropdownMenu from './dropdown-menu.js';
import CodePane from './code-pane.js';
import menuItems from './menu-items.js';

const state = {}

export default {
	state,
	template: `
		<div id="app">
			<div id="title-bar">
				<div id="title">Run PHP Code</div>
				<dropdown-menu v-for="item in menu" :item="item" :key="item.key" :active-key="activeChildKey" @selectKey="activeChildKey = $event" :is-submenu="false"></dropdown-menu>
				<div id="button_container">
					<button class="button" type="button" data-bind="click: clear"><i class="fa fa-eraser"></i> &nbsp; Clear</button>
					<button class="button" type="button" title="Run (Ctrl+Enter)" data-bind="click: run">Run &nbsp; <i class="fa fa-play"></i></button>
				</div>
			</div>
			<code-pane></code-pane>
			<div id="result-pane" data-bind="visible: !settings.run_external(), style: { width: result_width() + 'px' }"><iframe id="result_frame" name="result_frame" data-bind="event: { load: result_loaded }"></iframe></div>		
			<div id="resize_bar" data-bind="visible: !settings.run_external(), style: { left: settings.divide_x() + 'px' }"></div>
		</div>
	`,
	name: 'app',
	data: function() {
		return {
			activeChildKey: '',
			menu: menuItems,
		};
	},
	methods: {
	},
	components: {
		dropdownMenu: DropdownMenu,
		codePane: CodePane
	}
};