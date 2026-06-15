<script lang="ts">
	import { onMount } from 'svelte';

	// props에서 데이터 가져오기
	const { data } = $props<{ data: any }>();

	let character: any = data.info;

	function getStatus(
		condition: boolean,
		successColor: string,
		successStatus: string,
		failureColor: string,
		failureStatus: string
	) {
		return condition
			? { color: successColor, status: successStatus }
			: { color: failureColor, status: failureStatus };
	}

	function getImageStatus(imageCount: any) {
		if (!imageCount) return getStatus(false, '', '정보 없음', 'bg-gray-500', '정보 없음');
		const hasCard = imageCount.card > 0;
		const hasArt = imageCount.art > 0;
		const hasVideo = imageCount.video > 0;
		if (!hasCard || !hasArt) {
			return getStatus(false, 'bg-red-500', '필수 이미지 누락', 'bg-red-500', '필수 이미지 누락');
		}
		return getStatus(hasVideo, 'bg-green-500', '완료', 'bg-yellow-500', '동영상 누락');
	}

	function getTypeStatus(type: any) {
		if (!type) return getStatus(false, '', '정보 없음', 'bg-gray-500', '정보 없음');
		const hasZeroValue = Object.values(type).some((value) => value === 0);
		return getStatus(!hasZeroValue, 'bg-green-500', '완료', 'bg-red-500', '타입 누락');
	}

	function getDetailsStatus(details: any) {
		if (!details) return getStatus(false, '', '정보 없음', 'bg-gray-500', '정보 없음');
		if (!details.itemData) {
			return getStatus(false, 'bg-red-500', '아이템 정보 누락', 'bg-red-500', '아이템 정보 누락');
		}
		if (!details.stats) {
			return getStatus(false, 'bg-red-500', '스탯 정보 누락', 'bg-red-500', '스탯 정보 누락');
		}
		return getStatus(true, 'bg-green-500', '완료', '', '');
	}

	function getSkillStatus(skillCount: any) {
		if (!skillCount) return getStatus(false, 'bg-red-500', '정보 없음', 'bg-red-500', '정보 없음');
		return getStatus(skillCount > 0, 'bg-green-500', '완료', 'bg-red-500', '스킬 누락');
	}

	function getIsReleasedStatus(isReleased: any, releaseDate: any) {
		if (!releaseDate) return getStatus(false, 'bg-red-500', '정보 없음', 'bg-red-500', '정보 없음');
		return getStatus(isReleased, 'bg-green-500', '', 'bg-red-500', '/출시 예정');
	}

	$effect(() => {});
</script>

