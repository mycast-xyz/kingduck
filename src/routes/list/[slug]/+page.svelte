<script lang="ts">
	import type { PageData } from './$types';
	import DesktopView from '../../../app/view/agent/desktop/ListView.svelte';
	import MobileView from '../../../app/view/agent/mobile/ListView.svelte';

	export let data: PageData;
</script>

<article>
	{#if data.isMobile}
		<MobileView {data} />
	{:else}
		<DesktopView {data} />
	{/if}
</article>
