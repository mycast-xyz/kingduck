<script lang="ts">
	import { mainMenuActive } from '$lib/stores/mainMenuStore.js';
	import ListCardView from '../../list/ListCardView.svelte';

	const { data } = $props<{}>();

	const mainViewActive: any = {
		80: 'w-[calc(100%-80px)] ml-[80px]',
		240: 'w-[calc(100%-240px)] ml-[240px]'
	};
</script>

<div
	class="h-screen w-screen min-w-[1700px] overflow-hidden overflow-x-hidden bg-gray-100 dark:bg-gray-800"
>
	<article
		id="list-componet"
		class="{mainViewActive[$mainMenuActive]} my-0 mr-0 flex h-full overflow-hidden"
	>
		<div class="list-menu flex h-full p-4">
			<div
				class="mt-12 w-80 flex-col items-center rounded border border-gray-100 bg-white p-4 text-gray-700 shadow-md"
			>
				<div class="gmae-title my-2 h-auto w-full">
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
			<ListCardView {data} />
		</div>
	</article>
</div>
