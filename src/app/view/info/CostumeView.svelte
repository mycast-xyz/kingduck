<script lang="ts">
	import Layer from '../../view-framework/content/ContentLayer.svelte';

	const { listData, currentUrl, isMobile, initData } = $props<{
		listData: any;
		currentUrl: string;
		isMobile: boolean;
		initData: any;
	}>();

	// listData: Array of costume objects { id, name, description, image }
    let costumes = $derived(Array.isArray(listData) ? listData : Object.values(listData || {}));

</script>

<Layer title={initData?.name || '코스튬'}>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        {#each costumes as costume}
            <div class="group relative rounded-lg border border-gray-200 bg-white p-2 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                <div class="aspect-[3/4] w-full overflow-hidden rounded-md bg-gray-100 dark:bg-gray-900">
                     {#if costume.image}
                        <img 
                            src="{currentUrl}/{costume.image}" 
                            alt={costume.name} 
                            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    {:else}
                        <div class="flex h-full w-full items-center justify-center text-gray-400">
                            No Image
                        </div>
                    {/if}
                </div>
                <div class="mt-2 text-center">
                    <h5 class="text-sm font-bold text-gray-900 dark:text-white">{costume.name || '스킨'}</h5>
                    {#if costume.desc}
                        <p class="text-xs text-gray-500 line-clamp-2">{costume.desc}</p>
                    {/if}
                </div>
            </div>
        {/each}
        {#if costumes.length === 0}
            <div class="col-span-full py-8 text-center text-gray-500">
                코스튬 정보가 없습니다.
            </div>
        {/if}
    </div>
</Layer>
