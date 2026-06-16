export class EndfieldSkillViewModel {
	skills: any; // metadata.skills
	skillGroupMap: any; // metadata.skillGroupMap
	currentUrl: string;

	constructor(data: any, currentUrl: string, context: any) {
		// data is 'metadata' (full object)
		this.skills = data?.skills || {};
		const talents = data?.talents || {};
		this.skillGroupMap = talents.skillGroupMap || {};
		this.currentUrl = currentUrl;
	}

	items = $derived.by(() => {
		if (!this.skillGroupMap) return [];

		// Order for Combat Skills
		const order = ['NormalAttack', 'NormalSkill', 'ComboSkill', 'UltimateSkill'];
		const list = [];

		for (const type of order) {
			const groupKey = Object.keys(this.skillGroupMap).find(
				(k) => this.skillGroupMap[k].skillGroupType === type
			);

			if (groupKey) {
				const group = this.skillGroupMap[groupKey];
				list.push({
					id: groupKey,
					name: group.name?.text || type,
					type: type,
					image: `/assets/image/endfield/skill/${group.icon}.webp`,
					description: group.desc?.text,
					skillIds: group.skillIdList,
					groupData: group
				});
			}
		}
		return list;
	});

	getMaxLevel(item: any) {
		if (!item.skillIds || item.skillIds.length === 0) return 1;

		// We assume all skills in the group share the same max level (e.g. Normal Attack steps)
		// Or we just take the first one.
		const firstId = item.skillIds[0];
		const skillData = this.skills[firstId];

		if (skillData && skillData.SkillPatchDataBundle) {
			return skillData.SkillPatchDataBundle.length;
		}

		return 1;
	}

	getFormattedDescription(item: any, level: number) {
		// Use the group description as base
		let desc = item.description || '';

		// User said: "talents>skillGroupMap" -> "skillIdList" -> "skills" key -> level values
		// We need to substitute {key} in description with values from the CURRENT LEVEL's blackboard.
		// Since a group might have multiple skillIds (e.g. Normal Attack 1, 2, 3...),
		// we usually look for the blackboard in the first skillId that matches the variable keys?
		// Or iterate all?
		// Usually variables are unique across the set or we take from the primary skill.

		if (!item.skillIds || item.skillIds.length === 0) return desc;

		// Iterate through all skillIds in this group to find matching blackboard keys
		item.skillIds.forEach((skillId: string) => {
			const skillData = this.skills[skillId];
			if (!skillData || !skillData.SkillPatchDataBundle) return;

			// Find bundle for current level
			// Levels are 1-based in UI, usually 1-based in bundle 'level' field
			const bundle =
				skillData.SkillPatchDataBundle.find((b: any) => b.level === level) ||
				skillData.SkillPatchDataBundle[skillData.SkillPatchDataBundle.length - 1]; // Fallback to max

			if (bundle && bundle.blackboard) {
				bundle.blackboard.forEach((bb: any) => {
					// Regex to match {key} or {key:format}
					// Example: {damage_scale:0%} or {damage}
					const regex = new RegExp(`{${bb.key}(:[^}]*)?}`, 'g');
					const val = bb.value;

					desc = desc.replace(regex, (match: string, format: string) => {
						if (format === ':0%') return `${(val * 100).toFixed(0)}%`;
						if (format === ':1%') return `${(val * 100).toFixed(1)}%`;
						return String(val);
					});
				});
			}
		});

		// Rich Text Tag Replacement (Endfield specific)
		// <@ba.key>...</> -> Color processing
		// Common tags: @ba.vup (Value Up?), @ba.cryst (Cryst?), #ba.crystinflict
		// We map them to generic styles or specific colors

		const replaceTag = (text: string, tag: string, colorClass: string) => {
			const r = new RegExp(`<${tag.replace(/\./g, '\\.')}>(.*?)<\\/>`, 'g');
			return text.replace(r, `<span class="${colorClass}">$1</span>`);
		};

		desc = replaceTag(desc, '@ba.key', 'text-orange-500 font-bold'); // Keywords
		desc = replaceTag(desc, '@ba.vup', 'text-green-500 font-bold'); // Value Up
		desc = replaceTag(desc, '@ba.cryst', 'text-blue-400 font-bold'); // Cryst
		desc = replaceTag(desc, '#ba.crystinflict', 'text-blue-400 font-bold'); // Cryst Inflict
		desc = replaceTag(desc, '@ba.kw', 'text-orange-500 font-bold'); // Keyword

		// Handle #ba tags generically or specifically
		// User asked to remove <#ba.lastcombo>. We can just replace it with empty string or content?
		// Usually content is "Final Hit" or similar.
		// Let's replace with bold highlight for now, or just content if user wants to 'remove the tag'.
		// User said "remove the tag" (usually implies keeping content).
		// Tag format is <#ba.lastcombo>CONTENT</>

		desc = replaceTag(desc, '#ba.lastcombo', 'text-yellow-500 font-bold'); // Last Combo highlight

		// Fallback: Remove any other <#ba...> or <@ba...> tags but keep content
		desc = desc.replace(/<[#@]ba\.[^>]+>(.*?)<\/>/g, '$1');
		desc = desc.replace(/<@[^>]+>(.*?)<\/>/g, '$1');

		return desc;
	}
}
