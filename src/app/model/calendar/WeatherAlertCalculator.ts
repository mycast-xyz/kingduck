import type { CalendarEvent } from './CalendarTypes';
import type { WeatherAlertLevel, WeatherAlert } from './WeatherAlertTypes';
import { WEATHER_ALERTS } from './WeatherAlertMessages';

export interface WeatherAlertAnalysis {
	level: WeatherAlertLevel;
	alert: WeatherAlert;
	metadata: {
		activePickups: number; // 현재 진행중인 픽업 수
		upcomingInDays: number; // D-day 카운트 (가장 가까운 픽업)
		simultaneousPickups: number; // 동시 진행 픽업 수
		hasRecentUpdate: boolean; // 최근 업데이트/점검 여부
		endingSoonCount: number; // 1주일 이내 종료 예정 픽업 수
	};
}

/**
 * 현재 이벤트 상황을 분석하여 적절한 기상특보 등급과 메시지를 반환
 */
export function analyzeWeatherAlert(
	events: CalendarEvent[],
	now: Date = new Date()
): WeatherAlertAnalysis {
	const gachaEvents = events.filter((e) => e.type === 'GACHA');

	// 현재 진행중인 픽업
	const activePickups = gachaEvents.filter((e) => e.startDate <= now && e.endDate >= now);

	// 1주일 이내 종료될 픽업 (소멸 단계)
	const endingSoon = activePickups.filter((e) => {
		const daysToEnd = (e.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
		return daysToEnd >= 0 && daysToEnd <= 7;
	});

	// 앞으로 3일 이내 시작될 픽업
	const upcomingSoon = gachaEvents.filter((e) => {
		const diffDays = (e.startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
		return diffDays >= 0 && diffDays <= 3;
	});

	// 앞으로 7일 이내 시작될 픽업
	const upcomingWeek = gachaEvents.filter((e) => {
		const diffDays = (e.startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
		return diffDays > 3 && diffDays <= 7;
	});

	// 가장 가까운 픽업까지 남은 일수
	const nextPickup = gachaEvents
		.filter((e) => e.startDate > now)
		.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())[0];

	const daysToNext = nextPickup
		? Math.ceil((nextPickup.startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
		: 999;

	// 최근 점검/업데이트 이벤트 (7일 이내)
	const hasRecentMaintenance = events.some((e) => {
		if (e.type !== 'MAINTENANCE') return false;
		const diffDays = Math.abs((e.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
		return diffDays <= 7;
	});

	// 동시 진행 픽업 수 (같은 날짜에 여러 게임)
	const simultaneousPickups = activePickups.length;

	// ===== 등급 결정 로직 =====

	let level: WeatherAlertLevel;

	// 재난급: 3개 이상 동시 픽업
	if (simultaneousPickups >= 3) {
		level = 'DISASTER';
	}
	// 소멸 단계: 현재 진행중이면서 7일 이내 종료 예정
	else if (endingSoon.length > 0) {
		level = 'DISSIPATION';
	}
	// 경보: 현재 진행중이거나 3일 이내 시작
	else if (activePickups.length > 0 || upcomingSoon.length > 0) {
		level = 'WARNING';
	}
	// 주의보: 7일 이내 시작 예정
	else if (upcomingWeek.length > 0) {
		level = 'ADVISORY';
	}
	// 복구: 최근 점검 있음
	else if (hasRecentMaintenance) {
		level = 'RECOVERY';
	}
	// 평시: 아무 일도 없음
	else {
		level = 'SAFE';
	}

	// 해당 등급의 메시지 중 랜덤 선택
	const messages = WEATHER_ALERTS[level];
	const randomIndex = Math.floor(Math.random() * messages.length);
	const alert = messages[randomIndex];

	return {
		level,
		alert,
		metadata: {
			activePickups: activePickups.length,
			upcomingInDays: daysToNext,
			simultaneousPickups,
			hasRecentUpdate: hasRecentMaintenance,
			endingSoonCount: endingSoon.length
		}
	};
}
