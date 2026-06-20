import type { PageLoad, EntryGenerator } from './$types';
import { get } from 'svelte/store';
import { browser } from '$app/environment';
import { toastStore } from '../../../app/service/ToastService';
import { getApiBaseUrl } from '../../../app/service/api/client';
import { isGameSupported } from '../../../app/model/game/GameRegistry';
import type { ElementType, GameType } from '../../../app/model/api/api';

// 캐릭터 리스트 서비스
import {
	CharacterListService,
	characterList
} from '../../../app/service/character/CharacterListService';

// 게임 라우트 공통 로드 (모바일 감지 + 게임정보 조회 + 설정 주입)
import { loadGameContext } from '../../../app/service/game/loadGameContext';

// SEO: 게임 list 랜딩을 빌드 시 실제 HTML로 프리렌더(네이버 등 JS 약한 크롤러 대비).
export const prerender = true;

// 프리렌더 대상 slug 열거 — 빌드 시 백엔드 게임 목록에서 지원 게임(Init 보유)만 추린다.
// (raw fetch라 응답 봉투 {resultCode, data}를 직접 언랩. 실패하면 빈 배열 → 해당 라우트는 CSR 폴백.)
export const entries: EntryGenerator = async () => {
	try {
		const res = await fetch(`${getApiBaseUrl()}/api/v0/game/list`);
		const json = await res.json();
		const games: GameType[] = json?.data ?? json ?? [];
		return games
			.map((g) => g.slug)
			.filter((s): s is string => !!s && isGameSupported(s))
			.map((slug) => ({ slug }));
	} catch (e) {
		console.error('[prerender] list/[slug] entries 조회 실패 — CSR 폴백:', e);
		return [];
	}
};

// 캐릭터 목록 서비스
export const load: PageLoad = async ({ params }) => {
	const { isMobile, gameInfo, url } = await loadGameContext(params.slug);
	const gameType: ElementType[] | undefined = undefined;

	CharacterListService.clearCharacterConfig();
	CharacterListService.getCharacterListConfig(gameInfo.id, '', '');
	const listStatus = await CharacterListService.getCharacterList(params.slug);
	// get()으로 현재 값만 읽는다 — subscribe는 unsubscribe 없이 load마다 누수했다 (F-B1).
	const characterListData = get(characterList);

	// 캐릭터 목록 실패는 게임 정보와 달리 페이지는 살리고 토스트로 알린다 (F-A3).
	// 'stale'(빠른 네비로 superseded된 응답)은 에러로 취급하지 않는다 (F-B2).
	if (browser && listStatus === 'error') {
		toastStore.error('캐릭터 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
	}

	return {
		params: params.slug,
		url,
		isMobile: !!isMobile,
		info: gameInfo,
		list: characterListData,
		listError: listStatus === 'error',
		type: gameType,
		title: `${gameInfo.name} - 게임 정보`,
		meta: {
			description: `${gameInfo.name}의 상세 정보를 제공합니다.`,
			keywords: `${gameInfo.name}, 게임, 정보, 가이드`
		}
	};
};
