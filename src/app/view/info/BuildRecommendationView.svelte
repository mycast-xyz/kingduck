<script lang="ts">
	import Layer from '../../view-framework/content/ContentLayer.svelte';

	const { listData, currentUrl, isMobile, initData } = $props<{
		listData: any;
		currentUrl: string;
		isMobile: boolean;
		initData: any;
	}>();

    // listData 형식: { relics, lightcones, teams, stats } 가정
    let relics = $derived(Array.isArray(listData?.relics) ? listData.relics : Object.values(listData?.relics || []));
    let lightcones = $derived(Array.isArray(listData?.lightcones) ? listData.lightcones : Object.values(listData?.lightcones || []));
    let teams = $derived(Array.isArray(listData?.teams) ? listData.teams : Object.values(listData?.teams || []));
    let mainStats = $derived(listData?.stats?.main || []);
    let subStats = $derived(listData?.stats?.sub || []);

</script>

<Layer title={initData?.name || '추천 세팅'}>
    <div class="p-4 space-y-6">
        
        <!-- 광추 추천 -->
        {#if lightcones.length > 0}
        <div>
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3 border-l-4 border-indigo-500 pl-2">추천 광추</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                {#each lightcones as lc}
                    <div class="flex items-center p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800">
                        <div class="w-10 h-auto mr-3">
                             <img src="{currentUrl}/{lc.id}.webp" alt={lc.name} class="w-full object-cover rounded" />
                        </div>
                        <div>
                            <h5 class="text-sm font-semibold text-gray-900 dark:text-white">{lc.name}</h5>
                            {#if lc.desc}<p class="text-xs text-gray-500">{lc.desc}</p>{/if}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
        {/if}

        <!-- 유물 추천 -->
        {#if relics.length > 0}
        <div>
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3 border-l-4 border-indigo-500 pl-2">추천 유물</h4>
            <div class="space-y-3">
                 {#each relics as set}
                    <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                        <div class="flex items-center gap-2">
                            <!-- 유물 아이콘들 -->
                            {#each set.items as item}
                                <img src="{currentUrl}/relics/{item}.webp" class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600" alt="" />
                            {/each}
                            <span class="text-sm font-medium text-gray-800 dark:text-gray-200 ml-2">{set.name}</span>
                        </div>
                        {#if set.desc}<span class="text-xs text-gray-500">{set.desc}</span>{/if}
                    </div>
                 {/each}
            </div>
        </div>
        {/if}

        <!-- 추천 조합 -->
        {#if teams.length > 0}
        <div>
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3 border-l-4 border-indigo-500 pl-2">추천 조합</h4>
            <div class="space-y-3">
                 {#each teams as team}
                    <div class="p-3 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800">
                        <div class="flex items-center justify-between mb-2">
                            <h5 class="text-sm font-semibold text-gray-900 dark:text-white">{team.name || 'Team'}</h5>
                            {#if team.desc}<span class="text-xs text-gray-500">{team.desc}</span>{/if}
                        </div>
                        <div class="flex flex-wrap gap-2">
                            {#each team.members as member}
                                <div class="relative w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden border border-gray-200 dark:border-gray-600" title={member.name}>
                                    <img src="{currentUrl}/{member.id}.webp" alt={member.name} class="w-full h-full object-cover" />
                                     {#if member.role}
                                        <div class="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-white text-center leading-none py-0.5">
                                            {member.role}
                                        </div>
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    </div>
                 {/each}
            </div>
        </div>
        {/if}

        <!-- 주요 옵션 -->
        {#if mainStats.length > 0 || subStats.length > 0}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
             {#if mainStats.length > 0}
            <div>
                <h4 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Main Stats</h4>
                <div class="flex flex-wrap gap-2">
                    {#each mainStats as stat}
                        <span class="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded font-medium">{stat}</span>
                    {/each}
                </div>
            </div>
            {/if}
            {#if subStats.length > 0}
            <div>
                <h4 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Sub Stats</h4>
                 <div class="flex flex-wrap gap-2">
                    {#each subStats as stat}
                        <span class="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded font-medium">{stat}</span>
                    {/each}
                </div>
            </div>
            {/if}
        </div>
        {/if}
    </div>
</Layer>
