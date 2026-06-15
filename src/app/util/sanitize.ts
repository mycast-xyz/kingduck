import DOMPurify from 'dompurify';

/**
 * 외부/크롤링/어드민 데이터를 {@html}로 출력하기 전에 sanitize한다.
 * - 줄바꿈·기본 서식 태그(<br>, <hr>, <span>, <b>, <i>, <p>, <h3>, <div> 등)는 허용.
 * - <script>, 이벤트 핸들러(on*), javascript: URI 등 위험 요소는 DOMPurify 기본값으로 제거.
 * - SSR 환경(window 없음)에서는 원본 문자열(또는 빈 문자열)을 그대로 반환한다.
 */
export function sanitizeHtml(dirty: string): string {
	if (typeof window === 'undefined') return dirty ?? '';
	return DOMPurify.sanitize(dirty ?? '');
}
