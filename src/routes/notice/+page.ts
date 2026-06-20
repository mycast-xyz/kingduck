import type { PageLoad } from './$types';
import client from '../../app/service/api/client';
import type { NoticeType } from '../../app/model/api/api';

export const load: PageLoad = async () => {
	try {
		// 공개 엔드포인트는 client 인터셉터가 봉투를 언랩 → response.data가 곧 배열(admin만 예외).
		const response = await client.get<NoticeType[]>('/api/v0/notice/list');
		return { notices: (response.data as NoticeType[]) ?? [] };
	} catch (error) {
		console.error('공지사항 목록 조회 중 오류 발생:', error);
		return { notices: [] as NoticeType[] };
	}
};
