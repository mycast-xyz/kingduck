import { RankListViewModel, type RankItem } from '../RankListViewModel';
import { localizedName } from '../../../model/game/localizedName';

/**
 * 원신 별자리(constellation) 뷰모델 — RankListView가 starrail 성혼과 동일하게 렌더하도록 어댑팅.
 *
 * 백엔드 GenshinCharacterScraper가 constellation을 HSR(성혼) 호환 형태로 가공해둠:
 *   ranks_raw[] = { Id, name, Desc, ParamList:[], Image, iconUrl }
 *
 * 원신 설명은 `<color=#XXXXXXXX>…</color>` 태그를 포함하므로 강조 span으로 치환한다.
 */
export class GenshinRankListViewModel extends RankListViewModel {
	get items(): RankItem[] {
		const raw = Array.isArray(this.listData)
			? this.listData
			: Object.values(this.listData || {});

		return raw.map((item: any, index: number) => ({
			id: item.Id ?? index,
			name:
				localizedName(item.name) ||
				item.Name ||
				(typeof item.name === 'string' ? item.name : '') ||
				'',
			description: this.formatDescription(item),
			image: item.Image || item.iconUrl || '',
			index: index + 1
		}));
	}

	private formatDescription(item: any): string {
		let desc = item.Desc || item.description || '설명이 없습니다.';
		desc = desc
			.replace(/<color=#?[0-9A-Fa-f]+>/g, '<span style="color:#f29e38;">')
			.replace(/<\/color>/g, '</span>')
			.replace(/\\n/g, '<br/>');
		return desc;
	}
}
