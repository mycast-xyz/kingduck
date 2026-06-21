<script lang="ts">
	import { WindowService } from '../../../service/WindowService';
	import { FavoriteService } from '../../../service/FavoriteService';

	type GameItem = { slug: string; iconUrl: string; name: string };
	type MainMenuData = {
		info: GameItem[];
		url: string;
	};

	const { data } = $props<{ data: MainMenuData }>();

	let navActive = $state(false);
	const toggleNav = () => {
		navActive = !navActive;
		WindowService.closeModal();
	};

	// 즐겨찾기: 상단 고정 게임. 게임 수가 늘어 메뉴가 길어질 때 자주 보는 게임을 위로 올린다.
	const favorites = FavoriteService.favorites;
	const gameList = $derived<GameItem[]>(Array.isArray(data?.info) ? data.info : []);
	const favoriteGames = $derived(gameList.filter((g) => $favorites.includes(g.slug)));
	const otherGames = $derived(gameList.filter((g) => !$favorites.includes(g.slug)));
</script>

<header class="" class:active={navActive}>
	<div
		class="shadow-m fixed inset-y-0 left-0 z-50 flex h-16 w-screen flex-wrap items-center justify-between border-b border-gray-200 bg-white p-3"
	>
		<a href="/">
			<img
				class="h-10 w-10 rounded-full fill-current"
				src="/assets/logo/500.png"
				alt="Your Company"
			/>
		</a>
		<div class="flex">
			<button id="hamburger" onclick={toggleNav} aria-label="메뉴 열기">
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
				<!-- 즐겨찾기 고정 게임 (상단) -->
				{#if favoriteGames.length}
					{#each favoriteGames as gameItem (gameItem.slug)}
						{@render gameRow(gameItem)}
					{/each}
					<div class="my-1 w-full border-t border-gray-200"></div>
				{/if}
				<!-- 나머지 게임 -->
				{#each otherGames as gameItem (gameItem.slug)}
					{@render gameRow(gameItem)}
				{/each}
			</div>
			<!-- 반복 area
			<div class="mt-2 flex w-full flex-col items-center border-t border-gray-300 pb-5">
				{#each tmp_MenuSet as item}
					<a
						data-sveltekit-preload-data="false"
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
			</div> -->
		</div>
	</div>
</header>

{#snippet gameRow(gameItem: GameItem)}
	<div class="flex w-full items-center">
		<a
			id="menu-item"
			class="mt-2 flex h-12 flex-1 items-center rounded px-1 hover:bg-gray-300"
			href="/list/{gameItem.slug}"
			onclick={() => {
				toggleNav();
			}}
		>
			<img
				class="h-10 w-10 rounded-full fill-current"
				src={data.url + '/' + gameItem.iconUrl}
				alt={gameItem.name}
			/>
			<span class="ml-2 text-sm font-medium transition-all delay-300 duration-200 ease-in-out"
				>{gameItem.name}</span
			>
		</a>
		<!-- 즐겨찾기 토글 -->
		<button
			type="button"
			aria-label={$favorites.includes(gameItem.slug) ? '즐겨찾기 해제' : '즐겨찾기 추가'}
			class="mt-2 flex h-12 w-12 items-center justify-center text-lg"
			onclick={() => FavoriteService.toggle(gameItem.slug)}
		>
			<i
				class={$favorites.includes(gameItem.slug)
					? 'ri-star-fill text-yellow-400'
					: 'ri-star-line text-gray-400'}
			></i>
		</button>
	</div>
{/snippet}

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
