<script lang="ts">
	import { writable } from 'svelte/store';
	import { mainMenuActive, navActive, userNavActive } from '$lib/stores/mainMenuStore';
	import { authTokenService } from '../../../../app/service/AuthTokenService';

	const { data } = $props<{ data: PageData }>();

	console.log(data);

	const toggleNav = () => {
		navActive.update((navActive) => !navActive);
		if ($navActive === false) {
			mainMenuActive.set(80);
		} else {
			mainMenuActive.set(240);
		}
	};
	const toggleUserNav = () => {
		userNavActive.update((userNavActive) => !userNavActive);
	};

	// 토큰 유효성 검사
	const checkToken = () => {
		const token = authTokenService.getToken();
		return authTokenService.isTokenValid(token || '');
	};

	console.log(checkToken());

	let isTokenValid = checkToken();

	const userInfo = writable({});

	// 토큰 정보 추출
	if (checkToken()) {
		const token = authTokenService.getToken();
		if (token) {
			userInfo.set(JSON.parse(atob(token.split('.')[1])));
			console.log('토큰 정보:', userInfo);
		}
	}

	// 로그아웃 함수
	const logout = () => {
		authTokenService.clearTokens(); // 토큰 제거
		isTokenValid = false; // 토큰 유효성 상태 업데이트
		userInfo.set({}); // 유저 정보 초기화
		window.location.href = '/'; // 홈페이지로 리다이렉트
	};
</script>

<header
	class:active={$navActive}
	class=" fixed inset-y-0 left-0 z-50 flex h-full w-[{$mainMenuActive}px] flex-col items-center rounded border-r border-r-gray-100 bg-white text-gray-700 shadow-md transition-all duration-75 ease-in-out dark:border-r-gray-800 dark:bg-gray-950"
>
	<!-- Logo area -->
	<a
		href="#top"
		id="menu-item"
		class="mt-3 flex w-full items-center px-4 pl-5"
		onclick={() => toggleNav()}
	>
		<img
			class="h-10 w-10 rounded-full fill-current"
			src="/assets/logo/500.png"
			alt="Your Company"
		/>
		<span
			class:active={$navActive}
			class="ml-2 text-sm font-bold transition-all delay-300 duration-200 ease-in-out"
			>King Duck</span
		>
	</a>
	<!-- Logo area -->
	<!-- Favorites area -->
	<div class="w-full px-2">
		<!-- 반복 area -->
		<div class="mt-3 flex w-full flex-col items-center border-t border-gray-300">
			{#each data.info as gameItem}
				<a
					data-sveltekit-preload-data="false"
					id="menu-item"
					class=" mt-2 flex h-12 w-full items-center rounded px-3 hover:bg-gray-300"
					href="/list/{gameItem.title.slug}"
				>
					<img
						class="h-10 w-10 rounded-full fill-current"
						src={data.url + '/' + gameItem.images[0].url}
						alt="HonkaiStarRail"
					/>
					<span
						class:active={navActive}
						class="ml-2 text-sm font-medium transition-all delay-300 duration-200 ease-in-out"
						>{gameItem.title.kr}</span
					>
				</a>
			{/each}
		</div>
		<!-- 반복 area 
		<div class="mt-2 flex w-full flex-col items-center border-t border-gray-300">
			{#each tmp_MenuSet as item}
				<a
					id="menu-item"
					class=" mt-2 flex h-12 w-full items-center rounded px-3 hover:bg-gray-300"
					href={item.href}
				>
					<img class="h-10 w-10 rounded-full fill-current" src={item.image} alt="HonkaiStarRail" />
					<span
						class:active={navActive}
						class="ml-2 text-sm font-medium transition-all delay-300 duration-200 ease-in-out"
						>{item.title}</span
					>
				</a>
			{/each}
		</div>-->
	</div>
	<!-- 사용자 메뉴 -->
	{#if isTokenValid}
		<div class="relative mt-auto h-16 w-full">
			<button
				type="button"
				aria-label="사용자 메뉴"
				class="mt-auto flex h-16 w-full items-center justify-center bg-gray-200 hover:bg-gray-300"
				onclick={toggleUserNav}
			>
				<i class="ri-user-line h-6 w-6 text-lg"></i>
			</button>
			{#if $userNavActive}
				<div
					data-popover
					id="popover-user"
					class="shadow-xs absolute bottom-16 left-0 z-50 inline-block w-60 rounded-lg border border-gray-200 bg-white text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
				>
					<div class="flex items-center gap-3 border-b border-gray-200 p-3">
						<img
							class="h-10 w-10 rounded-full"
							src="/assets/logo/profile.png"
							alt="프로필 이미지"
						/>
						<div>
							<p class="font-medium text-gray-900">{$userInfo.userName}</p>
							<p class="text-sm text-gray-500">{$userInfo.userId}</p>
						</div>
					</div>
					<div class="py-2">
						<a href="/profile" class="flex items-center px-4 py-2 hover:bg-gray-100">
							<i class="ri-user-line mr-3"></i>
							<span>프로필</span>
						</a>
						<a href="/settings" class="flex items-center px-4 py-2 hover:bg-gray-100">
							<i class="ri-settings-line mr-3"></i>
							<span>설정</span>
						</a>
						<div class="mt-2 border-t border-gray-200">
							<a href="/add-account" class="flex items-center px-4 py-2 hover:bg-gray-100">
								<i class="ri-instance-line mr-3"></i>
								<span>어드민 페이지 이동</span>
							</a>
							<button
								onclick={logout}
								class="flex w-full items-center px-4 py-2 text-left hover:bg-gray-100"
							>
								<i class="ri-logout-box-line mr-3"></i>
								<span>로그아웃</span>
							</button>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<a
			href="/login"
			aria-label="로그인"
			class="mt-auto flex h-16 w-full items-center justify-center bg-gray-200 hover:bg-orange-500 hover:text-white"
		>
			<i class="ri-user-line h-6 w-6 text-lg"></i>
		</a>
	{/if}
</header>

<style lang="scss">
	header {
		&.active {
			width: 240px;

			#menu-item {
				span {
					display: block;
					opacity: 1;
				}
			}
		}
		#menu-item {
			span {
				display: none;
				opacity: 0;
			}
		}
	}
</style>
