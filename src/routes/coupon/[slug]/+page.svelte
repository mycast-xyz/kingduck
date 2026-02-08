<script lang="ts">
	import DesktopListMenu from '../../../app/view/menu/DesktopListMenu.svelte';
	import FooterView from '../../../app/view/footer/FooterView.svelte';
	// 컴포넌트 임포트
	import Layer from '../../../app/view-framework/content/ContentLayer.svelte';

	let { data } = $props();

	function formatRemainingTime(endTime: string): string {
		const end = new Date(endTime).getTime();
		const now = new Date().getTime();
		const diff = end - now;

		if (diff <= 0) return '종료됨';

		const oneDay = 1000 * 60 * 60 * 24;
		const days = Math.ceil(diff / oneDay);

		if (days > 1) {
			return `D-${days}`;
		} else {
			const hours = Math.floor(diff / (1000 * 60 * 60));
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
			return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
		}
	}
</script>

<div class="h-screen w-screen min-w-[1700px] overflow-hidden bg-gray-100 dark:bg-gray-800">
	<article
		id="list-component"
		class="my-0 ml-[80px] mr-0 flex h-full w-[calc(100%-80px)] overflow-hidden"
	>
		<!-- Sidebar Menu -->
		<DesktopListMenu {data} />
		<!-- Main Content Area -->
		<div class="list h-auto w-[calc(100%-100px)] w-[inherit] overflow-y-auto pr-2 pt-16">
			<div class="w-full p-4 min-h-screen">
				<Layer title={`활성화된 ${data.game.coupon?.name || '리딤코드'} 목록`}>
					{#if data.coupons.length === 0}
						<div
							class="flex flex-col items-center justify-center w-full py-16 bg-white dark:bg-gray-800 rounded-lg"
						>
							<i class="ri-coupon-3-line text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
							<p class="text-lg font-medium text-gray-500 dark:text-gray-400">
								현재 활성화된 {data.game.coupon?.name || '리딤코드'}가 없습니다.
							</p>
							<p class="text-sm text-gray-400 dark:text-gray-500 mt-1">
								새로운 코드가 추가되면 이곳에 표시됩니다.
							</p>
						</div>
					{:else}
						{#each data.coupons as group}
							<div
								class="flex flex-wrap w-full bg-white divide-x border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-8 last:mb-0 dark:bg-gray-800"
							>
								<!-- Info Section -->
								<div
									class="w-full md:w-1/4 p-6 bg-gray-50 dark:bg-gray-800 flex flex-col justify-center border-r border-gray-200 dark:border-gray-700 dark:bg-gray-800"
								>
									<span class="text-xl font-light text-gray-500 dark:text-gray-400">
										{#if group.endTime}
											{@const status = (() => {
												const end = new Date(group.endTime).getTime();
												const now = new Date().getTime();
												const diff = end - now;
												if (diff < 1000 * 60 * 60 * 24) return 'urgent';
												return 'normal';
											})()}
											<span
												class={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
													status === 'urgent'
														? 'animate-pulse bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20 dark:bg-gray-800'
														: 'bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20 dark:bg-gray-800'
												}`}
											>
												{formatRemainingTime(group.endTime)}
											</span>
										{:else}
											<span
												class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20"
											>
												상시
											</span>
										{/if}
									</span>
									<h3 class="text-2xl font-bold text-orange-500 dark:text-orange-500 mt-2">
										{group.title}
									</h3>
									<p class="text-gray-500 dark:text-gray-400 pt-4">
										{group.periodText}
									</p>
								</div>
								<!-- Coupon Grid -->
								<div
									class="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 bg-white"
								>
									{#each group.codes as code}
										<a
											href={`https://hsr.hoyoverse.com/gift?code=${code.code}`}
											target="_blank"
											class="flex px-6 py-4 cursor-pointer text-gray-900 items-center hover:bg-orange-500 hover:text-white transition-colors border-b border-r border-gray-100 last:border-b-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
										>
											<i class="ri-coupon-line mr-3 text-4xl"></i>
											<div class="ml-2 overflow-hidden">
												<div class="font-medium text-base truncate">{code.code}</div>
												<div class="mt-0.5 text-lg text-opacity-80 truncate">{code.reward}</div>
												<div
													class="mt-0.5 text-sm text-opacity-80 truncate font-light flex items-center"
												>
													<i class="ri-external-link-line mr-2"></i>
													<span>클릭시 입력 페이지로 이동 됩니다.</span>
												</div>
											</div>
										</a>
									{/each}
								</div>
							</div>
						{/each}
					{/if}
				</Layer>
			</div>
			<FooterView />
		</div>
	</article>
</div>

<style>
</style>
