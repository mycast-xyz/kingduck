<script lang="ts">
	import { GameSettingInitService } from '../../service/GameSettingService';
	import { CharacterRarityService } from '../../service/CharacterRarityService';

	const { data } = $props<{ data: any }>();

	const currentUrl = data.url;

	let gameInit: any;
	let rarityService: CharacterRarityService;

	GameSettingInitService.showList.subscribe((value) => {
		gameInit = value;
		if (gameInit) {
			rarityService = new CharacterRarityService(gameInit);
		}
	});
</script>

<div class="con flex h-auto w-full flex-wrap content-start items-stretch justify-start">
	{#each data.list as item}
		{#if data.isMobile}
			<a class="flex-box basis-1/3" href="/content/{data.params}/{item.id}">
				<div
					class="shadow-m card-Rating-{rarityService.rarityData(
						item.rarity
					)} relative m-2 block overflow-hidden rounded-lg border border-gray-100 pb-6 text-white"
				>
					<div class="card-Rating-{rarityService.rarityData(item.rarity)} rounded-t-lg">
						<img src="{currentUrl}/{item.images.url}.webp" alt={item.name.kr} />
					</div>
					<div
						class="image-info card-HY-Rating-{rarityService.rarityData(
							item.rarity
						)}-bg absolute inset-x-0 bottom-0 px-2 py-2"
					>
						<h5 class="break-keep pb-1 text-base font-extrabold"></h5>
						<h3 class="break-keep pb-1 text-base font-extrabold drop-shadow-md">
							{item.name.kr}
						</h3>
						<div class="flex w-full justify-start">
							<div class="rating-info-img flex w-auto justify-start">
								{#if rarityService.rarityType(item.rarity) === 'number'}
									{#each { length: item.rarity } as i}
										<div class="icon h-5 w-3 py-1">
											<svg
												id="_레이어_1"
												data-name="레이어_1"
												xmlns="http://www.w3.org/2000/svg"
												version="1.1"
												viewBox="0 0 50 50"
											>
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
								{:else}
									<h5 class="break-keep pb-1 text-base font-extrabold drop-shadow-md">
										{item.rarity}
									</h5>
								{/if}
							</div>
							<div class="ml-auto flex w-auto justify-start">
								{#each Object.entries(item.type).slice(0, 2) as [key, value]}
									{#if value?.image?.url}
										<div class="ml-1 flex h-6">
											<img src="{currentUrl}/{value.image.url}.webp" class="h-6" alt="" />
										</div>
									{/if}
								{/each}
							</div>
						</div>
					</div>
				</div>
			</a>
		{:else}
			<a
				class="shadow-m card-Rating-{rarityService.rarityData(
					item.rarity
				)} relative m-2 block w-60 overflow-hidden rounded-lg border border-gray-100 pb-14 text-white"
				href="/content/{data.params}/{item.id}"
			>
				<div class="card-Rating-{rarityService.rarityData(item.rarity)} rounded-t-lg">
					<img src="{currentUrl}/{item.images.url}.webp" alt={item.name.kr} />
				</div>
				<div
					class="image-info card-HY-Rating-{rarityService.rarityData(
						item.rarity
					)}-bg absolute inset-x-0 bottom-0 px-4 py-2"
				>
					<h5 class="break-keep pb-1 text-base font-extrabold"></h5>
					<h3 class="break-keep pb-1 text-xl font-extrabold drop-shadow-md">{item.name.kr}</h3>

					<div class="flex w-full justify-start">
						<div class="rating-info-img flex w-auto justify-start">
							{#if rarityService.rarityType(item.rarity) === 'number'}
								{#each { length: item.rarity } as i}
									<div class="icon h-8 w-5 py-1">
										<svg
											id="_레이어_1"
											data-name="레이어_1"
											xmlns="http://www.w3.org/2000/svg"
											version="1.1"
											viewBox="0 0 50 50"
										>
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
							{:else}
								<h5 class="break-keep pb-1 text-base font-extrabold drop-shadow-md">
									{item.rarity}
								</h5>
							{/if}
						</div>
						<div class="ml-auto flex w-auto justify-start">
							{#each Object.entries(item.type) as [key, value]}
								{#if value?.image?.url}
									<div class="ml-1 flex h-6">
										<img src="{currentUrl}/{value.image.url}.webp" class="h-6" alt="" />
									</div>
								{/if}
							{/each}
						</div>
					</div>
				</div>
			</a>
		{/if}
	{/each}
</div>

<style lang="scss">
	/* 호요버스 - 원신, 스타레일 색상 처리*/
	.border-Rating-5 {
		border-color: #fcba49;
		background-color: #fcba49;
	}
	.border-Rating-4 {
		border-color: #9f66c8;
		background-color: #9f66c8;
	}
	.border-Rating-3 {
		border-color: #4175bb;
		background-color: #4175bb;
	}
	.card-Rating-5 {
		background: #c9a36a;
		background: linear-gradient(180deg, #885550, #c9a36a 53%);
		border-bottom-color: #c9a36a;
	}
	.card-Rating-5-bg {
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
	.card-Rating-4 {
		background: #8a5fcc;
		background: linear-gradient(180deg, #343659, #8a5fcc 53%);
		border-bottom-color: #8a5fcc;
	}
	.card-Rating-4-bg {
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
	.card-Rating-3 {
		background: #4175bb;
		background: linear-gradient(180deg, #303051, #4175bb 53%);
		border-bottom-color: #4175bb;
	}
	.card-Rating-3-bg {
		background: rgb(48, 48, 81);
		background: -moz-linear-gradient(180deg, rgba(48, 48, 81, 1) 0%, rgba(65, 117, 187, 1) 100%);
		background: -webkit-linear-gradient(180deg, rgba(48, 48, 81, 1) 0%, rgba(65, 117, 187, 1) 100%);
		background: linear-gradient(180deg, rgba(48, 48, 81, 1) 0%, rgba(65, 117, 187, 1) 100%);
		filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#303051",endColorstr="#4175bb",GradientType=1);
	}

	/* 호요버스 - 원신, 스타레일 색상 처리*/
	.text-Rating-5 {
		color: #fcba49;
	}
	.text-Rating-4 {
		color: #9f66c8;
	}
	.text-Rating-3 {
		color: #4175bb;
	}
</style>
