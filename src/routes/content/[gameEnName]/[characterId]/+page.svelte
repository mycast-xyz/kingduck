<script lang="ts">
	import type { PageData } from './$types';
	import DesktopView from '../../../../app/view/agent/desktop/ContentView.svelte';
	import MobileView from '../../../../app/view/agent/mobile/ContentView.svelte';
	import SeoHead from '../../../../app/view/SeoHead.svelte';

	export let data: PageData;
</script>

<SeoHead
	title={data.title}
	description={data.meta?.description}
	keywords={data.meta?.keywords}
	image={data.meta?.image}
	jsonLd={data.meta?.jsonLd}
/>

<article>
	{#if data.isMobile}
		<MobileView {data} gameInit={data.gameInit} />
	{:else}
		<DesktopView {data} gameInit={data.gameInit} />
	{/if}
</article>
