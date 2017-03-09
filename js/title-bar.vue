<template>
	<div id="title-bar">
		<div id="title">{{appName}}</div>
		<dropdown-menu v-for="item in menu" :item="item" :key="item.key" :active-key="activeChildKey" @selectKey="selectKey" :is-submenu="false"></dropdown-menu>
		<div id="button_container">
			<button class="button" type="button" data-bind="click: clear"><i class="fa fa-eraser"></i> &nbsp; Clear</button>
			<button class="button" type="button" title="Run (Ctrl+Enter)" data-bind="click: run">Run &nbsp; <i class="fa fa-play"></i></button>
		</div>
	</div>
</template>

<script>
import DropdownMenu from './dropdown-menu.vue';
import {themes} from './themes.js';

export default {
	name: 'title-bar',
	props: ['appName'],
	components: {
		dropdownMenu: DropdownMenu
	},
	data: () => {
		return {
			activeChildKey: '',
			menu: [
				{
					title: 'File',
					key: 'file',
					submenu: [
						{ title: 'phpinfo()', key: 'phpinfo' },
						{ title: 'Remote Import...', key: 'remote_import' },
						{ title: 'Download...', key: 'download' }
					]
				},
				{
					title: 'Options',
					key: 'options',
					submenu: [
						{ title: 'Colorize', key: 'colorize' },
						{ title: 'External Window', key: 'external_window' },
						{ title: '<pre> Wrap', key: 'pre_wrap' },
					]
				},
				{
					title: 'Themes',
					key: 'themes',
					submenu: themes
				}
			]
		};
	},
	methods: {
		selectKey: function(key) {
			this.activeChildKey = key;
		}
	}
}
</script>

<style>
#title-bar { 
	background-color: #333;
	background-repeat: repeat-x;
	font-size: 13px; 
	line-height: 40px; 
	color: #ccc;
	height: 40px;
	width: 100%;
	z-index: 9999;
	box-shadow: 0 -10px 10px -10px #000 inset;
}
#title { 
	font-size: 18px; 
	padding: 0 15px; 
	float: left; 
	height: 40px; 
	line-height: 39px; 
	border-right: 1px solid #141414; 
}
</style>