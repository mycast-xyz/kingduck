import { SkillTreeViewModel, type SkillItem } from '../SkillTreeViewModel';
import { localizedName } from '../../../model/game/localizedName';

/**
 * 원신 스킬(talent) 뷰모델 — SkillTreeView가 starrail과 동일하게 렌더하도록 어댑팅.
 *
 * 백엔드 GenshinCharacterScraper가 talent를 HSR 호환 형태로 가공해둠:
 *   skills[] = { id, name, type, iconUrl, descLines: ["라벨|{param1:F1P}", …], levelData: [{level, params}], maxLevel }
 *
 * 원신 설명 템플릿은 `{paramN:FMT}` 형식(예: {param1:F1P}=소수1자리 퍼센트, {param2:F1}=소수1자리).
 * 레벨 슬라이더 값에 맞는 levelData[level-1].params로 치환한다.
 */
export class GenshinSkillTreeViewModel extends SkillTreeViewModel {
	get items(): SkillItem[] {
		let raw = this.listData;
		if (raw && !Array.isArray(raw)) {
			if (raw.metadata?.skills) raw = raw.metadata.skills;
			else raw = Object.values(raw);
		}
		if (!Array.isArray(raw)) return [];

		return raw.map((item: any, index: number) => ({
			id: item.id ?? `skill-${index}`,
			name:
				localizedName(item.name) ||
				(typeof item.name === 'string' ? item.name : '') ||
				'',
			type: item.type || null,
			description: '',
			image: item.iconUrl || item.image || '',
			levelParams: item
		}));
	}

	getFormattedDescription(item: SkillItem, level: number): string {
		const raw: any = item.levelParams;
		if (!raw) return '설명이 없습니다.';

		const lines: string[] = Array.isArray(raw.descLines) ? raw.descLines : [];
		const levelData: any[] = Array.isArray(raw.levelData) ? raw.levelData : [];
		if (lines.length === 0) return '설명이 없습니다.';

		const idx = Math.min(Math.max(level - 1, 0), Math.max(levelData.length - 1, 0));
		const params: number[] = levelData[idx]?.params || [];

		return lines.map((line) => this.formatLine(line, params)).join('<br/>');
	}

	getMaxLevel(item: SkillItem): number {
		return (item.levelParams as any)?.maxLevel || 1;
	}

	// "라벨|{param1:F1P}" → "<b>라벨</b>: 49.4%". 파이프가 없으면 템플릿만 치환.
	private formatLine(line: string, params: number[]): string {
		const pipe = line.indexOf('|');
		let label = '';
		let tmpl = line;
		if (pipe >= 0) {
			label = line.slice(0, pipe);
			tmpl = line.slice(pipe + 1);
		}

		const filled = tmpl.replace(
			/\{param(\d+):([^}]+)\}/g,
			(match: string, n: string, spec: string) => {
				const value = params[parseInt(n, 10) - 1];
				if (value === undefined || value === null) return match;
				const isPercent = /P/i.test(spec);
				const decMatch = spec.match(/F(\d+)/i);
				const decimals = decMatch ? parseInt(decMatch[1], 10) : isPercent ? 1 : 0;
				return isPercent
					? (value * 100).toFixed(decimals) + '%'
					: value.toFixed(decimals);
			}
		);

		return label ? `<b>${label}</b>: ${filled}` : filled;
	}
}
