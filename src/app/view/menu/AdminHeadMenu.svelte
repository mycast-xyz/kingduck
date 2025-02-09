<script lang="ts">
	import { writable } from 'svelte/store';
	import { authTokenService } from '../../service/auth/AuthTokenService';
	import { userNavActive } from '../../service/MainMenuService';

	const { title, infoText } = $props<{ title: string; infoText: string }>();

	// 토큰 유효성 검사
	const checkToken = () => {
		const token = authTokenService.getToken();
		return authTokenService.isTokenValid(token || '');
	};

	let isTokenValid = checkToken();
	const userInfo = writable({});

	// 토큰 정보 추출
	if (checkToken()) {
		const token = authTokenService.getToken();
		if (token) {
			userInfo.set(JSON.parse(atob(token.split('.')[1])));
		}
	}

	const toggleUserNav = () => {
		console.log('aa');

		userNavActive.update((userNavActive) => !userNavActive);
	};

	// 로그아웃 함수
	const logout = () => {
		authTokenService.clearTokens(); // 토큰 제거
		isTokenValid = false; // 토큰 유효성 상태 업데이트
		userInfo.set({}); // 유저 정보 초기화
		window.location.href = '/'; // 홈페이지로 리다이렉트
	};
</script>

<!-- 상단 사용자 프로필 -->
<div class="mb-8 flex items-center justify-between">
	<div>
		<h1 class="text-2xl font-bold text-gray-900">{title}</h1>
		<p class="text-sm text-gray-600">{infoText}</p>
	</div>
	<div class="flex items-center space-x-4 rounded-lg bg-white px-4 py-2">
		<button class="h-10 w-10 rounded-full bg-white text-gray-600 hover:bg-gray-200">
			<i class="ri-notification-3-line text-xl"></i>
		</button>

		<div class="relative mt-auto w-full">
			<button
				onclick={toggleUserNav}
				class="flex items-center space-x-3 rounded-full bg-white px-4 py-2 hover:bg-gray-200"
			>
				<img src="/assets/logo/profile.png" alt="프로필" class="h-8 w-8 rounded-full" />
				<div class="hidden text-left md:block">
					<p class="text-sm font-medium text-gray-900">관리자</p>
					<p class="text-xs text-gray-600">admin@kingduck.com</p>
				</div>
			</button>
			{#if $userNavActive}
				<div
					data-popover
					id="popover-user"
					class="shadow-xs absolute right-0 top-full z-50 inline-block w-60 rounded-lg border border-gray-200 bg-white text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
				>
					<div class="flex items-center gap-3 border-b border-gray-200 p-3">
						<img
							class="h-10 w-10 rounded-full"
							src="/assets/logo/profile.png"
							alt="프로필 이미지"
						/>
						<div>
							<p class="font-medium text-gray-900">관리자</p>
							<p class="text-sm text-gray-500">admin@kingduck.com</p>
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
	</div>
</div>
