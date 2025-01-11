<script lang="ts">
	import type { PageData } from '../$types';
	import MainMenu from '../../../app/view/menu/MainMenu.svelte';

	let { data }: { data: PageData } = $props();

	// 메뉴 버튼 클릭시 처리 하는 용도
	// 동적 적용이 안되서 아래와 같은 형태로 처리를 해줘야됨 ㅋㅋㅋ;;;
	let MainMenuActive: any = $state(80);
	const MainViewActive: any = {
		80: 'w-[calc(100%-80px)] ml-[80px]',
		240: 'w-[calc(100%-240px)] ml-[240px]'
	};
</script>

<div
	class="h-screen w-screen min-w-[1700px] overflow-hidden overflow-x-hidden bg-gray-100 dark:bg-gray-800"
>
	<!-- Left nav-->
	<MainMenu bind:MainMenuActive />
	<!-- Content -->
	<article
		id="info-componet"
		class="{MainViewActive[MainMenuActive]} my-0 mr-0 flex h-full overflow-hidden"
	>
		<!-- 캐릭터 이미지 표기 처리 -->
		<div id="info-image" class="relative h-screen w-1/3 max-w-2xl">
			<!-- Image Slider - 개발 필요 -->
			<div id="default-carousel" class="h-full w-full" data-carousel="slide">
				<!-- Carousel wrapper -->
				<div class="h-full overflow-hidden">
					<!-- Item 1 -->
					<div class="duration-700 ease-in-out" data-carousel-item>
						<img
							src="http://localhost:5173/assets/test/1730203915.webp"
							class="absolute left-1/2 top-1/2 block h-full w-full w-full -translate-x-1/2 -translate-y-1/2 object-cover object-top"
							alt="..."
						/>
					</div>
					<!-- Item 2 -->
					<div class="hidden duration-700 ease-in-out" data-carousel-item>
						<img
							src="http://localhost:5173/assets/test/test.webp"
							class="absolute left-1/2 top-1/2 block w-full -translate-x-1/2 -translate-y-1/2"
							alt="..."
						/>
					</div>
				</div>
				<!-- Slider controls -->
				<button
					type="button"
					class="group absolute start-0 top-0 z-30 flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none"
					data-carousel-prev
				>
					<span
						class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/30 group-hover:bg-white/50 group-focus:outline-none group-focus:ring-4 group-focus:ring-white dark:bg-gray-800/30 dark:group-hover:bg-gray-800/60 dark:group-focus:ring-gray-800/70"
					>
						<svg
							class="h-4 w-4 text-white dark:text-gray-800 rtl:rotate-180"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 6 10"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 1 1 5l4 4"
							/>
						</svg>
						<span class="sr-only">Previous</span>
					</span>
				</button>
				<button
					type="button"
					class="group absolute end-0 top-0 z-30 flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none"
					data-carousel-next
				>
					<span
						class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/30 group-hover:bg-white/50 group-focus:outline-none group-focus:ring-4 group-focus:ring-white dark:bg-gray-800/30 dark:group-hover:bg-gray-800/60 dark:group-focus:ring-gray-800/70"
					>
						<svg
							class="h-4 w-4 text-white dark:text-gray-800 rtl:rotate-180"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 6 10"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="m1 9 4-4-4-4"
							/>
						</svg>
						<span class="sr-only">Next</span>
					</span>
				</button>
			</div>

			<!-- 캐릭터 이름 / 정보 표기 -->
			<div id="info-image-card" class="absolute inset-x-0 bottom-0 h-80 w-full px-6 text-white">
				<!-- 캐릭터 이름 표기 -->
				<div id="info-title" class="w-full border-b px-2 pb-3 pt-20">
					<!-- 한글 표기 -->
					<!--서브타이틀-->
					<h5 class="break-keep pb-1 text-lg font-extrabold"></h5>
					<!-- 메인타이틀-->
					<h3 class="break-keep pb-1 text-4xl font-extrabold">망귀인</h3>
					<!-- 외래어 표기 | 영어, 일본어, 중국어 간체 일부 가능 -->
					<p class=" text-lg font-normal">Fugue, 忘归人, 帰忘の流離人</p>
				</div>
				<!-- 캐릭터 등급 표기 -->
				<div class="rating-info flex border-b p-2">
					<div class="flex w-1/2 justify-start">
						<h3 class="break-keep pb-1 pr-3 pt-0.5 text-xl font-normal">등급</h3>
						<!-- 레이팅 등급 아이콘 표기시 -->
						<div class="rating-info-img flex w-auto justify-start">
							<div class="icon h-8 w-6 py-1">
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
							<div class="icon h-8 w-6 py-1">
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
							<div class="icon h-8 w-6 py-1">
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
							<div class="icon h-8 w-6 py-1">
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
							<div class="icon h-8 w-6 py-1">
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
					</div>
					<div class="flex w-1/2 justify-start">
						<h3 class="break-keep pb-1 pr-3 pt-0.5 text-xl font-normal">출시일 :</h3>
						<h3 class="break-keep pb-1 pr-3 pt-0.5 text-xl font-extrabold">2024-12-25</h3>
					</div>
				</div>
				<!-- 캐릭터 등급 표기 -->
				<div class="flex w-auto justify-start p-2 pt-3">
					<div class=" mr-3 flex h-10">
						<img src="http://localhost:5173/assets/test/0/1.webp" class=" mr-2 h-8" alt="" />
						<h3 class="reak-keep pb-1 pr-3 pt-0.5 text-xl font-medium">공허</h3>
					</div>
					<div class=" mr-3 flex h-6">
						<img src="http://localhost:5173/assets/test/0/2.webp" class=" mr-2 h-8" alt="" />
						<h3 class="reak-keep pb-1 pr-3 pt-0.5 text-xl font-medium">화염</h3>
					</div>
				</div>
			</div>
		</div>

		<!-- 스크롤 처리 -->
		<div id="info-content" class="h-full w-[inherit] overflow-y-auto">
			<div class="w-full px-5 pt-5">
				<!-- 서포트 카드 처리용 / 기본 틀 -->
				<div
					class="mb-6 w-full rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800"
				>
					<div>
						<h5
							class="border-b border-gray-200 pb-3 pl-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
						>
							추천 광추
						</h5>
					</div>
					<div class="flex w-full justify-start p-3 pb-0">
						<!-- 스타레일 / 원신 -->
						<div class="card-info mx-6 w-min first:ml-0">
							<div class="rating-card border-HY-Rating-5 items-center rounded-xl border-8">
								<img
									class="h-auto min-w-36 max-w-52 rounded-xl"
									src="http://localhost:5173/assets/test/1/1.webp"
									alt=""
								/>
								<div class="rating-info flex w-auto justify-center p-2 pb-0">
									<div class="icon h-6 w-6">
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
									<div class="icon h-6 w-6">
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
									<div class="icon h-6 w-6">
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
									<div class="icon h-6 w-6">
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
									<div class="icon h-6 w-6">
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
							</div>
							<p
								class="w-full break-keep px-4 pt-2 text-center text-lg font-bold text-gray-600 dark:text-gray-200"
							>
								꿈은 어디로 돌아가야 하는가
							</p>
						</div>
						<div class="card-info mx-6 w-min">
							<div class="rating-card border-HY-Rating-5 rounded-xl border-8">
								<img
									class="h-auto min-w-36 max-w-52 rounded-xl"
									src="http://localhost:5173/assets/test/1/2.webp"
									alt=""
								/>
								<div class="rating-info flex justify-center p-2 pb-0">
									<div class="icon h-6 w-6">
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
									<div class="icon h-6 w-6">
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
									<div class="icon h-6 w-6">
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
									<div class="icon h-6 w-6">
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
									<div class="icon h-6 w-6">
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
							</div>
							<p
								class="w-full break-keep px-4 pt-2 text-center text-lg font-bold text-gray-600 dark:text-gray-200"
							>
								꿈은 어디로 돌아가야 하는가
							</p>
						</div>
						<div class="card-info mx-6 w-min">
							<div class="rating-card border-HY-Rating-4 rounded-xl border-8">
								<img
									class="h-auto min-w-36 max-w-52 rounded-xl"
									src="http://localhost:5173/assets/test/1/5.webp"
									alt=""
								/>
								<div class="rating-info flex justify-center p-2 pb-0">
									<div class="icon h-6 w-6">
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
									<div class="icon h-6 w-6">
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
									<div class="icon h-6 w-6">
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
									<div class="icon h-6 w-6">
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
							</div>
							<p
								class="w-full break-keep px-4 pt-2 text-center text-lg font-bold text-gray-600 dark:text-gray-200"
							>
								꿈은 어디로 돌아가야 하는가
							</p>
						</div>

						<!-- 말딸용 -->
						<div class="card-info mx-6 w-min">
							<div class="rating-card border-URA-Rating-SSR overflow-hidden rounded-xl border-8">
								<img
									class="h-auto min-w-36 max-w-52 rounded-xl"
									src="http://localhost:5173/assets/test/1/7.png"
									alt=""
								/>
								<h4 class=" text-center text-2xl font-bold tracking-tight text-white">SSR</h4>
							</div>
							<p
								class=" w-full break-keep px-4 pt-2 text-center text-lg font-bold text-gray-600 dark:text-gray-200"
							>
								다가오는 열기에 떠밀려
							</p>
						</div>
					</div>
				</div>
				<!-- 추천 유물 / 기본 틀-->
				<div
					class="mb-6 w-full rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800"
				>
					<div>
						<h5
							class="border-b border-gray-200 pb-3 pl-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
						>
							추천 유물
						</h5>
					</div>
					<!-- 기본 형태 | 강조 박스형 -->
					<div class="flex w-full p-3">
						<div class="w-auto py-3 pt-0">
							<h5 class="pb-3 pl-3 text-lg font-bold tracking-tight text-gray-700 dark:text-white">
								터널 유물
							</h5>
							<div class="flex">
								<div
									class="mx-4 max-w-sm basis-1/6 rounded-lg border border-gray-200 bg-[#d34e44] shadow dark:border-gray-700"
								>
									<div class=" relative h-auto w-full object-scale-down">
										<img
											class=" m-auto min-w-36 items-center p-4"
											src="http://localhost:5173/assets/test/2/5.webp"
											alt=""
										/>
									</div>
									<div class="p-2">
										<h5
											class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white"
										>
											괴도
										</h5>
									</div>
								</div>
								<div
									class="mx-4 max-w-sm basis-1/6 rounded-lg border border-gray-200 bg-[#d34e44] shadow dark:border-gray-700"
								>
									<div class="relative h-auto w-full object-scale-down">
										<img
											class=" m-auto max-w-36 items-center p-4"
											src="http://localhost:5173/assets/test/2/3.webp"
											alt=""
										/>
									</div>
									<div class="p-2">
										<h5
											class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white"
										>
											철기군
										</h5>
									</div>
								</div>
								<div
									class="mx-4 max-w-sm basis-1/6 rounded-lg border border-gray-200 bg-[#d34e44] shadow dark:border-gray-700"
								>
									<div class="relative h-auto w-full object-scale-down">
										<img
											class=" m-auto min-w-36 items-center p-4"
											src="http://localhost:5173/assets/test/2/3.webp"
											alt=""
										/>
										<img
											class=" absolute bottom-0 right-0 m-auto w-24 items-center p-2"
											src="http://localhost:5173/assets/test/2/1.webp"
											alt=""
										/>
									</div>
									<div class="p-2">
										<h5
											class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white"
										>
											시계공 & 철기군
										</h5>
									</div>
								</div>
								<div
									class="mx-4 max-w-sm basis-1/6 rounded-lg border border-gray-200 bg-[#d34e44] shadow dark:border-gray-700"
								>
									<div class="h-auto w-full object-scale-down">
										<img
											class=" m-auto w-36 min-w-36 items-center p-4"
											src="http://localhost:5173/assets/test/2/1.webp"
											alt=""
										/>
									</div>
									<div class="p-2">
										<h5 class="mb-2 text-center text-xl font-bold tracking-tight text-white">
											시계공
										</h5>
									</div>
								</div>
							</div>
						</div>
						<div class="w-auto py-3 pt-0">
							<h5 class="pb-3 pl-3 text-lg font-bold tracking-tight text-gray-700 dark:text-white">
								차원 유물
							</h5>
							<div class="flex">
								<div
									class="mx-4 basis-1/6 rounded-lg border border-gray-200 bg-[#d34e44] shadow dark:border-gray-700"
								>
									<div class=" relative h-auto w-full object-scale-down">
										<img
											class=" m-auto max-w-36 items-center p-4"
											src="http://localhost:5173/assets/test/2/2.webp"
											alt=""
										/>
									</div>
									<div class="p-2">
										<h5
											class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white"
										>
											겁화 연등의 연마궁
										</h5>
									</div>
								</div>
								<div
									class="mx-4 basis-1/6 rounded-lg border border-gray-200 bg-[#d34e44] shadow dark:border-gray-700"
								>
									<div class="relative h-auto w-full object-scale-down">
										<img
											class=" m-auto max-w-36 items-center p-4"
											src="http://localhost:5173/assets/test/2/4.webp"
											alt=""
										/>
									</div>
									<div class="p-2">
										<h5
											class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white"
										>
											도적국 탈리아
										</h5>
									</div>
								</div>
							</div>
						</div>
					</div>
					<!-- 기본 형태 | 이미지가 들어가는 경우 -->
					<div class="w-full border-t border-gray-200 p-3">
						<h5 class="pb-3 pl-3 text-lg font-bold tracking-tight text-gray-700 dark:text-white">
							추천 메인 속성
						</h5>
						<ul class="flex">
							<li class="block flex rounded-lg p-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700">
								<div class="image-box mr-3 h-16 w-16 rounded-full bg-gray-400 p-2 dark:bg-gray-800">
									<img class="h-full w-full" src="http://localhost:5173/assets/test/3/1.webp" />
								</div>
								<div class="pt-2">
									<h5 class="text-xl font-semibold">HP</h5>
									<span class="text-sm text-gray-500 dark:text-gray-400">50 ~ 60%</span>
								</div>
							</li>
							<li class="block flex rounded-lg p-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700">
								<div class="image-box mr-3 h-16 w-16 rounded-full bg-gray-400 p-2 dark:bg-gray-800">
									<img class="h-full w-full" src="http://localhost:5173/assets/test/3/8.webp" />
								</div>
								<div class="pt-2">
									<h5 class="text-xl font-semibold">효과 명중</h5>
									<span class="text-sm text-gray-500 dark:text-gray-400">50 ~ 60%</span>
								</div>
							</li>
							<li class="block flex rounded-lg p-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700">
								<div class="image-box mr-3 h-16 w-16 rounded-full bg-gray-400 p-2 dark:bg-gray-800">
									<img class="h-full w-full" src="http://localhost:5173/assets/test/3/2.webp" />
								</div>
								<div class="pt-2">
									<h5 class="text-xl font-semibold">격파 특수효과</h5>
									<span class="text-sm text-gray-500 dark:text-gray-400">50 ~ 60%</span>
								</div>
							</li>
							<li class="block flex rounded-lg p-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700">
								<div class="image-box mr-3 h-16 w-16 rounded-full bg-gray-400 p-2 dark:bg-gray-800">
									<img class="h-full w-full" src="http://localhost:5173/assets/test/3/5.webp" />
								</div>
								<div class="pt-2">
									<h5 class="text-xl font-semibold">속도</h5>
									<span class="text-sm text-gray-500 dark:text-gray-400">50 ~ 60%</span>
								</div>
							</li>
							<li class="block flex rounded-lg p-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700">
								<div class="image-box mr-3 h-16 w-16 rounded-full bg-gray-400 p-2 dark:bg-gray-800">
									<img class="h-full w-full" src="http://localhost:5173/assets/test/3/6.webp" />
								</div>
								<div class="pt-2">
									<h5 class="text-xl font-semibold">방어력</h5>
									<span class="text-sm text-gray-500 dark:text-gray-400">50 ~ 60%</span>
								</div>
							</li>
						</ul>
					</div>
					<!-- 기본 형태 | 텍스트만 표기시 -->
					<div class="w-full border-t border-gray-200 p-3 pb-0">
						<h5 class="pb-3 pl-3 text-lg font-bold tracking-tight text-gray-700 dark:text-white">
							추천 보조 속성
						</h5>
						<div class="flex pb-3 pl-3">
							<h5 class="text-lg font-normal">HP, 속도, 격파 특수효과, 치명타 확률</h5>
						</div>
					</div>
				</div>
				<!-- 행적 육성 - 기본형태와 동일 코드 -->
				<div
					class="mb-6 w-full rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800"
				>
					<div>
						<h5
							class="border-b border-gray-200 pb-3 pl-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
						>
							행적 육성
						</h5>
					</div>
					<!-- 기본 형태 | 강조 박스형 -->
					<div class="flex w-full p-3">
						<div class="w-auto py-3 pt-0">
							<h5
								class="pb-3 pl-3 text-lg font-bold tracking-tight text-gray-700 dark:text-white"
							></h5>
							<div class="flex">
								<div
									class="mx-4 max-w-sm basis-1/6 rounded-lg border border-gray-200 bg-gray-500 shadow dark:border-gray-700"
								>
									<div class=" relative h-auto w-full object-scale-down">
										<img
											class=" m-auto min-w-36 items-center p-4"
											src="http://localhost:5173/assets/test/4/3.webp"
											alt=""
										/>
									</div>
									<div class="p-2">
										<h5
											class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white"
										>
											1.전투스킬
										</h5>
									</div>
								</div>
								<div
									class="mx-4 max-w-sm basis-1/6 rounded-lg border border-gray-200 bg-gray-500 shadow dark:border-gray-700"
								>
									<div class=" relative h-auto w-full object-scale-down">
										<img
											class=" m-auto min-w-36 items-center p-4"
											src="http://localhost:5173/assets/test/4/5.webp"
											alt=""
										/>
									</div>
									<div class="p-2">
										<h5
											class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white"
										>
											1.특성
										</h5>
									</div>
								</div>
								<div
									class="mx-4 max-w-sm basis-1/6 rounded-lg border border-gray-200 bg-gray-500 shadow dark:border-gray-700"
								>
									<div class=" relative h-auto w-full object-scale-down">
										<img
											class=" m-auto min-w-36 items-center p-4"
											src="http://localhost:5173/assets/test/4/4.webp"
											alt=""
										/>
									</div>
									<div class="p-2">
										<h5
											class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white"
										>
											2.필살기
										</h5>
									</div>
								</div>
								<div
									class="mx-4 max-w-sm basis-1/6 rounded-lg border border-gray-200 bg-gray-500 shadow dark:border-gray-700"
								>
									<div class=" relative h-auto w-full object-scale-down">
										<img
											class=" m-auto min-w-36 items-center p-4"
											src="http://localhost:5173/assets/test/4/5.webp"
											alt=""
										/>
									</div>
									<div class="p-2">
										<h5
											class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white"
										>
											3.일반공격
										</h5>
									</div>
								</div>
							</div>
						</div>
					</div>
					<!-- 기본 형태 | 이미지가 들어가는 경우 
					<div class="w-full border-t border-gray-200 p-3">
						<div class="block flex rounded-lg p-3 px-4">
							<div class="image-box mr-3 h-16 w-16 rounded-full bg-gray-400 p-2 dark:bg-gray-800">
								<img class="h-full w-full" src="http://localhost:5173/assets/test/4/3.webp" />
							</div>
							<div class="pt-2">
								<h5 class="text-xl font-semibold">
									현인의 길조, 천명의 부채 <small>[서포트]</small>
								</h5>
								<span class="text-sm text-gray-500 dark:text-gray-400"
									>[여우의 기도]를 보유한 아군의 격파 특수효과가 n% 증가한다.<br />아군이 공격을
									발동할 때마다 망귀인은 100%의 기본 확률로 피격된 적의 방어력을 n% 감소시킨다, 지속
									시간: 2턴
								</span>
							</div>
						</div>
					</div>
					-->
				</div>
				<!-- 성흔 돌파 - 기본형태와 동일 코드 -->
				<div
					class="mb-6 w-full rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800"
				>
					<div>
						<h5
							class="border-b border-gray-200 pb-3 pl-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
						>
							성흔 돌파
						</h5>
					</div>
					<!-- 기본 형태 | 강조 박스형 -->
					<div class="flex w-full p-3">
						<div class="w-auto py-3 pt-0">
							<h5
								class="pb-3 pl-3 text-lg font-bold tracking-tight text-gray-700 dark:text-white"
							></h5>
							<div class="flex">
								<div
									class="mx-4 max-w-sm basis-1/6 rounded-lg border border-gray-200 bg-[#d34e44] shadow dark:border-gray-700"
								>
									<div class=" relative h-auto w-full object-scale-down">
										<img
											class=" m-auto max-w-36 items-center p-4"
											src="http://localhost:5173/assets/test/5/1.webp"
											alt=""
										/>
									</div>
									<div class="p-2">
										<h5
											class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white"
										>
											1
										</h5>
									</div>
								</div>
								<div
									class="mx-4 max-w-sm basis-1/6 rounded-lg border border-gray-200 bg-[#d34e44] shadow dark:border-gray-700"
								>
									<div class=" relative h-auto w-full object-scale-down">
										<img
											class=" m-auto min-w-36 items-center p-4"
											src="http://localhost:5173/assets/test/5/2.webp"
											alt=""
										/>
									</div>
									<div class="p-2">
										<h5
											class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white"
										>
											2
										</h5>
									</div>
								</div>
								<div
									class="mx-4 max-w-sm basis-1/6 rounded-lg border border-gray-200 bg-gray-500 shadow dark:border-gray-700"
								>
									<div class=" relative h-auto w-full object-scale-down">
										<img
											class=" m-auto min-w-36 items-center p-4"
											src="http://localhost:5173/assets/test/5/3.webp"
											alt=""
										/>
									</div>
									<div class="p-2">
										<h5
											class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white"
										>
											3
										</h5>
									</div>
								</div>

								<div
									class="mx-4 max-w-sm basis-1/6 rounded-lg border border-gray-200 bg-gray-500 shadow dark:border-gray-700"
								>
									<div class=" relative h-auto w-full object-scale-down">
										<img
											class=" m-auto min-w-36 items-center p-4"
											src="http://localhost:5173/assets/test/5/4.webp"
											alt=""
										/>
									</div>
									<div class="p-2">
										<h5
											class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white"
										>
											4
										</h5>
									</div>
								</div>

								<div
									class="mx-4 max-w-sm basis-1/6 rounded-lg border border-gray-200 bg-gray-500 shadow dark:border-gray-700"
								>
									<div class=" relative h-auto w-full object-scale-down">
										<img
											class=" m-auto min-w-36 items-center p-4"
											src="http://localhost:5173/assets/test/5/5.webp"
											alt=""
										/>
									</div>
									<div class="p-2">
										<h5
											class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white"
										>
											5
										</h5>
									</div>
								</div>

								<div
									class="mx-4 max-w-sm basis-1/6 rounded-lg border border-gray-200 bg-[#d34e44] shadow dark:border-gray-700"
								>
									<div class=" relative h-auto w-full object-scale-down">
										<img
											class=" m-auto min-w-36 items-center p-4"
											src="http://localhost:5173/assets/test/5/6.webp"
											alt=""
										/>
									</div>
									<div class="p-2">
										<h5
											class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white"
										>
											6
										</h5>
									</div>
								</div>
							</div>
						</div>
					</div>
					<!-- 기본 형태 | 이미지가 들어가는 경우 
					<div class="w-full border-t border-gray-200 p-3">
						<div class="block flex rounded-lg p-3 px-4">
							<div class="image-box mr-3 h-16 w-16 rounded-full bg-gray-400 p-2 dark:bg-gray-800">
								<img class="h-full w-full" src="http://localhost:5173/assets/test/4/3.webp" />
							</div>
							<div class="pt-2">
								<h5 class="text-xl font-semibold">
									현인의 길조, 천명의 부채 <small>[서포트]</small>
								</h5>
								<span class="text-sm text-gray-500 dark:text-gray-400"
									>[여우의 기도]를 보유한 아군의 격파 특수효과가 n% 증가한다.<br />아군이 공격을
									발동할 때마다 망귀인은 100%의 기본 확률로 피격된 적의 방어력을 n% 감소시킨다, 지속
									시간: 2턴
								</span>
							</div>
						</div>
					</div>
					-->
				</div>

				<!-- 속성정보 - 기본틀 -->
				<div
					class="mb-6 w-full rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800"
				>
					<div>
						<h5
							class="border-b border-gray-200 pb-3 pl-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
						>
							해외 속성 평균 통계
						</h5>
					</div>
					<!-- 기본 형태 | 강조 박스형 -->
					<div class="flex w-full p-0">
						<div class="w-auto pt-0">
							<h5
								class="pb-3 pl-3 text-lg font-bold tracking-tight text-gray-700 dark:text-white"
							></h5>
							<div class="flex flex-wrap">
								<div
									class="max-w-42 mx-4 my-3 rounded-lg border border-gray-200 bg-gray-500 shadow transition-colors hover:bg-[#d34e44] dark:border-gray-700"
								>
									<div class="h-auto w-36 object-scale-down p-2">
										<img
											class="m-auto max-w-14 items-center"
											src="http://localhost:5173/assets/test/3/1.webp"
											alt=""
										/>
										<h5
											class="break-keep border-b-2 border-white pb-3 text-center text-base tracking-tight text-white"
										>
											공격력
										</h5>
									</div>
									<div class="p-2 pt-0">
										<h5
											class=" mb-2 break-keep text-center text-2xl font-black tracking-tight text-white"
										>
											1641.75
										</h5>
									</div>
								</div>
							</div>
						</div>
					</div>
					<!-- 기본 형태 | 이미지가 들어가는 경우 
					<div class="w-full border-t border-gray-200 p-3">
						<div class="block flex rounded-lg p-3 px-4">
							<div class="image-box mr-3 h-16 w-16 rounded-full bg-gray-400 p-2 dark:bg-gray-800">
								<img class="h-full w-full" src="./assets/test/4/3.webp" />
							</div>
							<div class="pt-2">
								<h5 class="text-xl font-semibold">
									현인의 길조, 천명의 부채 <small>[서포트]</small>
								</h5>
								<span class="text-sm text-gray-500 dark:text-gray-400"
									>[여우의 기도]를 보유한 아군의 격파 특수효과가 n% 증가한다.<br />아군이 공격을
									발동할 때마다 망귀인은 100%의 기본 확률로 피격된 적의 방어력을 n% 감소시킨다, 지속
									시간: 2턴
								</span>
							</div>
						</div>
					</div>
					-->
				</div>
			</div>
		</div>
	</article>
</div>

<style>
	#info-image-card {
		background: rgb(0, 0, 0);
		background: -moz-linear-gradient(0deg, rgba(0, 0, 0, 0.75) 75%, rgba(0, 0, 0, 0) 100%);
		background: -webkit-linear-gradient(0deg, rgba(0, 0, 0, 0.75) 75%, rgba(0, 0, 0, 0) 100%);
		background: linear-gradient(0deg, rgba(0, 0, 0, 0.75) 75%, rgba(0, 0, 0, 0) 100%);
		filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#000000",endColorstr="#000000",GradientType=1);
	}
</style>
