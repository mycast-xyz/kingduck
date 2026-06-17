<script lang="ts">
	import Layer from '../../view-framework/content/ContentLayer.svelte';
	import { hsrItemService } from '../../service/game/starrail/HsrItemService';
	import { sanitizeHtml } from '../../util/sanitize';
	import type { ViewInitData } from '../../model/game/ViewInitData';

	const { listData, currentUrl, isMobile, gameId, initData, title } = $props<{
		listData: any;
		currentUrl: string;
		isMobile: boolean;
		gameId?: number;
		initData: ViewInitData;
		title?: string;
	}>();

	const propertyMap: Record<string, string> = {
		HealRatioBase: '치유량 보너스',
		SpeedDelta: '속도',
		HPAddedRatio: 'HP%',
		AttackAddedRatio: '공격력%',
		DefenseAddedRatio: '방어력%',
		CriticalDamageBase: '치명타 피해',
		CriticalChanceBase: '치명타 확률',
		StatusProbabilityBase: '효과 명중',
		StatusResistanceBase: '효과 저항',
		BreakDamageAddedRatioBase: '격파 특수효과',
		SPRatioBase: '에너지 회복효율',
		PhysicalAddedRatio: '물리 속성 피해증가',
		FireAddedRatio: '화염 속성 피해증가',
		IceAddedRatio: '얼음 속성 피해증가',
		ThunderAddedRatio: '번개 속성 피해증가',
		WindAddedRatio: '바람 속성 피해증가',
		QuantumAddedRatio: '양자 속성 피해증가',
		ImaginaryAddedRatio: '허수 속성 피해증가'
	};

	let relicMap = $state<Record<number, any>>({});

	$effect(() => {
		if (isHsrData && gameId) {
			const ids = [...(listData?.Set4IDList || []), ...(listData?.Set2IDList || [])];
			ids.forEach(async (id) => {
				if (!relicMap[id]) {
					try {
						const res = await hsrItemService.getItem(id, gameId.toString());
						if (res?.data?.length > 0) {
							relicMap[id] = res.data[0];
						}
					} catch (e) {
						console.error('Failed to fetch relic info', id, e);
					}
				}
			});
		}
	});

	function formatProperty(prop: string): string {
		return propertyMap[prop] || prop;
	}

	// listData 형식: { relics, lightcones, teams, stats } 가정 또는 HSR 데이터
	let isHsrData = $derived(
		listData && ('Set4IDList' in listData || 'Set2IDList' in listData || 'PropertyList' in listData)
	);

	let relics = $derived.by(() => {
		if (isHsrData) {
			const set4 = Array.isArray(listData?.Set4IDList)
				? listData.Set4IDList.map((id: number) => ({
						name: relicMap[id]?.name || '터널 유물',
						items: [id],
						desc: '',
						icon: relicMap[id]?.imageUrl
					}))
				: [];
			const set2 = Array.isArray(listData?.Set2IDList)
				? listData.Set2IDList.map((id: number) => ({
						name: relicMap[id]?.name || '차원 유물',
						items: [id],
						desc: '',
						icon: relicMap[id]?.imageUrl
					}))
				: [];
			return [...set4, ...set2];
		}
		return Array.isArray(listData?.relics)
			? listData.relics
			: Object.values(listData?.relics || []);
	});

	let lightcones = $derived(
		Array.isArray(listData?.lightcones)
			? listData.lightcones
			: Object.values(listData?.lightcones || [])
	);

	let teams = $derived(
		Array.isArray(listData?.teams) ? listData.teams : Object.values(listData?.teams || [])
	);

	let mainStats = $derived.by(() => {
		if (isHsrData) {
			const stats = [];
			if (listData?.PropertyList3?.length)
				stats.push(`몸통: ${listData.PropertyList3.map(formatProperty).join(' / ')}`);
			if (listData?.PropertyList4?.length)
				stats.push(`발: ${listData.PropertyList4.map(formatProperty).join(' / ')}`);
			if (listData?.PropertyList5?.length)
				stats.push(`차원 구체: ${listData.PropertyList5.map(formatProperty).join(' / ')}`);
			if (listData?.PropertyList6?.length)
				stats.push(`연결 매듭: ${listData.PropertyList6.map(formatProperty).join(' / ')}`);
			return stats;
		}
		return listData?.stats?.main || [];
	});

	let subStats = $derived.by(() => {
		if (isHsrData && listData?.SubAffixPropertyList) {
			return listData.SubAffixPropertyList.map(formatProperty);
		}
		return listData?.stats?.sub || [];
	});
	let hoveredRelic = $state<{
		visible: boolean;
		x: number;
		y: number;
		data: any;
	}>({ visible: false, x: 0, y: 0, data: null });

	function handleMouseEnter(event: MouseEvent, set: any) {
		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		// Find metadata for this set
		// The `set` object in `relics` map has `items: [id]`. We can use the first ID to look up metadata in `relicMap`.
		const id = set.items[0];
		const meta = relicMap[id]?.metadata;

		if (meta) {
			hoveredRelic = {
				visible: true,
				x: rect.left + rect.width / 2,
				y: rect.top,
				data: meta
			};
		}
	}

	function handleMouseLeave() {
		if (isMobile) return;
		closeTooltip();
	}

	function closeTooltip() {
		hoveredRelic = { ...hoveredRelic, visible: false };
	}

	function handleRelicClick(event: MouseEvent, set: any) {
		if (!isMobile) return;

		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const id = set.items[0];
		const meta = relicMap[id]?.metadata;

		// If clicking the same item that is already shown, toggle off
		if (hoveredRelic.visible && hoveredRelic.data === meta) {
			hoveredRelic = { ...hoveredRelic, visible: false };
			return;
		}

		if (meta) {
			hoveredRelic = {
				visible: true,
				x: rect.left + rect.width / 2,
				y: rect.top,
				data: meta
			};
		}
	}

	function formatDescription(desc: string, params: any[]): string {
		if (!desc) return '';
		if (!params || params.length === 0) return desc;

		return desc.replace(/#(\d+)\[i\]/g, (match, index) => {
			const val = params[parseInt(index) - 1];
			// Assuming `i` refers to integer or just standard value.
			// HSR formatting might use `[i]` for integer and `[f1]` for float, but based on user prompt `#1[i]%` it seems generic.
			// If it's a percentage value (usually < 1), we might need to multiply by 100 if the string has %, but usually the % is outside the tag.
			// However, sometimes the value itself is 10 for 10%.
			// Let's just return the value for now.
			return val !== undefined ? val : match;
		});
	}
