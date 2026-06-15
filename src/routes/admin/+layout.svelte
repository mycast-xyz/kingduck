<script lang="ts">
	import type { PageData } from './$types';
	import '../../app.css';
	import Toast from '../../app/view/toast/Toast.svelte';
	import AdminSideBarMenu from '../../app/view/menu/AdminSideBarMenu.svelte';
	import { onMount } from 'svelte';
	import { authTokenService } from '../../app/service/auth/AuthTokenService';
	import { goto } from '$app/navigation';
	import { toastStore } from '../../app/service/ToastService';

	const { data, children } = $props<{ data: PageData; children: any }>();

	// 클라이언트 가드는 UX/방어 보조용이며 실제 인가는 반드시 백엔드에서 검증한다.
	let authorized = $state(false);

	onMount(() => {
		if (!authTokenService.isAdmin) {
			toastStore.error('관리자 권한이 필요합니다.');
			goto('/');
		} else {
			authorized = true;
		}
	});
</script>

<!-- 토스트 메시지 -->
<Toast />

{#if authorized}
	<!-- 사이드바 -->
	<AdminSideBarMenu />

	<!-- 페이지 컨텐츠 -->
	{@render children()}
{/if}
