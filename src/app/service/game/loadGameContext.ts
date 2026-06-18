import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';
import client, { getApiBaseUrl } from '../api/client';
import { MobileUtils } from '../../../utils/mobile/MobileUtils';
import { GameSettingInitService } from './GameSettingService';
import { getGameInit } from '../../model/game/GameRegistry';
import type { GameType } from '../../model/api/api';

export interface GameContext {
	isMobile: boolean;
	gameInfo: GameType;
	/** API base URL (컴포넌트에서 이미지/리소스 절대경로 구성용) */
	url: string;
}

/**
 * 게임 라우트(list/coupon/calendar/tier-list/content)의 공통 로드 프리앰블.
 *
 * 모든 게임 라우트가 반복하던 ① 모바일 감지 ② `/api/v0/game/{slug}` 조회 + 에러 처리
 * ③ GameRegistry로 게임 설정 주입을 한곳으로 모은다(redesign-plan A1 후속 — router 모듈화).
 *
 * 에러 정책(F-A3): 네트워크/서버 장애는 503, 게임 미존재는 404. "데이터 없음"으로 위장하지 않는다.
 *
 * @returns 모바일 여부 · 게임 정보 · API base URL
 * @throws 503(연결 불가) / 404(게임 없음)
 */
export async function loadGameContext(slug: string): Promise<GameContext> {
	const isMobile = browser ? MobileUtils.isMobile() : false;

	let gameInfo: GameType | undefined;
	let fetchFailed = false;

	try {
		const res = await client.get<GameType>('/api/v0/game/' + slug);
		if (res.status === 200) {
			gameInfo = res.data;
		} else {
			console.error('게임 정보 조회 실패: 서버 코드', res.status);
			fetchFailed = true;
		}
	} catch (err) {
		console.error('게임 정보 조회 실패:', err);
		fetchFailed = true;
	}

	if (fetchFailed) {
		throw error(503, '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
	}
	if (!gameInfo) {
		throw error(404, 'Game not found');
	}

	// 게임 설정 주입 (slug → Init은 GameRegistry가 단일 관리)
	const gameInit = getGameInit(slug);
	if (gameInit) {
		// DB에 저장된 등급 색상이 있으면 코드 기본값 위에 덮어쓴다(어드민 편집 반영).
		if (gameInit.list?.card) {
			const card = gameInit.list.card;
			const dbColors = (gameInfo as { rarityColors?: typeof card.rarityColors }).rarityColors;
			if (dbColors) {
				card.rarityColors = { ...card.rarityColors, ...dbColors };
			}
		}
		GameSettingInitService.updateGameInit(gameInit);
	}

	return { isMobile, gameInfo, url: getApiBaseUrl() };
}
