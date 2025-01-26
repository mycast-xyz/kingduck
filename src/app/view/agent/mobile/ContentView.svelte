<script lang="ts">
	// Svelte 및 외부 라이브러리 임포트
	import { onMount } from 'svelte';
	import { register } from 'swiper/element/bundle';

	// 커스텀 서비스 임포트
	import { GameSettingInitService } from '../../../service/GameSettingService';
	import { ContentBackgroundSet } from '../../../service/ContentBackgroundService';
	import { ContentManualModal } from '../../../service/ContentManualModalService';

	// 컴포넌트 임포트
	import InfoMainImageView from '../../info/InfoMainImageView.svelte';
	import MainItemView from '../../info/MainItemView.svelte';
	import EquipmentItemView from '../../info/EquipmentItemView.svelte';
	import CarouselListView from '../../info/CarouselListView.svelte';

	// 페이지 데이터 및 모달 초기화
	const { data } = $props<{ data: any }>();
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
	let infoData = data.info;
	let itemData = infoData.info.itemData;
	let propertyBase = infoData.info.propertyBase;
	let gachaData = Object.values(infoData.info.ranks);

	// 캐릭터 정보 배경색 계산 함수
	let contentColor = ContentBackgroundSet.calculateInfoContentColor(
		infoData.type.element.image.backgroundColor
	);

	// 게임 정보 처리
	let gameInit, skillInit, gachaInit: any;
	GameSettingInitService.showList.subscribe((value) => {
		gameInit = value;
		skillInit = gameInit?.content?.info?.skill?.main;
		gachaInit = gameInit?.content?.info?.gacha;
	});

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
						{#if gameInit.gameId === 'HonkaiStarRail'}
							<!-- 메인 아이템 - MainItemView -->
							<MainItemView itemData={infoData.info.itemData.card} {currentUrl} {isMobile} />
							<!-- 장착용 아이템 - EquipmentItemView -->
							<EquipmentItemView {itemData} {propertyBase} {currentUrl} {isMobile} {contentColor} />
							<!-- 스킬 처리 -CarouselListView -->
							<CarouselListView
								listData={infoData.skill}
								{currentUrl}
								{isMobile}
								initData={skillInit}
							/>
							<!-- 가챠 처리 -CarouselListView -->
							<CarouselListView listData={gachaData} {currentUrl} {isMobile} initData={gachaInit} />
						{:else if gameInit.gameId === 'GirlsFrontline2Exilium'}
							<!-- 메인 아이템 - MainItemView -->
							<MainItemView itemData={infoData.info.itemData.weapon} {currentUrl} {isMobile} />
							<!-- 스킬 처리 -CarouselListView -->
							<CarouselListView
								listData={infoData.skill}
								{currentUrl}
								{isMobile}
								initData={skillInit}
							/>
							<!-- 뉴럴 헬릭스 처리 -CarouselListView -->
							<CarouselListView
								listData={infoData.info.stats.helix}
								{currentUrl}
								{isMobile}
								initData={gameInit?.content?.info?.helix}
							/>
							<!-- 뉴럴 헬릭스 처리 -CarouselListView -->
							<CarouselListView
								listData={infoData.info.ranks}
								{currentUrl}
								{isMobile}
								initData={gameInit?.content?.info?.gacha}
							/>
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
