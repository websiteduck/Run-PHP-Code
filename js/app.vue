<template>
	<div id="app">
		<title-bar app-name="Run PHP Code"></title-bar>
	</div>
</template>

<script>
import TitleBar from './title-bar.vue'

export default {
	name: 'app',
	data () {
		return {}
	},
	components: {
		titleBar: TitleBar
	}
}
</script>

<style>
</style>