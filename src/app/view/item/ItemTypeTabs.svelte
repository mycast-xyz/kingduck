<script lang="ts">
	import type { ItemTab } from '../../model/game/itemTabs';

	const { tabs, active, onSelect } = $props<{
		tabs: ItemTab[];
		active: string;
		onSelect: (type: string) => void;
	}>();
</script>

<div class="flex flex-wrap gap-2">
	{#each tabs as tab}
		<button
			type="button"
			class="rounded-full border px-5 py-2 text-sm font-semibold transition-colors"
			class:active={active === tab.type}
			onclick={() => onSelect(tab.type)}
		>
			{tab.label}
		</button>
	{/each}
</div>

<style lang="scss">
	button {
		border-color: #e5e7eb;
		background: #ffffff;
		color: #374151;
		&:hover {
			background: #f3f4f6;
		}
		&.active {
			background: #f9822c;
			border-color: #f9822c;
			color: #ffffff;
		}
	}
	:global(.dark) button {
		border-color: #374151;
		background: #111827;
		color: #e5e7eb;
		&:hover {
			background: #1f2937;
		}
		&.active {
			background: #f9822c;
			border-color: #f9822c;
			color: #ffffff;
		}
	}
</style>
