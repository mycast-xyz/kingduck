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

	onMount(() => {
		if (!authTokenService.isAdmin) {
			toastStore.error('관리자 권한이 필요합니다.');
			goto('/');
		}
	});
</script>

<!-- 토스트 메시지 -->
<Toast />
<!-- 사이드바 -->
<AdminSideBarMenu />

<!-- 페이지 컨텐츠 -->
{@render children()}
