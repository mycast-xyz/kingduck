<script lang="ts">
	import type { PageData } from './$types';
	import '../app.css';
	import DesktopMainMenu from '../app/view/agent/desktop//MainMenu.svelte';
	import MobileMainMenu from '../app/view/agent/mobile/MainMenu.svelte';
	import Toast from '../app/view/toast/Toast.svelte';

	const { data, children } = $props<{ data: PageData; children: any }>();
</script>

<!-- 토스트 메시지 -->
<Toast />

<!-- 메인 메뉴 -->
{#if !data.isAuthPage}
	{#if data.isMobile}
		<MobileMainMenu {data} />
	{:else}
		<DesktopMainMenu {data} />
	{/if}
{/if}

<!-- 페이지 컨텐츠 -->
{@render children()}
