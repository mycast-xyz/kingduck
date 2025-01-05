<div class="h-screen w-screen overflow-hidden overflow-x-hidden bg-gray-100 dark:bg-gray-800">
	<!-- Left nav-->
	<header
		class="fixed inset-y-0 left-0 h-full w-20 items-center border-r border-r-gray-100 bg-white shadow-md dark:border-r-gray-800 dark:bg-gray-950"
	>
		<!-- Logo area -->
		<div id="logo" class="mb-3">
			<a href="#top" class="flex h-20 w-20 items-center justify-center bg-[#F9822C]">
				<img class="h-full w-auto" src="./assets/logo/500.png" alt="Your Company" />
			</a>
		</div>

		<!-- Favorites Menu Area-->
		<div
			id="favorites-menu"
			class="mx-2 flex h-auto w-16 flex-col items-center border-b border-b-gray-200 pb-3 dark:border-b-gray-600"
		>
			<a href="#top" class="my-2 h-16 w-16 justify-center overflow-hidden rounded-full bg-gray-100">
				<img class="h-full w-auto" src="./assets/game/HonkaiStarRail.webp" alt="HonkaiStarRail" />
			</a>
			<a href="#top" class="my-2 h-16 w-16 justify-center overflow-hidden rounded-full bg-gray-100">
				<img class="h-full w-auto" src="./assets/game/Umamusume.webp" alt="HonkaiStarRail" />
			</a>
			<a href="#top" class="my-2 h-16 w-16 justify-center overflow-hidden rounded-full bg-gray-100">
				<img class="h-full w-auto" src="./assets/game/NIKKE.webp" alt="HonkaiStarRail" />
			</a>
		</div>
		<!-- Game Menu Area-->
		<div
			id="game-menu"
			class="mx-2 flex h-auto w-16 flex-col items-center border-b border-b-gray-200 pb-3 dark:border-b-gray-600"
		>
			<a href="#top" class="my-2 h-16 w-16 justify-center overflow-hidden rounded-full bg-gray-100">
				<img class="h-full w-auto" src="./assets/game/GenshinImpact.webp" alt="HonkaiStarRail" />
			</a>
			<a href="#top" class="my-2 h-16 w-16 justify-center overflow-hidden rounded-full bg-gray-100">
				<img class="h-full w-auto" src="./assets/game/BlueArchive.webp" alt="HonkaiStarRail" />
			</a>
			<a href="#top" class="my-2 h-16 w-16 justify-center overflow-hidden rounded-full bg-gray-100">
				<img class="h-full w-auto" src="./assets/game/WutheringWaves.webp" alt="HonkaiStarRail" />
			</a>
			<a href="#top" class="my-2 h-16 w-16 justify-center overflow-hidden rounded-full bg-gray-100">
				<img class="h-full w-auto" src="./assets/game/zzz.webp" alt="HonkaiStarRail" />
			</a>
		</div>
	</header>
	<!-- Content -->
	<article id="info-componet" class="component-width ml-20 flex h-full overflow-hidden">
		<div id="info-image" class="relative h-screen w-1/3 max-w-2xl">
			<!-- Image Slider - 개발 필요 -->
			<div id="default-carousel" class="h-full w-full" data-carousel="slide">
				<!-- Carousel wrapper -->
				<div class="h-full overflow-hidden">
					<!-- Item 1 -->
					<div class="duration-700 ease-in-out" data-carousel-item>
						<img
							src="./assets/test/1730203915.webp"
							class="absolute left-1/2 top-1/2 block h-full w-full w-full -translate-x-1/2 -translate-y-1/2 object-cover object-top"
							alt="..."
						/>
					</div>
					<!-- Item 2 -->
					<div class="hidden duration-700 ease-in-out" data-carousel-item>
						<img
							src="./assets/test/test.webp"
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

			<div id="info-image-card" class="absolute inset-x-0 bottom-0 h-64 w-full"></div>
		</div>

		<!-- 스크롤 처리 -->
		<div id="info-content" class="h-full w-fit overflow-y-auto">
			<div class="w-full px-5 pt-5">
				<!-- 서포트 카드 처리용 -->
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
					<div class="grid grid-cols-6 gap-14 p-3 pb-0">
						<!-- 스타레일 / 원신 -->
						<div class="card-info">
							<div class="rating-card border-HY-Rating-5 items-center rounded-xl border-8">
								<img class="h-auto max-w-full rounded-xl" src="./assets/test/1/1.webp" alt="" />
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
							<p class="text-HY-Rating-5 w-full break-keep px-4 pt-2 text-center text-lg font-bold">
								꿈은 어디로 돌아가야 하는가
							</p>
						</div>
						<div class="card-info">
							<div class="rating-card border-HY-Rating-5 rounded-xl border-8">
								<img class="h-auto max-w-full rounded-xl" src="./assets/test/1/2.webp" alt="" />
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
							<p class="text-HY-Rating-5 w-full break-keep px-4 pt-2 text-center text-lg font-bold">
								꿈은 어디로 돌아가야 하는가
							</p>
						</div>
						<div class="card-info">
							<div class="rating-card border-HY-Rating-4 rounded-xl border-8">
								<img class="h-auto max-w-full rounded-xl" src="./assets/test/1/5.webp" alt="" />
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
							<p class="text-HY-Rating-4 w-full break-keep px-4 pt-2 text-center text-lg font-bold">
								꿈은 어디로 돌아가야 하는가
							</p>
						</div>

						<!-- 말딸용 -->

						<div class="card-info">
							<div class="rating-card border-URA-Rating-SSR overflow-hidden rounded-xl border-8">
								<img class="h-auto max-w-full rounded-xl" src="./assets/test/1/7.png" alt="" />
								<h4 class=" text-center text-2xl font-bold tracking-tight text-white">SSR</h4>
							</div>
							<p
								class=" w-full break-keep px-4 pt-2 text-center text-lg font-bold text-gray-800 dark:text-gray-200"
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
					<!-- 좌우 구분 박스 처리가 필요한 경우 -->
					<div class="flex w-full p-3">
						<div class="w-2/3 p-3 pt-0">
							<h5 class="pb-3 pl-3 text-lg font-bold tracking-tight text-gray-700 dark:text-white">
								터널 유물
							</h5>
							<div class="grid grid-cols-6 gap-10">
								<div
									class="max-w-sm rounded-lg border border-gray-200 bg-amber-400 shadow dark:border-gray-700"
								>
									<div class=" relative h-auto w-full object-scale-down">
										<img
											class=" m-auto w-36 items-center p-4"
											src="./assets/test/2/5.webp"
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
									class="max-w-sm rounded-lg border border-gray-200 bg-amber-400 shadow dark:border-gray-700"
								>
									<div class="relative h-auto w-full object-scale-down">
										<img
											class=" m-auto w-36 items-center p-4"
											src="./assets/test/2/3.webp"
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
									class="max-w-sm rounded-lg border border-gray-200 bg-amber-400 shadow dark:border-gray-700"
								>
									<div class="relative h-auto w-full object-scale-down">
										<img
											class=" m-auto w-36 items-center p-4"
											src="./assets/test/2/3.webp"
											alt=""
										/>
										<img
											class=" absolute bottom-0 right-0 m-auto w-24 items-center p-2"
											src="./assets/test/2/1.webp"
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
									class="max-w-sm rounded-lg border border-gray-200 bg-amber-400 shadow dark:border-gray-700"
								>
									<div class="h-auto w-full object-scale-down">
										<img
											class=" m-auto w-36 items-center p-4"
											src="./assets/test/2/1.webp"
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
						<div class="w-1/3 p-3 pt-0">
							<h5 class="pb-3 pl-3 text-lg font-bold tracking-tight text-gray-700 dark:text-white">
								차원 유물
							</h5>
							<div class="grid grid-cols-3 gap-10">
								<div
									class="max-w-sm rounded-lg border border-gray-200 bg-amber-400 shadow dark:border-gray-700"
								>
									<div class=" relative h-auto w-full object-scale-down">
										<img
											class=" m-auto w-36 items-center p-4"
											src="./assets/test/2/2.webp"
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
									class="max-w-sm rounded-lg border border-gray-200 bg-amber-400 shadow dark:border-gray-700"
								>
									<div class="relative h-auto w-full object-scale-down">
										<img
											class=" m-auto w-36 items-center p-4"
											src="./assets/test/2/4.webp"
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
					<!-- 기본 형태 -->
					<div class="w-full border-t border-gray-200 p-3 pb-0">
						<h5 class="pb-3 pl-3 text-lg font-bold tracking-tight text-gray-700 dark:text-white">
							추천 메인 속성
						</h5>
					</div>
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
