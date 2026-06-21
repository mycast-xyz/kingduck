<script lang="ts">
	// 전체 게임 플라이아웃 패널. 좁은 레일 우측으로 펼쳐지는 가로 그리드.
	// 게임 수가 늘어도 세로가 아니라 열 수로 흡수해 레일을 밀지 않는다.
	import { FavoriteService } from '../../../service/FavoriteService';

	type GameItem = { slug: string; iconUrl: string; name: string };

	const { games, url, activeSlug, onClose } = $props<{
		games: GameItem[];
		url: string;
		activeSlug?: string;
		onClose: () => void;
	}>();

	const favorites = FavoriteService.favorites;

	// 패널 내 검색: 게임 수가 늘어도 이름으로 바로 찾는다.
	let query = $state('');
	const filtered = $derived(
		query.trim()
			? games.filter((g: GameItem) => g.name.toLowerCase().includes(query.trim().toLowerCase()))
			: games
	);

	// 패널이 열리면 검색창에 포커스(바로 타이핑 가능).
	function autofocus(node: HTMLInputElement) {
		node.focus();
	}
</script>

<div
	class="max-h-[80vh] w-[360px] max-w-[70vw] overflow-y-auto rounded-lg border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
	role="menu"
	aria-label="전체 게임"
>
	<div class="border-b border-gray-100 px-3 py-2 dark:border-gray-700">
		<div class="mb-2 px-1 text-sm font-bold text-gray-700 dark:text-white">전체 게임</div>
		<div class="relative">
			<i
				class="ri-search-line pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
			></i>
			<input
				type="text"
				bind:value={query}
				placeholder="게임 검색"
				aria-label="게임 검색"
				class="w-full rounded-md border border-gray-200 bg-gray-50 py-1.5 pl-7 pr-2 text-sm text-gray-700 focus:border-orange-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
				use:autofocus
			/>
		</div>
	</div>
	<div class="grid grid-cols-3 gap-1 p-2">
		{#each filtered as game (game.slug)}
			<div class="group relative">
				<a
					data-sveltekit-preload-data="false"
					href="/list/{game.slug}"
					role="menuitem"
					class="flex flex-col items-center gap-1 rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800 {activeSlug ===
					game.slug
						? 'bg-gray-100 dark:bg-gray-800'
						: ''}"
					onclick={onClose}
				>
					<img
						class="outline-3 h-12 w-12 rounded-full fill-current outline outline-offset-0 outline-gray-200 dark:outline-gray-600"
						src={url + '/' + game.iconUrl}
						alt={game.name}
					/>
					<span class="line-clamp-1 w-full text-center text-xs font-medium">{game.name}</span>
				</a>

				<!-- 즐겨찾기 토글 (호버 시 노출) -->
				<button
					type="button"
					aria-label={$favorites.includes(game.slug) ? '즐겨찾기 해제' : '즐겨찾기 추가'}
					class="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs opacity-0 shadow transition-opacity duration-150 group-hover:opacity-100 dark:bg-gray-800"
					onclick={() => FavoriteService.toggle(game.slug)}
				>
					<i
						class={$favorites.includes(game.slug)
							? 'ri-star-fill text-yellow-400'
							: 'ri-star-line text-gray-400'}
					></i>
				</button>
			</div>
		{/each}
		{#if filtered.length === 0}
			<div class="col-span-3 py-6 text-center text-sm text-gray-500">검색 결과가 없습니다.</div>
		{/if}
	</div>
</div>
