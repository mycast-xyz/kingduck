<script lang="ts">
	import { mainMenuActive } from '$lib/stores/mainMenuStore';
	import type { PageData } from '../$types';
	// import MainMenu from '../../app/view/menu/MainMenu.svelte';

	let { data }: { data: PageData } = $props();
	
	const mainViewActive: any = {
		80: 'w-[calc(100%-80px)] ml-[80px]',
		240: 'w-[calc(100%-240px)] ml-[240px]'
	};
</script>

<div
	class="h-screen w-screen min-w-[1700px] overflow-hidden overflow-x-hidden bg-gray-100 dark:bg-gray-800"
>
	<!-- Left nav-->
	<!-- <MainMenu bind:MainMenuActive /> -->
	<!-- Content -->
	<article
		id="info-componet"
		class="{mainViewActive[$mainMenuActive]} my-0 mr-0 flex h-full overflow-hidden"
	></article>
</div>

<style>
	#info-image-card {
		background: rgb(0, 0, 0);
		background: -moz-linear-gradient(0deg, rgba(0, 0, 0, 0.75) 75%, rgba(0, 0, 0, 0) 100%);
		background: -webkit-linear-gradient(0deg, rgba(0, 0, 0, 0.75) 75%, rgba(0, 0, 0, 0) 100%);
		background: linear-gradient(0deg, rgba(0, 0, 0, 0.75) 75%, rgba(0, 0, 0, 0) 100%);
		filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#000000",endColorstr="#000000",GradientType=1);
	}
</style>
