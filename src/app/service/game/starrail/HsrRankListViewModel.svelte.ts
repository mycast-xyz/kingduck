import { RankListViewModel, type RankItem } from '../RankListViewModel';
import { hsrSkillService } from './HsrSkillService';
import { localizedName } from '../../../model/game/localizedName';

export class HsrRankListViewModel extends RankListViewModel {
	get items(): RankItem[] {
		const rawItems = Array.isArray(this.listData)
			? this.listData
			: Object.values(this.listData || {});

		return rawItems.map((item: any, index: number) => ({
			id: item.Id || index,
			name: this.getFormattedName(item),
			description: this.getFormattedDescription(item),
			image: this.getFormattedImage(item),
			index: index + 1
		}));
	}

	private getFormattedName(item: any): string {
		// name 객체(kr/Name) → sibling(Name/title) → name 문자열 순(기존 동작 보존)
		return (
			localizedName(item.name) ||
			item.Name ||
			item.title ||
			(typeof item.name === 'string' ? item.name : '') ||
			''
		);
	}

	private getFormattedImage(item: any) {
		if (item.Image) return item.Image;
		if (item.Id) {
			const idStr = String(item.Id);
			const prefix = idStr.slice(0, -2);
			const suffix = idStr.slice(-2).replace(/^0/, '');
			return `/assets/image/${this.gameSlug}/character/rank_${prefix}_${suffix}.webp`;
		}
		if (item.image?.url) return item.image.url;
		if (typeof item.image === 'string') return item.image;
		if (item.icon) return item.icon;
		if (item.iconUrl) return item.iconUrl;
		return '';
	}

	private getFormattedDescription(item: any) {
		let desc = item.Desc || item.description || item.info || '설명이 없습니다.';

		if (item.ParamList) {
			desc = hsrSkillService.applyParams(desc, item.ParamList);
		}

		desc = hsrSkillService.cleanDescription(desc);

		// Add Cyan coloring for numbers and brackets
		desc = desc.replace(/(\d+(\.\d+)?%?)/g, '<span class="text-hsr-cyan font-bold">$1</span>');
		desc = desc.replace(/(\[[^\]]+\])/g, '<span class="text-hsr-cyan">$1</span>');

		return desc;
	}
}
