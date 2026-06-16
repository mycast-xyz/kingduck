export class EndfieldPassiveViewModel {
	talentNodeMap: any; // metadata.talents.talentNodeMap
	currentUrl: string;

	constructor(data: any, currentUrl: string, context: any) {
		// data is 'metadata' (full object)
		const talents = data?.talents || {};
		this.talentNodeMap = talents.talentNodeMap || {};
		this.currentUrl = currentUrl;
	}

	items = $derived.by(() => {
		// Passive / Normal Skills
		// Data: talents>talentNodeMap>chr_..._passive_skill_n_m
		// n = skill index, m = level
		if (!this.talentNodeMap) {
			return [];
		}

		const allKeys = Object.keys(this.talentNodeMap).filter((k) => k.includes('passive_skill'));

		// Group by 'n'
		const groups = new Map<string, string[]>();

		allKeys.forEach((key) => {
			// Regex to capture n and m
			// Key format example: chr_0011_seraph_passive_skill_0_1
			const match = key.match(/passive_skill_(\d+)_(\d+)/);
			if (match) {
				const n = match[1]; // Skill Index
				// const m = match[2]; // Level

				if (!groups.has(n)) {
					groups.set(n, []);
				}
				groups.get(n)?.push(key);
			}
		});

		const list: any[] = [];
		// Iterate groups (sorted by n)
		const sortedGroupKeys = Array.from(groups.keys()).sort((a, b) => Number(a) - Number(b));

		sortedGroupKeys.forEach((n) => {
			const keys = groups.get(n) || [];
			// Sort keys by level m just in case (e.g. 0_1, 0_2)
			keys.sort((a, b) => {
				const matchA = a.match(/_(\d+)$/);
				const matchB = b.match(/_(\d+)$/);
				const levelA = matchA ? Number(matchA[1]) : 0;
				const levelB = matchB ? Number(matchB[1]) : 0;
				return levelA - levelB;
			});

			if (keys.length === 0) return;

			// Use the first node (level 1) for basic info like Name, Icon
			// Or maybe the max level node? Usually Level 1 is safer for "Name".
			// Check for info in either passiveSkillNodeInfo or attributeNodeInfo
			const firstNodeKey = keys[0];
			const firstNode = this.talentNodeMap[firstNodeKey];
			const info = firstNode.passiveSkillNodeInfo || firstNode.attributeNodeInfo;

			list.push({
				id: `passive_skill_${n}`,
				name: info?.name?.text || firstNode.name?.text || `Passive ${Number(n) + 1}`,
				type: 'Passive',
				image:
					info.iconId || firstNode.icon
						? `/assets/image/endfield/skill/${info.iconId || firstNode.icon}.webp`
						: undefined,
				description: info?.effectData?.desc?.text || firstNode.desc?.text,
				levelKeys: keys,
				groupData: firstNode
			});
		});

		return list;
	});

	getMaxLevel(item: any) {
		// return number of levels found (keys)
		if (item.levelKeys) {
			return item.levelKeys.length;
		}
		return 1;
	}

	getFormattedDescription(item: any, level: number) {
		// level is 1-based index from the UI slider
		// item.levelKeys is 0-indexed array of keys [lvl1_key, lvl2_key, ...]

		if (!item.levelKeys || item.levelKeys.length === 0) return item.description || '';

		// Get key for this level
		const keyIndex = level - 1;
		// Boundary check
		const effectiveIndex = Math.min(Math.max(keyIndex, 0), item.levelKeys.length - 1);

		const targetKey = item.levelKeys[effectiveIndex];
		const node = this.talentNodeMap[targetKey];

		if (!node) return item.description || '';

		const info = node.passiveSkillNodeInfo || node.attributeNodeInfo;

		let desc = info?.effectData?.desc?.text || node.desc?.text || '';

		// Variable Replacement using dataList
		const dataList = info?.effectData?.dataList;
		if (dataList && Array.isArray(dataList)) {
			// Create a map for fast lookup
			const valMap = new Map<string, number>();

			// Generic recursive traverser to find key-value pairs
			const traverse = (obj: any) => {
				if (!obj || typeof obj !== 'object') return;

				// Define potential property names for Keys and Values
				const keyProps = ['bbKey', 'attrType', 'paramType', 'key'];
				const valProps = ['floatValue', 'attrValue', 'paramValue', 'value'];

				// Find if this object has a Key and a Value
				let foundKey: string | undefined;
				let foundVal: number | undefined;

				// Find key
				for (const p of keyProps) {
					if (p in obj && typeof obj[p] === 'string') {
						foundKey = obj[p];
						break;
					}
				}

				// Find value
				for (const p of valProps) {
					if (p in obj) {
						const v = obj[p];
						if (typeof v === 'number') {
							foundVal = v;
							break;
						}
					}
				}

				if (foundKey && foundVal !== undefined) {
					valMap.set(foundKey, foundVal);
					valMap.set(foundKey.toLowerCase(), foundVal);
				}

				// Recurse into children
				Object.values(obj).forEach((child) => traverse(child));
			};

			// Populate valMap
			dataList.forEach((dataItem: any) => traverse(dataItem));

			// Helper to safe-eval simple math
			const evalMath = (expr: string) => {
				try {
					// Allow only numbers, operators, parens, dots
					if (!/^[0-9+\-*/().\s]+$/.test(expr)) return NaN;
					return new Function(`return ${expr}`)();
				} catch (e) {
					return NaN;
				}
			};

			// Regex to find all {key} or {key:fmt} patterns
			// desc = desc.replace(/{([a-zA-Z0-9_]+)(:[^}]*)?}/g, (match, key, format) => {
			desc = desc.replace(/{([^}]+)}/g, (match: string, content: string) => {
				const parts = content.split(':');
				const exprTemplate = parts[0];
				const format = parts[1] ? ':' + parts[1] : '';

				let expr = exprTemplate;
				// Matches simple identifiers.
				const potentialKeys = expr.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];

				let hasReplacement = false;
				potentialKeys.forEach((k: string) => {
					let val = valMap.get(k);
					if (val === undefined) val = valMap.get(k.toLowerCase());

					if (val !== undefined) {
						expr = expr.split(k).join(String(val));
						hasReplacement = true;
					}
				});

				// If no keys matched and it's not a pure number, return original
				if (!hasReplacement && potentialKeys.length > 0) return match;

				// Evaluate
				const result = evalMath(expr);
				if (isNaN(result)) return match;

				// Format
				if (format === ':0%') return `${(result * 100).toFixed(0)}%`;
				if (format === ':1%') return `${(result * 100).toFixed(1)}%`;
				return String(parseFloat(result.toFixed(2)));
			});
		}

		// Apply Formatting
		const replaceTag = (text: string, tag: string, colorClass: string) => {
			const r = new RegExp(`<${tag.replace(/\./g, '\\.')}>(.*?)<\\/>`, 'g');
			return text.replace(r, `<span class="${colorClass}">$1</span>`);
		};

		desc = replaceTag(desc, '@ba.key', 'text-orange-500 font-bold');
		desc = replaceTag(desc, '@ba.vup', 'text-green-500 font-bold');
		desc = replaceTag(desc, '@ba.cryst', 'text-blue-400 font-bold');
		desc = replaceTag(desc, '#ba.crystinflict', 'text-blue-400 font-bold');
		desc = replaceTag(desc, '@ba.kw', 'text-orange-500 font-bold');
		desc = replaceTag(desc, '#ba.lastcombo', 'text-yellow-500 font-bold');

		desc = desc.replace(/<[#@]ba\.[^>]+>(.*?)<\/>/g, '$1');
		desc = desc.replace(/<@[^>]+>(.*?)<\/>/g, '$1');

		return desc;
	}
}
