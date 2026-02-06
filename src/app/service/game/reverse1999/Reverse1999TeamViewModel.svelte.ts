export interface TeamSlot {
	main: string | number;
	backups: (string | number)[];
	roleInfo?: string[];
}

export interface RecommendedTeam {
	name: string;
	slots: TeamSlot[];
}

export class Reverse1999TeamViewModel {
	listData: any;

	constructor(listData: any) {
		this.listData = listData;
	}

	get teams(): RecommendedTeam[] {
		// Handle input: likely the 'metadata' object comes in
		let rawTeams = this.listData;
		if (this.listData && this.listData.teams) {
			rawTeams = this.listData.teams;
		}

		if (!Array.isArray(rawTeams)) return [];

		return rawTeams.map((team: any) => {
			// team.members is array of { role_info, originalId }
			// We need to map this to 4 slots.
			// Reverse 1999 usually has 4 slots (3 main + 1 assist/backup or 4th position)

			const members = team.members || [];
			const slots: TeamSlot[] = members.map((m: any) => ({
				main: m.originalId,
				backups: [], // Reverse 1999 JSON doesn't seem to have explicit backups per slot in the example
				roleInfo: m.role_info
			}));

			// Ensure 4 slots
			while (slots.length < 4) {
				slots.push({ main: 0, backups: [] });
			}

			return {
				name: team.name,
				slots: slots
			};
		});
	}
}
