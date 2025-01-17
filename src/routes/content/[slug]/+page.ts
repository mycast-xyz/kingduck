import { error } from '@sveltejs/kit';
import theherta from './theherta.json';

export const load = async () => {
	// 테스트용
	// db 처리시 해당 방식와 유사할것으로 판단됨
	const infoData = theherta;

    if (!infoData) {
        error(404, 'Not found');
    }

    return {infoData};
};