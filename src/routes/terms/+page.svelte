<script lang="ts">
	import FooterView from '../../app/view/footer/FooterView.svelte';
	const EFFECTIVE = '2026-06-19';
</script>

<svelte:head>
	<title>이용약관 - KingDuck</title>
	<meta name="description" content="KingDuck(킹덕) 이용약관 — 비공식 가챠 게임 정보 사이트 안내 및 저작권 고지." />
	<link rel="canonical" href="https://www.kingduck.xyz/terms" />
</svelte:head>

<main class="mx-auto max-w-3xl px-5 py-10 text-gray-800 dark:text-gray-200">
	<h1 class="mb-2 text-2xl font-bold">이용약관</h1>
	<p class="mb-8 text-sm text-gray-500">시행일: {EFFECTIVE}</p>

	<section class="space-y-6 text-sm leading-relaxed">
		<div>
			<h2 class="mb-2 text-lg font-bold">1. 서비스 소개</h2>
			<p>
				KingDuck(이하 "사이트")은 여러 가챠 게임의 캐릭터·아이템·이벤트·캘린더·티어·쿠폰 등 정보를 정리해
				제공하는 <strong>비공식 정보 사이트</strong>입니다.
			</p>
		</div>

		<div>
			<h2 class="mb-2 text-lg font-bold">2. 저작권 및 권리 귀속</h2>
			<p>
				사이트에 표시되는 게임명·캐릭터·이미지 등 각 게임 관련 콘텐츠의 저작권 및 모든 권리는 해당 게임의
				개발사·배급사(예: HoYoverse, SHIFT UP, 넥슨, Kuro Games, 퍼펙트월드 등) 등 정당한 권리자에게
				있습니다. 본 사이트는 어떠한 게임사와도 <strong>공식 제휴·후원·승인 관계가 없습니다.</strong>
				자료는 정보 제공·이용자 편의를 위한 것이며, 권리자의 요청이 있을 경우 해당 자료를 수정·삭제합니다.
			</p>
		</div>

		<div>
			<h2 class="mb-2 text-lg font-bold">3. 정보의 정확성 및 면책</h2>
			<p>
				사이트가 제공하는 정보는 외부 출처를 정리한 참고용 자료로, 정확성·완전성·최신성을 보장하지 않습니다.
				게임 업데이트 등으로 실제와 다를 수 있으며, 이를 신뢰해 발생한 손해에 대해 사이트는 책임지지
				않습니다.
			</p>
		</div>

		<div>
			<h2 class="mb-2 text-lg font-bold">4. 이용자의 의무</h2>
			<p>
				이용자는 사이트를 불법적·악의적 목적(무단 크롤링/과도한 트래픽 유발, 서비스 방해 등)으로 이용해서는
				안 됩니다.
			</p>
		</div>

		<div>
			<h2 class="mb-2 text-lg font-bold">5. 약관의 변경 및 준거법</h2>
			<p>
				본 약관은 필요 시 변경될 수 있으며, 변경 시 본 페이지에 공지합니다. 본 약관은 대한민국 법령에 따라
				해석됩니다.
			</p>
		</div>
	</section>
</main>

<FooterView />
