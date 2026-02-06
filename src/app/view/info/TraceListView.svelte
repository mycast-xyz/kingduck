<script lang="ts">
	import Layer from '../../view-framework/content/ContentLayer.svelte';
	import { EndfieldFactoryViewModel } from '../../service/game/endfield/EndfieldFactoryViewModel.svelte';

	const {
		listData,
		currentUrl,
		isMobile,
		initData,
		title,
		cols = 3,
		gameId,
		vmType
	} = $props<{
		listData: any;
		currentUrl: string;
		isMobile: boolean;
		initData: any;
		title?: string;
		cols?: number;
		gameId?: any;
		vmType?: string;
	}>();

	import { Reverse1999TraceViewModel } from '../../service/game/reverse1999/Reverse1999TraceViewModel.svelte';

	// VM Integration
	let vm = $derived.by(() => {
		const targetGameId = gameId || initData?.gameId;
		if ((targetGameId === 'endfield' || targetGameId === 13) && vmType === 'factory') {
			return new EndfieldFactoryViewModel(listData, currentUrl);
		} else if (targetGameId === 'Reverse1999' || targetGameId === 6) {
			return new Reverse1999TraceViewModel(listData);
		}
		return null;
	});

	// Data preparation
	let nodes = $derived(
		vm ? vm.items : Array.isArray(listData) ? listData : Object.values(listData || {})
	);

	// ... (Existing logic for majorTraces/statTraces - keep as fallback or when no VM)
	let majorTraces = $derived.by(() => {
		if (vm) return nodes; // If VM exists, all items are "major"
		return nodes.filter((node: any) => node.Desc || node.description || node.PropertyNodeDescribe);
	});

	let statTraces = $derived.by(() => {
		if (vm) return []; // VM handles everything manually for now
		return nodes.filter(
			(node: any) => !node.Desc && !node.description && !node.PropertyNodeDescribe
		);
	});

	// ... (Existing statSummary logic - safe to keep as it uses statTraces which is empty for VM)
	let statSummary = $derived.by(() => {
		const summary: Record<string, number> = {};
		statTraces.forEach((node: any) => {
			const name = node.Name || node.name || node.PropertyNodeTitle;
			const value = node.ParamList?.[0] || node.params?.[0]?.value || node.Value || 0;

			if (name) {
				summary[name] = (summary[name] || 0) + value;
			}
		});
		return Object.entries(summary).map(([key, value]) => ({
			name: key,
			value: (value * 100).toFixed(1) + '%'
		}));
	});

	const getFormattedName = (item: any) => {
		if (item.name?.kr) return item.name.kr.replace(/<[^>]*>/g, '');
		if (item.name?.Name) return item.name.Name;
		if (item.PropertyNodeTitle) return item.PropertyNodeTitle;
		if (item.title) return item.title;
		if (typeof item.name === 'string') return item.name;
		return '';
	};

	const getFormattedImage = (item: any) => {
		return item.Icon || item.PropertyNodeIcon
			? item.Icon || item.PropertyNodeIcon
			: item.image?.url || '';
	};

	const getFormattedDescription = (item: any) => {
		let desc = item.Desc || item.description || item.PropertyNodeDescribe || '';
		if (item.ParamList) {
			desc = desc.replace(/#(\d)\[(i|f\d)]/g, (match: string) => {
				const num = match.match(/\d/)?.[0];
				if (!num) return match;
				const index = parseInt(num) - 1;
				const value = item.ParamList[index] ?? 0;
				return (value * 100).toFixed(1);
			});
		}
		return desc;
	};

	// Dynamic grid class
	let gridClass = $derived(
		cols === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'
	);
</script>

<Layer title={title || initData?.name || '행적'}>
	<div class="p-4 space-y-6">
		<div class="grid {gridClass} gap-4">
			{#each majorTraces as trace}
				<div
					class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm"
				>
					<div class="flex items-center mb-3">
						<div
							class="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center mr-3 overflow-hidden"
						>
							{#if getFormattedImage(trace)}
								<img
									src="{currentUrl}/{getFormattedImage(trace)}"
									alt={getFormattedName(trace)}
									class="w-8 h-8"
								/>
							{:else}
								<span class="text-xs">IMG</span>
							{/if}
						</div>
						<h4 class="font-bold text-gray-900 dark:text-white text-sm">
							{getFormattedName(trace)}
						</h4>
					</div>
					<p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
						{@html getFormattedDescription(trace)}
					</p>
				</div>
			{/each}
		</div>

		{#if statSummary.length > 0}
			<div class="border-t border-gray-200 dark:border-gray-700 pt-4">
				<h4 class="font-bold text-gray-900 dark:text-white mb-3 text-sm">속성 보너스 합계</h4>
				<div class="flex flex-wrap gap-2">
					{#each statSummary as stat}
						<div
							class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium text-gray-700 dark:text-gray-300"
						>
							{stat.name}
							<span class="text-indigo-600 dark:text-indigo-400 ml-1">+{stat.value}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</Layer>
