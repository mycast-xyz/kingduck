<script lang="ts">
	import { ContentBackgroundSet } from '../../../service/ContentBackgroundService';

	// 커스텀 서비스 임포트
	import { GameSettingInitService } from '../../../service/game/GameSettingService';

	// 컴포넌트 임포트
	import InfoMainImageView from '../../info/InfoMainImageView.svelte';
	import MainItemView from '../../info/MainItemView.svelte';
	import EquipmentItemView from '../../info/EquipmentItemView.svelte';
	import CarouselListView from '../../info/CarouselListView.svelte';
	import SkillTreeView from '../../info/SkillTreeView.svelte';
	import RankListView from '../../info/RankListView.svelte';
	import TraceListView from '../../info/TraceListView.svelte';
	import BuildRecommendationView from '../../info/BuildRecommendationView.svelte';
	import StatsView from '../../info/StatsView.svelte';
	import CostumeView from '../../info/CostumeView.svelte';
	import CalculatorView from '../../info/CalculatorView.svelte';
	import TeamRecommendationView from '../../info/TeamRecommendationView.svelte';
	import FooterView from '../../footer/FooterView.svelte';

	// 페이지 데이터 가져오기
	const { data, gameInit } = $props<{ data: any; gameInit?: any }>();

	// 페이지 기본 정보
	const currentUrl = data.url;
	const isMobile = data.isMobile;

	// 캐릭터 정보 데이터 초기화
	let infoData = $derived(data.info);

	// API Refactor: Use metadata for game specific info
	let meta = $derived(infoData?.metadata || {});

	let itemData = $derived(meta.itemData || {});
	let propertyBase = $derived(meta.propertyBase || {});
	let gameId = $derived(infoData.gameId || 0);
	let gachaData = $derived(meta.ranks ? Object.values(meta.ranks) : []);
	let skillData = $derived(meta.skill || []);

	// 캐릭터 정보 배경색 계산 함수
	let contentColor = '#ffffff';
	// Update path if needed, safeguarding for now
	// This calculation should ideally be reactive too or in an effect if data changes
	$effect(() => {
		if (infoData?.element?.metadata?.backgroundColor || meta?.backgroundColor) {
			const bg = infoData?.element?.metadata?.backgroundColor || meta?.backgroundColor;
			contentColor = ContentBackgroundSet.calculateInfoContentColor(bg);
		} else if (infoData?.type?.element?.image?.backgroundColor) {
			contentColor = ContentBackgroundSet.calculateInfoContentColor(
				infoData?.type?.element?.image?.backgroundColor
			);
		}
	});

	// Fallback if gameInit not passed via props (legacy support via global store)
	// But since we fixed +page.ts, prop should be there.
	// If we want double safety:
	// const initStore = GameSettingInitService.showList;
	// let storeInit = $derived($initStore);
	// let finalGameInit = $derived(gameInit || storeInit);

	// We will trust the prop for fixing the hydration issue.
	// Derived values:
	let skillInit = $derived(gameInit?.content?.info?.skill?.main);
	let gachaInit = $derived(gameInit?.content?.info?.gacha);

	// Helper to merge specific init data with gameId
	function getInitData(section: any) {
		const specificInit =
			(section.initDataKey && gameInit?.content?.info?.[section.initDataKey]) || {};
		return {
			...specificInit,
			gameId: gameInit?.gameId,
			rarity: gameInit?.rarity, // Rarity service needs this
			rarityColors: gameInit?.list?.card?.rarityColors
		};
	}
</script>

<div
	class="h-screen w-screen min-w-[1700px] overflow-hidden overflow-x-hidden bg-gray-100 dark:bg-gray-800"
>
	<!-- Content -->
	<article
		id="info-componet"
		class="my-0 ml-[80px] mr-0 flex h-full w-[calc(100%-80px)] overflow-hidden"
	>
		<!-- 캐릭터 이미지 - InfoMainImageView -->
		<InfoMainImageView {data} />
		<!-- 스크롤 처리 -->
		<div id="info-content" class="flex h-full w-[inherit] flex-col overflow-y-auto">
			<div class="w-full px-5 pt-5">
				{#if gameInit?.layout}
					{#each gameInit.layout as section}
						{#if section.component === 'MainItemView'}
							<MainItemView
								itemData={meta[section.dataKey] || []}
								{currentUrl}
								{isMobile}
								{gameId}
								{...section.props}
							/>
						{:else if section.component === 'EquipmentItemView'}
							<EquipmentItemView
								itemData={meta[section.dataKey] || {}}
								{propertyBase}
								{currentUrl}
								{isMobile}
								{contentColor}
								{gameId}
								{...section.props}
							/>
						{:else if section.component === 'CarouselListView'}
							<CarouselListView
								listData={meta[section.dataKey] || []}
								{currentUrl}
								{isMobile}
								{gameId}
								initData={getInitData(section)}
								{...section.props}
							/>
						{:else if section.component === 'SkillTreeView'}
							<SkillTreeView
								listData={meta[section.dataKey] || []}
								{currentUrl}
								{isMobile}
								{gameId}
								initData={getInitData(section)}
								extraData={section.props?.extraDataKey
									? meta[section.props.extraDataKey]
									: undefined}
								{...section.props}
							/>
						{:else if section.component === 'RankListView'}
							<RankListView
								listData={meta[section.dataKey] || []}
								{currentUrl}
								{isMobile}
								{gameId}
								initData={getInitData(section)}
								{...section.props}
							/>
						{:else if section.component === 'TraceListView'}
							<TraceListView
								listData={meta[section.dataKey] || []}
								{currentUrl}
								{isMobile}
								{gameId}
								initData={getInitData(section)}
								{...section.props}
							/>
						{:else if section.component === 'BuildRecommendationView'}
							<BuildRecommendationView
								listData={meta[section.dataKey] || []}
								{currentUrl}
								{isMobile}
								{gameId}
								initData={getInitData(section)}
								{...section.props}
							/>
						{:else if section.component === 'StatsView'}
							<StatsView
								listData={meta[section.dataKey] || []}
								{currentUrl}
								{isMobile}
								{gameId}
								initData={getInitData(section)}
								{...section.props}
							/>
						{:else if section.component === 'CostumeView'}
							<CostumeView
								listData={meta[section.dataKey] || []}
								{currentUrl}
								{isMobile}
								{gameId}
								initData={getInitData(section)}
								{...section.props}
							/>
						{:else if section.component === 'CalculatorView'}
							<CalculatorView
								listData={meta[section.dataKey] || []}
								{currentUrl}
								{isMobile}
								{gameId}
								initData={getInitData(section)}
								{...section.props}
							/>
						{:else if section.component === 'TeamRecommendationView'}
							<TeamRecommendationView
								listData={meta[section.dataKey] || []}
								{currentUrl}
								{isMobile}
								{gameId}
								initData={getInitData(section)}
								{...section.props}
							/>
						{/if}
					{/each}
				{/if}
				<!-- 속성정보 - 기본틀 -->
				<!-- 속성정보 - 기본틀 (Legacy Removed) -->
			</div>
			<FooterView />
		</div>
	</article>
</div>

<style>
</style>
