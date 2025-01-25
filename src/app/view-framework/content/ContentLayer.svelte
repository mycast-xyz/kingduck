<script lang="ts">
	export let title: string;
</script>

<!-- 기본 틀 -->
<div
	class="mb-4 w-full rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800 md:mb-6"
>
	<div>
		<!-- 타이틀 -->
		<h5
			class="border-b border-gray-200 pb-3 pl-3 text-lg font-bold tracking-tight text-gray-900 dark:text-white md:text-2xl"
		>
			{title}
		</h5>
	</div>
	<!-- 컨텐츠 영역 -->
	<slot />
</div>
