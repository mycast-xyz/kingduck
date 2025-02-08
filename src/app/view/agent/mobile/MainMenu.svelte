<script lang="ts">
	import { WindowService } from '../../../service/WindowService';

	const { data } = $props<{ data: PageData }>();

	let navActive = $state(false);
	const toggleNav = () => {
		navActive = !navActive;
		WindowService.closeModal();
	};
</script>

<header class="" class:active={navActive}>
	<div
		class="shadow-m fixed inset-y-0 left-0 z-50 flex h-16 w-screen flex-wrap items-center justify-between border-b border-gray-200 bg-white p-3"
	>
		<a href="/">
			<img
				class="h-10 w-10 rounded-full fill-current"
				src="/assets/logo/500.png"
				alt="Your Company"
			/>
		</a>
		<div class="flex">
			<button id="hamburger" onclick={toggleNav} aria-label="메뉴 열기">
				<i class="ri-menu-line h-10 w-10 text-2xl"></i>
			</button>
		</div>
	</div>
	<div
		class="toggle text-bold fixed inset-y-0 left-0 top-16 z-50 hidden h-full w-full bg-white text-right"
	>
		<div class="w-full px-2">
			<!-- 반복 area -->
			<div class=" flex w-full flex-col items-center border-t border-gray-300">
				{#each data.info as gameItem}
					<a
						id="menu-item"
						class=" mt-2 flex h-12 w-full items-center rounded px-1 hover:bg-gray-300"
						href="/list/{gameItem.title.slug}"
						onclick={() => {
							toggleNav();
						}}
					>
						<img
							class="h-10 w-10 rounded-full fill-current"
							src={data.url + '/' + gameItem.images[0].url}
							alt="HonkaiStarRail"
						/>
						<span class="ml-2 text-sm font-medium transition-all delay-300 duration-200 ease-in-out"
							>{gameItem.title.kr}</span
						>
					</a>
				{/each}
			</div>
			<!-- 반복 area
			<div class="mt-2 flex w-full flex-col items-center border-t border-gray-300 pb-5">
				{#each tmp_MenuSet as item}
					<a
						data-sveltekit-preload-data="false"
						id="menu-item"
						class=" mt-2 flex h-12 w-full items-center rounded px-1 hover:bg-gray-300"
						href={item.href}
					>
						<img
							class="h-10 w-10 rounded-full fill-current"
							src={item.image}
							alt="HonkaiStarRail"
						/>
						<span
							class:active={navActive}
							class="ml-2 text-sm font-medium transition-all delay-300 duration-200 ease-in-out"
							>{item.title}</span
						>
					</a>
				{/each}
			</div> -->
		</div>
	</div>
</header>

<style lang="scss">
	header {
		&.active {
			.toggle {
				display: block;
				opacity: 1;
			}
		}
		.toggle {
			display: none;
			opacity: 0;
		}
	}
</style>
