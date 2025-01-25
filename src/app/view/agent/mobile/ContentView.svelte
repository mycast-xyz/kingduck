<script lang="ts">
	// Svelte 및 외부 라이브러리 임포트
	import { onMount } from 'svelte';
	import { register } from 'swiper/element/bundle';

	// 커스텀 서비스 임포트
	import { ContentManualModal } from '../../../service/ContentManualModalService';
	import { ContentBackgroundSet } from '../../../service/ContentBackgroundService';

	// 페이지 데이터 및 모달 초기화
	const { data } = $props<{ data: PageData }>();
	const modal = new ContentManualModal();
	const showModal = modal.showModal;

	// 페이지 마운트 시 모달 쿠키 체크
	onMount(() => {
		modal.checkModalCookie();
	});

	// 현재 URL 및 캐릭터 정보 초기화
	const currentUrl = data.url;
	let infoData = data.info;
	let cardData = infoData.info.itemData.card;

	// 캐릭터 배경색 계산
	let infoContentColor = ContentBackgroundSet.calculateInfoContentColor(
		infoData.type.element.image.backgroundColor
	);

	// 캐릭터 레어도 설정
	let rarity = Number(infoData.rarity);
	let rarityArray = Array.from({ length: rarity }, (_, i) => i);

	// 비디오 컨트롤 상태 관리
	let paused = $state(false);

	// 이미지 슬라이더 상태 관리
	let slideIndex = $state(0);
	let slideData = $state(infoData.images);
	let currentSlide = $derived.by(() => {
		return slideData[slideIndex];
	});

	// 비디오 재생/정지 토글
	const togglePause = () => {
		paused = !paused;
	};

	// 슬라이드 이동 제어
	const controlSlide = (type = '') => {
		let nextIndex;
		if ((type = 'NEXT')) {
			nextIndex = (slideIndex + 1) % slideData.length;
		} else if ((type = 'PREV')) {
			nextIndex = (slideIndex - 1) % slideData.length;
		}
		slideIndex = nextIndex || 0;
	};

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
				<div id="info-image" class="relative h-full w-full">
					<!-- Image Slider -->
					<div id="default-carousel" class="h-full w-full">
						<!-- Carousel wrapper -->
						<div class="h-full overflow-hidden bg-gray-200">
							<div id="info-image-view" class="duration-700 ease-in-out">
								{#if currentSlide?.layout == 'video'}
									<video
										class="absolute left-1/2 top-1/2 block h-full w-full -translate-x-1/2 -translate-y-1/2 object-cover object-top"
										src="{currentUrl}/{currentSlide.url}.webm"
										bind:paused
										onclick={() => togglePause()}
										loop
										muted
										playsinline
									></video>
								{:else}
									<img
										src="{currentUrl}/{currentSlide.url}.webp"
										class="absolute left-1/2 top-1/2 block h-full w-full -translate-x-1/2 -translate-y-1/2 object-cover object-top"
										alt="..."
									/>
								{/if}
							</div>
						</div>
						<!-- Slider controls -->
						<!-- svelte-ignore event_directive_deprecated -->
						<button
							type="button"
							onclick={() => controlSlide('PREV')}
							class="group absolute start-0 top-0 z-30 flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none"
						>
							<span
								class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/30 group-hover:bg-white/50 group-focus:outline-none group-focus:ring-0 group-focus:ring-white dark:bg-gray-800/30 dark:group-hover:bg-gray-800/60 dark:group-focus:ring-gray-800/70"
								><i class="ri-arrow-left-s-line"></i>
								<span class="sr-only">Previous</span>
							</span>
						</button>
						<!-- svelte-ignore event_directive_deprecated -->
						<button
							type="button"
							onclick={() => controlSlide('NEXT')}
							class="group absolute end-0 top-0 z-30 flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none"
						>
							<span
								class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/30 group-hover:bg-white/50 group-focus:outline-none group-focus:ring-0 group-focus:ring-white dark:bg-gray-800/30 dark:group-hover:bg-gray-800/60 dark:group-focus:ring-gray-800/70"
							>
								<i class="ri-arrow-right-s-line"></i>
								<span class="sr-only">Next</span>
							</span>
						</button>
					</div>

					<!-- 캐릭터 이름 / 정보 표기 -->
					<div
						id="info-image-card"
						class="absolute inset-x-0 -bottom-4 h-72 w-full px-2 text-white"
					>
						<!-- 캐릭터 이름 표기 -->
						<div id="info-title" class="w-full border-b px-2 pb-3 pt-20">
							<!-- 한글 표기 -->
							<!--서브타이틀-->
							<h5 class="break-keep pb-1 text-lg font-extrabold"></h5>
							<!-- 메인타이틀-->
							<h3 class="break-keep pb-1 text-3xl font-extrabold">{infoData.name.kr}</h3>
							<!-- 외래어 표기 | 영어, 일본어, 중국어 간체 일부 가능 -->
							<p class=" text-lg font-normal">{infoData.name.en}</p>
						</div>
						<!-- 캐릭터 등급 표기 -->
						<div class="rating-info flex border-b p-2">
							<div class="flex w-1/2 items-center justify-start">
								<h3 class="break-keep text-lg font-normal">등급</h3>
								<!-- 레이팅 등급 아이콘 표기시 -->
								<div class="rating-info-img ml-3 flex w-auto items-center justify-start">
									{#each rarityArray as i}
										<div class="icon h-5 w-5">
											<svg
												id="_레이어_1"
												data-name="레이어_1"
												xmlns="http://www.w3.org/2000/svg"
												version="1.1"
												viewBox="0 0 50 50"
											>
												<!-- Generator: Adobe Illustrator 29.2.0, SVG Export Plug-In . SVG Version: 2.1.0 Build 108)  -->
												<defs>
													<style>
														.st0 {
															fill: #fff;
														}
													</style>
												</defs>
												<path
													class="st0"
													d="M45.99,23.97c-11.02,0-19.96-8.94-19.96-19.96V0h-2.06v4.01c0,11.02-8.94,19.96-19.96,19.96H0v2.06h4.01c11.02,0,19.96,8.94,19.96,19.96v4.01h2.06v-4.01c0-11.02,8.94-19.96,19.96-19.96h4.01v-2.06h-4.01Z"
												/>
											</svg>
										</div>
									{/each}
								</div>
							</div>
							<div class="flex w-1/2 justify-start">
								<h3 class="break-keep pb-1 pr-1 pt-0.5 text-lg font-normal">출시일 :</h3>
								<h3 class="break-keep pb-1 pr-1 pt-0.5 text-lg font-extrabold">
									{infoData.releaseDate}
								</h3>
							</div>
						</div>
						<!-- 캐릭터 등급 표기 -->
						<div class="flex w-auto justify-start p-2 pt-3">
							{#if infoData.type.path}
								<div class="mr-3 flex h-8 items-center">
									<img
										src="{currentUrl}/{infoData.type.path.image.url}.webp"
										class="mr-2 h-6"
										alt={infoData.type.path.name.ko}
									/>
									<h3 class="text-lg font-medium">
										{infoData.type.path.name.ko}
									</h3>
								</div>
							{/if}
							{#if infoData.type.element}
								<div class="mr-3 flex h-8 items-center">
									<img
										src="{currentUrl}/{infoData.type.element.image.url}.webp"
										class="mr-2 h-6"
										alt={infoData.type.element.name.ko}
									/>
									<h3 class="text-lg font-medium">
										{infoData.type.element.name.ko}
									</h3>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</swiper-slide>
			<swiper-slide>
				<div id="info-content" class="mb-16 mt-14 h-full w-full overflow-y-auto">
					<div class="w-full px-4 pb-16 pt-4">
						<!-- 서포트 카드 처리용 / 기본 틀 -->
						<div
							class="mb-4 w-full rounded-lg border border-gray-200 bg-white p-3 shadow dark:border-gray-700 dark:bg-gray-800"
						>
							<div>
								<h5
									class="border-b border-gray-200 pb-3 pl-3 text-lg font-bold tracking-tight text-gray-800 dark:text-white"
								>
									추천 광추
								</h5>
							</div>
							<div
								class="flex w-full justify-start overflow-x-auto p-3 pb-0"
								ontouchstart={(e) => e.stopPropagation()}
								ontouchmove={(e) => e.stopPropagation()}
								ontouchend={(e) => e.stopPropagation()}
							>
								<!-- 스타레일 / 원신 -->
								{#each cardData as card}
									<div class="card-info mx-3 w-28 min-w-28 max-w-28 first:ml-0">
										<div
											class="rating-card border-HY-Rating-{card.rarity} items-center rounded-xl border-4"
										>
											<img
												class="h-auto w-full rounded-xl"
												src="{currentUrl}/assets/image/item/{card.itemReferences?.image?.art
													?.src}.webp"
												alt=""
											/>
											<div class="rating-info flex w-auto justify-center p-2 pb-0">
												{#each { length: card.rarity } as i}
													<div class="icon h-3 w-3">
														<svg
															id="_레이어_1"
															data-name="레이어_1"
															xmlns="http://www.w3.org/2000/svg"
															version="1.1"
															viewBox="0 0 50 50"
														>
															<!-- Generator: Adobe Illustrator 29.2.0, SVG Export Plug-In . SVG Version: 2.1.0 Build 108)  -->
															<defs>
																<style>
																	.st0 {
																		fill: #fff;
																	}
																</style>
															</defs>
															<path
																class="st0"
																d="M45.99,23.97c-11.02,0-19.96-8.94-19.96-19.96V0h-2.06v4.01c0,11.02-8.94,19.96-19.96,19.96H0v2.06h4.01c11.02,0,19.96,8.94,19.96,19.96v4.01h2.06v-4.01c0-11.02,8.94-19.96,19.96-19.96h4.01v-2.06h-4.01Z"
															/>
														</svg>
													</div>
												{/each}
											</div>
										</div>
										<p
											class="w-full break-keep px-4 pt-2 text-center text-xs font-bold text-gray-600 dark:text-gray-200"
										>
											{card.name?.kr}
										</p>
									</div>
								{/each}

								<!-- 말딸용 
              <div class="card-info mx-6 w-min">
                <div class="rating-card border-URA-Rating-SSR overflow-hidden rounded-xl border-8">
                  <img
                    class="h-auto min-w-36 max-w-52 rounded-xl"
                    src="/assets/test/1/7.png"
                    alt=""
                  />
                  <h4 class=" text-center text-2xl font-bold tracking-tight text-white">SSR</h4>
                </div>
                <p
                  class=" w-full break-keep px-4 pt-2 text-center text-lg font-bold text-gray-600 dark:text-gray-200"
                >
                  다가오는 열기에 떠밀려
                </p>
              </div>-->
							</div>
						</div>
						<!-- 추천 유물 / 기본 틀-->
						<div
							class="mb-4 w-full rounded-lg border border-gray-200 bg-white p-3 shadow dark:border-gray-700 dark:bg-gray-800"
						>
							<div>
								<h5
									class="border-b border-gray-200 pb-3 pl-3 text-lg font-bold tracking-tight text-gray-800 dark:text-white"
								>
									추천 유물
								</h5>
							</div>
							<!-- 기본 형태 | 강조 박스형 -->
							<div class="flex w-full flex-col p-3">
								{#if infoData.info.itemData.relics}
									<div class="w-full py-3 pt-0">
										<h5 class="text-base font-bold tracking-tight text-gray-700 dark:text-white">
											터널 유물
										</h5>
										<div
											class="flex w-full justify-start overflow-x-auto py-3 pb-0"
											ontouchstart={(e) => e.stopPropagation()}
											ontouchmove={(e) => e.stopPropagation()}
											ontouchend={(e) => e.stopPropagation()}
										>
											{#each infoData.info.itemData.relics as SpriteItem}
												<div
													style:background={infoContentColor}
													class="mx-2 min-w-24 max-w-24 rounded-lg border border-gray-200 bg-gray-500 shadow first:ml-0 dark:border-gray-700"
												>
													<div class=" relative h-auto w-full object-scale-down">
														<img
															class=" m-auto min-w-24 max-w-24 items-center p-4"
															src="{currentUrl}/assets/image/item/{SpriteItem.itemReferences.image
																.src}.webp"
															alt={SpriteItem.name.kr}
														/>
													</div>
													<div class="-p-1">
														<h5
															class="mb-2 break-keep text-center text-xs font-bold tracking-tight text-white"
														>
															{SpriteItem.name.kr}
														</h5>
													</div>
												</div>
											{/each}
										</div>
									</div>
								{/if}

								{#if infoData.info.itemData.accessories}
									<div class="w-full py-3 pt-0">
										<h5 class="text-base font-bold tracking-tight text-gray-700 dark:text-white">
											차원 유물
										</h5>
										<div
											class="flex w-full justify-start overflow-x-auto py-3 pb-0"
											ontouchstart={(e) => e.stopPropagation()}
											ontouchmove={(e) => e.stopPropagation()}
											ontouchend={(e) => e.stopPropagation()}
										>
											{#each infoData.info.itemData.accessories as AccessoriesItem}
												<div
													style:background={infoContentColor}
													class="mx-2 min-w-24 max-w-24 rounded-lg border border-gray-200 bg-gray-500 shadow first:ml-0 dark:border-gray-700"
												>
													<div class=" relative h-auto w-full object-scale-down">
														<img
															class=" m-auto min-w-24 max-w-24 items-center p-4"
															src="{currentUrl}/assets/image/item/{AccessoriesItem.itemReferences
																.image.src}.webp"
															alt={AccessoriesItem.name.kr}
														/>
													</div>
													<div class="-p-1">
														<h5
															class="mb-2 break-keep text-center text-xs font-bold tracking-tight text-white"
														>
															{AccessoriesItem.name.kr}
														</h5>
													</div>
												</div>
											{/each}
										</div>
									</div>
								{/if}
							</div>
							<!-- 기본 형태 | 이미지가 들어가는 경우 -->
							<div class="w-full border-t border-gray-200 p-3">
								<h5 class="text-base font-bold tracking-tight text-gray-700 dark:text-white">
									추천 메인 속성
								</h5>
								<ul class="flex">
									{#each infoData.ItemOpt as Optitem}
										<li
											class="block flex rounded-lg p-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700"
										>
											<div
												class="image-box mr-3 h-16 w-16 rounded-full bg-gray-400 p-2 dark:bg-gray-800"
											>
												<img
													class="h-full w-full"
													src="{currentUrl}/assets/test/content/{infoData.slug}/{Optitem.iconPath}.webp"
												/>
											</div>
											<div class="pt-2">
												<h5 class="text-xl font-semibold">{Optitem.optName}</h5>
												<span class="font-base text-sm text-gray-500 dark:text-gray-400"
													>{Optitem.name}</span
												>
											</div>
										</li>
									{/each}
								</ul>
							</div>
							<!-- 기본 형태 | 텍스트만 표기시 -->
							<div class="w-full border-t border-gray-200 p-3 pb-0">
								<h5 class="text-base font-bold tracking-tight text-gray-700 dark:text-white">
									추천 보조 속성
								</h5>
								<div class="flex pb-3 pl-0 pt-2">
									<h5 class="text-xs font-normal">치명타 확률, 치명타 피해, 공력력%</h5>
								</div>
							</div>
						</div>
						<!-- 행적 육성 - 기본형태와 동일 코드 -->
						<div
							class="mb-6 w-full rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800"
						>
							<div>
								<h5
									class="border-b border-gray-200 pb-3 pl-3 text-lg font-bold tracking-tight text-gray-800 dark:text-white"
								>
									캐릭터 스킬
								</h5>
							</div>
							<!-- 기본 형태 | 강조 박스형 -->
							<div
								class="flex w-full justify-start overflow-x-auto py-3 pb-0"
								ontouchstart={(e) => e.stopPropagation()}
								ontouchmove={(e) => e.stopPropagation()}
								ontouchend={(e) => e.stopPropagation()}
							>
								{#each infoData.skill as skill}
									<button
										type="button"
										class="mx-2 min-w-24 max-w-24 cursor-pointer rounded-lg border border-gray-200 bg-gray-500 shadow transition-colors hover:bg-gray-600 dark:border-gray-700"
										onclick={() => (selectedSkill = skill)}
										onkeydown={(e) => e.key === 'Enter' && (selectedSkill = skill)}
									>
										<div class="relative h-auto w-full object-scale-down">
											<img
												class="m-auto min-w-24 max-w-24 items-center p-4"
												src="{currentUrl}/{skill.image.url}.webp"
												alt=""
											/>
										</div>
										<div class="w-full p-1">
											<h5
												class="mb-2 w-full break-words text-center text-sm font-bold tracking-tight text-white"
											>
												{skill.name.kr}
											</h5>
										</div>
									</button>
								{/each}
							</div>

							<!-- 스킬 상세 정보 -->
							{#if selectedSkill}
								<div class="w-full border-t border-gray-200 p-3">
									<div class="block rounded-lg pb-4">
										<div
											class="title"
											ontouchstart={(e) => e.stopPropagation()}
											ontouchmove={(e) => e.stopPropagation()}
											ontouchend={(e) => e.stopPropagation()}
										>
											<div class="flex items-center pb-2">
												<div
													class="image-box mr-3 h-10 w-10 flex-none rounded-full bg-gray-400 p-2 dark:bg-gray-800"
												>
													<img
														class="h-full w-full"
														src="{currentUrl}/{selectedSkill.image.url}.webp"
														alt={selectedSkill.name.kr}
													/>
												</div>
												<div class="flex-1">
													<h5 class="text-lg font-semibold">
														{selectedSkill.name.kr}
														{#if selectedSkill.type}
															<small>[{selectedSkill.type}]</small>
														{/if}
													</h5>
												</div>
											</div>
											<div class="flex items-center">
												<span class="mr-2 text-sm">LEVEL</span>
												<span class="mr-4 text-sm">{selectedLevel}</span>
												<input
													class="w-48 accent-indigo-600"
													type="range"
													name="skillRange"
													bind:value={selectedLevel}
													min="1"
													max={selectedSkill.levelData.length}
												/>
											</div>
										</div>
										<div class="pt-2">
											<span class=" text-xs font-normal text-gray-500 dark:text-gray-400">
												{@html selectedSkill.info?.replace(
													/(#(\d)\[(i|f\d)]|color:#FFFFFF)/g,
													(match, full, num, type) => {
														if (match === 'color:#FFFFFF') return '';
														const index = parseInt(num) - 1;
														const value =
															selectedSkill.levelData[selectedLevel - 1]?.params[index] || 0;
														return (value * 100).toFixed(1);
													}
												) || '설명이 없습니다.'}
											</span>
										</div>
									</div>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</swiper-slide>
		</swiper-container>

		<!-- 캐릭터 이미지 표기 처리 -->

		<!-- 스크롤 처리 -->
	</article>
</div>

<style>
	/* #info-image-view {
		display: none;
	}

	#info-image-view.show {
		display: block;
	} */
	#info-image-card {
		background: rgb(0, 0, 0);
		background: -moz-linear-gradient(0deg, rgba(0, 0, 0, 0.75) 75%, rgba(0, 0, 0, 0) 100%);
		background: -webkit-linear-gradient(0deg, rgba(0, 0, 0, 0.75) 75%, rgba(0, 0, 0, 0) 100%);
		background: linear-gradient(0deg, rgba(0, 0, 0, 0.75) 75%, rgba(0, 0, 0, 0) 100%);
		filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#000000",endColorstr="#000000",GradientType=1);
	}
</style>
