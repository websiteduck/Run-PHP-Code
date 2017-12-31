import { shadeColor } from './helpers.js';

export default {
	template: `
		<div 
			@mouseenter="setMouseOver(true)" 
			@mouseleave="setMouseOver(false)" 
			:class="{ drop: !isSubmenu, subdrop: (isSubmenu && isParent), active: isActive }"
		>
			<label :style="{ backgroundColor: isActive ? shadeColor('#555555', 5) : 'inherit' }" class="clickable">{{item.title}}</label>
			<div 
				v-show="shown" 
				v-if="isParent" 
				ref="menu"
			>
				<dropdown-menu 
					v-for="subitem in item.submenu" 
					:item="subitem" 
					:key="subitem.key" 
					:active-key="activeChildKey" 
					@selectKey="activeChildKey = $event" 
					:is-submenu="true"
				></dropdown-menu>
			</div>
		</div>
	`,
	name: 'dropdown-menu',
	props: ['item', 'isSubmenu', 'activeKey'],
	data: function() {
		return {
			shown: false,
			mouseOver: false,
			hideTimeout: null,
			activeChildKey: '',
			settings: this.$root.$data.settings
		};
	},
	methods: {
		setMouseOver: function(val) {
			if (val) {
				this.mouseOver = true;
				this.shown = true;
				this.$emit('selectKey', this.item.key);
				if (this.hideTimeout !== null) clearTimeout(this.hideTimeout);
			}
			else {
				this.mouseOver = false;
				let self = this;
				this.hideTimeout = setTimeout(function() {
					self.shown = false;
				}, '1500');
			}
		},
		shadeColor: shadeColor
	},
	computed: {
		isParent: function() {
			return (this.item.submenu && this.item.submenu.length);
		},
		isActive: function() {
			return (this.item.key === this.activeKey && this.mouseOver);
		}
	}
}