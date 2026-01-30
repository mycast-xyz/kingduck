<script lang="ts">
	import Layer from '../../view-framework/content/ContentLayer.svelte';

	const { listData, currentUrl, isMobile, initData } = $props<{
		listData: any;
		currentUrl: string;
		isMobile: boolean;
		initData: any;
	}>();

    // 입력 데이터: { HP, Attack, Defense, Speed } 등 (Lv 80 기준)
    // 혹은 배열 [{name: 'HP', value: 1241}, ...]
    
    // listData가 객체라면 배열로 변환
    let stats = $derived.by(() => {
        if (Array.isArray(listData)) return listData;
        if (!listData) return [];
        // 미리 정해진 순서대로 출력 (HP -> 공 -> 방 -> 속도)
        const order = ['HP', 'Attack', 'Defense', 'Speed', 'Taunt'];
        const labels: Record<string, string> = {
            'HP': 'HP',
            'Attack': '공격력',
            'Defense': '방어력',
            'Speed': '속도',
            'Taunt': '도발'
        };
        const icons: Record<string, string> = {
            // 아이콘 경로가 있다면 추가
             'HP': 'icon/hp.webp',
            'Attack': 'icon/attack.webp',
            'Defense': 'icon/defense.webp',
            'Speed': 'icon/speed.webp',
            'Taunt': 'icon/taunt.webp'
        };

        return order.map(key => {
            if (listData[key] !== undefined) {
                return {
                    key,
                    name: labels[key] || key,
                    value: Math.floor(listData[key]), // 소수점 제거
                    icon: icons[key]
                };
            }
            return null;
        }).filter(item => item !== null);
    });

</script>

<Layer title={initData?.name || '기초 속성'}>
    <div class="flex flex-wrap justify-around p-4 gap-4">
        {#each stats as stat}
            <div class="flex flex-col items-center min-w-[80px]">
                <div class="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full mb-2">
                    <!-- 아이콘 대신 텍스트 약어 사용 -->
                     <span class="text-xs font-bold text-gray-500 dark:text-gray-400">{stat.key.substring(0, 3).toUpperCase()}</span>
                </div>
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</span>
                <span class="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</span>
            </div>
        {/each}
        {#if stats.length === 0}
             <div class="text-gray-500">데이터가 없습니다.</div>
        {/if}
    </div>
</Layer>
