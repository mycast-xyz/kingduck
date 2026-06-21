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
</script>

<div
	class="max-h-[80vh] w-[360px] max-w-[70vw] overflow-y-auto rounded-lg border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
	role="menu"
	aria-label="전체 게임"
>
	<div
		class="border-b border-gray-100 px-4 py-3 text-sm font-bold text-gray-700 dark:border-gray-700 dark:text-white"
	>
		전체 게임
	</div>
	<div class="grid grid-cols-3 gap-1 p-2">
		{#each games as game (game.slug)}
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
	</div>
</div>
