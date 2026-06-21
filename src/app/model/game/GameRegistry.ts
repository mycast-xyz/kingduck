import type { GameInitConfig } from './GameInitConfig';
import { HonkaiStarRailInit } from './HonkaiStarRailInit';
import { GenshinInit } from './GenshinInit';
import { GirlsFrontline2Init } from './GirlsFrontline2Init';
import { nikkeInit } from './nikkeInit';
import { Reverse1999Init } from './Reverse1999Init';
import { WutheringWavesInit } from './WutheringWavesInit';
import { EndfieldInit } from './EndfieldInit';
import { ZzzInit } from './ZzzInit';
import { NteInit } from './NteInit';
import { BlueArchiveInit } from './BlueArchiveInit';

/**
 * 게임 레지스트리 — slug → GameInitConfig 팩토리의 단일 진실원.
 *
 * 기존엔 각 라우트(`list/[slug]`, `coupon/[slug]`, `calendar/[slug]`,
 * `calendar/[slug]/[id]`, `tier-list/[slug]`, `content/[gameEnName]/[characterId]`)의
 * `+page.ts`가 6개 Init 클래스를 각각 import하고 동일한 `switch(params.slug)`를 복붙했다.
 * → 새 게임 추가 시 6~7개 파일을 모두 고쳐야 했다(DRY 위반, redesign-plan A1).
 *
 * 이제 **새 게임 추가 = 이 파일의 GAME_INIT_FACTORIES에 한 줄 등록**이면 된다.
 * (`calendar/+page.ts`는 게임이 아니라 CalendarInit을 쓰므로 레지스트리 대상이 아니다.)
 */
const GAME_INIT_FACTORIES: Record<string, () => GameInitConfig> = {
	starrail: () => new HonkaiStarRailInit().setInit(),
	genshin: () => new GenshinInit().setInit(),
	// GirlsFrontline2/nikke의 Init은 아직 GameInitConfig를 완전히 만족하지 않는다(content.info의
	// option/main 형태 불일치, 데이터 0건의 비활성 게임). 정식 타이핑은 redesign-plan E3 과제.
	// 그때까지 레지스트리 도입을 막지 않도록 이 둘만 명시적으로 단언한다.
	GirlsFrontline2Exilium: () => new GirlsFrontline2Init().setInit() as unknown as GameInitConfig,
	nikke: () => new nikkeInit().setInit() as unknown as GameInitConfig,
	reverse1999: () => new Reverse1999Init().setInit(),
	wutheringwaves: () => new WutheringWavesInit().setInit(),
	endfield: () => new EndfieldInit().setInit(),
	zzz: () => new ZzzInit().setInit(),
	nte: () => new NteInit().setInit(),
	bluearchive: () => new BlueArchiveInit().setInit()
};

/**
 * 과거 enum 이름 별칭 → 정규 slug.
 * `content/[gameEnName]` 라우트 등 일부 경로가 enum 이름('HonkaiStarRail')을 넘기던 레거시 호환.
 */
const SLUG_ALIASES: Record<string, string> = {
	HonkaiStarRail: 'starrail',
	WutheringWaves: 'wutheringwaves'
};

/** 별칭을 정규 slug로 해석한다(별칭이 아니면 그대로 반환). */
export function resolveGameSlug(slugOrAlias: string): string {
	return SLUG_ALIASES[slugOrAlias] ?? slugOrAlias;
}

/**
 * slug(또는 레거시 별칭)에 해당하는 GameInitConfig를 생성해 반환한다.
 * 지원하지 않는 게임이면 `null`.
 */
export function getGameInit(slugOrAlias: string): GameInitConfig | null {
	const slug = resolveGameSlug(slugOrAlias);
	const factory = GAME_INIT_FACTORIES[slug];
	return factory ? factory() : null;
}

/** 지원하는 게임인지 여부. */
export function isGameSupported(slugOrAlias: string): boolean {
	return resolveGameSlug(slugOrAlias) in GAME_INIT_FACTORIES;
}

/** 지원하는 모든 정규 slug 목록. */
export function getSupportedSlugs(): string[] {
	return Object.keys(GAME_INIT_FACTORIES);
}
