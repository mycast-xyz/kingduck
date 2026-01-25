<script lang="ts">
	import { GameSettingInitService } from '../../service/game/GameSettingService';
	import { CharacterRarityService } from '../../service/character/CharacterRarityService';

	const { data, list } = $props<{ data: any; list: any }>();
	const currentUrl = data.url;

	let gameInit: any;
	let rarityService = $state<CharacterRarityService>();

	GameSettingInitService.showList.subscribe((value) => {
		gameInit = value;
		if (gameInit) {
			rarityService = new CharacterRarityService(gameInit);
		}
	});

	// element 이미지 경로 생성
	const getElementImageUrl = (element: any, isMobile: boolean = false) => {
		if (!element || !gameInit?.list?.card?.element) {
			// 기본값: iconUrl이 있으면 사용
			return element?.iconUrl ? `${currentUrl}/${element.iconUrl}` : '';
		}

		const cardConfig = gameInit.list.card.element;

		if (cardConfig.display === 'path' && isMobile && cardConfig.mobilePath) {
			// 모바일: 하드코딩된 경로 패턴 사용
			return cardConfig.mobilePath
				.replace('{gameSlug}', data.params)
				.replace('{elementName}', element.name || '');
		} else if (cardConfig.display === 'iconUrl' || !isMobile) {
			// 데스크톱 또는 iconUrl 모드: API에서 받은 iconUrl 사용
			return element.iconUrl ? `${currentUrl}/${element.iconUrl}` : '';
		} else {
			// 기본값
			return element.iconUrl ? `${currentUrl}/${element.iconUrl}` : '';
		}
	};

	// path 표시 여부 확인
	const shouldShowPath = $derived(gameInit?.list?.card?.path?.display ?? false);

	// 등급별 색상 가져오기 (반응형)
	const getRarityColor = (rarity: any) => {
		if (!gameInit?.list?.card?.rarityColors || !rarityService) {
			console.log('getRarityColor: missing gameInit or rarityService', {
				hasGameInit: !!gameInit,
				hasRarityColors: !!gameInit?.list?.card?.rarityColors,
				hasRarityService: !!rarityService,
				rarity
			});
			return null;
		}

		const rarityData = rarityService.rarityData(rarity);
		console.log('getRarityColor: rarityData', { rarity, rarityData, rarityType: typeof rarity });

		if (rarityData === undefined || rarityData === null || rarityData === 0) {
			console.log('getRarityColor: invalid rarityData', { rarityData });
			return null;
		}

		const colorKey = rarityData.toString();
		const colors = gameInit.list.card.rarityColors[colorKey];
		console.log('getRarityColor: result', {
			colorKey,
			colors,
			availableKeys: Object.keys(gameInit.list.card.rarityColors)
		});
		return colors || null;
	};

	// 카드 배경 스타일 생성 (반응형)
	const getCardStyle = (rarity: any) => {
		const colors = getRarityColor(rarity);
		if (!colors) return '';

		if (colors.gradient) {
			return `background: linear-gradient(180deg, ${colors.gradient.from}, ${colors.background} ${colors.gradient.stop}); border-bottom-color: ${colors.background};`;
		} else {
			return `background: ${colors.background}; border-bottom-color: ${colors.background};`;
		}
	};

	// 카드 배경 그라데이션 스타일 생성 (반응형)
	const getCardBgStyle = (rarity: any) => {
		const colors = getRarityColor(rarity);
		if (!colors) return '';

		const bgColor = colors.background;

		// OKLCH 색상인 경우
		if (bgColor.startsWith('oklch(')) {
			// oklch(L C H) 형식에서 투명도만 조정
			const oklchMatch = bgColor.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
			if (oklchMatch) {
				const [, l, c, h] = oklchMatch;
				return `background: linear-gradient(0deg, oklch(${l} ${c} ${h} / 1) 0%, oklch(${l} ${c} ${h} / 0) 100%);`;
			}
		}

		// HEX 색상인 경우 (#RRGGBB)
		if (bgColor.startsWith('#')) {
			const rgb = hexToRgb(bgColor);
			if (rgb) {
				return `background: linear-gradient(0deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0) 100%);`;
			}
		}

		// 기본값
		return `background: ${bgColor};`;
	};

	// 헥스 색상을 RGB로 변환 (HEX 색상 지원용)
	const hexToRgb = (hex: string) => {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? {
					r: parseInt(result[1], 16),
					g: parseInt(result[2], 16),
					b: parseInt(result[3], 16)
				}
			: null;
	};
</script>

