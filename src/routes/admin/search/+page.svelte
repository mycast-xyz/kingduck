<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { AdminSideMenuService } from '../../../app/service/AdminSiedMenuService';
	import { adminSearchService, type SearchResult } from '../../../app/service/AdminSearchService';
	import AdminHeadMenu from '../../../app/view/menu/AdminHeadMenu.svelte';

	// 사이드바 너비 기반 본문 마진 (다른 어드민 페이지와 동일 패턴)
	let sidebarStore = AdminSideMenuService.SidebarCollapsed;
	let isSidebarCollapsed = $derived($sidebarStore);
	let mainMargin = $derived(isSidebarCollapsed.collapsed ? 'ml-64' : 'ml-20');

	// 검색어 입력 상태 (URL ?q= 값으로 초기화)
	let q = $state($page.url.searchParams.get('q') ?? '');

	// 서비스 스토어 구독
	let result = $state<SearchResult | null>(null);
	let loading = $state(false);

	onMount(() => {
		const unsubResult = adminSearchService.result.subscribe((v) => {
			result = v;
		});
		const unsubLoading = adminSearchService.loading.subscribe((v) => {
			loading = v;
		});

		// 페이지 진입 시 URL에 q가 있으면 바로 검색
		const initialQ = $page.url.searchParams.get('q') ?? '';
		if (initialQ.length >= 2) {
			adminSearchService.search(initialQ);
		}

		return () => {
			unsubResult();
			unsubLoading();
		};
	});

	// URL ?q= 변경 감지 → 입력창 동기화 + 재검색 (사이드바 검색창에서 진입 시)
	$effect(() => {
		const urlQ = $page.url.searchParams.get('q') ?? '';
		if (urlQ !== q) {
			q = urlQ;
			if (urlQ.length >= 2) {
				adminSearchService.search(urlQ);
			} else {
				adminSearchService.clear();
			}
		}
	});

	function handleSearch() {
		const trimmed = q.trim();
		goto(`/admin/search?q=${encodeURIComponent(trimmed)}`, { replaceState: true });
		if (trimmed.length >= 2) {
			adminSearchService.search(trimmed);
		} else {
			adminSearchService.clear();
		}
	}

	function totalCount(r: SearchResult | null): number {
		if (!r) return 0;
		return (
			r.characters.length +
			r.items.length +
			r.events.length +
			r.redeemGroups.length +
			r.notices.length +
			r.faqs.length
		);
	}
</script>

