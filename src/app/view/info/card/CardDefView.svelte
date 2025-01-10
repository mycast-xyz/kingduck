<script lang="ts">
	/**
	 * 카드형 기본 박스 형태
	 *
	 * 1.
	 * 색상 지정시 다음과 같은 형태를 지켜주시길 바랍니다.
	 * 만일 해당 색 형태 외에 그라데이션 형태의 색 추가시 확인 필요
	 * EX) text-[#16진수] or text-gray-700
	 * 참조 : https://tailwindcss.com/docs/customizing-colors
	 *
	 * 2.
	 * 박스 분할시 박스 분할 반복 시작 지점 부터 끝 지점 처리
	 * EX) 붕괴스타레일 - 유물 [터널, 차원]
	 *
	 * 3.
	 * 아직 이미지 2분할 형태의 지원은 하지 않음. - 개발필요
	 *
	 **/
</script>

<div class="flex w-full p-3">
	<!-- 반복 시작 지점 / 분할시 활용 -->
	<div class="w-auto py-3 pt-0">
		<h5 class="pb-3 pl-3 text-lg font-bold tracking-tight text-[#d34e44] dark:text-[#d34e44]">
			터널 유물
		</h5>
		<div class="flex">
			<!-- 반복 시작 지점 -->
			<div
				class="mx-4 max-w-sm basis-1/6 rounded-lg border border-gray-200 bg-[#d34e44] shadow dark:border-gray-700"
			>
				<div class=" relative h-auto w-full object-scale-down">
					<img class=" m-auto min-w-36 items-center p-4" src="./assets/test/2/5.webp" alt="" />
				</div>
				<div class="p-2">
					<h5 class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white">
						괴도
					</h5>
				</div>
			</div>
			<!-- 반복 끝 지점-->
		</div>
	</div>
	<!-- 반복 끝 지점 / 분할시 활용 -->
</div>