<div class="con flex h-auto w-full flex-wrap content-start items-stretch justify-start">
	{#if list && list.length > 0}
		{#each list as item}
			{@const cardStyle = getCardStyle(item.rarity)}
			{@const cardBgStyle = getCardBgStyle(item.rarity)}
			{#if data.isMobile}
				<a class="flex-box basis-1/3" href="/content/{data.params}/{item.id}">
					<div
						class="shadow-m relative m-2 block h-[190px] overflow-hidden rounded-lg border border-gray-100 pb-6 text-white"
						style={cardStyle || undefined}
					>
						<div class="rounded-t-lg" style={cardStyle || undefined}>
							<img src="{currentUrl}/{item.imageUrl}" alt={item.name} width="100%" />
						</div>
						<div
							class="image-info absolute inset-x-0 bottom-0 px-2 py-2"
							style={cardBgStyle || undefined}
						>
							<h5 class="break-keep pb-1 text-base font-extrabold"></h5>
							<h3 class="break-keep pb-1 text-base font-extrabold drop-shadow-md">
								{item.name}
							</h3>
							<div class="flex w-full justify-start">
								<div class="rating-info-img flex w-auto justify-start">
									{#if rarityService?.rarityType(item.rarity) === 'number'}
										{#each { length: item.rarity } as i}
											<div class="icon h-5 w-3 py-1">
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
											{item.rarity}
										</h5>
									{/if}
								</div>
								<div class="ml-auto flex w-auto justify-start">
									{#if item.element?.name}
										<div class="ml-1 flex h-6">
											<img src={getElementImageUrl(item.element, true)} class="h-6" alt="" />
										</div>
									{/if}
								</div>
							</div>
						</div>
					</div>
				</a>
			{:else}
				<a
					class="shadow-m relative m-2 block h-[390px] w-60 overflow-hidden rounded-lg border border-gray-100 pb-14 text-white"
					href="/content/{data.params}/{item.id}"
					style={cardStyle || undefined}
				>
					<div class="relative rounded-t-lg" style={cardStyle || undefined}>
						<img src="{currentUrl}/{item.imageUrl}" alt={item.name} width="100%" />

						<div
							class="image-info absolute inset-x-0 bottom-0 h-16 px-4 py-2"
							style={cardBgStyle || undefined}
						></div>
					</div>
					<div
						class="image-info absolute inset-x-0 bottom-0 px-4 py-2"
						style={cardBgStyle || undefined}
					>
						<h5 class="break-keep pb-1 text-base font-extrabold"></h5>
						<h3 class="break-keep pb-1 text-xl font-extrabold drop-shadow-md">{item.name}</h3>

						<div class="flex w-full justify-start">
							<div class="rating-info-img flex w-auto justify-start">
								{#if rarityService?.rarityType(item.rarity) === 'number'}
									{#each { length: item.rarity } as i}
										<div class="icon h-8 w-5 py-1">
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
										{item.rarity}
									</h5>
								{/if}
							</div>
							<div class="ml-auto flex w-auto justify-start">
								{#if item.element?.name}
									<div class="ml-1 flex h-6">
										<img src={getElementImageUrl(item.element)} class="h-6" alt="" />
									</div>
								{/if}
								{#if shouldShowPath && item.path?.name}
									<div class="ml-1 flex h-6">
										<img src="{currentUrl}/{item.path.iconUrl}" class="h-6" alt="" />
									</div>
								{/if}
							</div>
						</div>
					</div>
				</a>
			{/if}
		{/each}
	{:else}
		<div
			class="flex h-[50vh] w-full flex-col items-center justify-center text-center text-black dark:text-gray-200"
		>
			<i class="ri-search-2-line mb-4 text-4xl"></i>
			<span class="text-lg">검색 결과가 없습니다.</span>
		</div>
	{/if}
</div>

<style lang="scss">
	/* 호요버스 - 원신, 스타레일 색상 처리*/
	.border-Rating-5 {
		border-color: #fcba49;
		background-color: #fcba49;
	}
	.border-Rating-4 {
		border-color: #9f66c8;
		background-color: #9f66c8;
	}
	.border-Rating-3 {
		border-color: #4175bb;
		background-color: #4175bb;
	}
	.card-Rating-5 {
		background: #c9a36a;
		background: linear-gradient(180deg, #885550, #c9a36a 53%);
		border-bottom-color: #c9a36a;
	}
	.card-Rating-5-bg {
		background: rgb(201, 163, 106);
		background: linear-gradient(0deg, rgba(201, 163, 106, 1) 0%, rgba(201, 163, 106, 0) 100%);
	}
	.card-Rating-4 {
		background: #8a5fcc;
		background: linear-gradient(180deg, #343659, #8a5fcc 53%);
		border-bottom-color: #8a5fcc;
	}
	.card-Rating-4-bg {
		background: rgb(138, 95, 204);
		background: linear-gradient(0deg, rgba(138, 95, 204, 1) 0%, rgba(138, 95, 204, 0) 100%);
	}
	.card-Rating-3 {
		background: #4175bb;
		background: linear-gradient(180deg, #303051, #4175bb 53%);
		border-bottom-color: #4175bb;
	}
	.card-Rating-3-bg {
		background: rgb(65, 117, 187);
		background: linear-gradient(0deg, rgba(65, 117, 187, 1) 0%, rgba(65, 117, 187, 0) 100%);
	}

	/* 호요버스 - 원신, 스타레일 색상 처리*/
	.text-Rating-5 {
		color: #fcba49;
	}
	.text-Rating-4 {
		color: #9f66c8;
	}
	.text-Rating-3 {
		color: #4175bb;
	}
</style>
