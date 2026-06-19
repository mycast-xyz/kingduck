<script lang="ts">
	import FooterView from '../../app/view/footer/FooterView.svelte';
	const CONTACT = 'w2story@naver.com';
</script>

<svelte:head>
	<title>소개 - KingDuck</title>
	<meta name="description" content="KingDuck(킹덕) 소개 — 가챠 게임 정보를 한곳에 모은 비공식 정보 사이트의 운영 목적과 안내." />
	<link rel="canonical" href="https://www.kingduck.xyz/about" />
</svelte:head>

<main class="mx-auto max-w-3xl px-5 py-10 text-gray-800 dark:text-gray-200">
	<h1 class="mb-6 text-2xl font-bold">소개 (About)</h1>

	<section class="space-y-6 text-sm leading-relaxed">
		<div>
			<h2 class="mb-2 text-lg font-bold">KingDuck은 어떤 사이트인가요?</h2>
			<p>
				KingDuck(킹덕)은 원신·붕괴: 스타레일·젠레스 존 제로·명조·승리의 여신: 니케·블루 아카이브·이환 등
				여러 가챠 게임의 <strong>캐릭터·아이템·이벤트·캘린더·티어 리스트·쿠폰 정보</strong>를 한 곳에 정리해
				제공하는 정보 사이트입니다. 흩어진 게임 정보를 빠르게 찾아보고 싶은 플레이어를 위해 운영됩니다.
			</p>
		</div>

		<div>
			<h2 class="mb-2 text-lg font-bold">무엇을 제공하나요?</h2>
			<ul class="list-disc space-y-1 pl-5">
				<li>게임별 캐릭터 목록·상세(스킬·스탯·프로필 등) 정보</li>
				<li>무기·장비 등 아이템 정보</li>
				<li>진행/예정 이벤트와 가챠 캘린더</li>
				<li>직접 만들고 공유하는 캐릭터 티어 리스트</li>
				<li>쿠폰/코드 정보</li>
			</ul>
		</div>

		<div>
			<h2 class="mb-2 text-lg font-bold">운영 안내</h2>
			<p>
				본 사이트는 개인 운영자가 취미로 운영하는 <strong>비공식 정보 사이트</strong>이며, 어떠한 게임사와도
				공식 제휴·후원 관계가 없습니다. 게임명·캐릭터·이미지 등의 저작권은 각 게임의 개발사·배급사 등 정당한
				권리자에게 있습니다. 자세한 내용은
				<a href="/terms" class="text-orange-600 hover:underline">이용약관</a>과
				<a href="/privacy" class="text-orange-600 hover:underline">개인정보처리방침</a>을 참고해 주세요.
			</p>
		</div>

		<div>
			<h2 class="mb-2 text-lg font-bold">문의</h2>
			<p>
				제보·수정 요청·제휴 등 문의는
				<a href="/contact" class="text-orange-600 hover:underline">문의 페이지</a> 또는
				<a href={`mailto:${CONTACT}`} class="text-orange-600 hover:underline">{CONTACT}</a> 로 연락 주세요.
			</p>
		</div>
	</section>
</main>

<FooterView />
