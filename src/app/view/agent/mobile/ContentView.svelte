<script lang="ts">
	// Svelte 및 외부 라이브러리 임포트
	import { onMount } from 'svelte';
	import { register } from 'swiper/element/bundle';

	// 커스텀 서비스 임포트
	import { GameSettingInitService } from '../../../service/game/GameSettingService';
	import { ContentBackgroundSet } from '../../../service/ContentBackgroundService';
	import { ContentManualModal } from '../../../service/ContentManualModalService';

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

	// 페이지 데이터 및 모달 초기화
	const { data, gameInit } = $props<{ data: any; gameInit?: any }>();
	const modal = new ContentManualModal();
	const showModal = modal.showModal;

	// 페이지 마운트 시 모달 쿠키 체크
	onMount(() => {
		modal.checkModalCookie();
	});

	// 현재 URL 및 캐릭터 정보 초기화
	const currentUrl = data.url;
	const isMobile = data.isMobile;
	// 캐릭터 정보 데이터 초기화
	let infoData = $derived(data.info);
	// API Refactor: Use metadata for game specific info
	let meta = $derived(infoData.metadata || {});

	let itemData = $derived(meta.itemData || {});
	let propertyBase = $derived(meta.propertyBase || {});
	let gameId = $derived(infoData.gameId || 0);
	let gachaData = $derived(meta.ranks ? Object.values(meta.ranks) : []);
	let skillData = $derived(meta.skill || []);

	// 캐릭터 정보 배경색 계산 함수
	let contentColor = $state('#ffffff');
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

	// 게임 정보 처리
	// Use prop if available, otherwise derived from store (but relying on prop now)
	let skillInit = $derived(gameInit?.content?.info?.skill?.main);
	let gachaInit = $derived(gameInit?.content?.info?.gacha);

	// 스킬 정보 상태 관리
	let selectedSkill = $state(null);
	let selectedLevel = $state(1);

	// Swiper 설정
	register();
	let activeTab = 0;
	let swiperInstance: any;

	// Swiper 슬라이드 변경 이벤트 핸들러
	function handleSlideChange(e: any) {
		if (swiperInstance?.swiper) {
			activeTab = swiperInstance.swiper.activeIndex;
		}
	}

	function getInitData(section: any) {
		const specificInit =
			(section.initDataKey && gameInit?.content?.info?.[section.initDataKey]) || {};
		return {
			...specificInit,
			gameId: gameInit?.gameId,
			gameSlug: data.gameSlug,
			rarity: gameInit?.rarity,
			rarityColors: gameInit?.list?.card?.rarityColors
		};
	}
</script>

<div class="h-dvh w-screen overflow-hidden bg-gray-100 dark:bg-gray-800">
	<!-- Content -->
	<article id="info-componet" class="my-0 mr-0 flex h-full overflow-hidden">
		<!-- 모달 팝업 -->
		{#if $showModal}
			<div class="fixed inset-0 z-50 flex items-center justify-center">
				<div class="absolute inset-0 bg-black opacity-50"></div>
				<div class="relative z-10 w-11/12 max-w-lg rounded-lg bg-white p-6 dark:bg-gray-800">
					<div class="mb-4 flex items-center justify-between">
						<h3 class="text-xl font-semibold text-gray-900 dark:text-white">화면 조작 방법</h3>
						<button
							type="button"
							class="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
							onclick={() => modal.closeModal()}
						>
							<i class="ri-close-line text-2xl"></i>
							<span class="sr-only">Close modal</span>
						</button>
					</div>
					<div class="space-y-4">
						<div class="flex items-center">
							<i class="ri-arrow-left-right-line mr-3 text-2xl"></i>
							<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
								좌우로 스와이프하여 캐릭터 정보와 상세 정보를 확인할 수 있습니다.
							</p>
						</div>
						<div class="flex items-center">
							<i class="ri-drag-move-line mr-3 text-2xl"></i>
							<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
								상하로 스크롤하여 상세 정보 내용을 확인할 수 있습니다.
							</p>
						</div>
					</div>
					<div
						class="mt-6 flex items-center space-x-2 border-t border-gray-200 pt-6 dark:border-gray-600"
					>
						<input
							id="dont-show-again"
							type="checkbox"
							onchange={(e) => modal.handleDontShowAgain(e)}
							class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
						/>
						<label
							for="dont-show-again"
							class="text-sm font-medium text-gray-900 dark:text-gray-300"
						>
							다시 보지 않기
						</label>
					</div>
				</div>
			</div>
		{/if}

		<!-- 스와이퍼 컨텐츠 -->
		<swiper-container
			bind:this={swiperInstance}
			slides-per-view="1"
			onslidechange={handleSlideChange}
			class="h-full w-full"
		>
			<swiper-slide>
				<InfoMainImageView {data} />
			</swiper-slide>
			<swiper-slide>
				<div id="info-content" class="mb-16 mt-14 h-full w-full overflow-y-auto">
					<div class="w-full px-4 pb-16 pt-4">
						<AdUnit slot={adSlots.content} />
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
								{:else if section.component === 'NteProfileView'}
									<NteProfileView
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
								{/if}
							{/each}
						{/if}
					</div>
				</div>
			</swiper-slide>
		</swiper-container>

		<!-- 캐릭터 이미지 표기 처리 -->

		<!-- 스크롤 처리 -->
	</article>
</div>

<style>
</style>
