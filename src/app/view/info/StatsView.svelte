<script lang="ts">
	import Layer from '../../view-framework/content/ContentLayer.svelte';
	import { HsrStatsViewModel } from '../../service/game/starrail/HsrStatsViewModel.svelte';
	import { WwStatsViewModel } from '../../service/game/wutheringwaves/WwStatsViewModel.svelte';
	import { EndfieldStatsViewModel } from '../../service/game/endfield/EndfieldStatsViewModel.svelte';
	import { Reverse1999StatsViewModel } from '../../service/game/reverse1999/Reverse1999StatsViewModel.svelte';
	import { getCardBgStyle } from '../../util/StyleUtils';

	const { listData, currentUrl, isMobile, initData, gameId, title } = $props<{
		listData: any;
		currentUrl: string;
		isMobile: boolean;
		initData: any;
		gameId: string;
		title?: string;
	}>();
	// 데이터 판별
	// ViewModel 타입 정의 (간략화)
	interface StatsVM {
		stats: any[];
		currentLevel: number;
		levels: number[];
		[key: string]: any;
	}

	// ViewModel 통합 관리
	const vm = $derived.by<StatsVM | null>(() => {
		const gId = initData?.gameId || gameId;
		const isHsr = gId === 'HonkaiStarRail' || gId === 2 || gId === '2';
		const isWw = gId === 'WutheringWaves' || gId === '8' || gId === 8;
		const isEndfield = gId === 'endfield' || gId === 3 || gId === '13'; // 13 from API
		const isReverse1999 = gId === 'Reverse1999' || gId === '6' || gId === 6;

		if (isHsr && listData && (listData['0'] || listData[0])) {
			return new HsrStatsViewModel(listData, String(gId));
		}
		if (isWw && listData && typeof listData === 'object') {
			return new WwStatsViewModel(listData, String(gId), currentUrl);
		}
		if (isEndfield && listData) {
			return new EndfieldStatsViewModel(listData, String(gId), currentUrl);
		}
		if (isReverse1999 && listData) {
			return new Reverse1999StatsViewModel(listData, String(gId), currentUrl);
		}
		return null;
	});

	// 일반 데이터 처리 (공통 VM이 없을 경우)

	// 일반 데이터 처리 (HSR이 아닐 경우)
	let genericStats = $derived.by(() => {
		if (vm) return [];

		if (Array.isArray(listData)) return listData;
		if (!listData) return [];

		const order = ['HP', 'Attack', 'Defense', 'Speed', 'Taunt'];
		const labels: Record<string, string> = {
			HP: 'HP',
			Attack: '공격력',
			Defense: '방어력',
			Speed: '속도',
			Taunt: '도발'
		};
		const icons: Record<string, string> = {
			HP: 'icon/hp.webp',
			Attack: 'icon/attack.webp',
			Defense: 'icon/defense.webp',
			Speed: 'icon/speed.webp',
			Taunt: 'icon/taunt.webp'
		};

		return order
			.map((key) => {
				if (listData[key] !== undefined) {
					return {
						key,
						name: labels[key] || key,
						value: Math.floor(listData[key]).toLocaleString(),
						icon: icons[key]
					};
				}
				return null;
			})
			.filter((item) => item !== null);
	});

	// 최종 표시할 스탯 목록
	let displayStats = $derived.by(() => {
		return vm ? vm.stats : genericStats;
	});
</script>

<Layer title={title || initData?.name || '기초 속성'}>
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		<div class="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 md:col-span-2">
			{#each displayStats as stat}
				<div
					class="flex items-center p-3 bg-gray-50 dark:bg-[#1d1e2e] rounded-lg border border-gray-100 dark:border-gray-700/50"
				>
					<div
						class="flex items-center justify-center w-10 h-10 bg-gray-400 dark:bg-gray-700/50 rounded-full mr-3 shrink-0"
					>
						{#if stat.icon}
							<img
								src={stat.icon}
								alt={stat.name}
								class="w-6 h-6 object-contain opacity-70"
								onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
							/>
						{:else}
							<span class="text-[10px] font-bold text-gray-500 dark:text-gray-400"
								>{(stat.key || '').substring(0, 3).toUpperCase()}</span
							>
						{/if}
					</div>
					<div class="flex flex-col">
						<span class="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{stat.name}</span>
						<span class="text-base font-bold text-gray-900 dark:text-gray-100">{stat.value}</span>
					</div>
				</div>
			{/each}
			{#if displayStats.length === 0}
				<div class="col-span-full text-center text-gray-500 py-4">데이터가 없습니다.</div>
			{/if}
		</div>
		<div class="px-4">
			<!-- 승급 재료 표시 (HSR 전용 - VM 속성으로 판단) -->
			{#if vm && 'costList' in vm && vm.costList?.length > 0}
				<div class="py-2">
					<h4 class="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 ml-1">승급 재료</h4>
					<div class="flex flex-wrap gap-3">
						{#await vm.costPromise}
							<div class="text-xs text-gray-400">Loading...</div>
						{:then items}
							{#each items as item}
								<div
									class="flex flex-col items-center min-w-[40px]"
									title={item.info?.name || 'Unknown'}
								>
									<div
										class="relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-1 bg-gray-200 dark:bg-gray-600 overflow-hidden border border-gray-200 dark:border-gray-700"
									>
										{#if item.info?.imageUrl}
											<img
												src="{currentUrl}/{item.info.imageUrl}"
												alt={item.info.name}
												class="w-[75%] h-[75%] object-cover"
												onerror={(e) =>
													((e.currentTarget as HTMLImageElement).style.display = 'none')}
											/>
										{:else}
											<span class="text-[10px] text-gray-400">?</span>
										{/if}
									</div>
									<span class="text-[12px] font-semibold text-gray-600 dark:text-gray-300"
										>x{(item.ItemNum ?? item.Value)?.toLocaleString()}</span
									>
								</div>
							{/each}
						{/await}
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- 하단 컨트롤 영역 (레벨 슬라이더 등) -->
	{#if vm && vm.levels}
		<div class="px-4 pt-5 pb-2 border-t border-gray-200 dark:border-gray-600/50">
			<!-- 기본/HSR/WW 공통 스타일 슬라이더 (Discrete steps) -->
			<div class="relative w-full h-8 flex items-center mb-6">
				<div class="absolute w-full h-1 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
				<input
					type="range"
					min="0"
					max={vm.levels.length - 1}
					step="1"
					value={vm.levels.indexOf(vm.currentLevel)}
					oninput={(e) => (vm.currentLevel = vm.levels[parseInt(e.currentTarget.value)])}
					class="absolute w-full h-full opacity-0 cursor-pointer z-10"
				/>
				{#each vm.levels as level, i}
					{@const percent = (i / (vm.levels.length - 1)) * 100}
					<div
						class="absolute flex flex-col items-center transform -translate-x-1/2"
						style="left: {percent}%;"
					>
						<div
							class="w-3 h-3 rounded-full transition-colors duration-200
                                {vm.currentLevel === level
								? 'bg-orange-500 scale-125'
								: 'bg-gray-400 dark:bg-gray-600'}"
						></div>
						<span
							class="mt-2 text-sm font-medium {vm.currentLevel === level
								? 'text-orange-500'
								: 'text-gray-400 dark:text-gray-500'}"
						>
							{level}
						</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</Layer>
