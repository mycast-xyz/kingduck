<script lang="ts">
	import { GameSettingInitService } from '../../service/GameSettingService';
	import { CharacterRarityService } from '../../service/CharacterRarityService';

	const { data } = $props<{ data: any }>();

	// url 정보 초기화
	const currentUrl = data.url;

	// 캐릭터 정보 데이터 초기화
	let infoData = data.info;

	// 게임 초기화 정보 초기화
	let gameInit: any;
	let rarityService: CharacterRarityService;

	GameSettingInitService.showList.subscribe((value) => {
		gameInit = value;
		if (gameInit) {
			rarityService = new CharacterRarityService(gameInit);
		}
	});

	// 비디오 재생 상태 관리
	let paused = $state(false);

	// 이미지 슬라이더 관련 상태 관리
	let slideIndex = $state(0);
	let slideData = $state(infoData.images);
	let currentSlide = $derived.by(() => {
		return slideData[slideIndex];
	});

	// 비디오 재생/일시정지 토글 함수
	const togglePause = () => {
		paused = !paused;
	};

	// 슬라이드 제어 함수
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

<!-- 캐릭터 이미지 표기 처리 -->
<div id="info-image" class="relative h-full w-full md:h-screen md:w-1/3 md:max-w-2xl">
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
						class="absolute left-1/2 top-1/2 block h-full w-full -translate-x-1/2 -translate-y-1/2 object-cover object-top pt-16 md:p-0"
						alt="..."
					/>
				{/if}
			</div>
		</div>
		<!-- Slider controls -->
		{#each [{ type: 'PREV', icon: 'ri-arrow-left-s-line', label: 'Previous', position: 'start-0' }, { type: 'NEXT', icon: 'ri-arrow-right-s-line', label: 'Next', position: 'end-0' }] as { type, icon, label, position }}
			<!-- svelte-ignore event_directive_deprecated -->
			<button
				type="button"
				onclick={() => controlSlide(type)}
				class="group absolute {position} top-0 z-30 flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none"
			>
				<span
					class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/30 group-hover:bg-white/50 group-focus:outline-none group-focus:ring-0 group-focus:ring-white dark:bg-gray-800/30 dark:group-hover:bg-gray-800/60 dark:group-focus:ring-gray-800/70"
				>
					<i class={icon}></i>
					<span class="sr-only">{label}</span>
				</span>
			</button>
		{/each}
	</div>

	<!-- 캐릭터 이름 / 정보 표기 -->
	<div
		id="info-image-card"
		class="absolute inset-x-0 -bottom-4 h-72 w-full px-2 text-white md:bottom-0 md:h-80 md:px-6"
	>
		<!-- 캐릭터 이름 표기 -->
		<div id="info-title" class="w-full border-b px-2 pb-3 pt-20">
			<!--서브타이틀-->
			<h5 class="break-keep pb-1 text-lg font-extrabold"></h5>
			<!-- 메인타이틀-->
			<h3 class="break-keep pb-1 text-3xl font-extrabold md:text-4xl">{infoData.name.kr}</h3>
			<!-- 외래어 표기 | 영어, 일본어, 중국어 간체 일부 가능 -->
			<p class="text-lg font-normal">{infoData.name.en}</p>
		</div>
		<!-- 캐릭터 등급 표기 -->
		<div class="rating-info flex border-b p-2">
			<div class="flex w-1/2 items-center justify-start md:items-start">
				<h3 class="break-keep text-lg font-normal md:pb-1 md:pr-3 md:pt-0.5">등급</h3>
				<!-- 레이팅 등급 아이콘 표기시 -->
				<div class="rating-info-img ml-3 flex w-auto items-center justify-start md:ml-0">
					{#if rarityService?.rarityType(infoData.rarity) === 'number'}
						{#each { length: infoData.rarity } as i}
							<div class="icon h-3 w-3 md:h-5 md:w-5 md:pt-2">
								<svg
									id="_레이어_1"
									data-name="레이어_1"
									xmlns="http://www.w3.org/2000/svg"
									version="1.1"
									viewBox="0 0 50 50"
								>
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
					{:else}
						<h5 class="break-keep pb-1 text-base font-extrabold drop-shadow-md">
							{infoData.rarity}
						</h5>
					{/if}
				</div>
			</div>
			<div class="flex w-1/2 justify-start">
				<h3 class="break-keep pb-1 pr-1 pt-0.5 text-lg font-normal md:pr-3">출시일 :</h3>
				<h3 class="break-keep pb-1 pr-1 pt-0.5 text-lg font-extrabold md:pr-3">
					{infoData.releaseDate}
				</h3>
			</div>
		</div>
		<!-- 캐릭터 타입 표기 -->
		<div class="flex w-auto justify-start p-2 pt-3">
			{#each Object.entries(infoData.type) as [key, value]}
				{#if value?.image?.url}
					<div class="mr-4 flex h-6">
						<img src="{currentUrl}/{value.image.url}.webp" class="mr-2 h-6 pt-1" alt="" />
						<h3 class="text-lg font-medium md:text-xl">
							{value.name.ko}
						</h3>
					</div>
				{/if}
			{/each}
		</div>
	</div>
</div>

<style>
	#info-image-card {
		background: rgb(0, 0, 0);
		background: -moz-linear-gradient(0deg, rgba(0, 0, 0, 0.75) 75%, rgba(0, 0, 0, 0) 100%);
		background: -webkit-linear-gradient(0deg, rgba(0, 0, 0, 0.75) 75%, rgba(0, 0, 0, 0) 100%);
		background: linear-gradient(0deg, rgba(0, 0, 0, 0.75) 75%, rgba(0, 0, 0, 0) 100%);
		filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#000000",endColorstr="#000000",GradientType=1);
	}
</style>
