import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import axios from 'axios';

export const load = async ({ params }) => {
	console.log(params.slug);

	const gameInfoConfig = {
		headers: {
			//"x-access-token": userToken,
		},
		params: {
			en: params.slug
		}
	};

	let gameId;

	await axios
		.get('http://localhost:3000/api/v0/game/item/', gameInfoConfig)
		.then((res) => {
			if (res.data.resultCode === 200) {
				//console.log(res.data.items);
				gameId = res.data.items.id;
			} else {
				console.log('err: 서버 코드 에러');
			}
		})
		.catch((err) => {
			console.log(err);
		});

	const characterListConfig = {
		headers: {
			//"x-access-token": userToken,
		},
		params: {
			gameId: gameId
		}
	};

	console.log(characterListConfig);

	let data: any = {};

	await axios
		.get('http://localhost:3000/api/v0/character/list/', characterListConfig)
		.then((res) => {
			if (res.data.resultCode === 200) {
				//console.log(res.data.items);
				data = res.data.items;
			} else {
				console.log('err: 서버 코드 에러');
			}
		})
		.catch((err) => {
			console.log(err);
		});

	console.log(data);

	return {
		params: params.slug,
		list: data
	};
};
