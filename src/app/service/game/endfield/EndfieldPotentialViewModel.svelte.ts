export class EndfieldPotentialViewModel {
	items: any[] = [];

	constructor(data: any, gameSlug: string, currentUrl: string) {
		// data is 'metadata' object.
		// User Path: metadata > potentials > potentialUnlockBundle (Array)

		const potentials = data?.potentials?.potentialUnlockBundle;

		if (!potentials || !Array.isArray(potentials)) {
			console.warn('EndfieldPotentialViewModel: No potentialUnlockBundle found', data);
			return;
		}

		this.items = potentials.map((node: any, index: number) => {
			const n = index + 1;
			// User: "이름에서는 'name'이걸 쓰고 뒤에 '잠재력 n'"
			// node.name might be object { text: string, id: string } or string
			const rawName = node.name?.text || node.name || 'Potential';
			const finalName = `${rawName} 잠재력 ${n}`;

			// User: "effectData"에 "desc"가 있으니... "dataList"에서 확인 가능해
			const effectData = node.effectData;
			let desc = effectData?.desc?.text || node.desc?.text || '';

			// Process placeholders
			if (effectData?.dataList) {
				const valMap = new Map<string, number>();

				// Generic recursive traverser to find key-value pairs
				// specific to Endfield's data structure patterns
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

				effectData.dataList.forEach((dataItem: any) => traverse(dataItem));

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

				desc = desc.replace(/{([^}]+)}/g, (match: string, content: string) => {
					// content e.g. "1-costvalue:0%" or "key:fmt" or "key"
					const parts = content.split(':');
					const exprTemplate = parts[0];
					const format = parts[1] ? ':' + parts[1] : '';

					// User logic: "remove numbers inside brackets to get key"
					// We'll extract all potential keys (alphanumeric identifiers)
					// and replace them if found in valMap.
					let expr = exprTemplate;
					// Matches simple identifiers.
					// Note: keys like "1-costvalue" will match "costvalue".
					const potentialKeys = expr.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];

					let hasReplacement = false;
					potentialKeys.forEach((k: string) => {
						// Try exact match then lowercase match
						let val = valMap.get(k);
						if (val === undefined) val = valMap.get(k.toLowerCase());

						if (val !== undefined) {
							// Replace key with value
							// Use split/join or global replace to handle multiple occurrences
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

			// Clean up tags
			const replaceTag = (text: string, tag: string, colorClass: string) => {
				const r = new RegExp(`<${tag.replace(/\./g, '\\.')}>(.*?)<\\/>`, 'g');
				return text.replace(r, `<span class="${colorClass}">$1</span>`);
			};

			desc = replaceTag(desc, '@ba.key', 'text-orange-500 font-bold');
			desc = replaceTag(desc, '@ba.vup', 'text-green-500 font-bold');
			desc = replaceTag(desc, '@ba.cryst', 'text-blue-400 font-bold');
			desc = replaceTag(desc, '#ba.crystinflict', 'text-blue-400 font-bold');
			desc = replaceTag(desc, '#ba.frozen', 'text-blue-400 font-bold');
			desc = replaceTag(desc, '@ba.kw', 'text-orange-500 font-bold');
			desc = replaceTag(desc, '#ba.lastcombo', 'text-yellow-500 font-bold');
			desc = replaceTag(desc, '#ba.spellenhance', 'text-yellow-500 font-bold');
			desc = replaceTag(desc, '#ba.crystenhance', 'text-blue-400 font-bold');
			desc = replaceTag(desc, '#ba.naturalenhance', 'text-green-500 font-bold');
			desc = replaceTag(desc, '#ba.dispel', 'text-gray-400 font-bold');

			// Strip remaining tags
			desc = desc.replace(/<[#@]ba\.[^>]+>(.*?)<\/>/g, '$1');
			desc = desc.replace(/<@[^>]+>(.*?)<\/>/g, '$1');

			return {
				index: n,
				name: finalName,
				image: `/assets/image/endfield/potentiality/${n}.webp`,
				description: desc
			};
		});
	}
}
