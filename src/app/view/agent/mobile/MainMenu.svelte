<script lang="ts">
	import { mainMenuActive, navActive } from '$lib/stores/mainMenuStore';

	const toggleNav = () => {
		console.log('toggleNav');

		navActive.update((navActive) => !navActive);
		if ($navActive === false) {
			console.log($mainMenuActive);
		} else {
			console.log($mainMenuActive);
		}
	};

	console.log('mobile');

	const tmp_FavoritesMenuSet: any = [
		{
			title: '붕괴 스타레일',
			href: '/list/HonkaiStarRail',
			image: '/assets/game/HonkaiStarRail.webp'
		},
		{
			title: '우마무스메',
			href: '/list/Umamusume',
			image: '/assets/game/Umamusume.webp'
		},
		{
			title: '승리의 여신 니케',
			href: '/list/NIKKE',
			image: '/assets/game/NIKKE.webp'
		}
	];

	const tmp_MenuSet: any = [
		{
			title: '블루아카이브',
			href: '/list/BlueArchive',
			image: '/assets/game/BlueArchive.webp'
		},
		{
			title: '원신',
			href: '/list/GenshinImpact',
			image: '/assets/game/GenshinImpact.webp'
		},
		{
			title: '명조',
			href: '/list/WutheringWaves',
			image: '/assets/game/WutheringWaves.webp'
		},
		{
			title: '젠존스제로',
			href: '/list/zzz',
			image: '/assets/game/zzz.webp'
		}
	];
</script>

<header class="" class:active={$navActive}>
	<div
		class="fixed inset-y-0 left-0 z-50 flex h-16 w-screen flex-wrap items-center justify-between bg-white p-3"
	>
		<img
			class="h-10 w-10 rounded-full fill-current"
			src="/assets/logo/500.png"
			alt="Your Company"
		/>
		<div class="flex">
			<button id="hamburger" onclick={toggleNav}>
				<i class="ri-menu-line h-10 w-10 text-2xl"></i>
			</button>
		</div>
	</div>
	<div
		class="toggle text-bold fixed inset-y-0 left-0 top-16 z-50 hidden h-full w-full bg-white text-right"
	>
		<div class="w-full px-2">
			<!-- 반복 area -->
			<div class=" flex w-full flex-col items-center border-t border-gray-300">
				{#each tmp_FavoritesMenuSet as favoritesItem}
					<a
						id="menu-item"
						class=" mt-2 flex h-12 w-full items-center rounded px-1 hover:bg-gray-300"
						href={favoritesItem.href}
					>
						<img
							class="h-10 w-10 rounded-full fill-current"
							src={favoritesItem.image}
							alt="HonkaiStarRail"
						/>
						<span
							class:active={navActive}
							class="ml-2 text-sm font-medium transition-all delay-300 duration-200 ease-in-out"
							>{favoritesItem.title}</span
						>
					</a>
				{/each}
			</div>
			<!-- 반복 area -->
			<div class="mt-2 flex w-full flex-col items-center border-t border-gray-300 pb-5">
				{#each tmp_MenuSet as item}
					<a
						id="menu-item"
						class=" mt-2 flex h-12 w-full items-center rounded px-1 hover:bg-gray-300"
						href={item.href}
					>
						<img
							class="h-10 w-10 rounded-full fill-current"
							src={item.image}
							alt="HonkaiStarRail"
						/>
						<span
							class:active={navActive}
							class="ml-2 text-sm font-medium transition-all delay-300 duration-200 ease-in-out"
							>{item.title}</span
						>
					</a>
				{/each}
			</div>
		</div>
	</div>
</header>

<style lang="scss">
	header {
		&.active {
			.toggle {
				display: block;
				opacity: 1;
			}
		}
		.toggle {
			display: none;
			opacity: 0;
		}
	}
</style>
