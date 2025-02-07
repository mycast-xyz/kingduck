<script lang="ts">
	import type { PageData } from './$types';
	import DesktopView from '../../../../app/view/agent/desktop/ContentView.svelte';
	import MobileView from '../../../../app/view/agent/mobile/ContentView.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta name="description" content={data.meta.description} />
	<meta name="keywords" content={data.meta.keywords} />
</svelte:head>

<article>
	{#if data.isMobile}
		<MobileView {data} />
	{:else}
		<DesktopView {data} />
	{/if}
</article>
