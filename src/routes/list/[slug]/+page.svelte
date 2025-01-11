<script lang="ts">
	import MainMenu from '../../../app/view/menu/MainMenu.svelte';

	let { data } = $props();

	// 메뉴 버튼 클릭시 처리 하는 용도
	// 동적 적용이 안되서 아래와 같은 형태로 처리를 해줘야됨 ㅋㅋㅋ;;;
	let MainMenuActive: any = $state(80);

	const MainViewActive: any = {
		80: 'w-[calc(100%-80px)] ml-[80px]',
		240: 'w-[calc(100%-240px)] ml-[240px]'
	};

	const colors = [
		'red',
		'orange',
		'yellow',
		'green',
		'blue',
		'indigo',
		'violet',
		'orange',
		'yellow',
		'green',
		'blue',
		'indigo',
		'violet',
		'orange',
		'yellow',
		'green',
		'blue',
		'indigo',
		'violet',
		'orange',
		'yellow',
		'green',
		'blue',
		'indigo',
		'violet',
		'orange',
		'yellow',
		'green',
		'blue',
		'indigo',
		'violet',
		'orange',
		'yellow',
		'green',
		'blue',
		'indigo',
		'violet',
		'orange',
		'yellow',
		'green',
		'blue',
		'indigo',
		'violet',
		'orange',
		'yellow',
		'green',
		'blue',
		'indigo',
		'violet',
		'orange',
		'yellow',
		'green',
		'blue',
		'indigo',
		'violet',
		'orange',
		'yellow',
		'green',
		'blue',
		'indigo',
		'violet',
		'orange',
		'yellow',
		'green',
		'blue',
		'indigo',
		'violet'
	];
</script>

<div
	class="h-screen w-screen min-w-[1700px] overflow-hidden overflow-x-hidden bg-gray-100 dark:bg-gray-800"
