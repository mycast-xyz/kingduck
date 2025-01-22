<script lang="ts">
	import { mainMenuActive } from '$lib/stores/mainMenuStore.js';
	import { goto } from '$app/navigation';

	export let data: PageData;

	const currentUrl = data.url;

	const mainViewActive: any = {
		80: 'w-[calc(100%-80px)] ml-[80px]',
		240: 'w-[calc(100%-240px)] ml-[240px]'
	};
</script>

<div class=" mt-7 w-screen overflow-hidden overflow-x-hidden bg-gray-100 dark:bg-gray-800">
	<article id="list-componet" class=" my-0 mr-0 flex h-full overflow-hidden">
		<div class="list h-full w-full overflow-y-auto px-2 pt-12">
			<div class="con flex h-auto w-full flex-wrap content-start items-stretch justify-start">
				{#each data.list as item}
					<a class="flex-box basis-1/3" href="/content/{data.params}/{item.id}">
						<div
							class="shadow-m card-HY-Rating-{item.rarity} relative m-2 block overflow-hidden rounded-lg border border-gray-100 pb-6 text-white"
						>
							<div class="card-HY-Rating-{item.rarity} rounded-t-lg">
								<img src="{currentUrl}/{item.images.url}.webp" />
							</div>
							<div
								class="image-info card-HY-Rating-{item.rarity}-bg absolute inset-x-0 bottom-0 px-2 py-2"
							>
								<!--서브타이틀-->
								<h5 class="break-keep pb-1 text-base font-extrabold"></h5>
								<!-- 메인타이틀-->
								<h3 class="break-keep pb-1 text-base font-extrabold drop-shadow-md">
									{item.name.kr}
								</h3>

								<div class="flex w-full justify-start">
									<!-- 레이팅 등급 아이콘 표기시 -->
									<div class="rating-info-img flex w-auto justify-start">
										{#each { length: item.rarity } as i}
											<div class="icon h-5 w-3 py-1">
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
										{/each}
									</div>
									<!-- 캐릭터 등급 표기 -->
									<div class="ml-auto flex w-auto justify-start">
										<div class="ml-1 flex h-5 w-5">
											<img
												src="{currentUrl}/{item.element.image.url}.webp"
												class="h-5 w-5"
												alt=""
											/>
										</div>
										<div class="ml-1 flex h-5 w-5">
											<img src="{currentUrl}/{item.path.image.url}.webp" class="h-5 w-5" alt="" />
										</div>
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

<style lang="scss">
	/* 호요버스 - 원신, 스타레일 색상 처리*/
	.border-HY-Rating-5 {
		border-color: #fcba49;
		background-color: #fcba49;
	}
	.border-HY-Rating-4 {
		border-color: #9f66c8;
		background-color: #9f66c8;
	}
	.card-HY-Rating-5 {
		background: #c9a36a;
		background: linear-gradient(180deg, #885550, #c9a36a 53%);
		border-bottom-color: #c9a36a;
	}
	.card-HY-Rating-5-bg {
		background: rgb(201, 163, 106);
		background: -moz-linear-gradient(0deg, rgba(201, 163, 106, 1) 50%, rgba(201, 163, 106, 0) 100%);
		background: -webkit-linear-gradient(
			0deg,
			rgba(201, 163, 106, 1) 50%,
			rgba(201, 163, 106, 0) 100%
		);
		background: linear-gradient(0deg, rgba(201, 163, 106, 1) 50%, rgba(201, 163, 106, 0) 100%);
		filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#c9a36a",endColorstr="#c9a36a",GradientType=1);
	}
	.card-HY-Rating-4 {
		background: #8a5fcc;
		background: linear-gradient(180deg, #343659, #8a5fcc 53%);
		border-bottom-color: #8a5fcc;
	}
	.card-HY-Rating-4-bg {
		background: rgb(138, 95, 204);
		background: -moz-linear-gradient(0deg, rgba(138, 95, 204, 1) 50%, rgba(138, 95, 204, 0) 100%);
		background: -webkit-linear-gradient(
			0deg,
			rgba(138, 95, 204, 1) 50%,
			rgba(138, 95, 204, 0) 100%
		);
		background: linear-gradient(0deg, rgba(138, 95, 204, 1) 50%, rgba(138, 95, 204, 0) 100%);
		filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#8a5fcc",endColorstr="#8a5fcc",GradientType=1);
	}

	/* 호요버스 - 원신, 스타레일 색상 처리*/
	.text-HY-Rating-5 {
		color: #fcba49;
	}
	.text-HY-Rating-4 {
		color: #9f66c8;
	}
</style>
