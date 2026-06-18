import { SkillTreeViewModel, type SkillItem } from '../SkillTreeViewModel';

/**
 * 니케 스킬 뷰모델 — SkillTreeView가 다른 게임과 동일하게 렌더하도록 어댑팅.
 * 백엔드가 fandom Skill table을 가공한 metadata.skills = [{ name, type, description }]
 * (기본 무기 + 스킬1~3). 레벨 스케일은 없어 maxLevel 1. 설명은 영문(소스 한계).
 */
export class NikkeSkillTreeViewModel extends SkillTreeViewModel {
	get items(): SkillItem[] {
		let raw = this.listData;
		if (raw && !Array.isArray(raw)) {
			raw = raw.skills ?? Object.values(raw);
		}
		if (!Array.isArray(raw)) return [];
		return raw.map((s: any, i: number) => ({
			id: i,
			name: s.name || '',
			type: s.type || null,
			description: s.description || '',
			image: s.icon || '',
			levelParams: s
		}));
	}

	getFormattedDescription(item: SkillItem): string {
		const desc = (item.levelParams as any)?.description || item.description || '';
		// 백엔드에서 <br>→개행으로 정리됨 → 표시용 <br>로 환원.
		return desc ? desc.replace(/\n/g, '<br/>') : '설명이 없습니다.';
	}

	getMaxLevel(): number {
		return 1;
	}
}
