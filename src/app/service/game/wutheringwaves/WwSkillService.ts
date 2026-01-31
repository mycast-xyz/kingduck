export interface WwSkillAttribute {
	attributeId: number;
	attributeName: string;
	Description: string;
	values: string[];
}

export interface WwSkill {
	SkillId: number;
	SkillName: string;
	SkillType: string;
	SkillDescribe: string;
	Icon: string;
	SkillAttributes: WwSkillAttribute[];
	SkillDetailNum: any[];
}

export class WwSkillService {
	/**
	 * 명조 스킬 설명에서 특수 태그 제거 및 HTML 변환
	 * @param desc - 원본 설명 (Unity/TMPro 스타일 태그 포함)
	 * @returns 정화된 HTML 설명
	 */
	cleanDescription(desc: string): string {
		if (!desc) return '';

		return (
			desc
				// <size=10> -> <span style="font-size: 0.8em">
				.replace(/<size=([^>]+)>/g, '<span style="font-size: 0.9em;">')
				.replace(/<\/size>/g, '</span>')
				// <te=...> -> 제거 (아이콘 등 특수 태그)
				.replace(/<te=[^>]+>/g, '')
				.replace(/<\/te>/g, '')
				// <color=#...> -> <span style="color:#...">
				.replace(/<color=([^>]+)>/g, (match, color) => {
					// 명조 데이터의 색상 코드가 ARGB 형태(예: #f8e56cff)인 경우가 있으나 브라우저는 RGBA를 지원함
					// 다만 보통은 RGB이므로 그대로 사용하거나 변환 필요
					return `<span style="color:${color};">`;
				})
				.replace(/<\/color>/g, '</span>')
				// 줄바꿈 처리
				.replace(/\n/g, '<br/>')
				.trim()
		);
	}

	/**
	 * 스킬 속성(계수) 데이터 포맷팅
	 * @param attributes - 스킬 속성 배열
	 * @param level - 선택된 레벨 (1-based)
	 * @returns 표시용 속성 배열
	 */
	formatAttributes(attributes: WwSkillAttribute[], level: number) {
		if (!attributes) return [];

		return attributes.map((attr) => {
			const value = attr.values[level - 1] || attr.values[attr.values.length - 1] || '0';
			return {
				name: attr.attributeName,
				value: value
			};
		});
	}
}

export const wwSkillService = new WwSkillService();
