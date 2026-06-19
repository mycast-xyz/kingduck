export const GAME_CONFIG: Record<string, { color: string; icon?: string }> = {
	starrail: { color: 'bg-cyan-400' },
	wutheringwaves: { color: 'bg-[#3C3C46]' },
	endfield: { color: 'bg-[#B4AA00]' },
	nikke: { color: 'bg-[#DC0000]' },
	zzz: { color: 'bg-[#F0780A]' },
	reverse1999: { color: 'bg-[#AA4628]' },
	genshin: { color: 'bg-[#141E64]' },
	nte: { color: 'bg-[#5B8DEF]' },
	bluearchive: { color: 'bg-[#128AFA]' }
};

export const CALENDAR_CONFIG = {
	daysToShow: 30,
	pastDays: 3,
	pixelsPerDay: 100
} as const;
