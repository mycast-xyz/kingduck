<script lang="ts">
	import { goto } from '$app/navigation';

	// props에서 데이터 가져오기
	let {
		data,
		games = [],
		selectedGames = $bindable([])
	} = $props<{
		data: any;
		games?: any[];
		selectedGames?: string[];
	}>();

	// Toggle Game Filter
	function toggleGame(gameId: string) {
		if (selectedGames.includes(gameId)) {
			selectedGames = selectedGames.filter((id: string) => id !== gameId);
		} else {
			selectedGames = [...selectedGames, gameId];
		}
	}

	console.log('calendar info:', games);
</script>

<div class="list-menu flex h-full p-4 pr-2">
	<div
		class="mt-12 w-80 flex-col items-center rounded border border-gray-100 bg-white text-gray-700 shadow-md dark:border-gray-700 dark:bg-gray-900 dark:text-white"
	>
		<div
			class="gmae-title my-2 h-auto w-full p-4 mb-0 border-b border-gray-100 dark:border-gray-700"
		>
			<div class="gmae-logo-img">
				<img
					src="/assets/logo/weather-500.webp"
					class="-mt-20 w-28 rounded-full border border-gray-100 shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
					alt="가챠 예보"
				/>
			</div>
			<h3 class="pb-3 pt-2 text-2xl font-bold tracking-tight text-gray-700 dark:text-white">
				가챠 예보
			</h3>
			<p class="text-md font-medium text-gray-500 dark:text-gray-400">
				픽뚫 태풍이 상륙 중입니다.<br />당신의 천장은 안전합니까?
			</p>
		</div>
		<div
			id="list-menu-content"
			class="flex h-[calc(100%-85px)] w-full flex-col items-center overflow-y-auto overflow-x-hidden"
		>
			<!-- 페이지 기능 -->
			<!-- 페이지 기능 -->
			<div class=" my-4 mt-1 flex w-full flex-col items-center p-4 pb-2 pt-0">
				<h3 class="w-full py-3 pb-4 pl-1 text-lg font-bold text-gray-700 dark:text-white">
					게임리스트
				</h3>

				<div class="flex flex-col w-full gap-2">
					{#each games as game}
						<button
							class="flex w-full items-center mb-2 gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                {selectedGames.includes(game.id)
								? `${game.color} text-white shadow-md`
								: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200'}"
							onclick={() => toggleGame(game.id)}
						>
							<div class="flex items-center gap-2">
								<img
									src={data.url + '/' + game.icon}
									alt={game.name}
									class="outline-3 h-10 w-10 rounded-full fill-current outline outline-offset-0 outline-gray-200"
								/>
							</div>
							<h3 class="text-sm font-bold">{game.name}</h3>

							<div class="ml-auto">
								{#if selectedGames.includes(game.id)}
									<i class="ml-auto ri-check-line"></i>
								{/if}
								<span
									role="button"
									tabindex="0"
									aria-label="{game.name} 이벤트 및 가챠 정보"
									onclick={(e) => {
										e.stopPropagation();
										goto(`/calendar/${game.id}`);
									}}
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.stopPropagation();
											goto(`/calendar/${game.id}`);
										}
									}}
									class="border-l pl-3 cursor-pointer"
								>
									<i class="ri-external-link-line"></i>
								</span>
							</div>
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	button {
		&.active {
			background: #f9822c;
			color: #ffffff !important;
			border-color: #f9822c;
			i {
				color: #ffffff !important;
			}
			img {
				filter: brightness(0) invert(1) !important;
			}
		}
		.text-Rating-5 {
			color: #fcba49;
		}
		.text-Rating-4 {
			color: #9f66c8;
		}
		.text-Rating-3 {
			color: #4175bb;
		}
	}
</style>
