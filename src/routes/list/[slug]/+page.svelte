<script lang="ts">
	import type { PageData } from './$types';
	import DesktopView from '../../../app/view/agent/desktop/ListView.svelte';
	import MobileView from '../../../app/view/agent/mobile/ListView.svelte';
	import SeoHead from '../../../app/view/SeoHead.svelte';

	export let data: PageData;
</script>

<SeoHead title={data.title} description={data.meta?.description} keywords={data.meta?.keywords} />

<article>
	{#if data.isMobile}
		<MobileView {data} />
	{:else}
		<DesktopView {data} />
	{/if}
</article>
