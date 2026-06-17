/**
 * 게임 데이터의 `name` 필드는 문자열이거나 `{ kr, Name, ... }` 객체로 들어온다(크롤 소스별 상이).
 * 여러 뷰/뷰모델의 `getFormattedName`이 `name?.kr → name?.Name` 해석을 복붙하고 있어 공용화한다.
 * (redesign-plan F-T4 — name 해석 부분만 타입 안전하게 정리. 호출부의 sibling 폴백 순서는
 *  `||` 체인으로 각자 보존한다.)
 */
export type LocalizedNameObject = { kr?: string; Name?: string; [k: string]: unknown };

/**
 * name이 `{ kr, Name }` 객체일 때 표시 문자열을 반환한다. kr은 HTML 태그를 제거(기존 동작),
 * Name은 그대로. 객체가 아니거나 해당 키가 없으면 빈 문자열(호출부가 `||`로 다음 폴백을 잇는다).
 */
export function localizedName(name: unknown): string {
	if (name && typeof name === 'object') {
		const n = name as LocalizedNameObject;
		if (typeof n.kr === 'string' && n.kr) return n.kr.replace(/<[^>]*>/g, '');
		if (typeof n.Name === 'string' && n.Name) return n.Name;
	}
	return '';
}
