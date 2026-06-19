import { SkillTreeViewModel, type SkillItem } from '../SkillTreeViewModel';

/**
 * 이환(NTE) 스킬 뷰모델 — SkillTreeView가 다른 게임과 동일하게 렌더하도록 어댑팅.
 * everness.info에서 가공한 metadata.skills = [{ name, type, description, icon }]
 * (레벨 스케일 없음 → maxLevel 1). description은 줄바꿈(\n)을 <br>로 변환해 표시.
 */
export class NteSkillTreeViewModel extends SkillTreeViewModel {
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
		if (!desc) return '설명이 없습니다.';
		return desc.replace(/\n/g, '<br>');
	}

	getMaxLevel(): number {
		return 1;
	}
}
