import type { CharacterType, ItemType } from '../api/api';

/**
 * 게임별 `metadata`(JSON) 타입 정의 (redesign-plan F-T4).
 *
 * 게임마다 metadata 키가 매우 다양하다(특히 wutheringwaves는 원본 raw 키 90+). 따라서 자주
 * 읽히는 공통/게임 핵심 필드만 명시하고 나머지는 index signature(`any`)로 둔다 — 비파괴적이고
 * 점진 채택이 가능하다. 소비처는 아래 typed 별칭(HsrCharacter 등)을 점진적으로 적용하면 된다.
 */

export interface BaseCharacterMeta {
	/** 정규 식별자(외부 소스 id). 전 게임 통일(B-H4b 선행으로 backfill 완료). */
	originalId?: string;
	rarity?: number;
	cardImageUrl?: string;
	description?: string;
	[key: string]: unknown;
}

/** Honkai: Star Rail (starrailstation 소스) — 프론트가 읽는 핵심 필드 */
export interface HsrCharacterMeta extends BaseCharacterMeta {
	element?: string; // DamageType (영문 키: Fire/Ice/…)
	path?: string; // BaseType (영문 키: Warlock/Knight/…)
	camp?: string;
	skills?: unknown[];
	skills_raw?: unknown[];
	ranks_raw?: unknown[]; // 성혼(RankListView)
	eidolons?: unknown[];
	skill_tree?: unknown[]; // 행적(TraceListView)
	skillTrees?: unknown[];
	stats?: Record<string, unknown>; // 승급별 인덱스 객체(StatsView)
	voiceLines?: unknown[];
	stories?: unknown[];
	relics?: unknown; // 유물 추천(BuildRecommendationView)
	lightcones?: unknown; // 광추 추천
	teams?: unknown; // 팀 추천
}

/** Reverse: 1999 */
export interface Reverse1999CharacterMeta extends BaseCharacterMeta {
	path?: string;
	element?: string;
	afflatus?: string;
	teams?: unknown;
	builds?: unknown;
	skins?: unknown[];
}

/** Wuthering Waves (encore.moe raw) */
export interface WwCharacterMeta extends BaseCharacterMeta {
	Id?: number | string;
	Skills?: unknown;
	SkillTree?: unknown;
	Properties?: unknown[];
	Breaches?: unknown[];
	WeaponTypeName?: string;
}

/** 승리의 여신: 니케 */
export interface NikkeCharacterMeta extends BaseCharacterMeta {
	class?: string; // attacker / defender / supporter
	burst?: string | number; // 1 | 2 | 3
	manufacturer?: string; // elysion / missilis / tetra / pilgrim / abnormal
	squad?: string; // 소속 분대명
	weaponName?: string; // 무기 이름
	cv?: Record<string, string>; // 성우 { kor, jpn, eng }
	/** Nikke-db.github.io l2d/<id>/ 폴더의 스켈레톤 id (예: "c010"). 크롤러가 채운다. */
	nikkeId?: string;
	/** Spine 런타임 버전 ("4.0" | "4.1"). 없으면 4.0 기본값. */
	spineVersion?: string;
}

/** Arknights: Endfield */
export interface EndfieldCharacterMeta extends BaseCharacterMeta {
	charId?: string;
	slug?: string;
	skills?: unknown;
	talents?: unknown;
	attributes?: unknown[];
	potentials?: unknown;
	profession?: number | string;
	weaponType?: number | string;
	factorySkills?: unknown;
}

export interface BaseItemMeta {
	originalId?: string;
	type?: string;
	rarity?: number;
	[key: string]: unknown;
}

/** HSR 광추(LightCone) */
export interface HsrLightconeMeta extends BaseItemMeta {
	cardImageUrl?: string;
	path?: string;
	refinements?: unknown;
	stats?: unknown;
}

/** HSR 유물 세트(RelicSet) */
export interface HsrRelicSetMeta extends BaseItemMeta {
	parts?: Record<string, unknown>;
	srsIconPath?: string;
	'2pc'?: { desc: string; params: number[] };
	'4pc'?: { desc: string; params: number[] };
}

// ── 게임별 typed 별칭 (소비처에서 점진 채택) ──
export type HsrCharacter = CharacterType<HsrCharacterMeta>;
export type Reverse1999Character = CharacterType<Reverse1999CharacterMeta>;
export type WwCharacter = CharacterType<WwCharacterMeta>;
export type EndfieldCharacter = CharacterType<EndfieldCharacterMeta>;

export type HsrLightcone = ItemType<HsrLightconeMeta>;
export type HsrRelicSet = ItemType<HsrRelicSetMeta>;
