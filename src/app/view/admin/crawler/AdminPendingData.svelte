<script lang="ts">
	// API가 아직 준비되지 않았습니다.
</script>

<div class="rounded-lg bg-white p-12 text-center shadow-md">
	<div class="mb-6 flex justify-center">
		<div class="rounded-full bg-orange-100 p-6">
			<i class="ri-tools-line text-6xl text-orange-500"></i>
		</div>
	</div>
	<h3 class="mb-2 text-xl font-bold text-gray-900">기능 준비 중입니다</h3>
	<p class="mb-6 text-gray-600">
		파싱 결과 검토 API가 아직 백엔드에 구현되지 않았습니다.<br />
		추후 업데이트될 예정입니다.
	</p>
	<div class="rounded-lg bg-gray-50 p-4 text-left text-sm text-gray-500">
		<p class="font-medium text-gray-700">필요한 API 엔드포인트:</p>
		<ul class="mt-2 list-inside list-disc space-y-1">
			<li>GET /api/v0/admin/parser/pending (검토 대기 목록)</li>
			<li>POST /api/v0/admin/parser/:id/approve (승인)</li>
			<li>POST /api/v0/admin/parser/:id/reject (거부)</li>
		</ul>
	</div>
</div>
