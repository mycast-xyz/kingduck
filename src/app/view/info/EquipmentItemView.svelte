<script lang="ts">
	// 커스텀 서비스 임포트
	import { GameSettingInitService } from '../../service/GameSettingService';
	import { CharacterRarityService } from '../../service/CharacterRarityService';

	// 컴포넌트 임포트
	import Layer from '../../view-framework/content/ContentLayer.svelte';

	const { itemData, propertyBase, currentUrl, isMobile, contentColor } = $props<{
		itemData: any;
		propertyBase: any;
		currentUrl: string;
		isMobile: boolean;
		contentColor: string;
	}>();

	let gameInit: any;
	let rarityService: CharacterRarityService;

	GameSettingInitService.showList.subscribe((value) => {
		gameInit = value;
		if (gameInit) {
			rarityService = new CharacterRarityService(gameInit);
		}
	});

	// 장비 착용 부분에 대한 안내 표시
	const getFormattedType = (relicType: any, gameId: string) => {
		let type = '';
		if (gameId == 'HonkaiStarRail') {
			switch (relicType) {
				case 'BODY':
					type = '몸';
					break;
				case 'FOOT':
					type = '신발';
					break;
				case 'NECK':
					type = '연결 매듭';
					break;
				case 'OBJECT':
					type = '차원 구체';
					break;
				default:
					type = 'ERROR1';
					break;
			}
		} else {
			type = 'ERROR2';
		}
		return type;
	};

	// 스킬 관련 상태 관리
	let selectedList = $state(null);

	// 장비 착용 부분에 대한 안내 표시
	const getFormattedProperty = (property: any, gameId: string) => {
		let result = '';
		if (gameId == 'HonkaiStarRail') {
			const setProperty = {
				HealRatioBase: '치유량 보너스',
				PhysicalAddedRatio: '물리 속성 피해 증가',
				FireAddedRatio: '화염 속성 피해 증가',
				IceAddedRatio: '얼음 속성 피해 증가',
				ThunderAddedRatio: '번개 속성 피해 증가',
				WindAddedRatio: '바람 속성 피해 증가',
				QuantumAddedRatio: '양자 속성 피해 증가',
				ImaginaryAddedRatio: '허수 속성 피해 증가',
				CriticalChanceBase: '치명타 확률',
				CriticalDamageBase: '치명타 피해',
				SPRatioBase: '에너지 회복효율',
				StatusProbabilityBase: '효과 명중',
				StatusResistanceBase: '효과 저항',
				HPDelta: 'HP',
				HPAddedRatio: 'HP%',
				AttackDelta: '공격력',
				AttackAddedRatio: '공격력%',
				DefenceDelta: '방어력',
				DefenceAddedRatio: '방어력%',
				BreakDamageAddedRatioBase: '격파 특수효과',
				SpeedDelta: '속도'
			};
			result = setProperty[property] || 'ERROR1';
		} else {
			result = 'ERROR2';
		}
		return result;
	};

	// 이미지 변수 처리를 위한 구문
	const getFormattedImage = (item: any) => {
		return item.image.src ? item.image.src : item.image;
	};

	// 이름 변수 처리를 위한 구문
	const getFormattedName = (item: any) => {
		// 한국어 이름이 있는 경우
		if (item.name?.kr) {
			return item.name.kr.replace(/<[^>]*>/g, '');
		}

		// Name 속성이 있는 경우
		if (item.name?.Name) {
			return item.name.Name;
		}

		// title 속성이 있는 경우
		if (item.title) {
			return item.title;
		}

		// name이 문자열인 경우
		if (typeof item.name === 'string') {
			return item.name;
		}

		// 기본값
		return '';
	};

	const getFormattedDescription = (item: any, selectedLevel: number) => {
		if (item?.info) {
			let description = item.info;
			if (item.levelData && item.levelData[selectedLevel - 1]?.params) {
				const params = item.levelData[selectedLevel - 1].params;
				description = description
					.replace(/#(\d+)\[(i|f\d)]/g, (match: string) => {
						const num = match.match(/\d+/)?.[0];
						if (!num) return match;
						const index = parseInt(num) - 1;
						let value = params[index] ?? 0;
						if (params[index] < 10) {
							value = params[index] * 100 ?? 0;
						}
						return value.toFixed(1);
					})
					.replace(/color:#FFFFFF/g, '');
			}
			return description || '설명이 없습니다.';
		} else if (item?.Desc) {
			let description = item.Desc;
			if (item.ParamList) {
				description = description.replace(/#(\d)\[(i|f\d)]/g, (match: string) => {
					const num = match.match(/\d/)?.[0];
					if (!num) return match;
					const index = parseInt(num) - 1;
					const value = item.ParamList[index] ?? 0;
					return (value * 100).toFixed(1);
				});
			}
			return description || '설명이 없습니다.';
		} else if (item.params) {
			let description = item.description;
			if (item.params) {
				description = description.replace(/#(\d)\[(i|f\d)]/g, (match: string) => {
					const num = match.match(/\d/)?.[0];
					if (!num) return match;
					const index = parseInt(num) - 1;
					const value = item.params[index] ?? 0;
					return (value * 100).toFixed(1);
				});
			}
			return description || '설명이 없습니다.';
		} else if (item.ParamList) {
			// 스타레일 유물 처리 구문
			let description = item.kr;

			if (item.ParamList) {
				const params = item.ParamList;
				description = description
					.replace(/#(\d+)\[(i|f\d)]/g, (match: string) => {
						const num = match.match(/\d+/)?.[0];
						if (!num) return match;
						const index = parseInt(num) - 1;
						let value = params[index] ?? 0;
						if (params[index] < 1) {
							value = params[index] * 100 ?? 0;
						}
						return value.toFixed(1);
					})
					.replace(/color:#FFFFFF/g, '');
			}
			return description || '설명이 없습니다.';
		} else if (item?.description) {
			return item?.description?.replace(/#(\d)\[(i|f\d)]/g) || '설명이 없습니다.';
		} else {
			return '설명이 없습니다.';
		}
	};
