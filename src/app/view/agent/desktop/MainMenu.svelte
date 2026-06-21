<script lang="ts">
	import { writable } from 'svelte/store';
	import { fly } from 'svelte/transition';
	import { authTokenService } from '../../../service/auth/AuthTokenService';
	import { userNavActive } from '../../../../app/service/MainMenuService';
	import { FavoriteService } from '../../../service/FavoriteService';
	import type { PageData } from '../../../../routes/$types';
	import ThemeToggle from '../../common/ThemeToggle.svelte';
	import GameFlyoutPanel from './GameFlyoutPanel.svelte';

	const { data } = $props<{ data: PageData }>();

	// 토큰 유효성 검사
	const checkToken = () => {
		const token = authTokenService.getToken();
		return authTokenService.isTokenValid(token || '');
	};

	let isTokenValid = checkToken();

	const userInfo = writable<{ userName?: string; userId?: string }>({});

	// 토큰 정보 추출
	if (checkToken()) {
		const token = authTokenService.getToken();
		if (token) {
			userInfo.set(JSON.parse(atob(token.split('.')[1])));
		}
	}

	// 로그아웃 함수
	const logout = () => {
		authTokenService.clearTokens(); // 토큰 제거
		isTokenValid = false; // 토큰 유효성 상태 업데이트
		userInfo.set({}); // 유저 정보 초기화
		window.location.href = '/'; // 홈페이지로 리다이렉트
	};

	const toggleUserNav = () => {
		userNavActive.update((userNavActive) => !userNavActive);
	};

	// tooltip 표시 상태를 위한 상태 변수
	let showTooltip = $state<string | null>(null);

	type GameItem = { slug: string; iconUrl: string; name: string };

	// data.info가 배열인지 확인하고 안전하게 처리
	const gameList = $derived<GameItem[]>(Array.isArray(data?.info) ? data.info : []);

	// 즐겨찾기: 상단 고정 게임. 게임 수가 늘어 메뉴가 길어질 때 자주 보는 게임을 위로 올린다.
	const favorites = FavoriteService.favorites;
	const favoriteGames = $derived(gameList.filter((g) => $favorites.includes(g.slug)));
	// 레일에 보이는 게임 = 즐겨찾기. 없으면 기본 3개 노출(레일 세로 길이에 상한을 둔다).
	const railGames = $derived(favoriteGames.length ? favoriteGames : gameList.slice(0, 3));

	// 전체 게임 플라이아웃(우측 가로 그리드). 클릭 토글 + 바깥클릭/ESC 닫기.
	let flyoutOpen = $state(false);
	let flyoutContainer = $state<HTMLElement | null>(null);
	const toggleFlyout = () => (flyoutOpen = !flyoutOpen);
	const closeFlyout = () => (flyoutOpen = false);

	$effect(() => {
		if (!flyoutOpen) return;
		const onClick = (e: MouseEvent) => {
			if (flyoutContainer && !flyoutContainer.contains(e.target as Node)) closeFlyout();
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') closeFlyout();
		};
		window.addEventListener('click', onClick);
		window.addEventListener('keydown', onKey);
		return () => {
			window.removeEventListener('click', onClick);
			window.removeEventListener('keydown', onKey);
		};
	});
</script>

<header
	class=" w-80px] fixed inset-y-0 left-0 z-50 flex h-full flex-col items-center rounded border-r border-r-gray-100 bg-white text-gray-700 shadow-md transition-all duration-75 ease-in-out dark:border-r-gray-800 dark:bg-gray-950 dark:text-gray-200"
