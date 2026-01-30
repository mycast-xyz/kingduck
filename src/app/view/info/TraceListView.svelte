<script lang="ts">
	import Layer from '../../view-framework/content/ContentLayer.svelte';

	const { listData, currentUrl, isMobile, initData } = $props<{
		listData: any;
		currentUrl: string;
		isMobile: boolean;
		initData: any;
	}>();

    // 입력 데이터는 skill_tree 전체 객체라고 가정 (Node map)
    // listData가 객체라면 배열로 변환
    let nodes = $derived(Array.isArray(listData) ? listData : Object.values(listData || {}));
    
    // 주요 행적 (A2, A4, A6 - 보통 PointType이 3인 것들, 혹은 아이콘이 큰 것들)
    // 여기서는 간단히 이름이나 Description이 있는 항목을 주요 행적으로 간주하거나, 
    // HSR 데이터 특성상 'PointType': 3 (Special Ability) 등을 확인해야 함.
    // 사용자가 제공한 데이터에는 PointType 필드가 안보임. 
    // 하지만 보통 주요 행적은 'Name'과 'Desc'가 있고, 스탯 보너스는 'Name'이 스탯 이름이고 'Desc'가 없음.
    // 따라서, 'Desc'가 있는 항목을 주요 행적으로 분류.
    
    let majorTraces = $derived(nodes.filter((node: any) => node.Desc || node.description));
    let statTraces = $derived(nodes.filter((node: any) => !node.Desc && !node.description));

    // 스탯 요약 계산
    let statSummary = $derived.by(() => {
        const summary: Record<string, number> = {};
        statTraces.forEach((node: any) => {
            // 이름 예: "공격력", "얼음 속성 피해 증가"
            const name = node.Name || node.name;
            // 값: ParamList[0] (보통 소수점 단위)
            const value = (node.ParamList?.[0] || node.params?.[0]?.value || 0);

            if (name) {
                summary[name] = (summary[name] || 0) + value;
            }
        });
        return Object.entries(summary).map(([key, value]) => ({
            name: key,
            value: (value * 100).toFixed(1) + '%' // 퍼센트라고 가정
        }));
    });

	const getFormattedName = (item: any) => {
		if (item.name?.kr) return item.name.kr.replace(/<[^>]*>/g, '');
		if (item.name?.Name) return item.name.Name;
		if (item.title) return item.title;
        if (typeof item.name === 'string') return item.name;
		return '';
	};

    const getFormattedImage = (item: any) => {
		return item.Icon ? item.Icon : (item.image?.url || '');
	};
    
    const getFormattedDescription = (item: any) => {
        // HSR Simple Desc processing if needed
        let desc = item.Desc || item.description || '';
        if (item.ParamList) {
				desc = desc.replace(/#(\d)\[(i|f\d)]/g, (match: string) => {
					const num = match.match(/\d/)?.[0];
					if (!num) return match;
					const index = parseInt(num) - 1;
					const value = item.ParamList[index] ?? 0;
                    // 값 포맷팅 (정수형인지 소수형인지 판단 필요하지만 일단 소수로 가정)
					return (value * 100).toFixed(1); // 대부분 퍼센트
				});
        }
        return desc;
    };
</script>

<Layer title={initData?.name || '행적'}>
    <div class="p-4 space-y-6">
        <!-- 주요 행적 (카드형) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            {#each majorTraces as trace}
                <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
                    <div class="flex items-center mb-3">
                        <div class="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                             {#if getFormattedImage(trace)}
                                <img src="https://api.hakush.in/hsr/UI/skilltree/{getFormattedImage(trace)}.webp" alt={getFormattedName(trace)} class="w-8 h-8" />
                             {:else}
                                <span class="text-xs">IMG</span>
                             {/if}
                        </div>
                        <h4 class="font-bold text-gray-900 dark:text-white text-sm">{getFormattedName(trace)}</h4>
                    </div>
                    <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        {@html getFormattedDescription(trace)}
                    </p>
                </div>
            {/each}
        </div>

        <!-- 스탯 보너스 요약 (리스트형) -->
        {#if statSummary.length > 0}
            <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 class="font-bold text-gray-900 dark:text-white mb-3 text-sm">속성 보너스 합계</h4>
                <div class="flex flex-wrap gap-2">
                    {#each statSummary as stat}
                        <div class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium text-gray-700 dark:text-gray-300">
                            {stat.name} <span class="text-indigo-600 dark:text-indigo-400 ml-1">+{stat.value}</span>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
</Layer>