</script>

<Layer title={title || initData?.name || '추천 세팅'}>
	<div class="p-4 space-y-6">
		<!-- 유물 추천 -->
		{#if relics.length > 0}
			<div>
				<h4
					class="text-sm font-bold text-gray-900 dark:text-white mb-3 border-l-4 border-orange-500 pl-2"
				>
					추천 유물
				</h4>
				<div class="grid grid-cols-2 md:grid-cols-3 gap-2">
					{#each relics as set}
						<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
						<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
						<div
							class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded cursor-help transition-colors hover:bg-gray-100 dark:hover:bg-gray-600"
							onmouseenter={(e) => handleMouseEnter(e, set)}
							onmouseleave={handleMouseLeave}
							onclick={(e) => handleRelicClick(e, set)}
							role="tooltip"
							tabindex="0"
							onkeydown={() => {}}
						>
							<div class="flex flex-col items-center justify-center gap-2 w-full">
								<div class="flex items-center justify-center gap-1">
									<!-- 유물 아이콘들 -->
									{#each set.items as item}
										<img
											src={set.icon
												? `${currentUrl}/${set.icon}`
												: `${currentUrl}/relics/${item.icon}.webp`}
											class="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500"
											alt=""
										/>
									{/each}
								</div>
								{#if set.name}
									<span
										class="text-sm font-medium text-gray-800 dark:text-gray-200 text-center break-keep"
										>{set.name}</span
									>
								{/if}
							</div>
							{#if set.desc}<span class="text-xs text-gray-500">{set.desc}</span>{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}
		<!-- 주요 옵션 -->
		{#if mainStats.length > 0 || subStats.length > 0}
			<div class="">
				{#if mainStats.length > 0}
					<div>
						<h4 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
							Main Stats
						</h4>
						<div class="grid grid-cols-2 md:grid-cols-4 gap-2">
							{#each mainStats as stat}
								<span
									class="text-center px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-base rounded font-medium"
									>{stat}</span
								>
							{/each}
						</div>
					</div>
				{/if}
				{#if subStats.length > 0}
					<div class="mt-4">
						<h4 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
							Sub Stats
						</h4>
						<div class="grid grid-cols-2 md:grid-cols-4 gap-2">
							{#each subStats as stat}
								<span
									class="text-center px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-base rounded font-medium"
									>{stat}</span
								>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</Layer>

{#if hoveredRelic.visible && hoveredRelic.data}
	{#if isMobile}
		<!-- Mobile Backdrop -->
		<div
			class="fixed inset-0 bg-black/50 z-40"
			onclick={closeTooltip}
			role="button"
			tabindex="0"
			onkeydown={() => {}}
		></div>
	{/if}

	<div
		class={isMobile
			? 'fixed z-50 bottom-0 left-0 w-full p-4 bg-white dark:bg-gray-800 rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] text-sm animate-slide-up'
			: 'fixed z-50 w-96 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl pointer-events-none text-xs'}
		style={isMobile
			? ''
			: `top: ${hoveredRelic.y - 10}px; left: ${hoveredRelic.x}px; transform: translate(-50%, -100%);`}
	>
		{#if hoveredRelic.data['2pc']}
			<div class="mb-3">
				<span class="font-bold text-orange-500 mb-1 block text-base md:text-sm">2세트 효과</span>
				<p class="text-gray-600 dark:text-gray-300 leading-relaxed">
					{@html sanitizeHtml(formatDescription(
						hoveredRelic.data['2pc'].desc ||
							(typeof hoveredRelic.data['2pc'] === 'string' ? hoveredRelic.data['2pc'] : ''),
						hoveredRelic.data['2pc'].params
					))}
				</p>
			</div>
		{/if}
		{#if hoveredRelic.data['4pc'] && hoveredRelic.data['4pc'].desc}
			<div>
				<span class="font-bold text-orange-500 mb-1 block text-base md:text-sm">4세트 효과</span>
				<p class="text-gray-600 dark:text-gray-300 leading-relaxed">
					{@html sanitizeHtml(formatDescription(hoveredRelic.data['4pc'].desc, hoveredRelic.data['4pc'].params))}
				</p>
			</div>
		{/if}
	</div>
{/if}