>
	<!-- Logo area -->
	<a href="/" id="menu-item" class="mt-3 flex w-full items-center px-4 pl-5">
		<img
			class="h-10 w-10 rounded-full fill-current"
			src="/assets/logo/500.png"
			alt="Your Company"
		/>
	</a>
	<!-- Logo area -->
	<!-- Favorites area -->
	<div class="w-full px-2">
		<!-- 반복 area -->
		<div
			class="mt-3 flex w-full flex-col items-center border-t border-gray-300 dark:border-gray-600"
		>
			<div class="relative border-b border-gray-300 pb-2">
				<a
					data-sveltekit-preload-data="false"
					id="menu-item"
					class:active={data.params === 'calendar'}
					class="mt-2 flex h-12 w-full items-center rounded px-3"
					href="/calendar"
					onmouseenter={() => (showTooltip = 'calendar')}
					onmouseleave={() => (showTooltip = null)}
				>
					<img
						class="outline-3 h-10 w-10 rounded-full fill-current outline outline-offset-0 outline-gray-200 dark:outline-gray-600"
						src="/assets/logo/weather-500.webp"
						alt="HonkaiStarRail"
					/>
				</a>

				{#if showTooltip === 'calendar' && !flyoutOpen}
					<div
						class="tooltip absolute left-16 top-3 z-50 w-auto rounded-lg bg-orange-400 px-3 py-2 text-white shadow-sm transition-opacity duration-300 dark:bg-orange-600"
						role="tooltip"
					>
						<p class="block whitespace-nowrap text-sm font-medium">가챠예보</p>
						<div class="tooltip-arrow" data-popper-arrow>
							<div class="absolute -left-1 top-3 h-4 w-4 rotate-45 bg-orange-400"></div>
						</div>
					</div>
				{/if}
			</div>
			<!-- 레일: 즐겨찾기(없으면 기본 3개) -->
			{#each railGames as gameItem (gameItem.slug)}
				{@render gameIcon(gameItem)}
			{/each}

			<!-- 전체 게임 트리거 + 플라이아웃 -->
			<div bind:this={flyoutContainer} class="relative w-full">
				<button
					type="button"
					aria-label="전체 게임"
					aria-haspopup="menu"
					aria-expanded={flyoutOpen}
					class="mt-2 flex h-12 w-full items-center justify-center rounded text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 {flyoutOpen
						? 'bg-gray-100 dark:bg-gray-800'
						: ''}"
					onclick={toggleFlyout}
				>
					<i class="ri-apps-2-line text-2xl"></i>
				</button>

				{#if flyoutOpen}
					<div
						class="absolute left-full top-0 z-50 ml-2"
						transition:fly={{ x: -10, duration: 150 }}
					>
						<GameFlyoutPanel
							games={gameList}
							url={data.url}
							activeSlug={data.params}
							onClose={closeFlyout}
						/>
					</div>
				{/if}
			</div>
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
	<!-- 테마 토글 (최하단, 사용자 버튼 바로 위에 고정) -->
	<div class="mb-2 mt-auto w-full px-2">
		<ThemeToggle />
	</div>
	<!-- 사용자 메뉴 -->
	{#if isTokenValid}
		<div class="relative h-16 w-full">
			<button
				type="button"
				aria-label="사용자 메뉴"
				class="flex h-16 w-full items-center justify-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
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
							<a href="/admin/dashboard" class="flex items-center px-4 py-2 hover:bg-gray-100">
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
			class="flex h-16 w-full items-center justify-center bg-gray-200 hover:bg-orange-500 hover:text-white dark:bg-gray-800 dark:hover:bg-orange-600 dark:hover:text-white"
		>
			<i class="ri-user-line h-6 w-6 text-lg"></i>
		</a>
	{/if}
</header>

{#snippet gameIcon(gameItem: GameItem)}
	<div class="group relative">
		<a
			data-sveltekit-preload-data="false"
			id="menu-item"
			class:active={data.params === gameItem.slug}
			class="mt-2 flex h-12 w-full items-center rounded px-3"
			href="/list/{gameItem.slug}"
			onmouseenter={() => (showTooltip = gameItem.slug)}
			onmouseleave={() => (showTooltip = null)}
		>
			<img
				class="outline-3 h-10 w-10 rounded-full fill-current outline outline-offset-0 outline-gray-200 dark:outline-gray-600"
				src={data.url + '/' + gameItem.iconUrl}
				alt={gameItem.name}
			/>
		</a>

		<!-- 즐겨찾기 토글 (호버 시 노출). 아이콘 클릭(네비게이션)과 분리 -->
		<button
			type="button"
			aria-label={$favorites.includes(gameItem.slug) ? '즐겨찾기 해제' : '즐겨찾기 추가'}
			class="absolute right-0 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs opacity-0 shadow transition-opacity duration-150 group-hover:opacity-100 dark:bg-gray-800"
			onclick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				FavoriteService.toggle(gameItem.slug);
			}}
		>
			<i
				class={$favorites.includes(gameItem.slug)
					? 'ri-star-fill text-yellow-400'
					: 'ri-star-line text-gray-400'}
			></i>
		</button>

		{#if showTooltip === gameItem.slug && !flyoutOpen}
			<div
				class="tooltip absolute left-16 top-3 z-50 w-auto rounded-lg bg-orange-400 px-3 py-2 text-white shadow-sm transition-opacity duration-300 dark:bg-orange-600"
				role="tooltip"
			>
				<p class="block whitespace-nowrap text-sm font-medium">
					{gameItem.name}
				</p>
				<div class="tooltip-arrow" data-popper-arrow>
					<div
						class="absolute -left-1 top-3 h-4 w-4 rotate-45 bg-orange-400 dark:bg-orange-600"
					></div>
				</div>
			</div>
		{/if}
	</div>
{/snippet}

<style lang="scss">
	header {
		#menu-item {
			&.active {
				img {
					outline-color: #fcba49;
				}
			}

			span {
				display: none;
				opacity: 0;
			}
		}
	}

	.tooltip {
		opacity: 0;
		animation: fadeIn 0.2s ease-in-out forwards;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
