<script lang="ts">
	import Layer from '../../view-framework/content/ContentLayer.svelte';

	const { listData, currentUrl, isMobile, initData } = $props<{
		listData: any;
		currentUrl: string;
		isMobile: boolean;
		initData: any;
	}>();

	// listData가 객체일 경우 배열로 변환
	let items = $derived(Array.isArray(listData) ? listData : Object.values(listData || {}));

	const getFormattedName = (item: any) => {
		if (item.name?.kr) return item.name.kr.replace(/<[^>]*>/g, '');
		if (item.name?.Name) return item.name.Name;
		if (item.title) return item.title;
        if (typeof item.name === 'string') return item.name;
		return '';
	};

     const getFormattedImage = (item: any) => {
		return item.image.url ? item.image.url : item.image;
	};

	const getFormattedDescription = (item: any) => {
        // ... (Description formatting logic, simplified or reused if possible)
        // For ranks, usually simpler description logic is sufficient, but re-using robust one is safe
        if (item?.info) return item.info;
        if (item?.Desc) return item.Desc;
        if (item?.description) return item.description;
		return '설명이 없습니다.';
	};
</script>

<Layer title={initData?.name || '성흔/공명'}>
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
		{#each items as item, index}
			<div class="flex border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800 shadow-sm transition-all hover:shadow-md">
				<div class="flex-shrink-0 mr-4">
					<div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-transparent hover:border-indigo-500 transition-colors">
                         {#if item?.image?.url}
                             <img
                                class="w-full h-full object-cover"
                                src="{currentUrl}/{getFormattedImage(item).replace(/\.webp$/, '')}.webp"
                                alt={getFormattedName(item)}
                            />
                        {:else}
                            <span class="text-xl font-bold text-gray-400">{index + 1}</span>
                        {/if}
					</div>
				</div>
                <div class="flex-1 min-w-0">
                    <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
                        {getFormattedName(item)}
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 hover:line-clamp-none transition-all">
                        {@html getFormattedDescription(item)}
                    </p>
                </div>
			</div>
		{/each}
	</div>
</Layer>
