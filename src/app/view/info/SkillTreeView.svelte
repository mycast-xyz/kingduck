<script lang="ts">
	import { register } from 'swiper/element/bundle';
	import Layer from '../../view-framework/content/ContentLayer.svelte';
	import { hsrSkillService } from '../../service/game/starrail/HsrSkillService';
	import { wwSkillService } from '../../service/game/wutheringwaves/WwSkillService';

	const { listData, currentUrl, isMobile, initData, extraData, gameId } = $props<{
		listData: any;
		currentUrl: string;
		isMobile: boolean;
		initData: any;
		extraData?: any;
		gameId?: string;
	}>();

	// 스킬 관련 상태 관리
	let activeTab = $state(0);
	// 탭 레이블 (기본값: '캐릭터')
	let tabLabels = $derived(initData?.tabLabels || ['캐릭터']);
	// 추가 데이터 키 (예: 소환수 스킬) - 이제 prop으로 받으므로 여기서 키는 안써도 되지만 display용으로 남겨둠
	let extraDataKey = $derived(initData?.extraDataKey);

	// 현재 표시할 리스트 데이터 계산
	let currentList = $derived.by(() => {
		let data: any = listData;
		if (activeTab === 0) data = listData;
		else if (activeTab === 1) {
			// extraData prop 사용
			data = extraData || [];
		}

		return Array.isArray(data) ? data : Object.values(data || {});
	});

	let selectedList = $state<any>(null);
	let selectedLevel = $state(1);

	// 탭 변경 시 또는 초기 로드 시 선택 자동 설정
	$effect(() => {
		// currentList가 변경되면 첫 번째 항목을 선택
		if (currentList && currentList.length > 0) {
			selectedList = currentList[0];
			selectedLevel = 1;
		} else {
			selectedList = null;
		}
	});

	// 이름 포맷팅
	const getFormattedName = (item: any) => {
		if (item.name?.kr) return item.name.kr.replace(/<[^>]*>/g, '');
		if (item.name?.Name) return item.name.Name;
		if (item.SkillName) return item.SkillName; // WW
		if (item.title) return item.title;
		if (typeof item.name === 'string') return item.name;
		return '';
	};

	// 타입 포맷팅
	const getFormattedType = (item: any) => {
		if (item.type) return item.type;
		if (item.SkillType) return item.SkillType; // WW
		return null;
	};

	// 이미지 포맷팅
	const getFormattedImage = (item: any) => {
		// HSR 스킬 형식
		if (item.iconUrl) return item.iconUrl;
		// WW 형식
		if (item.Icon) return item.Icon;
		// 기존 형식
		return item.image?.url ? item.image.url : item.image;
	};

	// 설명 포맷팅 (HSR/WW 우선, 기존 로직 fallback)
	const getFormattedDescription = (item: any, selectedLevel: number) => {
		// WW 스킬 형식 감지
		if (gameId === 'WutheringWaves' || item.SkillDescribe) {
			let description = wwSkillService.cleanDescription(item.SkillDescribe || '');

			// 계수 정보 추가 (표 형식이 좋겠지만 일단 텍스트로)
			if (item.SkillAttributes && item.SkillAttributes.length > 0) {
				const attrs = wwSkillService.formatAttributes(item.SkillAttributes, selectedLevel);
				let attrText =
					'<div class="mt-4 space-y-1 pt-2 border-t border-gray-200 dark:border-gray-700">';
				attrs.forEach((attr) => {
					attrText += `<div class="flex justify-between text-xs"><span class="text-gray-500">${attr.name}</span><span class="font-medium text-indigo-500">${attr.value}</span></div>`;
				});
				attrText += '</div>';
				description += attrText;
			}
			return description || '설명이 없습니다.';
		}

		// HSR 스킬 형식 감지 (desc + params 필드 존재)
		if (item?.desc && item?.params !== undefined) {
			try {
				const processed = hsrSkillService.processSkill(item);
				// processedDesc를 사용하되, HTML 태그로 변환
				let description = processed.processedDesc
					.replace(/<color=#[^>]+>/g, '<span style="color: #f29e38;">')
					.replace(/<\/color>/g, '</span>')
					.replace(/<unbreak>/g, '')
					.replace(/<\/unbreak>/g, '')
					.replace(/<u>/g, '<span style="text-decoration: underline;">')
					.replace(/<\/u>/g, '</span>');

				return description || '설명이 없습니다.';
			} catch (error) {
				console.error('HSR skill processing error:', error);
				return item.desc || '설명이 없습니다.';
			}
		}

		// 기존 형식들 (다른 게임)
		if (item?.info) {
			let description = item.info;
			if (item.levelData && item.levelData[selectedLevel - 1]?.params) {
				const params = item.levelData[selectedLevel - 1].params;
				description = description
					.replace(/#(\d+)\[(i|f\d)]/g, (match: string) => {
						const num = match.match(/\d+/)?.[0];
						if (!num) return match;
						const index = parseInt(num) - 1;
						let value = params[index] || 0;
						if (params[index] < 10) {
							value = params[index] * 100 || 0;
						}
						return value.toFixed(1);
					})
					.replace(/color:#FFFFFF/g, '');
			}
			if (description.includes('&2&')) {
				description = description.replace(/&2&/g, '<br/>');
				if (description.includes('&10&')) {
					description = description.replace(/&10&/g, '<hr style="margin: 10px 0" />');
				}
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
		} else if (item.params && item.description) {
			let description = item.description;
			if (item.params) {
				description = description.replace(/#(\d+)\[(i|f\d)\]/g, (match: string) => {
					const num = match.match(/\d+/)?.[0];
					if (!num) return match;
					const index = parseInt(num) - 1;
					const value = item.params[index] || 0;
					return (value * 100).toFixed(1);
				});
			}
			return description || '설명이 없습니다.';
		} else if (item?.description) {
			return item?.description?.replace(/#(\d)\[(i|f\d)]/g, '') || '설명이 없습니다.';
		} else {
			return '설명이 없습니다.';
		}
	};
</script>

<Layer title={initData?.name || '스킬'}>
	<!-- 탭 버튼 (탭이 2개 이상일 때만 표시) -->
	{#if initData?.hasTabs}
		<div class="flex border-b border-gray-200 dark:border-gray-700 mb-4">
			{#each tabLabels as label, index}
				<button
					class="px-4 py-2 font-medium text-sm transition-colors relative
                        {activeTab === index
						? 'text-indigo-600 dark:text-indigo-400'
						: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}"
					onclick={() => (activeTab = index)}
				>
					{label}
					{#if activeTab === index}
						<div
							class="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400"
						></div>
					{/if}
				</button>
			{/each}
		</div>
	{/if}

	<div class="flex flex-col md:flex-row gap-4 p-4 max-h-64 overflow-y-auto">
		<!-- 스킬 리스트 (왼쪽/상단) -->
		<div
			class="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:w-1/4 md:border-r border-gray-200 dark:border-gray-700 pr-2"
		>
			{#each currentList as item}
				<button
					class="flex items-center gap-3 p-2 rounded-lg transition-colors text-left
                        {selectedList === item
						? 'bg-gray-200 dark:bg-gray-700'
						: 'hover:bg-gray-100 dark:hover:bg-gray-800'}"
					onclick={() => {
						selectedList = item;
						selectedLevel = 1;
					}}
				>
					<div
						class="w-10 h-10 flex-shrink-0 bg-gray-300 dark:bg-gray-600 rounded-full p-1 overflow-hidden"
					>
						{#if getFormattedImage(item)}
							<img
								class="w-full h-full object-contain"
								src="{currentUrl}/{getFormattedImage(item)}"
								alt={getFormattedName(item)}
							/>
						{/if}
					</div>
					<span class="font-medium text-sm text-gray-900 dark:text-gray-100 hidden md:block">
						{getFormattedName(item)}
					</span>
				</button>
			{/each}
		</div>

		<!-- 스킬 상세 (오른쪽/하단) -->
		<div class="flex-1 max-h-64 overflow-y-auto">
			{#if selectedList}
				<div class="flex flex-col h-full">
					<div
						class="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700 pb-2"
					>
						<div class="flex items-center gap-3">
							<div class="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg p-1">
								{#if getFormattedImage(selectedList)}
									<img
										class="w-full h-full object-contain"
										src="{currentUrl}/{getFormattedImage(selectedList)}"
										alt={getFormattedName(selectedList)}
									/>
								{/if}
							</div>
							<div>
								<h3 class="text-xl font-bold text-gray-900 dark:text-white">
									{getFormattedName(selectedList)}
								</h3>
								{#if getFormattedType(selectedList)}
									<span class="text-sm text-gray-500 dark:text-gray-400">
										[{getFormattedType(selectedList)}]
									</span>
								{/if}
							</div>
						</div>

						{#if selectedList?.levelData || selectedList?.SkillAttributes}
							<div class="flex items-center gap-2">
								<span class="text-sm font-medium">Lv. {selectedLevel}</span>
								<input
									type="range"
									class="w-32 accent-indigo-600"
									min="1"
									max={selectedList.levelData
										? selectedList.levelData.length
										: selectedList.SkillAttributes?.[0]?.values?.length || 10}
									bind:value={selectedLevel}
								/>
							</div>
						{/if}
					</div>

					<div class="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
						{@html getFormattedDescription(selectedList, selectedLevel)}
					</div>
				</div>
			{:else}
				<div class="flex items-center justify-center h-full text-gray-500">
					스킬을 선택해주세요.
				</div>
			{/if}
		</div>
	</div>
</Layer>