<div class=" mx-auto flex w-[1400px] pb-4">
	<div class="w-1/3 pr-8">
		<div
			class="mb-4 w-full rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800 md:mb-6"
		>
			<div class="flex flex-col">
				<div class="mt-2">
					<div class="flex flex-col items-center">
						<div class="items-image mx-auto h-56 w-40">
							<img
								src={data.url + '/' + character.images.url + '.webp'}
								alt={character?.name?.kr}
								class=""
							/>
						</div>
						<div class=" text-center">
							<h3 class="text-xl font-semibold">{character?.name.kr}</h3>
							<p class="text-sm font-normal text-gray-500">
								{character?.name.en}, {character?.name.jp}
							</p>
							<p class="pt-1 text-sm font-normal text-gray-500">
								{character?.game.title.kr}
							</p>
						</div>
					</div>
				</div>
				<div class="mt-4">
					<div class="border-b border-gray-200">
						<h3 class="pb-3 text-lg font-semibold">캐릭터 정보 여부</h3>
					</div>
					<div class="mt-2 flex flex-col">
						<div class="text-md flex items-center py-2 text-gray-500">
							<p class=" mr-2 w-1/4 text-right font-semibold">출시여부 :</p>
							<div class="flex w-3/4 items-center">
								<div
									class="mr-2 h-3.5 w-3.5 rounded-full {getIsReleasedStatus(
										character.isReleased,
										character.releaseDate
									).color}"
								></div>
								<p class="text-base font-normal">
									{character.releaseDate}{getIsReleasedStatus(
										character.isReleased,
										character.releaseDate
									).status}
								</p>
							</div>
						</div>
						<div class="text-md flex items-center py-2 text-gray-500">
							<p class=" mr-2 w-1/4 text-right font-semibold">세부정보 :</p>
							<div class="flex w-3/4 items-center">
								<div
									class="mr-2 h-4 w-4 rounded-full {getDetailsStatus(character.details).color}"
								></div>
								<p class="font-normal">{getDetailsStatus(character.details).status}</p>
							</div>
						</div>
						<div class="text-md flex items-center py-2 text-gray-500">
							<p class=" mr-2 w-1/4 text-right font-semibold">스킬 :</p>
							<div class="flex w-3/4 items-center">
								<div
									class="mr-2 h-4 w-4 rounded-full {getSkillStatus(character.skillCount).color}"
								></div>
								<p class="font-normal">{getSkillStatus(character.skillCount).status}</p>
							</div>
						</div>
						<div class="text-md flex items-center py-2 text-gray-500">
							<p class=" mr-2 w-1/4 text-right font-semibold">타입 :</p>
							<div class="flex w-3/4 items-center">
								<div class="mr-2 h-4 w-4 rounded-full {getTypeStatus(character.type).color}"></div>
								<p class="font-normal">{getTypeStatus(character.type).status}</p>
							</div>
						</div>
						<div class="text-md flex items-center py-2 text-gray-500">
							<p class=" mr-2 w-1/4 text-right font-semibold">이미지 :</p>
							<div class="flex w-3/4 items-center">
								<div
									class="mr-2 h-4 w-4 rounded-full {getImageStatus(character.imageCount).color}"
								></div>
								<p class="font-normal">{getImageStatus(character.imageCount).status}</p>
							</div>
						</div>
					</div>
					<div class="my-4 flex justify-center">
						<button
							class="inline-flex items-center rounded-lg bg-green-400 px-4 py-2 text-white hover:bg-green-600"
						>
							<i class="ri-pencil-line mr-2"></i>
							수정
						</button>
						<button
							class="ml-2 inline-flex items-center rounded-lg border-2 border-red-500 px-4 py-2 text-red-500 hover:bg-red-500 hover:text-white"
						>
							<i class="ri-delete-bin-line mr-2"></i>
							삭제
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="w-2/3">
		<ul class="flex flex-wrap text-center text-sm font-medium text-gray-500 dark:text-gray-400">
			<li class="me-2">
				<a
					href="#"
					class="active inline-block rounded-lg bg-orange-500 px-4 py-3 text-white"
					aria-current="page"><i class="ri-information-line mr-2"></i>기본정보</a
				>
			</li>
			<li class="me-2">
				<a
					href="#"
					class="inline-block rounded-lg px-4 py-3 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
					><i class="ri-image-line mr-2"></i>이미지</a
				>
			</li>
			<li class="me-2">
				<a
					href="#"
					class="inline-block rounded-lg px-4 py-3 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
					><i class="ri-folder-user-line mr-2"></i>세부정보</a
				>
			</li>
			<li class="me-2">
				<a
					href="#"
					class="inline-block rounded-lg px-4 py-3 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
					><i class="ri-magic-line mr-2"></i>아이템</a
				>
			</li>
			<li class="me-2">
				<a
					href="#"
					class="inline-block rounded-lg px-4 py-3 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
					><i class="ri-user-add-line mr-2"></i>조합세팅</a
				>
			</li>
			<li>
				<a class="inline-block cursor-not-allowed px-4 py-3 text-gray-400 dark:text-gray-500"
					>Tab 5</a
				>
			</li>
		</ul>
	</div>
</div>
