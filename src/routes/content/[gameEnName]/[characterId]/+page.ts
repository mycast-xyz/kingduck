import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import client, { getApiBaseUrl } from '../../../../app/service/api/client';
import { browser } from '$app/environment';
import { MobileUtils } from '../../../../utils/mobile/MobileUtils';
import { GameSettingInitService } from '../../../../app/service/game/GameSettingService';
import { getGameInit } from '../../../../app/model/game/GameRegistry';
import { hsrItemService } from '../../../../app/service/game/starrail/HsrItemService';
// import { CharacterListService } from '../../../../app/service/character/CharacterListService';
import type { CharacterType, GameType, ResultCodeType } from '../../../../app/model/api/api';

export const load: PageLoad = async ({ params, url }) => {
	let isMobile = false;

	if (browser) {
		isMobile = MobileUtils.isMobile();
	}

	// 캐릭터 리스트 데이터 로드 (팀 추천 등에서 ID 참조를 위해 필요)
	// CharacterListService.clearCharacterConfig(); // 필요한 경우 초기화
	// await CharacterListService.getCharacterList(params.gameEnName);

	// 게임 설정 주입 (slug/레거시 별칭 → Init은 GameRegistry가 단일 관리)
	const gameInitConfig = getGameInit(params.gameEnName);
	if (gameInitConfig) {
		GameSettingInitService.updateGameInit(gameInitConfig);
	}

	let gameInfo: GameType | undefined;

	const characterListConfig = {
		params: {
			id: params.characterId,
			type: url.searchParams.get('type'),
			rarity: url.searchParams.get('rarity')
		}
	};

	const gameInfoConfig = {
		params: {
			//en: params.slug
		}
	};

	await client
		.get<GameType>('/api/v0/game/' + params.gameEnName, gameInfoConfig)
		.then((res) => {
			if (res.data) {
				gameInfo = res.data;
			} else {
				console.error('캐릭터 콘텐츠 게임 정보 조회 실패: 서버 응답 없음');
			}
		})
		.catch((err) => {
			console.error('캐릭터 콘텐츠 게임 정보 조회 실패:', err);
		});

	let data: CharacterType | undefined;
	await client
		.get<CharacterType>('/api/v0/character/' + params.gameEnName + '/' + params.characterId)
		.then((res) => {
			if (res.data) {
				data = res.data;
			} else {
				error(500, { message: '서버 코드 에러' });
			}
		})
		.catch((err) => {
			error(500, { message: '서버 코드 에러' });
		});

	const apiBase = getApiBaseUrl();

	// 공유/검색 썸네일용 og:image — 큰 카드 이미지 우선, 없으면 캐릭터 아이콘. 절대 URL로.
	// (InfoMainImageView의 폴백 로직과 동일한 경로 조립)
	const ogImage = (() => {
		const u = (data?.metadata as any)?.cardImageUrl || data?.imageUrl;
		if (!u) return undefined;
		if (u.startsWith('http')) return u;
		const hasExtension = /\.[a-z0-9]+$/i.test(u);
		return `${apiBase}/${u}${hasExtension ? '' : '.webp'}`;
	})();

	const SITE = 'https://www.kingduck.xyz';
	const description = `${data?.name}의 상세 정보를 제공합니다.`;

	// 구조화 데이터(JSON-LD) — 캐릭터 상세 페이지를 Article로 표현(구글 리치결과).
	const jsonLd = data
		? {
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: `${data?.name} - ${gameInfo?.name}`,
				description,
				...(ogImage ? { image: ogImage } : {}),
				inLanguage: 'ko',
				mainEntityOfPage: SITE + url.pathname,
				publisher: {
					'@type': 'Organization',
					name: 'KingDuck',
					logo: { '@type': 'ImageObject', url: `${SITE}/favicon.png` }
				}
			}
		: undefined;

	return {
		gameSlug: params.gameEnName,
		isMobile: isMobile,
		url: apiBase,
		info: data,
		title: `${data?.name} - ${gameInfo?.name}`,
		meta: {
			description,
			keywords: `${gameInfo?.name}, 게임, 정보, 가이드, ${data?.name}`,
			image: ogImage,
			jsonLd
		},
		gameInit: gameInitConfig
	};
};
