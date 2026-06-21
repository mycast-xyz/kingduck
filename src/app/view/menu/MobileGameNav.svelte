<script lang="ts">
	import { page } from '$app/stores';
	import { hasItemTabs } from '../../model/game/itemTabs';

	// 모바일 게임별 서브 네비게이션 — 데스크톱 DesktopListMenu의 페이지 탭(캐릭터/아이템/티어/쿠폰/캘린더)을
	// 모바일에서도 쓸 수 있게 가로 탭바로 제공. /list /item /tier-list /coupon /calendar 의 [slug] 라우트 공용.
	const slug = $derived($page.params.slug ?? '');
	const path = $derived($page.url.pathname);

	const tabs = $derived([
		{ label: '캐릭터', icon: 'ri-user-line', href: `/list/${slug}`, match: '/list/' },
		...(hasItemTabs(slug)
			? [{ label: '아이템', icon: 'ri-sword-line', href: `/item/${slug}`, match: '/item/' }]
			: []),
		{
			label: '티어',
			icon: 'ri-vip-crown-2-line',
			href: `/tier-list/${slug}`,
			match: '/tier-list/'
		},
		{ label: '쿠폰', icon: 'ri-coupon-line', href: `/coupon/${slug}`, match: '/coupon/' },
		{ label: '캘린더', icon: 'ri-calendar-line', href: `/calendar/${slug}`, match: '/calendar/' }
	]);
</script>

<nav
	class="sticky top-16 z-30 flex gap-1 overflow-x-auto border-b border-gray-200 bg-white px-2 py-1.5 dark:border-gray-700 dark:bg-gray-900"
>
	{#each tabs as t}
		<a
			href={t.href}
			class="flex shrink-0 flex-col items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors {path.startsWith(
				t.match
			)
				? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30'
				: 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}"
		>
			<i class="{t.icon} text-lg"></i>
			<span class="mt-0.5">{t.label}</span>
		</a>
	{/each}
</nav>
