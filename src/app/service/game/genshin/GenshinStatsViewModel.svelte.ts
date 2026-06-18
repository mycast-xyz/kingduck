import { StatsViewModelBase } from '../common/StatsViewModelBase.svelte';

/**
 * 원신 기초 스탯 뷰모델 — StatsView가 starrail과 동일하게 렌더하도록 어댑팅.
 *
 * 원신 스탯은 metadata.stats = Ambr `upgrade` 객체로 저장된다:
 *   { prop: [{ propType:'FIGHT_PROP_BASE_HP', initValue, type:'GROW_CURVE_HP_S4' }, …],
 *     promote: [{ promoteLevel, addProps:{ FIGHT_PROP_BASE_HP, …, <돌파특수스탯> }, costItems, coinCost }, …] }
 *
 * 레벨별 기초값 = initValue * 성장곡선배수(level) + 해당 돌파단계 addProps(단계별 누적 총합).
 * 성장곡선(GROW_CURVE_*_S4/S5)은 metadata에 없어, Ambr `api/v2/static/avatarCurve`에서
 * 돌파 구간(1·20·40·50·60·70·80·90) 배수만 추출해 아래 CURVE 표에 임베드했다
 * (HP·ATTACK 곡선은 동일 값이라 등급별 S4/S5 두 종류만 둠).
 * 검증: 케이아(4★) L90 HP 11636/ATK 223/DEF 792, 아야카(5★) L90 HP 12858/ATK 342/DEF 784 — 인게임 일치.
 */

const LEVELS = [1, 20, 40, 50, 60, 70, 80, 90];

// 성장곡선 배수(index가 LEVELS와 정렬). Ambr api/v2/static/avatarCurve 기준.
const CURVE: Record<'S4' | 'S5', number[]> = {
	S4: [1, 2.569, 4.22, 5.046, 5.872, 6.697, 7.523, 8.349],
	S5: [1, 2.594, 4.307, 5.176, 6.054, 6.94, 7.836, 8.739]
};

// LEVELS[i] → 적용할 누적 돌파 단계(promoteLevel). 1·20은 돌파 전(0).
const PHASE_FOR_LEVEL = [0, 0, 1, 2, 3, 4, 5, 6];

const BASE_HP = 'FIGHT_PROP_BASE_HP';
const BASE_ATK = 'FIGHT_PROP_BASE_ATTACK';
const BASE_DEF = 'FIGHT_PROP_BASE_DEFENSE';

// 돌파 특수 스탯 FIGHT_PROP_* → { 한글명, 퍼센트 여부 }
const PROP_LABELS: Record<string, { name: string; percent: boolean }> = {
	FIGHT_PROP_CHARGE_EFFICIENCY: { name: '원소 충전 효율', percent: true },
	FIGHT_PROP_CRITICAL: { name: '치명타 확률', percent: true },
	FIGHT_PROP_CRITICAL_HURT: { name: '치명타 피해', percent: true },
	FIGHT_PROP_HEAL_ADD: { name: '치유 효과', percent: true },
	FIGHT_PROP_ELEMENT_MASTERY: { name: '원소 마스터리', percent: false },
	FIGHT_PROP_ATTACK_PERCENT: { name: '공격력', percent: true },
	FIGHT_PROP_HP_PERCENT: { name: 'HP', percent: true },
	FIGHT_PROP_DEFENSE_PERCENT: { name: '방어력', percent: true },
	FIGHT_PROP_PHYSICAL_ADD_HURT: { name: '물리 피해 보너스', percent: true },
	FIGHT_PROP_FIRE_ADD_HURT: { name: '불 원소 피해 보너스', percent: true },
	FIGHT_PROP_WATER_ADD_HURT: { name: '물 원소 피해 보너스', percent: true },
	FIGHT_PROP_WIND_ADD_HURT: { name: '바람 원소 피해 보너스', percent: true },
	FIGHT_PROP_ELEC_ADD_HURT: { name: '번개 원소 피해 보너스', percent: true },
	FIGHT_PROP_GRASS_ADD_HURT: { name: '풀 원소 피해 보너스', percent: true },
	FIGHT_PROP_ICE_ADD_HURT: { name: '얼음 원소 피해 보너스', percent: true },
	FIGHT_PROP_ROCK_ADD_HURT: { name: '바위 원소 피해 보너스', percent: true }
};

interface StatRow {
	key: string;
	name: string;
	value: string;
	icon: string;
}

export class GenshinStatsViewModel extends StatsViewModelBase {
	levels = LEVELS;

	constructor(listData: any, gameId: string, currentUrl = '') {
		super(listData, gameId, currentUrl);
		// 원신은 만렙 90 기준으로 진입
		this.currentLevel = 90;
	}

	// 돌파 재료는 별도 MainItemView 섹션이라 StatsView 비용 표시는 미사용. 추상 메서드만 충족.
	protected getCostItemId(): string {
		return '';
	}

	// listData가 metadata.stats(=upgrade) 객체로 들어오는 경우와 metadata 전체로 들어오는 경우 모두 흡수.
	private get upgrade(): any {
		const d = this.listData;
		if (!d) return null;
		if (d.prop || d.promote) return d;
		if (d.stats) return d.stats;
		return null;
	}

	stats = $derived.by<StatRow[]>(() => {
		const up = this.upgrade;
		if (!up || !Array.isArray(up.prop)) return [];

		const li = this.levels.indexOf(this.currentLevel);
		const levelIdx = li < 0 ? this.levels.length - 1 : li;
		const phase = PHASE_FOR_LEVEL[levelIdx];

		const promote: any[] = Array.isArray(up.promote) ? up.promote : [];
		const addProps: Record<string, number> =
			promote.find((p) => p?.promoteLevel === phase)?.addProps || {};

		const findProp = (propType: string) =>
			up.prop.find((p: any) => p?.propType === propType) || null;

		const curveMult = (p: any): number => {
			const arr = /S5/.test(p?.type || '') ? CURVE.S5 : CURVE.S4;
			return arr[levelIdx] ?? 1;
		};

		const rows: StatRow[] = [];

		// 기초 스탯(HP/ATK/DEF) = initValue * 곡선배수 + 돌파 누적 보너스
		const baseDefs: Array<{ propType: string; key: string; name: string }> = [
			{ propType: BASE_HP, key: 'HP', name: 'HP' },
			{ propType: BASE_ATK, key: 'ATK', name: '공격력' },
			{ propType: BASE_DEF, key: 'DEF', name: '방어력' }
		];
		for (const def of baseDefs) {
			const p = findProp(def.propType);
			if (!p) continue;
			const val = (p.initValue || 0) * curveMult(p) + (addProps[def.propType] || 0);
			rows.push({ key: def.key, name: def.name, value: Math.round(val).toLocaleString(), icon: '' });
		}

		// 돌파 특수 스탯(HP/ATK/DEF 외 addProps 키) — 현재 돌파 단계 누적값 노출
		for (const [k, v] of Object.entries(addProps)) {
			if (k === BASE_HP || k === BASE_ATK || k === BASE_DEF) continue;
			if (!v) continue;
			const meta = PROP_LABELS[k] || { name: k, percent: false };
			const display = meta.percent
				? (v * 100).toFixed(1) + '%'
				: Math.round(v).toLocaleString();
			// 특수 스탯은 아이콘 원 안 약어를 비움(HP/ATK/DEF만 약어 노출).
			rows.push({ key: '', name: meta.name, value: display, icon: '' });
		}

		return rows;
	});
}
