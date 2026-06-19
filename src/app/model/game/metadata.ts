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

/** 이환(Neverness to Everness, NTE) — everness.info GraphQL 소스 */
export interface NteSkill {
	name: string;
	type?: string;
	description?: string;
	icon?: string;
}
export interface NteCharacterMeta extends BaseCharacterMeta {
	element?: string; // 속성(DamageType, 영문 키: Incantation/Chaos/…)
	elementIconUrl?: string;
	elementKo?: string | null; // 게임 내 단일 글자 표기(주/암/령…)
	path?: string; // 형질(Path, 한글: 고체/액체/플라스마/기체/결합)
	pathIconUrl?: string;
	arcsTypeId?: string | null;
	faction?: string | null; // 진영
	birthday?: string | null;
	abilityName?: string | null; // 이능력 명칭
	avatarImageUrl?: string;
	skills?: NteSkill[];
	awaken?: { name: string; type?: string; description?: string }[];
	resonance?: { name: string; type?: string; description?: string }[];
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
export type NteCharacter = CharacterType<NteCharacterMeta>;

export type HsrLightcone = ItemType<HsrLightconeMeta>;
export type HsrRelicSet = ItemType<HsrRelicSetMeta>;
