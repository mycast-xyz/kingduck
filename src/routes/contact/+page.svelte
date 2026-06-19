<script lang="ts">
	import FooterView from '../../app/view/footer/FooterView.svelte';

	// 실제로 동작하는 문의 이메일. (kingduck.xyz 도메인 메일 라우팅 또는 운영자 메일로 연결)
	const CONTACT = 'w2story@naver.com';

	let name = $state('');
	let email = $state('');
	let message = $state('');

	// 백엔드 폼 핸들러 없이도 동작하도록 mailto로 메일 클라이언트를 연다.
	function send() {
		const subject = encodeURIComponent(`[KingDuck 문의] ${name || '제목 없음'}`);
		const body = encodeURIComponent(
			`이름: ${name}\n회신 이메일: ${email}\n\n${message}`
		);
		window.location.href = `mailto:${CONTACT}?subject=${subject}&body=${body}`;
	}
</script>

<svelte:head>
	<title>문의 - KingDuck</title>
	<meta name="description" content="KingDuck(킹덕) 문의 — 제보·수정 요청·제휴 등 연락처와 문의 양식." />
	<link rel="canonical" href="https://www.kingduck.xyz/contact" />
</svelte:head>

<main class="mx-auto max-w-2xl px-5 py-10 text-gray-800 dark:text-gray-200">
	<h1 class="mb-2 text-2xl font-bold">문의 (Contact)</h1>
	<p class="mb-8 text-sm text-gray-600 dark:text-gray-400">
		정보 오류 제보, 수정 요청, 저작권 관련 요청, 제휴 등 무엇이든 아래로 연락 주세요.
	</p>

	<div class="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-700 dark:bg-gray-800">
		<p>
			이메일:
			<a href={`mailto:${CONTACT}`} class="font-semibold text-orange-600 hover:underline">{CONTACT}</a>
		</p>
		<p class="mt-1 text-gray-500">보통 영업일 기준 며칠 내에 답변드립니다.</p>
	</div>

	<form
		class="space-y-4"
		onsubmit={(e) => {
			e.preventDefault();
			send();
		}}
	>
		<div>
			<label for="c-name" class="mb-1 block text-sm font-medium">이름</label>
			<input
				id="c-name"
				bind:value={name}
				required
				class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none dark:border-gray-600 dark:bg-gray-900"
			/>
		</div>
		<div>
			<label for="c-email" class="mb-1 block text-sm font-medium">회신 받을 이메일</label>
			<input
				id="c-email"
				type="email"
				bind:value={email}
				required
				class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none dark:border-gray-600 dark:bg-gray-900"
			/>
		</div>
		<div>
			<label for="c-msg" class="mb-1 block text-sm font-medium">문의 내용</label>
			<textarea
				id="c-msg"
				bind:value={message}
				required
				rows="6"
				class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none dark:border-gray-600 dark:bg-gray-900"
			></textarea>
		</div>
		<button
			type="submit"
			class="rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600"
		>
			메일로 문의 보내기
		</button>
		<p class="text-xs text-gray-400">
			버튼을 누르면 작성한 내용으로 메일 작성 창이 열립니다. 메일 앱이 없으면 위 이메일 주소로 직접 보내주세요.
		</p>
	</form>
</main>

<FooterView />
