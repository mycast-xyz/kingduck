<script lang="ts">
	import { mainMenuActive } from '$lib/stores/mainMenuStore';

	const { data } = $props();

	let infoData = data.info;
	let cardData = infoData.info.itemData.card;

	console.log(infoData.info.itemData.card);

	let infoContentColor = infoData.element.image.backgroundColor;
	let rarity = Number(infoData.rarity);
	let rarityArray = Array.from({ length: rarity }, (_, i) => i);

	const mainViewActive: any = {
		80: 'w-[calc(100%-80px)] ml-[80px]',
		240: 'w-[calc(100%-240px)] ml-[240px]'
	};

	//비디오 재생 토글
	let paused = $state(false);

	// 이미지 슬라이더 구현
	let slideIndex = $state(0);
	let slideData = $state(infoData.images);
	let currentSlide = $derived.by(() => {
		return slideData[slideIndex];
	});

	const togglePause = () => {
		paused = !paused;
	};
	const controlSlide = (type = '') => {
		let nextIndex;
		if ((type = 'NEXT')) {
			nextIndex = (slideIndex + 1) % slideData.length;
		} else if ((type = 'PREV')) {
			nextIndex = (slideIndex - 1) % slideData.length;
		}

		slideIndex = nextIndex || 0;
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
		<!-- 캐릭터 이미지 표기 처리 -->
		<div id="info-image" class="relative h-screen w-1/3 max-w-2xl">
			<!-- Image Slider -->
			<div id="default-carousel" class="h-full w-full">
				<!-- Carousel wrapper -->
				<div class="h-full overflow-hidden bg-gray-200">
					<div id="info-image-view" class="duration-700 ease-in-out">
						{#if currentSlide?.layout == 'video'}
							<video
								class="absolute left-1/2 top-1/2 block h-full w-full -translate-x-1/2 -translate-y-1/2 object-cover object-top"
								src="http://localhost:3000/{currentSlide.url}.webm"
								bind:paused
								onclick={() => togglePause()}
								loop
								muted
								playsinline
							></video>
						{:else}
							<img
								src="http://localhost:3000/{currentSlide.url}.webp"
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
			<div id="info-image-card" class="absolute inset-x-0 bottom-0 h-80 w-full px-6 text-white">
				<!-- 캐릭터 이름 표기 -->
				<div id="info-title" class="w-full border-b px-2 pb-3 pt-20">
					<!-- 한글 표기 -->
					<!--서브타이틀-->
					<h5 class="break-keep pb-1 text-lg font-extrabold"></h5>
					<!-- 메인타이틀-->
					<h3 class="break-keep pb-1 text-4xl font-extrabold">{infoData.name.kr}</h3>
					<!-- 외래어 표기 | 영어, 일본어, 중국어 간체 일부 가능 -->
					<p class=" text-lg font-normal">{infoData.name.en}</p>
				</div>
				<!-- 캐릭터 등급 표기 -->
				<div class="rating-info flex border-b p-2">
					<div class="flex w-1/2 justify-start">
						<h3 class="break-keep pb-1 pr-3 pt-0.5 text-xl font-normal">등급</h3>
						<!-- 레이팅 등급 아이콘 표기시 -->
						<div class="rating-info-img flex w-auto justify-start">
							{#each rarityArray as i}
								<div class="icon h-8 w-5 py-1">
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
						<h3 class="break-keep pb-1 pr-3 pt-0.5 text-xl font-normal">출시일 :</h3>
						<h3 class="break-keep pb-1 pr-3 pt-0.5 text-xl font-extrabold">
							{infoData.releaseDate}
						</h3>
					</div>
				</div>
				<!-- 캐릭터 등급 표기 -->
				<div class="flex w-auto justify-start p-2 pt-3">
					{#if infoData.path}
						<div class=" mr-3 flex h-10">
							<img
								src="/{infoData.path.image.url}.webp"
								class=" mr-2 h-8"
								alt={infoData.path.name.ko}
							/>
							<h3 class="reak-keep pb-1 pr-3 pt-0.5 text-xl font-medium">
								{infoData.path.name.ko}
							</h3>
						</div>
					{/if}
					{#if infoData.element}
						<div class=" mr-3 flex h-6">
							<img
								src="http://localhost:3000/{infoData.element.image.url}.webp"
								class=" mr-2 h-8"
								alt={infoData.element.ko}
							/>
							<h3 class="reak-keep pb-1 pr-3 pt-0.5 text-xl font-medium">
								{infoData.element.name.ko}
							</h3>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- 스크롤 처리 -->
		<div id="info-content" class="h-full w-[inherit] overflow-y-auto">
			<div class="w-full px-5 pt-5">
				<!-- 서포트 카드 처리용 / 기본 틀 -->
				<div
					class="mb-6 w-full rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800"
				>
					<div>
						<h5
							class="border-b border-gray-200 pb-3 pl-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
						>
							추천 광추
						</h5>
					</div>
					<div class="flex w-full justify-start overflow-x-auto p-3 pb-0">
						<!-- 스타레일 / 원신 -->
						{#each cardData as card}
							<div class="card-info mx-6 w-min first:ml-0">
								<div
									class="rating-card border-HY-Rating-{card.rarity} items-center rounded-xl border-8"
								>
									<img
										class="h-auto min-w-36 max-w-52 rounded-xl"
										src="http://localhost:3000/assets/image/item/{card.itemReferences?.image?.art
											?.src}.webp"
										alt=""
									/>
									<div class="rating-info flex w-auto justify-center p-2 pb-0">
										{#each { length: card.rarity } as i}
											<div class="icon h-6 w-6">
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
									class="w-full break-keep px-4 pt-2 text-center text-lg font-bold text-gray-600 dark:text-gray-200"
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
					class="mb-6 w-full rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800"
				>
					<div>
						<h5
							class="border-b border-gray-200 pb-3 pl-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
						>
							추천 유물
						</h5>
					</div>
					<!-- 기본 형태 | 강조 박스형 -->
					<div class="flex w-full p-3">
						{#if infoData.info.itemData.relics}
							<div class="w-auto py-3 pt-0">
								<h5
									class="pb-3 pl-3 text-lg font-bold tracking-tight text-gray-700 dark:text-white"
								>
									터널 유물
								</h5>
								<div class="flex">
									{#each infoData.info.itemData.relics as SpriteItem}
										<div
											style:background={infoContentColor}
											class="mx-4 max-w-sm basis-1/6 rounded-lg border border-gray-200 shadow dark:border-gray-700"
										>
											<div class=" relative h-auto w-full object-scale-down">
												<img
													class=" m-auto min-w-36 max-w-40 items-center p-4"
													src="http://localhost:3000/assets/image/item/{SpriteItem.itemReferences
														.image.src}.webp"
													alt={SpriteItem.name.kr}
												/>
											</div>
											<div class="p-2">
												<h5
													class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white"
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
							<div class="w-auto py-3 pt-0">
								<h5
									class="pb-3 pl-3 text-lg font-bold tracking-tight text-gray-700 dark:text-white"
								>
									차원 유물
								</h5>
								<div class="flex">
									{#each infoData.info.itemData.accessories as AccessoriesItem}
										<div
											style:background={infoContentColor}
											class="mx-4 max-w-sm basis-1/6 rounded-lg border border-gray-200 shadow dark:border-gray-700"
										>
											<div class=" relative h-auto w-full object-scale-down">
												<img
													class=" m-auto min-w-36 max-w-40 items-center p-4"
													src="http://localhost:3000/assets/image/item/{AccessoriesItem
														.itemReferences.image.src}.webp"
													alt={AccessoriesItem.name.kr}
												/>
											</div>
											<div class="p-2">
												<h5
													class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white"
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
						<h5 class="pb-3 pl-3 text-lg font-bold tracking-tight text-gray-700 dark:text-white">
							추천 메인 속성
						</h5>
						<ul class="flex">
							{#each infoData.ItemOpt as Optitem}
								<li class="block flex rounded-lg p-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700">
									<div
										class="image-box mr-3 h-16 w-16 rounded-full bg-gray-400 p-2 dark:bg-gray-800"
									>
										<img
											class="h-full w-full"
											src="/assets/test/content/{infoData.slug}/{Optitem.iconPath}.webp"
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
						<h5 class="pb-3 pl-3 text-lg font-bold tracking-tight text-gray-700 dark:text-white">
							추천 보조 속성
						</h5>
						<div class="flex pb-3 pl-3">
							<h5 class="text-lg font-normal">치명타 확률, 치명타 피해, 공력력%</h5>
						</div>
					</div>
				</div>
				<!-- 행적 육성 - 기본형태와 동일 코드 -->
				<div
					class="mb-6 w-full rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800"
				>
					<div>
						<h5
							class="border-b border-gray-200 pb-3 pl-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
						>
							스킬
						</h5>
					</div>
					<!-- 기본 형태 | 강조 박스형 -->
					<div class="flex w-full p-3">
						<div class="w-auto py-3 pt-0">
							<h5
								class="pb-3 pl-3 text-lg font-bold tracking-tight text-gray-700 dark:text-white"
							></h5>
							<div class="flex">
								<div
									class="mx-4 max-w-sm basis-1/6 rounded-lg border border-gray-200 bg-gray-500 shadow dark:border-gray-700"
								>
									<div class=" relative h-auto w-full object-scale-down">
										<img
											class=" m-auto min-w-36 items-center p-4"
											src="/assets/test/4/3.webp"
											alt=""
										/>
									</div>
									<div class="p-2">
										<h5
											class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white"
										>
											1.전투스킬
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
								<img class="h-full w-full" src="/assets/test/4/3.webp" />
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
				<!-- 성흔 돌파 - 기본형태와 동일 코드 -->
				<div
					class="mb-6 w-full rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800"
				>
					<div>
						<h5
							class="border-b border-gray-200 pb-3 pl-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
						>
							성흔 돌파
						</h5>
					</div>
					<!-- 기본 형태 | 강조 박스형 -->
					<div class="flex w-full p-3">
						<div class="w-auto py-3 pt-0">
							<h5
								class="pb-3 pl-3 text-lg font-bold tracking-tight text-gray-700 dark:text-white"
							></h5>
							<div class="flex">
								<div
									class="mx-4 max-w-sm basis-1/6 rounded-lg border border-gray-200 bg-[#d34e44] shadow dark:border-gray-700"
								>
									<div class=" relative h-auto w-full object-scale-down">
										<img
											class=" m-auto max-w-36 items-center p-4"
											src="/assets/test/5/1.webp"
											alt=""
										/>
									</div>
									<div class="p-2">
										<h5
											class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white"
										>
											1
										</h5>
									</div>
								</div>
								<div
									class="mx-4 max-w-sm basis-1/6 rounded-lg border border-gray-200 bg-[#d34e44] shadow dark:border-gray-700"
								>
									<div class=" relative h-auto w-full object-scale-down">
										<img
											class=" m-auto min-w-36 items-center p-4"
											src="/assets/test/5/2.webp"
											alt=""
										/>
									</div>
									<div class="p-2">
										<h5
											class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white"
										>
											2
										</h5>
									</div>
								</div>
								<div
									class="mx-4 max-w-sm basis-1/6 rounded-lg border border-gray-200 bg-gray-500 shadow dark:border-gray-700"
								>
									<div class=" relative h-auto w-full object-scale-down">
										<img
											class=" m-auto min-w-36 items-center p-4"
											src="/assets/test/5/3.webp"
											alt=""
										/>
									</div>
									<div class="p-2">
										<h5
											class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white"
										>
											3
										</h5>
									</div>
								</div>

								<div
									class="mx-4 max-w-sm basis-1/6 rounded-lg border border-gray-200 bg-gray-500 shadow dark:border-gray-700"
								>
									<div class=" relative h-auto w-full object-scale-down">
										<img
											class=" m-auto min-w-36 items-center p-4"
											src="/assets/test/5/4.webp"
											alt=""
										/>
									</div>
									<div class="p-2">
										<h5
											class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white"
										>
											4
										</h5>
									</div>
								</div>

								<div
									class="mx-4 max-w-sm basis-1/6 rounded-lg border border-gray-200 bg-gray-500 shadow dark:border-gray-700"
								>
									<div class=" relative h-auto w-full object-scale-down">
										<img
											class=" m-auto min-w-36 items-center p-4"
											src="/assets/test/5/5.webp"
											alt=""
										/>
									</div>
									<div class="p-2">
										<h5
											class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white"
										>
											5
										</h5>
									</div>
								</div>

								<div
									class="mx-4 max-w-sm basis-1/6 rounded-lg border border-gray-200 bg-[#d34e44] shadow dark:border-gray-700"
								>
									<div class=" relative h-auto w-full object-scale-down">
										<img
											class=" m-auto min-w-36 items-center p-4"
											src="/assets/test/5/6.webp"
											alt=""
										/>
									</div>
									<div class="p-2">
										<h5
											class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white"
										>
											6
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
								<img class="h-full w-full" src="/assets/test/4/3.webp" />
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
