<template>
	<div @mouseenter="shown = true" @mouseleave="shown = false" class="drop">
		<span>{{item.title}}</span>
		<transition name="slide-fade">
			<div v-show="shown">
				<div v-for="subitem in item.submenu" class="clickable"><a href="#">{{subitem.title}}</a></div>
			</div>
		</transition>
	</div>
</template>

<script>
export default {
	name: 'dropdown-menu',
	props: ['item'],
	data() {
		return {
			shown: false
		}
	}
}
</script>

<style>
.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .3s ease;
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active for <2.1.8 */ {
  transform: translateX(20px);
  opacity: 0;
}
</style>