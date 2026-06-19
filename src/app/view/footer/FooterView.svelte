<script lang="ts">
	import { onDestroy } from 'svelte';
	import { GameSettingInitService } from '../../service/game/GameSettingService';
	// 게임 정보 처리
	let gameInit: any;

	const _unsubShowList = GameSettingInitService.showList.subscribe((value) => {
		gameInit = value;
	});
	onDestroy(_unsubShowList);
</script>

<footer class="mt-auto w-full bg-gray-100 dark:bg-gray-800">
	<hr class="mb-2 mt-4 border-gray-200 dark:border-gray-700 dark:bg-gray-700" />
	<div class="flex justify-center px-6 pb-6">
		<span class="text-sm font-light text-gray-500 dark:text-gray-400">
			<p class="text-base font-bold">
				<a href="/" class="text-[#f9822c] hover:underline">KingDuck</a>
			</p>
			{#if gameInit?.copyright?.title}
				<p>{gameInit.copyright.title}</p>
			{/if}
			{#if gameInit?.copyright?.description}
				<p>{gameInit.copyright.description}</p>
			{/if}
			<p class="mt-2">
				<a href="/about" class="hover:text-gray-900 hover:underline dark:hover:text-white">소개</a>
				<span class="mx-2 text-gray-300">|</span>
				<a href="/contact" class="hover:text-gray-900 hover:underline dark:hover:text-white">문의</a>
				<span class="mx-2 text-gray-300">|</span>
				<a href="/privacy" class="hover:text-gray-900 hover:underline dark:hover:text-white"
					>개인정보처리방침</a
				>
				<span class="mx-2 text-gray-300">|</span>
				<a href="/terms" class="hover:text-gray-900 hover:underline dark:hover:text-white">이용약관</a>
			</p>
		</span>
		<span class="ml-auto mt-4 flex justify-center">
			<a href="#" class="ms-5 text-gray-500 hover:text-gray-900 dark:hover:text-white">
				<i class="ri-discord-line h-4 w-4"></i>
			</a>
			<a href="#" class="ms-5 text-gray-500 hover:text-gray-900 dark:hover:text-white">
				<i class="ri-github-line h-4 w-4"></i>
			</a>
			<a href="#" class="ms-5 text-gray-500 hover:text-gray-900 dark:hover:text-white">
				<i class="ri-home-line h-4 w-4"></i>
			</a>
		</span>
	</div>
</footer>
