<script lang="ts">
	/**
	 * 카드형 기본 박스 형태
	 *
	 * 1.
	 * 색상 지정시 다음과 같은 형태를 지켜주시길 바랍니다.
	 * 만일 해당 색 형태 외에 그라데이션 형태의 색 추가시 확인 필요
	 * EX) bg-[16진수], bg-gray-600
	 * 참조 : https://tailwindcss.com/docs/customizing-colors
	 *
	 * 2.
	 * 등급의 표기가 별, 텍스트를 제외한 이미지 형태의 제공이 필요한 경우
	 * 코드상에 일부 SVG / 이미지 형태로 변경 하여 처리 할 필요가 있음.
	 *
	 *
	 **/
</script>

<div class="flex w-full justify-start p-3 pb-0">
	<!-- 반복 시작 지점 -->
	<div class="card-info mx-6 w-min first:ml-0">
		<div class="rating-card border-HY-Rating-5 items-center rounded-xl border-8">
			<img class="h-auto min-w-36 max-w-52 rounded-xl" src="./assets/test/1/1.webp" alt="" />
			<!-- 이미지 등급 표기 시작 지점 -->
			<div class="rating-info flex w-auto justify-center p-2 pb-0">
				<div class="icon h-6 w-6">
					<svg
						id="_레이어_1"
						data-name="레이어_1"
						xmlns="http://www.w3.org/2000/svg"
						version="1.1"
						viewBox="0 0 50 50"
					>
						<!-- Generator: Adobe Illustrator 29.2.0, SVG Export Plug-In . SVG Version: 2.1.0 Build 108)  -->
						<defs>
							<style>
								.st0 {
									fill: #fff;
								}
							</style>
						</defs>
						<path
							class="st0"
							d="M45.99,23.97c-11.02,0-19.96-8.94-19.96-19.96V0h-2.06v4.01c0,11.02-8.94,19.96-19.96,19.96H0v2.06h4.01c11.02,0,19.96,8.94,19.96,19.96v4.01h2.06v-4.01c0-11.02,8.94-19.96,19.96-19.96h4.01v-2.06h-4.01Z"
						/>
					</svg>
				</div>
				<div class="icon h-6 w-6">
					<svg
						id="_레이어_1"
						data-name="레이어_1"
						xmlns="http://www.w3.org/2000/svg"
						version="1.1"
						viewBox="0 0 50 50"
					>
						<!-- Generator: Adobe Illustrator 29.2.0, SVG Export Plug-In . SVG Version: 2.1.0 Build 108)  -->
						<defs>
							<style>
								.st0 {
									fill: #fff;
								}
							</style>
						</defs>
						<path
							class="st0"
							d="M45.99,23.97c-11.02,0-19.96-8.94-19.96-19.96V0h-2.06v4.01c0,11.02-8.94,19.96-19.96,19.96H0v2.06h4.01c11.02,0,19.96,8.94,19.96,19.96v4.01h2.06v-4.01c0-11.02,8.94-19.96,19.96-19.96h4.01v-2.06h-4.01Z"
						/>
					</svg>
				</div>
				<div class="icon h-6 w-6">
					<svg
						id="_레이어_1"
						data-name="레이어_1"
						xmlns="http://www.w3.org/2000/svg"
						version="1.1"
						viewBox="0 0 50 50"
					>
						<!-- Generator: Adobe Illustrator 29.2.0, SVG Export Plug-In . SVG Version: 2.1.0 Build 108)  -->
						<defs>
							<style>
								.st0 {
									fill: #fff;
								}
							</style>
						</defs>
						<path
							class="st0"
							d="M45.99,23.97c-11.02,0-19.96-8.94-19.96-19.96V0h-2.06v4.01c0,11.02-8.94,19.96-19.96,19.96H0v2.06h4.01c11.02,0,19.96,8.94,19.96,19.96v4.01h2.06v-4.01c0-11.02,8.94-19.96,19.96-19.96h4.01v-2.06h-4.01Z"
						/>
					</svg>
				</div>
				<div class="icon h-6 w-6">
					<svg
						id="_레이어_1"
						data-name="레이어_1"
						xmlns="http://www.w3.org/2000/svg"
						version="1.1"
						viewBox="0 0 50 50"
					>
						<!-- Generator: Adobe Illustrator 29.2.0, SVG Export Plug-In . SVG Version: 2.1.0 Build 108)  -->
						<defs>
							<style>
								.st0 {
									fill: #fff;
								}
							</style>
						</defs>
						<path
							class="st0"
							d="M45.99,23.97c-11.02,0-19.96-8.94-19.96-19.96V0h-2.06v4.01c0,11.02-8.94,19.96-19.96,19.96H0v2.06h4.01c11.02,0,19.96,8.94,19.96,19.96v4.01h2.06v-4.01c0-11.02,8.94-19.96,19.96-19.96h4.01v-2.06h-4.01Z"
						/>
					</svg>
				</div>
				<div class="icon h-6 w-6">
					<svg
						id="_레이어_1"
						data-name="레이어_1"
						xmlns="http://www.w3.org/2000/svg"
						version="1.1"
						viewBox="0 0 50 50"
					>
						<!-- Generator: Adobe Illustrator 29.2.0, SVG Export Plug-In . SVG Version: 2.1.0 Build 108)  -->
						<defs>
							<style>
								.st0 {
									fill: #fff;
								}
							</style>
						</defs>
						<path
							class="st0"
							d="M45.99,23.97c-11.02,0-19.96-8.94-19.96-19.96V0h-2.06v4.01c0,11.02-8.94,19.96-19.96,19.96H0v2.06h4.01c11.02,0,19.96,8.94,19.96,19.96v4.01h2.06v-4.01c0-11.02,8.94-19.96,19.96-19.96h4.01v-2.06h-4.01Z"
						/>
					</svg>
				</div>
			</div>
			<!-- 이미지 등급 표기 끝 지점 -->

			<!-- 글자 등급 표기 시작 지점 -->
			<h4 class=" text-center text-2xl font-bold tracking-tight text-white">SSR</h4>
			<!-- 글자 등급 표기 끝 지점 -->
		</div>
		<!-- 카드 이름 표기 시작 지점 -->
		<h3
			class="w-full break-keep px-4 pt-2 text-center text-lg font-bold text-gray-600 dark:text-gray-200"
		>
			꿈은 어디로 돌아가야 하는가
		</h3>
		<!-- 카드 이름 표기 끝 지점 -->
	</div>
	<!-- 반복 끝 지점 -->

	<!-- CSS-그라데이션 예제 | 말딸용
	<div class="card-info mx-6 w-min">
		<div class="rating-card border-URA-Rating-SSR overflow-hidden rounded-xl border-8">
			<img class="h-auto min-w-36 max-w-52 rounded-xl" src="./assets/test/1/7.png" alt="" />
			<h4 class=" text-center text-2xl font-bold tracking-tight text-white">SSR</h4>
		</div>
		<p
			class=" w-full break-keep px-4 pt-2 text-center text-lg font-bold text-gray-600 dark:text-gray-200"
		>
			다가오는 열기에 떠밀려
		</p>
	</div>
	-->
</div>
