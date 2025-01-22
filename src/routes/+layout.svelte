<script lang="ts">
	import type { PageData } from './$types';
	import '../app.css';
	import DesktopMainMenu from '../app/view/agent/desktop//MainMenu.svelte';
	import MobileMainMenu from '../app/view/agent/mobile/MainMenu.svelte';

	const { data, children } = $props<{ data: PageData; children: any }>();
</script>

{#if data.isMobile}
	<MobileMainMenu {data} />
{:else}
	<DesktopMainMenu {data} />
{/if}

{@render children()}
