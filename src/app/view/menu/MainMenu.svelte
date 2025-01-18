<script lang="ts">
	import { mainMenuActive, navActive } from "$lib/stores/mainMenuStore";

	const toggleNav = () => {
		navActive.update(navActive => !navActive);
		if ($navActive === false) {
			mainMenuActive.set(80);
			console.log($mainMenuActive);
		} else {
			mainMenuActive.set(240);
			console.log($mainMenuActive);
		}
	};

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

<header
	class:active={$navActive}
	class=" fixed inset-y-0 left-0 z-50 flex h-full w-[{$mainMenuActive}px] flex-col items-center overflow-hidden rounded border-r border-r-gray-100 bg-white text-gray-700 shadow-md transition-all duration-75 ease-in-out dark:border-r-gray-800 dark:bg-gray-950"
>
	<!-- Logo area -->
	<a
		href="#top"
		id="menu-item"
		class="mt-3 flex w-full items-center px-4 pl-5"
		on:click={() => toggleNav()}
	>
		<img
			class="h-10 w-10 rounded-full fill-current"
			src="/assets/logo/500.png"
			alt="Your Company"
		/>
		<span
			class:active={$navActive}
			class="ml-2 text-sm font-bold transition-all delay-300 duration-200 ease-in-out"
			>King Duck</span
		>
	</a>
	<!-- Logo area -->
	<!-- Favorites area -->
	<div class="w-full px-2">
		<!-- 반복 area -->
		<div class="mt-3 flex w-full flex-col items-center border-t border-gray-300">
			{#each tmp_FavoritesMenuSet as favoritesItem}
				<a
					id="menu-item"
					class=" mt-2 flex h-12 w-full items-center rounded px-3 hover:bg-gray-300"
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
		<div class="mt-2 flex w-full flex-col items-center border-t border-gray-300">
			{#each tmp_MenuSet as item}
				<a
					id="menu-item"
					class=" mt-2 flex h-12 w-full items-center rounded px-3 hover:bg-gray-300"
					href={item.href}
				>
					<img class="h-10 w-10 rounded-full fill-current" src={item.image} alt="HonkaiStarRail" />
					<span
						class:active={navActive}
						class="ml-2 text-sm font-medium transition-all delay-300 duration-200 ease-in-out"
						>{item.title}</span
					>
				</a>
			{/each}
		</div>
	</div>
	<!--
	<a
		class="mt-auto flex h-16 w-full items-center justify-center bg-gray-200 hover:bg-gray-300"
		href="#"
	>
		<svg
			class="h-6 w-6 stroke-current"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
		<span class="ml-2 text-sm font-medium">Account</span>
	</a>
  -->
</header>

<style lang="scss">
	header {
		&.active {
			width: 240px;

			#menu-item {
				span {
					display: block;
					opacity: 1;
				}
			}
		}
		#menu-item {
			span {
				display: none;
				opacity: 0;
			}
		}
	}
</style>
