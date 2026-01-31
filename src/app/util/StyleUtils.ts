// 헥스 색상을 RGB로 변환 (HEX 색상 지원용)
export const hexToRgb = (hex: string) => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			}
		: null;
};

// 카드 배경 그라데이션 스타일 생성
// bgColor: The background color string (e.g., "#fcba49" or "oklch(...)")
export const getCardBgStyle = (bgColor: string) => {
	if (!bgColor) return '';

	// OKLCH 색상인 경우
	if (bgColor.startsWith('oklch(')) {
		// oklch(L C H) 형식에서 투명도만 조정
		const oklchMatch = bgColor.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
		if (oklchMatch) {
			const [, l, c, h] = oklchMatch;
			return `background: linear-gradient(0deg, oklch(${l} ${c} ${h} / 1) 0%, oklch(${l} ${c} ${h} / 0) 100%);`;
		}
	}

	// HEX 색상인 경우 (#RRGGBB)
	if (bgColor.startsWith('#')) {
		const rgb = hexToRgb(bgColor);
		if (rgb) {
			return `background: linear-gradient(0deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0) 100%);`;
		}
	}

	// 기본값
	return `background: ${bgColor};`;
};
