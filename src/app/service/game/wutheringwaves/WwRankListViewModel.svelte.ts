import { RankListViewModel, type RankItem } from '../RankListViewModel';

export class WwRankListViewModel extends RankListViewModel {
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

	private getFormattedName(item: any) {
		if (item.NodeName) return item.NodeName;
		if (item.Name) return item.Name;
		if (item.title) return item.title;
		if (typeof item.name === 'string') return item.name;
		return '';
	}

	private getFormattedImage(item: any) {
		let iconPath = item.NodeIcon || item.Icon || item.Image || item.icon || item.iconUrl || '';
		if (iconPath && typeof iconPath === 'string') {
			// Normalize backslashes to forward slashes
			let normalized = iconPath.replace(/\\/g, '/');
			if (!normalized.startsWith('/') && !normalized.startsWith('http')) {
				normalized = '/' + normalized;
			}
			return normalized;
		}
		return iconPath || '';
	}

	private getFormattedDescription(item: any) {
		// WW uses NodeDescribe or AttributesDescription (often HTML)
		let desc =
			item.AttributesDescription ||
			item.NodeDescribe ||
			item.Desc ||
			item.description ||
			'설명이 없습니다.';

		const params = item.AttributesDescriptionParams;
		if (desc && params && Array.isArray(params) && params.length > 0) {
			params.forEach((param, index) => {
				const placeholder = `{${index}}`;
				// Replace all occurrences of the placeholder with the colored value
				desc = desc.replace(
					new RegExp(`\\{${index}\\}`, 'g'),
					`<span class="text-hsr-cyan font-bold">${param}</span>`
				);
			});
		}

		return desc;
	}
}
