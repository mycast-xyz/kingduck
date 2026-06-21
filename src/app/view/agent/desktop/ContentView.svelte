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
	import NteMaterialView from '../../info/NteMaterialView.svelte';
	import CalculatorView from '../../info/CalculatorView.svelte';
	import TeamRecommendationView from '../../info/TeamRecommendationView.svelte';
	import ProfileView from '../../info/ProfileView.svelte';
	import StoryView from '../../info/StoryView.svelte';
	import VoiceView from '../../info/VoiceView.svelte';
	import EndfieldProfileView from '../../info/EndfieldProfileView.svelte';
	import Reverse1999ProfileView from '../../info/Reverse1999ProfileView.svelte';
	import NikkeProfileView from '../../info/NikkeProfileView.svelte';
	import ZzzProfileView from '../../info/ZzzProfileView.svelte';
	import NteProfileView from '../../info/NteProfileView.svelte';
	import BlueArchiveProfileView from '../../info/BlueArchiveProfileView.svelte';
	import FooterView from '../../footer/FooterView.svelte';
	import AdUnit from '../../ad/AdUnit.svelte';
	import { adSlots } from '../../ad/adSlots';

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
	let contentColor = $state('#ffffff');
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
			gameSlug: data.gameSlug,
			rarity: gameInit?.rarity, // Rarity service needs this
			rarityColors: gameInit?.list?.card?.rarityColors
		};
	}

	// Navigation & ScrollSpy Logic
	let activeSection = $state('');
	const sectionLabels: Record<string, string> = {
		MainItemView: '기본 정보',
		EquipmentItemView: '장비',
		CarouselListView: '목록',
		SkillTreeView: '스킬',
		RankListView: '돌파',
		TraceListView: '행적',
		BuildRecommendationView: '추천 세팅',
		StatsView: '기초 속성',
		CostumeView: '스킨',
		CalculatorView: '계산기',
		TeamRecommendationView: '추천 조합',
		ProfileView: '정보',
		NteProfileView: '정보',
		BlueArchiveProfileView: '정보',
		StoryView: '스토리',
		VoiceView: '음성',
		EndfieldProfileView: '정보',
		Reverse1999ProfileView: '정보',
		NikkeProfileView: '정보',
		ZzzProfileView: '정보'
	};

	const scrollToSection = (id: string) => {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	};

	// ScrollSpy implementation using IntersectionObserver
	$effect(() => {
		if (!gameInit?.layout) return;

		const observerOptions = {
			root: document.getElementById('info-content'),
			threshold: 0.1, // Trigger when 10% of the section is visible
			rootMargin: '-5% 0px -50% 0px' // Offset to trigger closer to top
		};

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					activeSection = entry.target.id;
				}
			});
		}, observerOptions);

		gameInit.layout.forEach((section: any, index: number) => {
			const element = document.getElementById(`section-${index}`);
			if (element) observer.observe(element);
		});

		return () => {
			observer.disconnect();
		};
	});
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
		<div id="info-content" class="flex h-full w-[inherit] flex-col overflow-y-auto pr-[20px]">
			<div class="w-full px-5 pt-5">
				<AdUnit slot={adSlots.content} />
				{#if gameInit?.layout}
					{#each gameInit.layout as section, index}
						<!-- Section Wrapper for Navigation -->
						<div id="section-{index}" class="scroll-mt-4 mb-8">
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
									listData={section.dataKey === 'metadata' ? meta : meta[section.dataKey] || []}
									{currentUrl}
									{isMobile}
									{gameId}
									gameSlug={data.gameSlug}
									initData={getInitData(section)}
									extraData={section.props?.extraDataKey
										? meta[section.props.extraDataKey]
										: undefined}
									{...section.props}
								/>
							{:else if section.component === 'RankListView'}
								<RankListView
									listData={section.dataKey === 'metadata' ? meta : meta[section.dataKey] || []}
									{currentUrl}
									{isMobile}
									{gameId}
									gameSlug={data.gameSlug}
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
									listData={section.dataKey === 'metadata' ? meta : meta[section.dataKey] || []}
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
							{:else if section.component === 'NteMaterialView'}
								<NteMaterialView
									listData={meta[section.dataKey] || []}
									{currentUrl}
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
							{:else if section.component === 'ProfileView'}
								<ProfileView
									listData={meta}
									{currentUrl}
									{isMobile}
									{gameId}
									initData={getInitData(section)}
									{...section.props}
								/>
							{:else if section.component === 'StoryView'}
								<StoryView
									listData={meta[section.dataKey] || []}
									{currentUrl}
									{isMobile}
									{gameId}
									initData={getInitData(section)}
									{...section.props}
								/>
							{:else if section.component === 'VoiceView'}
								<VoiceView
									listData={meta[section.dataKey] || []}
									{currentUrl}
									{isMobile}
									{gameId}
									initData={getInitData(section)}
									{...section.props}
								/>
							{:else if section.component === 'EndfieldProfileView'}
								<EndfieldProfileView
									listData={meta}
									{currentUrl}
									{isMobile}
									{gameId}
									initData={getInitData(section)}
									{...section.props}
								/>
							{:else if section.component === 'Reverse1999ProfileView'}
								<Reverse1999ProfileView
									listData={meta}
									{currentUrl}
									{isMobile}
									{gameId}
									initData={getInitData(section)}
									{...section.props}
								/>
							{:else if section.component === 'NikkeProfileView'}
								<NikkeProfileView
									listData={meta}
									{currentUrl}
									{isMobile}
									{gameId}
									initData={getInitData(section)}
									{...section.props}
								/>
							{:else if section.component === 'ZzzProfileView'}
								<ZzzProfileView
									listData={meta}
									{currentUrl}
									{isMobile}
									{gameId}
									initData={getInitData(section)}
									{...section.props}
								/>
							{:else if section.component === 'BlueArchiveProfileView'}
								<BlueArchiveProfileView
									listData={meta}
									{currentUrl}
									{isMobile}
									{gameId}
									initData={getInitData(section)}
									{...section.props}
								/>
							{:else if section.component === 'NteProfileView'}
								<NteProfileView
									listData={meta}
									{currentUrl}
									{isMobile}
									{gameId}
									initData={getInitData(section)}
									{...section.props}
								/>
							{/if}
						</div>
					{/each}
				{/if}
				<!-- 속성정보 - 기본틀 -->
				<!-- 속성정보 - 기본틀 (Legacy Removed) -->
			</div>
			<FooterView />
		</div>
	</article>

	<!-- Side Navigation (Waifu2x Style) -->
	<nav class="fixed right-6 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-3">
		{#if gameInit?.layout}
			{#each gameInit.layout as section, index}
				{@const label = sectionLabels[section.component] || section.component}
				<div class="group relative flex items-center justify-end">
					<!-- Tooltip (Left side) -->
					<span
						class="pointer-events-none absolute right-6 mr-2 whitespace-nowrap rounded bg-gray-900/80 px-2 text-sm text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-white/90 dark:text-gray-900 shadow-sm"
					>
						{label}
					</span>

					<!-- Dot Button -->
					<button
						aria-label={label}
						class="h-3 w-3 rounded-full transition-all duration-300 {activeSection ===
						`section-${index}`
							? 'scale-125 bg-orange-500 ring-2 ring-orange-300 dark:bg-orange-400 dark:ring-orange-500/50'
							: 'bg-gray-400 hover:scale-110 hover:bg-gray-600 dark:bg-gray-500 dark:hover:bg-gray-300'}"
						onclick={() => scrollToSection(`section-${index}`)}
					></button>
				</div>
			{/each}
		{/if}
	</nav>
</div>

<style>
</style>
