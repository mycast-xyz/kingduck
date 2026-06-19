<script lang="ts">
	import FooterView from '../../app/view/footer/FooterView.svelte';
	// 연락 이메일 — 운영자 메일로 교체 가능.
	const CONTACT = 'w2story@naver.com';
	const EFFECTIVE = '2026-06-19';
</script>

<svelte:head>
	<title>개인정보처리방침 - KingDuck</title>
	<meta name="description" content="KingDuck(킹덕) 개인정보처리방침 — 쿠키 및 제3자 광고(Google AdSense) 안내." />
	<link rel="canonical" href="https://www.kingduck.xyz/privacy" />
</svelte:head>

<main class="mx-auto max-w-3xl px-5 py-10 text-gray-800 dark:text-gray-200">
	<h1 class="mb-2 text-2xl font-bold">개인정보처리방침</h1>
	<p class="mb-8 text-sm text-gray-500">시행일: {EFFECTIVE}</p>

	<section class="space-y-6 text-sm leading-relaxed">
		<p>
			KingDuck(이하 "사이트")은 이용자의 개인정보를 중요하게 생각하며, 「개인정보 보호법」 등 관련 법령을
			준수합니다. 본 방침은 사이트가 수집하는 정보와 그 이용·관리 방식을 안내합니다.
		</p>

		<div>
			<h2 class="mb-2 text-lg font-bold">1. 수집하는 정보</h2>
			<ul class="list-disc space-y-1 pl-5">
				<li>자동 수집: 접속 IP, 브라우저·기기·OS 정보, 방문 일시 및 페이지 이용 기록, 쿠키.</li>
				<li>회원 기능 이용 시: 로그인에 필요한 최소한의 식별 정보.</li>
			</ul>
		</div>

		<div>
			<h2 class="mb-2 text-lg font-bold">2. 쿠키 및 제3자 광고</h2>
			<p>
				사이트는 서비스 운영과 통계, 광고 게재를 위해 쿠키를 사용합니다. 특히 <strong>Google
				AdSense</strong> 등 제3자 광고 사업자는 쿠키(예: DoubleClick 쿠키)를 사용하여 이용자의 이전
				방문 기록 등을 바탕으로 맞춤형 광고를 게재할 수 있습니다.
			</p>
			<ul class="mt-2 list-disc space-y-1 pl-5">
				<li>
					Google의 광고 쿠키 사용 및 맞춤 광고 비활성화:
					<a class="text-orange-600 hover:underline" href="https://www.google.com/settings/ads" target="_blank" rel="noopener">google.com/settings/ads</a>
				</li>
				<li>
					제3자 광고 쿠키 일괄 거부:
					<a class="text-orange-600 hover:underline" href="https://www.aboutads.info/choices" target="_blank" rel="noopener">aboutads.info/choices</a>
				</li>
				<li>브라우저 설정에서 쿠키 저장을 거부할 수 있으나, 일부 기능 이용이 제한될 수 있습니다.</li>
			</ul>
			<p class="mt-2">
				또한 방문 통계 분석을 위해 Google Analytics를 사용할 수 있으며, 이때 수집되는 정보는 통계 목적으로만
				이용됩니다.
			</p>
		</div>

		<div>
			<h2 class="mb-2 text-lg font-bold">3. 이용 목적</h2>
			<p>수집된 정보는 서비스 제공·개선, 이용 통계 분석, 광고 게재 목적으로만 이용됩니다.</p>
		</div>

		<div>
			<h2 class="mb-2 text-lg font-bold">4. 보유 및 파기</h2>
			<p>
				수집된 정보는 이용 목적 달성 후 지체 없이 파기합니다. 다만 관련 법령에 따라 보존이 필요한 경우 해당
				기간 동안 보관합니다.
			</p>
		</div>

		<div>
			<h2 class="mb-2 text-lg font-bold">5. 제3자 제공</h2>
			<p>
				사이트는 이용자의 개인정보를 외부에 판매하거나 제공하지 않습니다. 단, 위 광고·분석 서비스 제공을
				위한 처리는 예외로 합니다.
			</p>
		</div>

		<div>
			<h2 class="mb-2 text-lg font-bold">6. 이용자의 권리</h2>
			<p>이용자는 자신의 정보에 대한 열람·정정·삭제를 요청할 수 있으며, 쿠키 사용을 거부할 수 있습니다.</p>
		</div>

		<div>
			<h2 class="mb-2 text-lg font-bold">7. 문의</h2>
			<p>개인정보 관련 문의: <a class="text-orange-600 hover:underline" href={`mailto:${CONTACT}`}>{CONTACT}</a></p>
		</div>

		<p class="text-gray-500">
			본 방침은 법령·정책 변경에 따라 수정될 수 있으며, 변경 시 본 페이지를 통해 공지합니다.
		</p>
	</section>
</main>

<FooterView />
