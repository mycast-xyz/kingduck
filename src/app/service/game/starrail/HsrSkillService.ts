import client from '../../api/client';

export interface HsrSkill {
	id: string;
	tag: string;
	desc: string;
	name: string;
	type: string | null;
	params: number[];
	iconUrl: string;
	simpleDesc: string | null;
}

export class HsrSkillService {
	/**
	 * 스킬 리스트 조회
	 * @param characterId - 캐릭터 ID
	 */
	async getSkillList(characterId: string) {
		try {
			const response = await client.get(`/api/v0/skill/list`, {
				params: { characterId }
			});
			return response;
		} catch (error) {
			console.error('Failed to fetch HSR skills:', error);
			throw error;
		}
	}

	/**
	 * 스킬 설명에서 특수 태그 제거 (간단한 텍스트로 변환)
	 * @param desc - 원본 설명
	 * @returns 태그가 제거된 설명
	 */
	cleanDescription(desc: string): string {
		if (!desc) return '';

		return (
			desc
				// Remove color tags but keep content
				.replace(/<color=#[^>]+>/g, '')
				.replace(/<\/color>/g, '')
				// Remove unbreak tags but keep content
				.replace(/<unbreak>/g, '')
				.replace(/<\/unbreak>/g, '')
				// Remove underline tags but keep content
				.replace(/<u>/g, '')
				.replace(/<\/u>/g, '')
				// Trim extra spaces
				.trim()
		);
	}

	/**
	 * 스킬 설명에 파라미터 값 적용
	 * @param desc - 템플릿 설명
	 * @param params - 파라미터 배열
	 * @returns 파라미터가 적용된 설명
	 */
	applyParams(desc: string, params: number[]): string {
		if (!desc || !params || params.length === 0) return desc;

		let result = desc;

		// Replace #1[i]%, #2[f1]%, etc. with actual values
		params.forEach((value, index) => {
			const paramIndex = index + 1;

			// Handle percentage values #X[i]%
			result = result.replace(
				new RegExp(`#${paramIndex}\\[i\\]%`, 'g'),
				`${(value * 100).toFixed(0)}%`
			);

			// Handle float percentage values #X[f1]%
			result = result.replace(
				new RegExp(`#${paramIndex}\\[f1\\]%`, 'g'),
				`${(value * 100).toFixed(1)}%`
			);

			// Handle integer values #X[i]
			result = result.replace(new RegExp(`#${paramIndex}\\[i\\]`, 'g'), `${Math.floor(value)}`);

			// Handle float values #X[f1]
			result = result.replace(new RegExp(`#${paramIndex}\\[f1\\]`, 'g'), `${value.toFixed(1)}`);
		});

		return result;
	}

	/**
	 * 스킬 데이터 가공 (파라미터 적용 + 태그 정리)
	 * @param skill - 원본 스킬 데이터
	 * @returns 가공된 스킬 데이터
	 */
	processSkill(skill: HsrSkill): HsrSkill & { processedDesc: string; cleanDesc: string } {
		const processedDesc = this.applyParams(skill.desc, skill.params);
		const cleanDesc = this.cleanDescription(processedDesc);

		return {
			...skill,
			processedDesc, // 파라미터 적용, 태그 유지
			cleanDesc // 파라미터 적용, 태그 제거
		};
	}

	/**
	 * 스킬 배열 전체 가공
	 * @param skills - 스킬 배열
	 * @returns 가공된 스킬 배열
	 */
	processSkills(
		skills: HsrSkill[]
	): Array<HsrSkill & { processedDesc: string; cleanDesc: string }> {
		return skills.map((skill) => this.processSkill(skill));
	}
}

export const hsrSkillService = new HsrSkillService();
