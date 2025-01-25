<script lang="ts">
	// 메인 메뉴 활성화 상태를 관리하는 스토어 임포트
	import { mainMenuActive } from '$lib/stores/mainMenuStore';
	import { ContentBackgroundSet } from '../../../service/ContentBackgroundService';

	// 커스텀 서비스 임포트
	import { GameSettingInitService } from '../../../service/GameSettingService';

	// 컴포넌트 임포트
	import InfoMainImageView from '../../info/InfoMainImageView.svelte';
	import MainItemView from '../../info/MainItemView.svelte';
	import EquipmentItemView from '../../info/EquipmentItemView.svelte';
	import CarouselListView from '../../info/CarouselListView.svelte';

	// 페이지 데이터 가져오기
	const { data } = $props<{ data: any }>();

	// 페이지 기본 정보
	const currentUrl = data.url;
	const isMobile = data.isMobile;

	// 캐릭터 정보 데이터 초기화
	let infoData = data.info;
	let itemData = infoData.info.itemData;
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

	// 메인 뷰 활성화 상태에 따른 스타일 매핑
	const mainViewActive: any = {
		80: 'w-[calc(100%-80px)] ml-[80px]',
		240: 'w-[calc(100%-240px)] ml-[240px]'
	};
</script>

<div
	class="h-screen w-screen min-w-[1700px] overflow-hidden overflow-x-hidden bg-gray-100 dark:bg-gray-800"
>
	<!-- Content -->
	<article
		id="info-componet"
		class="{mainViewActive[$mainMenuActive]} my-0 mr-0 flex h-full overflow-hidden"
	>
		<!-- 캐릭터 이미지 - InfoMainImageView -->
		<InfoMainImageView {data} />
		<!-- 스크롤 처리 -->
		<div id="info-content" class="h-full w-[inherit] overflow-y-auto">
			<div class="w-full px-5 pt-5">
				{#if gameInit.gameId === 'HonkaiStarRail'}
					<!-- 메인 아이템 - MainItemView -->
					<MainItemView itemData={infoData.info.itemData.card} {currentUrl} {isMobile} />
					<!-- 장착용 아이템 - EquipmentItemView -->
					<EquipmentItemView {itemData} {currentUrl} {isMobile} {contentColor} />
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
				<!-- 속성정보 - 기본틀 -->
				<div
					class="mb-6 w-full rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800"
				>
					<div>
						<h5
							class="border-b border-gray-200 pb-3 pl-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
						>
							해외 속성 평균 통계
						</h5>
					</div>
					<!-- 기본 형태 | 강조 박스형 -->
					<div class="flex w-full p-0">
						<div class="w-auto pt-0">
							<h5
								class="pb-3 pl-3 text-lg font-bold tracking-tight text-gray-700 dark:text-white"
							></h5>
							<div class="flex flex-wrap">
								<div
									class="max-w-42 mx-4 my-3 rounded-lg border border-gray-200 bg-gray-500 shadow transition-colors hover:bg-[#d34e44] dark:border-gray-700"
								>
									<div class="h-auto w-36 object-scale-down p-2">
										<img class="m-auto max-w-14 items-center" src="/assets/test/3/1.webp" alt="" />
										<h5
											class="break-keep border-b-2 border-white pb-3 text-center text-base tracking-tight text-white"
										>
											공격력
										</h5>
									</div>
									<div class="p-2 pt-0">
										<h5
											class=" mb-2 break-keep text-center text-2xl font-black tracking-tight text-white"
										>
											1641.75
										</h5>
									</div>
								</div>
							</div>
						</div>
					</div>
					<!-- 기본 형태 | 이미지가 들어가는 경우 
					<div class="w-full border-t border-gray-200 p-3">
						<div class="block flex rounded-lg p-3 px-4">
							<div class="image-box mr-3 h-16 w-16 rounded-full bg-gray-400 p-2 dark:bg-gray-800">
								<img class="h-full w-full" src="./assets/test/4/3.webp" />
							</div>
							<div class="pt-2">
								<h5 class="text-xl font-semibold">
									현인의 길조, 천명의 부채 <small>[서포트]</small>
								</h5>
								<span class="text-sm text-gray-500 dark:text-gray-400"
									>[여우의 기도]를 보유한 아군의 격파 특수효과가 n% 증가한다.<br />아군이 공격을
									발동할 때마다 망귀인은 100%의 기본 확률로 피격된 적의 방어력을 n% 감소시킨다, 지속
									시간: 2턴
								</span>
							</div>
						</div>
					</div>
					-->
				</div>
			</div>
		</div>
	</article>
</div>

<style>
</style>
