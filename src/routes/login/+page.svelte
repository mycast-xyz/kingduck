<script lang="ts">
	import type { PageData } from './$types';

	import { goto } from '$app/navigation';
	import { toastStore } from '../../app/service/ToastService';
	import { authTokenService } from '../../app/service/AuthTokenService';

	const { data } = $props<{ data: any }>();
	const currentUrl = data.url;

	// 이메일 검증 상태
	let isEmailValid = $state(false);
	let emailError = $state('');

	// 비밀번호 검증 상태
	let isPasswordValid = $state(false);
	let passwordError = $state('');

	const handleSubmit = async () => {
		const formData = new FormData(document.getElementById('createForm') as HTMLFormElement);
		const data = Object.fromEntries(formData.entries());
		// 서버 요청
		try {
			const response = await fetch(`${currentUrl}/api/v0/account/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});

			if (!response.ok) {
				const data = await response.json();
				switch (data.item) {
					case 'email':
						emailError = data.resultMsg;
						isEmailValid = false;
						break;
					case 'password':
						passwordError = data.resultMsg;
						isPasswordValid = false;
						break;
					case 'user':
						break;
					default:
						break;
				}
				toastStore.error(data.resultMsg ? data.resultMsg : '로그인에 실패했습니다.');
			} else {
				const responseData = await response.json();

				// JWT 토큰 저장
				if (responseData.accessToken) {
					authTokenService.setToken(responseData.accessToken);
				}
				if (responseData.refreshToken) {
					authTokenService.setRefreshToken(responseData.refreshToken);
				}

				toastStore.success('로그인이 완료되었습니다.');
				goto('/');
			}
		} catch (error) {
			console.error('서버 연결 중 오류가 발생했습니다.', error);
			toastStore.error('서버 연결 중 오류가 발생했습니다.');
		}
	};
</script>

<div class="h-screen w-screen overflow-hidden overflow-x-hidden bg-gray-100 dark:bg-gray-800">
	<div class="flex h-full w-full items-center justify-center">
		<!-- Left side - Image -->
		<div class="hidden h-full w-2/3 bg-gray-50 md:flex">
			<div class="flex h-full items-center justify-center overflow-hidden">
				<img
					src="/assets/login/bg_02.webp"
					alt="Login illustration"
					class="h-full w-full object-cover object-center"
				/>
			</div>
		</div>
		<!-- Right side - Login form -->
		<div class="ml-auto flex h-full w-full flex-col justify-center bg-white p-8 md:w-1/3">
			<div class="mb-8">
				<img src="/assets/logo/500.png" alt="Logo" class="mb-4 h-20 w-20 rounded-full" />
				<h2 class="mb-2 text-2xl font-bold">환영합니다!</h2>
				<p class="text-sm text-gray-600">계정에 로그인해주세요</p>
			</div>

			<form class="flex flex-col gap-4" onsubmit={handleSubmit} id="createForm">
				<div>
					<label for="email" class="mb-1 block text-sm font-medium">이메일</label>
					<input
						type="email"
						id="email"
						name="email"
						class="h-14 w-full rounded-lg border border-gray-300 p-4 text-sm font-medium focus:border-orange-500 focus:outline-none"
						placeholder="이메일을 입력하세요"
					/>
				</div>
				<div>
					<label for="password" class="mb-1 block text-sm font-medium">비밀번호</label>
					<input
						type="password"
						id="password"
						name="password"
						class="h-14 w-full rounded-lg border border-gray-300 p-2 text-sm font-medium focus:border-orange-500 focus:outline-none"
						placeholder="비밀번호를 입력하세요"
					/>
				</div>
				<div class="flex items-center justify-between">
					<a href="/login/password" class="text-sm text-orange-600 hover:underline">비밀번호 찾기</a
					>
				</div>
				<button
					type="submit"
					class="mt-2 h-14 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-orange-500"
				>
					로그인
				</button>
				<button
					type="button"
					class=" mt-2 flex h-14 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
				>
					<i class="ri-google-fill h-5 w-5"></i>
					<span>Google로 로그인</span>
				</button>

				<div class="flex items-center pt-4">
					<p class="pr-4 text-base font-normal text-gray-400">아직 회원이 아니신가요?</p>
					<a href="/login/create" class="text-base text-orange-600 hover:underline"> 회원가입 </a>
				</div>
			</form>
		</div>
	</div>
</div>
