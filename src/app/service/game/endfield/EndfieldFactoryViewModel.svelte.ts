export class EndfieldFactoryViewModel {
	skills: any; // factorySkills.skills
	currentUrl: string;

	constructor(data: any, currentUrl: string) {
		// data is 'factorySkills'
		this.skills = data?.skills || {};
		this.currentUrl = currentUrl;
	}

	items = $derived.by(() => {
		// factorySkills>skills>spaceship_skill_chr_..._n_m
		if (!this.skills) return [];

		const allKeys = Object.keys(this.skills).filter((k) => k.includes('spaceship_skill_'));

		// Group by 'n' (Skill Index)
		const groups = new Map<string, string[]>();

		allKeys.forEach((key) => {
			// Regex to capture n and m at the end
			// keys like: spaceship_skill_chr_0011_seraph_0_1 -> n=0, m=1
			const match = key.match(/_(\d+)_(\d+)$/);
			if (match) {
				const n = match[1];
				if (!groups.has(n)) {
					groups.set(n, []);
				}
				groups.get(n)?.push(key);
			}
		});

		const list: any[] = [];
		const sortedGroupKeys = Array.from(groups.keys()).sort((a, b) => Number(a) - Number(b));

		sortedGroupKeys.forEach((n) => {
			const keys = groups.get(n) || [];
			// Sort by level m
			keys.sort((a, b) => {
				const matchA = a.match(/_(\d+)$/);
				const matchB = b.match(/_(\d+)$/);
				const levelA = matchA ? Number(matchA[1]) : 0;
				const levelB = matchB ? Number(matchB[1]) : 0;
				return levelA - levelB;
			});

			if (keys.length === 0) return;

			// Use the first node (usually level 1) for main title/icon
			const firstNodeKey = keys[0];
			const firstNode = this.skills[firstNodeKey];

			let combinedDesc = '';
			keys.forEach((k) => {
				const node = this.skills[k];
				const postfix = node.skillNamePostfix || '';
				const desc = node.desc?.text || node.desc || '';
				// User said: "n is skill, 1 is first" -> skillNamePostfix shows level like I, II
				// desc is the text.
				// Format: <b>[I]</b> Description
				if (combinedDesc) combinedDesc += '<br/>';
				combinedDesc += `<span class="font-bold text-endfield-brand">[${postfix}]</span> ${desc}`;
			});

			list.push({
				id: `factory_skill_${n}`,
				name: firstNode.name?.text || firstNode.name || `Base Skill ${Number(n) + 1}`,
				// Ensure correct image path. Assuming 'icon' property refers to filename without extension?
				// API sample didn't have these but user said check "name".
				// Using safe fallback for image.
				image: {
					url: firstNode.icon
						? `/assets/image/endfield/skill/${firstNode.icon}.webp`
						: '/assets/image/common/no_image.webp'
				},
				description: combinedDesc
			});
		});

		return list;
	});
}
