import axios from 'axios';

export class CharacterListService {
	public getCharacterListConfig(gameId: number, type: string | null, rarity: string | null) {
		return {
			headers: {},
			params: {
				gameId: gameId,
				type: type,
				rarity: rarity
			}
		};
	}

	public async getCharacterList(currentUrl: string, params: string, config: any) {
		let data: any = {};

		await axios
			.get(currentUrl + '/api/v0/character/' + params, config)
			.then((res) => {
				if (res.data.resultCode === 200) {
					data = res.data.items;
				} else {
					console.log('err: 서버 코드 에러');
				}
			})
			.catch((err) => {
				console.log(err);
			});

		return data;
	}
}

export default new CharacterListService();
