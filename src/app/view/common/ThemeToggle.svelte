<script lang="ts">
	import { theme } from '../../store/theme';
	import { onMount, onDestroy } from 'svelte';

	let currentTheme: string;

	const _unsubTheme = theme.subscribe((value) => {
		currentTheme = value;
	});
	onDestroy(_unsubTheme);

	const toggleTheme = () => {
		theme.toggle();
	};
</script>

<button
	class="h-12 w-full items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
	on:click={toggleTheme}
	aria-label="Toggle Dark Mode"
>
	{#if currentTheme === 'dark'}
		<i class="ri-moon-line text-xl text-gray-700 dark:text-gray-200"></i>
	{:else}
		<i class="ri-sun-line text-xl text-gray-700 dark:text-gray-200"></i>
	{/if}
	<div class="hidden text-sm font-medium text-gray-700 dark:text-gray-200 md:block">
		{currentTheme === 'dark' ? '다크 모드' : '라이트 모드'}
	</div>
</button>

<style>
	/* Add specific styles if needed */
</style>
