import { env } from '$env/dynamic/public';

// 애드센스 광고 유닛 slot ID. 애드센스 승인 후 각 유닛을 만들어 받은 ID를 .env에 채운다.
// 미설정(빈 문자열)이면 AdUnit이 아무것도 렌더하지 않으므로, 승인 전엔 배치만 되고 광고는 표시되지 않는다.
//   PUBLIC_ADSENSE_SLOT_LIST    — 리스트(캐릭터 목록) 최상단 배너
//   PUBLIC_ADSENSE_SLOT_CONTENT — 캐릭터 상세 본문 최상단 배너
export const adSlots = {
	list: env.PUBLIC_ADSENSE_SLOT_LIST ?? '',
	content: env.PUBLIC_ADSENSE_SLOT_CONTENT ?? ''
};