>
	<!-- Left nav-->
	<MainMenu bind:MainMenuActive />
	<!-- Content -->
	<article
		id="list-componet"
		class="{MainViewActive[MainMenuActive]} my-0 mr-0 flex h-full overflow-hidden"
	>
		<div class="list-menu flex h-full p-4">
			<div
				class="mt-12 w-80 flex-col items-center rounded border border-gray-100 bg-white p-4 text-gray-700 shadow-md"
			>
				<div class="gmae-title my-2 h-auto w-full">
					<div class="gmae-logo-img">
						<img
							src="http://localhost:5173/assets/game/{data.params}.webp"
							class="-mt-20 w-28 rounded-full border border-gray-100 shadow-md"
							alt={data.params}
						/>
					</div>
					<h3 class="pb-3 pt-2 text-2xl font-bold tracking-tight text-gray-700 dark:text-white">
						붕괴 스타레일
					</h3>
				</div>
				<div class="my-4 mt-3 flex w-full flex-col items-center border-t border-gray-300">
					<a
						id="menu-item"
						class=" mt-2 flex h-12 w-full items-center rounded px-3 hover:bg-gray-300"
						href="#top"
					>
						<i class="ri-user-line h-8 w-8 text-2xl"></i>
						<span
							class="ml-2 text-base font-medium transition-all delay-300 duration-200 ease-in-out"
							>캐릭터</span
						>
					</a>
					<a
						id="menu-item"
						class=" mt-2 flex h-12 w-full items-center rounded px-3 hover:bg-gray-300"
						href="#top"
					>
						<i class="ri-vip-crown-2-line h-8 w-8 text-2xl"></i>
						<span
							class="ml-2 text-base font-medium transition-all delay-300 duration-200 ease-in-out"
							>티어 리스트</span
						>
					</a>
					<a
						id="menu-item"
						class=" mt-2 flex h-12 w-full items-center rounded px-3 hover:bg-gray-300"
						href="#top"
					>
						<i class="ri-box-3-line h-8 w-8 text-2xl"></i>
						<span
							class="ml-2 text-base font-medium transition-all delay-300 duration-200 ease-in-out"
							>아이템</span
						>
					</a>
				</div>
			</div>
		</div>
		<div class="list h-full w-[calc(100%-320px)] w-[inherit] overflow-y-auto px-2 pt-12">
			<div class="con flex h-auto w-full flex-wrap content-start items-stretch justify-start">
				{#each colors as item}
					<a
						class="shadow-m card-HY-Rating-5 relative m-2 block w-60 overflow-hidden rounded-lg border border-gray-100 pb-14 text-white"
						href="/content/HonkaiStarRail"
					>
						<div class="card-HY-Rating-5 rounded-t-lg">
							<img src="http://localhost:5173/assets/test/list/ting_card_v2.webp" />
						</div>
						<div class="image-info card-HY-Rating-5-bg absolute inset-x-0 bottom-0 px-4 py-2">
							<!--서브타이틀-->
							<h5 class="break-keep pb-1 text-base font-extrabold"></h5>
							<!-- 메인타이틀-->
							<h3 class="break-keep pb-1 text-xl font-extrabold drop-shadow-md">망귀인</h3>

							<div class="flex w-full justify-start">
								<!-- 레이팅 등급 아이콘 표기시 -->
								<div class="rating-info-img flex w-auto justify-start">
									<div class="icon h-8 w-5 py-1">
										<svg
											id="_레이어_1"
											data-name="레이어_1"
											xmlns="http://www.w3.org/2000/svg"
											version="1.1"
											viewBox="0 0 50 50"
										>
											<!-- Generator: Adobe Illustrator 29.2.0, SVG Export Plug-In . SVG Version: 2.1.0 Build 108)  -->
											<defs>
												<style>
													.st0 {
														fill: #fff;
													}
												</style>
											</defs>
											<path
												class="st0"
												d="M45.99,23.97c-11.02,0-19.96-8.94-19.96-19.96V0h-2.06v4.01c0,11.02-8.94,19.96-19.96,19.96H0v2.06h4.01c11.02,0,19.96,8.94,19.96,19.96v4.01h2.06v-4.01c0-11.02,8.94-19.96,19.96-19.96h4.01v-2.06h-4.01Z"
											/>
										</svg>
									</div>
									<div class="icon h-8 w-5 py-1">
										<svg
											id="_레이어_1"
											data-name="레이어_1"
											xmlns="http://www.w3.org/2000/svg"
											version="1.1"
											viewBox="0 0 50 50"
										>
											<!-- Generator: Adobe Illustrator 29.2.0, SVG Export Plug-In . SVG Version: 2.1.0 Build 108)  -->
											<defs>
												<style>
													.st0 {
														fill: #fff;
													}
												</style>
											</defs>
											<path
												class="st0"
												d="M45.99,23.97c-11.02,0-19.96-8.94-19.96-19.96V0h-2.06v4.01c0,11.02-8.94,19.96-19.96,19.96H0v2.06h4.01c11.02,0,19.96,8.94,19.96,19.96v4.01h2.06v-4.01c0-11.02,8.94-19.96,19.96-19.96h4.01v-2.06h-4.01Z"
											/>
										</svg>
									</div>
									<div class="icon h-8 w-5 py-1">
										<svg
											id="_레이어_1"
											data-name="레이어_1"
											xmlns="http://www.w3.org/2000/svg"
											version="1.1"
											viewBox="0 0 50 50"
										>
											<!-- Generator: Adobe Illustrator 29.2.0, SVG Export Plug-In . SVG Version: 2.1.0 Build 108)  -->
											<defs>
												<style>
													.st0 {
														fill: #fff;
													}
												</style>
											</defs>
											<path
												class="st0"
												d="M45.99,23.97c-11.02,0-19.96-8.94-19.96-19.96V0h-2.06v4.01c0,11.02-8.94,19.96-19.96,19.96H0v2.06h4.01c11.02,0,19.96,8.94,19.96,19.96v4.01h2.06v-4.01c0-11.02,8.94-19.96,19.96-19.96h4.01v-2.06h-4.01Z"
											/>
										</svg>
									</div>
									<div class="icon h-8 w-5 py-1">
										<svg
											id="_레이어_1"
											data-name="레이어_1"
											xmlns="http://www.w3.org/2000/svg"
											version="1.1"
											viewBox="0 0 50 50"
										>
											<!-- Generator: Adobe Illustrator 29.2.0, SVG Export Plug-In . SVG Version: 2.1.0 Build 108)  -->
											<defs>
												<style>
													.st0 {
														fill: #fff;
													}
												</style>
											</defs>
											<path
												class="st0"
												d="M45.99,23.97c-11.02,0-19.96-8.94-19.96-19.96V0h-2.06v4.01c0,11.02-8.94,19.96-19.96,19.96H0v2.06h4.01c11.02,0,19.96,8.94,19.96,19.96v4.01h2.06v-4.01c0-11.02,8.94-19.96,19.96-19.96h4.01v-2.06h-4.01Z"
											/>
										</svg>
									</div>
									<div class="icon h-8 w-5 py-1">
										<svg
											id="_레이어_1"
											data-name="레이어_1"
											xmlns="http://www.w3.org/2000/svg"
											version="1.1"
											viewBox="0 0 50 50"
										>
											<!-- Generator: Adobe Illustrator 29.2.0, SVG Export Plug-In . SVG Version: 2.1.0 Build 108)  -->
											<defs>
												<style>
													.st0 {
														fill: #fff;
													}
												</style>
											</defs>
											<path
												class="st0"
												d="M45.99,23.97c-11.02,0-19.96-8.94-19.96-19.96V0h-2.06v4.01c0,11.02-8.94,19.96-19.96,19.96H0v2.06h4.01c11.02,0,19.96,8.94,19.96,19.96v4.01h2.06v-4.01c0-11.02,8.94-19.96,19.96-19.96h4.01v-2.06h-4.01Z"
											/>
										</svg>
									</div>
								</div>
								<!-- 캐릭터 등급 표기 -->
								<div class="ml-auto flex w-auto justify-start">
									<div class=" ml-1 flex h-6">
										<img src="http://localhost:5173/assets/test/0/1.webp" class=" h-6" alt="" />
									</div>
									<div class=" ml-1 flex h-6">
										<img src="http://localhost:5173/assets/test/0/2.webp" class=" h-6" alt="" />
									</div>
								</div>
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</article>
</div>
