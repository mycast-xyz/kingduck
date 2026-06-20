<script lang="ts">
	import type { PageData } from './$types';
	import { authTokenService } from '../app/service/auth/AuthTokenService';
	import SeoHead from '../app/view/SeoHead.svelte';

	const isAuthenticated = authTokenService.isAuthenticated;

	// 1부터 5까지의 랜덤값 생성 (setting이 'random'일 때 사용)
	const randomNumber = Math.floor(Math.random() * 5) + 1;

	let { data }: { data: PageData } = $props();

	// homeHeroBackground 값에 따라 실제 img src를 결정하는 헬퍼
	function heroSrc(bg: string): string {
		if (!bg || bg === 'random') return `/assets/main/bg_0${randomNumber}.webp`;
		if (/^bg_0[1-5]$/.test(bg)) return `/assets/main/${bg}.webp`;
		if (bg.startsWith('http://') || bg.startsWith('https://')) return bg;
		return `${data.url}/${bg.replace(/^\//, '')}`;
	}

	const bgSrc = heroSrc(data.setting?.homeHeroBackground ?? 'random');
	const visibleGames = data.info.slice(0, data.setting?.homeRecentGamesLimit ?? 6);

	const SITE = 'https://www.kingduck.xyz';
	const homeDescription =
		'킹덕(KingDuck) — 원신, 스타레일, 명조, 니케, 젠레스 존 제로 등 서브컬처 가챠 게임의 캐릭터·이벤트·캘린더·티어리스트·쿠폰 정보를 한곳에서.';
	// 구조화 데이터(JSON-LD) — 사이트 자체를 WebSite + Organization으로 표현.
	const homeJsonLd = [
		{
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: 'KingDuck',
			url: SITE,
			inLanguage: 'ko'
		},
		{
			'@context': 'https://schema.org',
			'@type': 'Organization',
			name: 'KingDuck',
			url: SITE,
			logo: `${SITE}/favicon.png`
		}
	];
</script>

<SeoHead
	description={homeDescription}
	keywords="킹덕, KingDuck, 원신, 스타레일, 명조, 니케, 젠레스존제로, 가챠, 티어리스트, 캘린더, 쿠폰"
	jsonLd={homeJsonLd}
/>

{#if data.isMobile}
	<div class="h-screen w-screen overflow-hidden overflow-x-hidden bg-gray-100 dark:bg-gray-800">
		<!-- 메인 컨텐츠 영역 -->
		<div class="relative h-full w-full">
			<!-- 배경 이미지 -->
			<div class="absolute inset-0">
				<img
					src={bgSrc}
					alt="Background"
					class="h-full w-full object-cover object-center"
				/>
			</div>

			<!-- 컨텐츠 오버레이 -->
			<div class="bg-gradient-m relative z-10 flex h-full flex-col items-end justify-end px-2">
				<div class="max-w-2xl pl-2 text-white">
					<!-- 메인 텍스트 -->
					<h1 class="mb-3 text-3xl font-bold tracking-tight">
						좋아하는 서브컬쳐 게임을<br />위한 정보 서비스
					</h1>
					<p class="mb-4 text-sm font-light">
						KingDuck는 붕괴: 스타레일, 소녀전선2: 망명, 니케, 젠레스 존 제로, 원신, 명조 와 같은
						서브 컬처 게임에 대한 정보를 제공하는 서비스입니다.
					</p>

					<!-- 버튼 그룹 -->
					{#if !$isAuthenticated}
						<div class="flex gap-4">
							<a
								href="/login/create"
								class="rounded-lg bg-white px-5 py-2 font-semibold text-gray-900 transition-colors hover:bg-gray-200"
							>
								회원가입
							</a>
							<a
								href="/login/"
								class="rounded-lg border-2 border-white px-5 py-2 font-semibold text-white transition-colors hover:bg-white hover:text-gray-900"
							>
								로그인
							</a>
						</div>
					{/if}
				</div>
				<!-- 버튼 그룹 -->
				<div class="mb-5 mt-10 flex flex-col pl-2">
					<h2 class="text-xl font-bold text-white">최근 추가된 게임</h2>
					<div class="mt-4 flex gap-3">
						{#each visibleGames as gameItem}
							<a href="/list/{gameItem.slug}" class="mr-4 flex flex-col items-center">
								<img src={data.url + '/' + gameItem.iconUrl} alt="Honkai Star Rail" class="w-32" />
								<p class="mt-2 text-xs font-medium text-white">{gameItem.name}</p>
							</a>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
{:else}
	<div
		class="h-screen w-screen min-w-[1700px] overflow-hidden overflow-x-hidden bg-gray-100 dark:bg-gray-800"
	>
		<!-- 메인 컨텐츠 영역 -->
		<div class="relative h-full w-full">
			<!-- 배경 이미지 -->
			<div class="absolute inset-0">
				<img
					src={bgSrc}
					alt="Background"
					class="h-full w-full object-cover object-center"
				/>
			</div>

			<!-- 컨텐츠 오버레이 -->
			<div class="bg-gradient relative z-10 flex h-full items-center px-20">
				<div class="max-w-2xl pl-20 text-white">
					<!-- 메인 텍스트 -->
					<h1 class="mb-6 text-5xl font-bold tracking-tight">
						좋아하는 서브컬쳐 게임을<br />위한 정보 서비스
					</h1>
					<p class="mb-8 text-lg font-medium">
						KingDuck는 붕괴: 스타레일, 소녀전선2: 망명, 니케, 젠레스 존 제로, 원신, 명조 와 같은
						서브 컬처 게임에 대한 정보를 제공하는 서비스입니다.
					</p>

					<!-- 버튼 그룹 -->
					{#if !$isAuthenticated}
						<div class="flex gap-4">
							<a
								href="/login/create"
								class="rounded-lg bg-white px-8 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-200"
							>
								회원가입
							</a>
							<a
								href="/login/"
								class="rounded-lg border-2 border-white px-8 py-3 font-semibold text-white transition-colors hover:bg-white hover:text-gray-900"
							>
								로그인
							</a>
						</div>
					{/if}
				</div>
				<!-- 버튼 그룹 -->
				<div class="absolute bottom-10 left-20 flex flex-col pl-20">
					<h2 class="text-2xl font-bold text-white">최근 추가된 게임</h2>
					<div class="mt-4 flex gap-3">
						{#each visibleGames as gameItem}
							<a href="/list/{gameItem.slug}" class="mr-4 flex flex-col items-center">
								<img src={data.url + '/' + gameItem.iconUrl} alt="Honkai Star Rail" class="w-32" />
								<p class="mt-2 text-xs font-medium text-white">{gameItem.name}</p>
							</a>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	.bg-gradient {
		background: rgb(0, 0, 0);
		background: linear-gradient(90deg, rgba(0, 0, 0, 0.7497373949579832) 9%, rgba(0, 0, 0, 0) 78%);
	}
	.bg-gradient-m {
		background: rgb(0, 0, 0);
		background: linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%);
	}
</style>
