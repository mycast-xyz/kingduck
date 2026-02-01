export class EndfieldTrustViewModel {
	items = $derived.by(() => {
		if (!this.data || !Array.isArray(this.data)) return [];

		return this.data.map((gift: any) => ({
			id: gift.itemId,
			name: gift.name || `Gift ${gift.itemId}`, // Need I18n lookup?
			// The JSON has nameI18nId: "-3445..."
			// We might not have the map here. So maybe fallback or try to fetch?
			// For now, let's look at what we have.
			// Checking previous JSON: "bestGifts" has "nameI18nId", no text text.
			// This effectively means we can't show names unless we have the global I18n map.
			// I'll leave name empty or use ID for now.

			// Image construction
			image: `/assets/image/endfield/item/${gift.iconId}.webp`,

			// Subtext or other info
			rarity: gift.rarity,
			subText: `Favor: +${gift.favorablePoint}`
		}));
	});

	data: any;
	currentUrl: string;

	constructor(data: any, currentUrl: string) {
		this.data = data;
		this.currentUrl = currentUrl;
	}
}
