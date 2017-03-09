<template>
	<div @mouseenter="setMouseOver(true)" @mouseleave="setMouseOver(false)" :class="{ drop: !isSubmenu, subdrop: (isSubmenu && isParent), active: isActive }" class="clickable">
		<label :style="{ backgroundColor: isActive ? shadeColor('#555555', 5) : 'inherit' }">{{item.title}}</label>
		<transition name="slide-fade">
			<div v-show="shown" v-if="isParent">
				<dropdown-menu v-for="subitem in item.submenu" :item="subitem" :key="subitem.key" :active-key="activeChildKey" @selectKey="selectKey" :is-submenu="true"></dropdown-menu>
			</div>
		</transition>
	</div>
</template>

<script>
import { shadeColor } from './helpers.js';

export default {
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
				}, '1000');
			}
		},
		selectKey: function(key) {
			this.activeChildKey = key;
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
</script>

<style>
.slide-fade-enter-active { transition: all .3s ease; }
.slide-fade-leave-active { transition: all .3s ease; }
.slide-fade-enter, .slide-fade-leave-to { transform: translateX(-20px); opacity: 0; }

.drop { position: relative; display: inline-block; padding: 0 15px; cursor: pointer; font-size: 14px; }
.drop > div { position: absolute; z-index: 9997; width: 200px; background-color: #222; line-height: 30px; padding: 5px 0; left: 0; 
	-webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;user-select: none; cursor: default; }
.drop div label { cursor: pointer; display: block; padding-left: 10px; }
.drop .button { width: 180px; margin-left: 10px; }
.drop .checkbox, .drop .radio, .drop .clickable { padding-left: 10px; cursor: pointer; }
.drop.active > div { z-index: 9998; }

.clickable a { display: block; }

.drop .checkbox i, .drop .radio i, .drop .subdrop i { width: 15px; }

.subdrop { position: relative; padding-left: 32px; cursor: pointer; background-image: url(../img/subdrop.png); background-position: 185px 0; background-repeat: no-repeat; }
.subdrop.with_icon { padding-left: 10px; }
.subdrop > div { position: absolute; top: -5px; left: 200px; z-index: 9997; width: 200px; background-color: #222; padding: 5px 0; 
	-webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;user-select: none; cursor: default; }
.subdrop.active > div { z-index: 9998; }
</style>