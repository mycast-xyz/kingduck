<script lang="ts">
	// const MainViewActive: any = {
	// 	80: 'w-[calc(100%-80px)] ml-[80px]',
	// 	240: 'w-[calc(100%-240px)] ml-[240px]'
	// };

	// 1부터 5까지의 랜덤값 생성
	const randomNumber = Math.floor(Math.random() * 5) + 1;
</script>

<div
	class="h-screen w-screen min-w-[1700px] overflow-hidden overflow-x-hidden bg-gray-100 dark:bg-gray-800"
>
	<!-- 메인 컨텐츠 영역 -->
	<div class="relative h-full w-full">
		<!-- 배경 이미지 -->
		<div class="absolute inset-0">
			<img
				src="/assets/main/bg_0{randomNumber}.webp"
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
					KingDuck는 붕괴: 스타레일, 소녀전선2: 망명, 니케, 젠레스 존 제로, 원신, 명조 와 같은 서브
					컬처 게임에 대한 정보를 제공하는 서비스입니다.
				</p>

				<!-- 버튼 그룹 -->
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
			</div>
			<!-- 버튼 그룹 -->
			<div class="absolute bottom-10 left-20 flex flex-col pl-20">
				<h2 class="text-2xl font-bold text-white">최근 추가된 게임</h2>
				<div class="mt-4 flex gap-3">
					<a href="/list/HonkaiStarRail" class="mr-4 flex flex-col items-center">
						<img src="/assets/game/HonkaiStarRail.webp" alt="Honkai Star Rail" class="w-32" />
						<p class="mt-2 text-sm font-medium text-white">붕괴: 스타레일</p>
					</a>
					<a href="/list/HonkaiStarRail" class="mr-4 flex flex-col items-center">
						<img
							src="/assets/game/GirlsFrontline2-Exilium.webp"
							alt="Honkai Star Rail"
							class="w-32"
						/>
						<p class="mt-2 text-sm font-medium text-white">소녀전선2: 망명</p>
					</a>
					<a href="/list/HonkaiStarRail" class="mr-4 flex flex-col items-center">
						<img src="/assets/game/NIKKE.webp" alt="Honkai Star Rail" class="w-32" />
						<p class="mt-2 text-sm font-medium text-white">승리의 여신 니케</p>
					</a>
					<a href="/list/HonkaiStarRail" class="mr-4 flex flex-col items-center">
						<img src="/assets/game/zzz.webp" alt="Honkai Star Rail" class="w-32" />
						<p class="mt-2 text-sm font-medium text-white">젠로스 존 제로</p>
					</a>
				</div>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.bg-gradient {
		background: rgb(0, 0, 0);
		background: linear-gradient(90deg, rgba(0, 0, 0, 0.7497373949579832) 9%, rgba(0, 0, 0, 0) 78%);
	}
</style>
