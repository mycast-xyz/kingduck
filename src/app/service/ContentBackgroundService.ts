export class ContentBackgroundSet {
	// 캐릭터 정보 배경색 계산 함수
	static calculateInfoContentColor(backgroundColor: string): string {
		const bgColor = backgroundColor.toLowerCase();

		// 흰색인 경우 회색으로 변경
		if (bgColor === '#ffffff') return '#6b7280';

		// 형광색 판단 및 조정
		const rgb = bgColor.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
		if (rgb) {
			const [r, g, b] = rgb.slice(1).map((x) => parseInt(x, 16));
			// RGB 값이 너무 높은 경우(형광색) 채도를 낮춤
			if (r > 200 || g > 200 || b > 200) {
				const darkenFactor = 0.8; // 30% 어둡게
				return `rgb(${Math.floor(r * darkenFactor)}, ${Math.floor(g * darkenFactor)}, ${Math.floor(b * darkenFactor)})`;
			}
		}

		return bgColor;
	}
}
