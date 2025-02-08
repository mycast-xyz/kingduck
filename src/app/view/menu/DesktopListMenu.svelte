<script lang="ts">
	// 컴포넌트 가져오기
	import RarityFilterMenu from './filter/RarityFilterMenu.svelte';
	import ListFilterMenu from './filter/ListFilterMenu.svelte';

	// props에서 데이터 가져오기
	const { data } = $props<{ data: any }>();
</script>

<div class="list-menu flex h-full p-4 pr-2">
	<div
		class="mt-12 w-80 flex-col items-center rounded border border-gray-100 bg-white text-gray-700 shadow-md"
	>
		<div class="gmae-title my-2 h-auto w-full p-4">
			<div class="gmae-logo-img">
				<img
					src={data.url + '/' + data.info.images[0].url}
					class="-mt-20 w-28 rounded-full border border-gray-100 shadow-md"
					alt={data.params}
				/>
			</div>
			<h3 class="pb-3 pt-2 text-2xl font-bold tracking-tight text-gray-700 dark:text-white">
				{data.info.title.kr}
			</h3>
		</div>
		<div class="flex w-full items-center">
			<div
				class="flex w-full items-center justify-between border-b border-t border-gray-200 border-gray-200 bg-gray-100 px-0 placeholder-gray-400 focus:outline-none"
			>
				<input
					type="text"
					class="py-3text-base mr-2 grow border-none bg-transparent px-5 font-normal text-gray-700 focus:outline-none dark:border-gray-700 dark:text-white"
					placeholder="검색어를 입력하세요"
				/>
				<button
					class="flex h-full items-center border-l bg-gray-300 p-3 px-4 text-gray-600 hover:bg-[#f9822c] hover:text-white"
				>
					<i class="ri-search-line text-xl"></i>
				</button>
			</div>
		</div>
		<div
			id="list-menu-content"
			class="flex h-[calc(100%-185px)] w-full flex-col items-center overflow-y-auto overflow-x-hidden"
		>
			<!-- 페이지 기능 -->
			<div class=" my-4 mt-1 flex w-full flex-col items-center p-4 pb-2">
				<h3 class="w-full py-3 pb-1 pl-1 text-lg font-bold text-gray-700">페이지 메뉴</h3>
				<a
					id="menu-item"
					class=" mt-2 flex h-12 w-full items-center rounded px-3 hover:bg-gray-300"
					href="#top"
				>
					<i class="ri-user-line h-8 w-8 text-2xl"></i>
					<span class="ml-2 text-base font-medium transition-all delay-300 duration-200 ease-in-out"
						>캐릭터</span
					>
				</a>
				<a
					id="menu-item"
					class=" mt-2 flex h-12 w-full items-center rounded px-3 hover:bg-gray-300"
					href="#top"
				>
					<i class="ri-vip-crown-2-line h-8 w-8 text-2xl"></i>
					<span class="ml-2 text-base font-medium transition-all delay-300 duration-200 ease-in-out"
						>티어 리스트</span
					>
				</a>
				<a
					id="menu-item"
					class=" mt-2 flex h-12 w-full items-center rounded px-3 hover:bg-gray-300"
					href="#top"
				>
					<i class="ri-box-3-line h-8 w-8 text-2xl"></i>
					<span class="ml-2 text-base font-medium transition-all delay-300 duration-200 ease-in-out"
						>아이템</span
					>
				</a>
			</div>

			<!-- 필터 기능 -->
			<RarityFilterMenu {data} />
			<!-- 필터 기능 -->
			{#if data?.type && Object.keys(data.type).length > 0}
				<ListFilterMenu {data} />
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	button {
		&.active {
			background: #f9822c;
			color: #ffffff !important;
			border-color: #f9822c;
			i {
				color: #ffffff !important;
			}
			img {
				filter: brightness(0) invert(1) !important;
			}
		}
		.text-Rating-5 {
			color: #fcba49;
		}
		.text-Rating-4 {
			color: #9f66c8;
		}
		.text-Rating-3 {
			color: #4175bb;
		}
	}
</style>
