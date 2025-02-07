<script lang="ts">
	import { GameSettingInitService } from '../../service/game/GameSettingService';
	// 게임 정보 처리
	let gameInit: any;

	GameSettingInitService.showList.subscribe((value) => {
		gameInit = value;
	});
</script>

<footer class="mt-auto w-full bg-gray-100">
	<hr class="mb-2 mt-4 border-gray-200 dark:border-gray-700" />
	<div class="flex justify-center px-6 pb-6">
		<span class="text-sm font-light text-gray-500">
			<p class="text-base font-bold">
				<a href="https://flowbite.com/" class="text-[#f9822c] hover:underline">KingDuck</a>
			</p>
			<p>{gameInit.copyright.title}</p>
			<p>{gameInit.copyright.description}</p>
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
