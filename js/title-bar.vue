<template>
	<div id="title-bar">
		<div id="title">{{appName}}</div>
		<dropdown-menu v-for="item in menu" :item="item"></dropdown-menu>
	</div>
</template>

<script>
import DropdownMenu from './dropdown-menu.vue';

export default {
	name: 'title-bar',
	props: ['appName'],
	components: {
		dropdownMenu: DropdownMenu
	},
	data() {
		return {
			menu: [
				{
					title: 'File',
					submenu: [
						{ title: 'phpinfo()' },
						{ title: 'Remote Import...' },
						{ title: 'Download...' }
					]
				},
				{
					title: 'Options',
					submenu: [
						{ title: 'Colorize' },
						{ title: 'External Window' },
						{ title: '<pre> Wrap' },
					]
				},
				{
					title: 'Themes',
					submenu: []
				}
			]
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