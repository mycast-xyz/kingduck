import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import axios from 'axios';

export const load = async ({ params }) => {
	const characterListConfig = {
		headers: {
			//"x-access-token": userToken,
		},
		params: {
			id: params.characterId
		}
	};

	let data: any = {};
	await axios
		.get(
			'http://localhost:3000/api/v0/character/' + params.gameEnName + '/' + params.characterId,
			characterListConfig
		)
		.then((res) => {
			if (res.data.resultCode === 200) {
				//console.log(res.data.items);
				data = res.data.items;
				console.log(data);
			} else {
				console.log('err: 서버 코드 에러');
			}
		})
		.catch((err) => {
			console.log(err);
		});

	return {
		info: data
	};
};
