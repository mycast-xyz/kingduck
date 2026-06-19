<script lang="ts">
	import { page } from '$app/stores';
	import { ItemListService } from '../../service/item/ItemListService';
	import { hasItemTabs } from '../../model/game/itemTabs';

	const { data } = $props<{ data: any }>();

	let searchQuery = $state('');
	$effect(() => {
		ItemListService.setSearchQuery(searchQuery);
	});

	const slug = $derived($page.params.slug);
</script>

<div class="list-menu flex h-full p-4 pr-2">
	<div
		class="mt-12 w-80 flex-col items-center rounded border border-gray-100 bg-white text-gray-700 shadow-md dark:border-gray-700 dark:bg-gray-900 dark:text-white"
	>
		<div class="gmae-title my-2 h-auto w-full p-4">
			<div class="gmae-logo-img">
				{#if data?.info?.iconUrl && data.info.iconUrl.length > 0}
					<img
						src={data.url + '/' + data.info.iconUrl}
						class="-mt-20 w-28 rounded-full border border-gray-100 shadow-md dark:border-gray-700 dark:bg-gray-800"
						alt={data.params}
					/>
				{:else}
					<div
						class="-mt-20 h-28 w-28 rounded-full border border-gray-100 bg-gray-200 shadow-md dark:border-gray-700 dark:bg-gray-800"
					></div>
				{/if}
			</div>
			<h3 class="pb-3 pt-2 text-2xl font-bold tracking-tight text-gray-700 dark:text-white">
				{data?.info?.name || '게임 정보'}
			</h3>
		</div>
		<div class="flex w-full items-center">
			<div
				class="flex w-full items-center justify-between border-b border-t border-gray-200 bg-gray-100 px-0 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
			>
				<input
					type="text"
					bind:value={searchQuery}
					class="mr-2 grow border-none bg-transparent px-5 py-3 text-base font-normal text-gray-700 focus:outline-none dark:bg-gray-800 dark:text-white"
					placeholder="아이템 검색"
				/>
				<button
					aria-label="검색"
					class="flex h-full items-center border-l bg-gray-300 p-3 px-4 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
				>
					<i class="ri-search-line text-xl"></i>
				</button>
			</div>
		</div>
		<div
			class="flex h-[calc(100%-185px)] w-full flex-col items-center overflow-y-auto overflow-x-hidden"
		>
			<div class="my-4 mt-1 flex w-full flex-col items-center p-4 pb-2">
				<h3 class="w-full py-3 pb-1 pl-1 text-lg font-bold text-gray-700 dark:text-white">
					페이지 메뉴
				</h3>
				<a
					class="mt-2 flex h-12 w-full items-center rounded px-3 hover:bg-gray-300 dark:hover:bg-gray-800"
					href={`/list/${slug}`}
				>
					<i class="ri-user-line h-8 w-8 text-2xl"></i>
					<span class="ml-2 text-base font-medium">캐릭터</span>
				</a>
				{#if hasItemTabs(slug)}
					<a
						class="active mt-2 flex h-12 w-full items-center rounded px-3 hover:bg-gray-300 dark:hover:bg-gray-800"
						href={`/item/${slug}`}
					>
						<i class="ri-sword-line h-8 w-8 text-2xl"></i>
						<span class="ml-2 text-base font-medium">아이템</span>
					</a>
				{/if}
				<a
					class="mt-2 flex h-12 w-full items-center rounded px-3 hover:bg-gray-300 dark:hover:bg-gray-800"
					href={`/tier-list/${slug}`}
				>
					<i class="ri-vip-crown-2-line h-8 w-8 text-2xl"></i>
					<span class="ml-2 text-base font-medium">티어 리스트</span>
				</a>
				<a
					class="mt-2 flex h-12 w-full items-center rounded px-3 hover:bg-gray-300 dark:hover:bg-gray-800"
					href={`/coupon/${slug}`}
				>
					<i class="ri-coupon-line h-8 w-8 text-2xl"></i>
					<span class="ml-2 text-base font-medium">쿠폰</span>
				</a>
				<a
					class="mt-2 flex h-12 w-full items-center rounded px-3 hover:bg-gray-300 dark:hover:bg-gray-800"
					href={`/calendar/${slug}`}
				>
					<i class="ri-calendar-line h-8 w-8 text-2xl"></i>
					<span class="ml-2 text-base font-medium">이벤트/가챠 캘린더</span>
				</a>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	a.active {
		background: #f9822c;
		color: #ffffff !important;
		i {
			color: #ffffff !important;
		}
	}
</style>