<main class="{mainMargin} min-h-screen flex-1 bg-gray-100 p-8">
	<AdminHeadMenu
		title="전역 검색"
		infoText="캐릭터·아이템·이벤트·쿠폰·공지·FAQ를 통합 검색합니다."
	/>

	<!-- 검색창 -->
	<div class="mb-6 flex gap-3">
		<div class="relative flex-1">
			<i class="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
			<input
				type="text"
				bind:value={q}
				onkeydown={(e) => e.key === 'Enter' && handleSearch()}
				class="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:border-orange-400 focus:outline-none"
				placeholder="2자 이상 입력 후 Enter"
			/>
		</div>
		<button
			onclick={handleSearch}
			class="rounded-lg bg-orange-500 px-6 py-2 font-medium text-white hover:bg-orange-600"
		>
			검색
		</button>
	</div>

	<!-- 결과 영역 -->
	{#if loading}
		<div class="flex items-center justify-center py-16 text-gray-400">
			<i class="ri-loader-4-line mr-2 animate-spin text-xl"></i>
			검색 중...
		</div>
	{:else if q.length < 2}
		<div class="py-16 text-center text-gray-400">
			<i class="ri-search-2-line mb-3 block text-4xl"></i>
			2자 이상 입력하세요.
		</div>
	{:else if result !== null && totalCount(result) === 0}
		<div class="py-16 text-center text-gray-400">
			<i class="ri-file-search-line mb-3 block text-4xl"></i>
			검색 결과 없음
		</div>
	{:else if result}
		<!-- 캐릭터 -->
		{#if result.characters.length > 0}
			<section class="mb-6 rounded-xl bg-white p-6 shadow-sm">
				<h2 class="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
					<i class="ri-user-star-line"></i>
					캐릭터
					<span class="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600"
						>{result.characters.length}</span
					>
				</h2>
				<ul class="divide-y divide-gray-50">
					{#each result.characters as item}
						<li class="flex items-center justify-between py-2">
							<span class="text-sm text-gray-800">{item.name}</span>
							<div class="flex items-center gap-4">
								<span class="text-xs text-gray-400">{item.gameId}</span>
								<a href="/admin/character" class="text-xs text-orange-500 hover:underline"
									>관리 페이지</a
								>
							</div>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<!-- 아이템 -->
		{#if result.items.length > 0}
			<section class="mb-6 rounded-xl bg-white p-6 shadow-sm">
				<h2 class="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
					<i class="ri-sword-line"></i>
					아이템
					<span class="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600"
						>{result.items.length}</span
					>
				</h2>
				<ul class="divide-y divide-gray-50">
					{#each result.items as item}
						<li class="flex items-center justify-between py-2">
							<div>
								<span class="text-sm text-gray-800">{item.name}</span>
								<span class="ml-2 text-xs text-gray-400">[{item.type}]</span>
							</div>
							<div class="flex items-center gap-4">
								<span class="text-xs text-gray-400">{item.gameId}</span>
								<a href="/admin/item" class="text-xs text-orange-500 hover:underline">관리 페이지</a>
							</div>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<!-- 이벤트 -->
		{#if result.events.length > 0}
			<section class="mb-6 rounded-xl bg-white p-6 shadow-sm">
				<h2 class="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
					<i class="ri-calendar-event-line"></i>
					이벤트
					<span class="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600"
						>{result.events.length}</span
					>
				</h2>
				<ul class="divide-y divide-gray-50">
					{#each result.events as item}
						<li class="flex items-center justify-between py-2">
							<span class="text-sm text-gray-800">{item.title}</span>
							<div class="flex items-center gap-4">
								<span class="text-xs text-gray-400">{item.gameId}</span>
								<a href="/admin/event" class="text-xs text-orange-500 hover:underline">관리 페이지</a>
							</div>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<!-- 쿠폰 -->
		{#if result.redeemGroups.length > 0}
			<section class="mb-6 rounded-xl bg-white p-6 shadow-sm">
				<h2 class="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
					<i class="ri-coupon-line"></i>
					쿠폰
					<span class="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600"
						>{result.redeemGroups.length}</span
					>
				</h2>
				<ul class="divide-y divide-gray-50">
					{#each result.redeemGroups as item}
						<li class="flex items-center justify-between py-2">
							<span class="text-sm text-gray-800">{item.title}</span>
							<div class="flex items-center gap-4">
								<span class="text-xs text-gray-400">{item.gameId}</span>
								<a href="/admin/redeem" class="text-xs text-orange-500 hover:underline"
									>관리 페이지</a
								>
							</div>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<!-- 공지사항 -->
		{#if result.notices.length > 0}
			<section class="mb-6 rounded-xl bg-white p-6 shadow-sm">
				<h2 class="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
					<i class="ri-notification-3-line"></i>
					공지사항
					<span class="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600"
						>{result.notices.length}</span
					>
				</h2>
				<ul class="divide-y divide-gray-50">
					{#each result.notices as item}
						<li class="flex items-center justify-between py-2">
							<span class="text-sm text-gray-800">{item.title}</span>
							<a href="/admin/notice" class="text-xs text-orange-500 hover:underline">관리 페이지</a>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<!-- FAQ -->
		{#if result.faqs.length > 0}
			<section class="mb-6 rounded-xl bg-white p-6 shadow-sm">
				<h2 class="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
					<i class="ri-question-answer-line"></i>
					FAQ
					<span class="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600"
						>{result.faqs.length}</span
					>
				</h2>
				<ul class="divide-y divide-gray-50">
					{#each result.faqs as item}
						<li class="flex items-center justify-between py-2">
							<span class="text-sm text-gray-800">{item.question}</span>
							<a href="/admin/faq" class="text-xs text-orange-500 hover:underline">관리 페이지</a>
						</li>
					{/each}
				</ul>
			</section>
		{/if}
	{/if}
</main>