</script>

<Layer title="추천 {gameInit?.content?.info?.item?.name || '아이템'}">
	<!-- 기본 형태 | 강조 박스형 -->
	<div class="flex w-full flex-col p-3 md:flex-row">
		{#if gameInit?.content?.info?.item?.list && itemData}
			{#each Object.entries(gameInit?.content?.info?.item?.list ?? {}) as [key, value]}
				{#if value?.view && itemData?.[key]}
					<div class="w-auto py-3 pt-0">
						<h5
							class="pb-0 pl-0 font-bold tracking-tight text-gray-700 dark:text-white md:pb-3 md:pl-3 md:text-lg"
						>
							{value.name}
						</h5>
						<div class="flex w-full justify-start overflow-x-auto py-3 pb-0">
							{#each itemData[key] as item}
								{#if !isMobile}
									<button
										type="button"
										onclick={() => (selectedList = item)}
										style:background={contentColor}
										class="mx-4 max-w-sm basis-1/6 rounded-lg border border-gray-200 bg-gray-500 shadow dark:border-gray-700"
									>
										<div class="relative h-auto w-full object-scale-down">
											<img
												class="m-auto min-w-36 max-w-40 items-center p-4"
												src="{currentUrl}/{item?.itemReferences?.image?.src ?? ''}.webp"
												alt={item?.name?.kr ?? ''}
											/>
										</div>
										<div class="p-2">
											<h5
												class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white"
											>
												{item?.name?.kr ?? ''}
											</h5>
										</div>
									</button>
								{:else}
									<button
										type="button"
										onclick={() => (selectedList = item)}
										style:background={contentColor}
										class="mx-2 min-w-24 max-w-24 rounded-lg border border-gray-200 bg-gray-500 shadow first:ml-0 dark:border-gray-700"
									>
										<div class=" relative h-auto w-full object-scale-down">
											<img
												class="m-auto min-w-24 max-w-24 items-center p-4"
												src="{currentUrl}/{item?.itemReferences?.image?.src ?? ''}.webp"
												alt={item?.name?.kr ?? ''}
											/>
										</div>
										<div class="-p-1">
											<h5
												class="mb-2 break-keep text-center text-xs font-bold tracking-tight text-white"
											>
												{item?.name?.kr ?? ''}
											</h5>
										</div>
									</button>
								{/if}
							{/each}
						</div>
					</div>
				{/if}
			{/each}
		{/if}
	</div>
	{#if selectedList}
		<div class="w-full border-t border-gray-200 p-3">
			<div class="block flex rounded-lg p-3 px-4">
				<div
					style:background={contentColor}
					class="image-box mr-3 h-16 w-16 flex-none overflow-auto rounded-full bg-gray-400 p-2 dark:bg-gray-800"
				>
					{#if selectedList?.itemReferences?.image}
						<img
							class="h-full w-full"
							src="{currentUrl}/{getFormattedImage(selectedList.itemReferences).replace(
								/\.webp$/,
								''
							)}.webp"
							alt={getFormattedName(selectedList)}
						/>
					{/if}
				</div>
				<div class="flex-1 pt-2">
					<div class="flex items-center justify-between">
						<h5 class="text-xl font-semibold">
							{getFormattedName(selectedList)}
						</h5>
					</div>
					<span class=" text-lg font-normal text-gray-500 dark:text-gray-400">
						{#if selectedList?.itemReferences?.set}
							{#each Object.entries(selectedList?.itemReferences?.set ?? {}) as [key, value]}
								<p>{key}세트 : {@html getFormattedDescription(value)}</p>
							{/each}
						{/if}
					</span>
				</div>
			</div>
		</div>
	{/if}
	<!-- 기본 형태 | 이미지가 들어가는 경우 -->
	{#if gameInit?.content?.info?.item?.option.main && propertyBase.main}
		<div class="w-full border-t border-gray-200 p-3">
			<h5 class="pb-3 pl-3 text-lg font-bold tracking-tight text-gray-700 dark:text-white">
				추천 메인 속성
			</h5>
			<ul class="flex">
				{#each propertyBase.main as Optitem}
					<li class="block flex rounded-lg p-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700">
						<div class="image-box mr-3 h-16 w-16 rounded-full bg-gray-400 p-2 dark:bg-gray-800">
							<img
								class="h-full w-full"
								src="{currentUrl}/assets/image/{gameInit.gameId}/icon/IconRelic{Optitem.relicType}.webp"
							/>
						</div>
						<div class="pt-2">
							<h5 class="text-xl font-semibold">
								{getFormattedProperty(Optitem.property, gameInit.gameId)}
							</h5>
							<span class="font-base text-sm text-gray-500 dark:text-gray-400"
								>{getFormattedType(Optitem.relicType, gameInit.gameId)}</span
							>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
	<!-- 기본 형태 | 텍스트만 표기시 -->
	{#if gameInit?.content?.info?.item?.option.sub && propertyBase.sub}
		<div class="w-full border-t border-gray-200 p-3 pb-0">
			<h5 class="pb-3 pl-3 text-lg font-bold tracking-tight text-gray-700 dark:text-white">
				추천 보조 속성
			</h5>
			<div class="flex pb-3 pl-3">
				<h5 class="text-lg font-normal">
					{#each propertyBase.sub as Optitem}
						{getFormattedProperty(Optitem, gameInit.gameId) + ', '}
					{/each}
				</h5>
			</div>
		</div>
	{/if}
</Layer>
