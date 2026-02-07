import type { WeatherAlert } from './WeatherAlertTypes';

// 각 등급별 다양한 메시지 풀
export const WEATHER_ALERTS: Record<string, WeatherAlert[]> = {
	SAFE: [
		{
			level: 'SAFE',
			icon: 'ri-sun-line',
			title: '[특보: 고기압 영향권]',
			description: '전국 지갑 맑음. 잔고 습도 0%의 쾌적한 존버 환경이 유지됩니다.',
			color: {
				bg: 'bg-blue-50 dark:bg-blue-900/30',
				text: 'text-blue-700 dark:text-blue-300',
				border: 'border-blue-200 dark:border-blue-800'
			}
		},
		{
			level: 'SAFE',
			icon: 'ri-moon-clear-line',
			title: '[특보: 정체 전선 형성]',
			description: '신규 픽업 부재로 인한 강제 저축 모드 돌입. 지갑 내구도가 회복 중입니다.',
			color: {
				bg: 'bg-blue-50 dark:bg-blue-900/30',
				text: 'text-blue-700 dark:text-blue-300',
				border: 'border-blue-200 dark:border-blue-800'
			}
		},
		{
			level: 'SAFE',
			icon: 'ri-sun-foggy-line',
			title: '[특보: 평온한 기류]',
			description: '현재 감지된 금빛 뇌우 없음. 평화롭게 일일 숙제에 전념하십시오.',
			color: {
				bg: 'bg-blue-50 dark:bg-blue-900/30',
				text: 'text-blue-700 dark:text-blue-300',
				border: 'border-blue-200 dark:border-blue-800'
			}
		}
	],

	ADVISORY: [
		{
			level: 'ADVISORY',
			icon: 'ri-cloudy-line',
			title: '[주의보: 금빛 저기압 발달]',
			description: '원거리에서 신규 픽업 기류 포착. 지갑 방어벽 구축을 권고합니다.',
			color: {
				bg: 'bg-yellow-50 dark:bg-yellow-900/30',
				text: 'text-yellow-700 dark:text-yellow-300',
				border: 'border-yellow-200 dark:border-yellow-800'
			}
		},
		{
			level: 'ADVISORY',
			icon: 'ri-live-line',
			title: '[주의보: 공식 방송 낙뢰 예보]',
			description: '채널 고정! 리딤코드 보급물자가 투하될 예정입니다.',
			color: {
				bg: 'bg-yellow-50 dark:bg-yellow-900/30',
				text: 'text-yellow-700 dark:text-yellow-300',
				border: 'border-yellow-200 dark:border-yellow-800'
			}
		},
		{
			level: 'ADVISORY',
			icon: 'ri-temp-cold-line',
			title: '[주의보: 픽업 전선 북상 중]',
			description: 'D-3, 금빛 태풍의 눈이 유저님의 서버로 접근하고 있습니다.',
			color: {
				bg: 'bg-yellow-50 dark:bg-yellow-900/30',
				text: 'text-yellow-700 dark:text-yellow-300',
				border: 'border-yellow-200 dark:border-yellow-800'
			}
		}
	],

	WARNING: [
		{
			level: 'WARNING',
			icon: 'ri-thunderstorms-line',
			title: '[경보: 픽업 태풍 상륙]',
			description: '현재 픽업 태풍이 상륙했습니다. 비상 천장 가동 및 잔고 확인 요망.',
			color: {
				bg: 'bg-orange-50 dark:bg-orange-900/30',
				text: 'text-orange-500 dark:text-orange-300',
				border: 'border-orange-200 dark:border-orange-800'
			}
		},
		{
			level: 'WARNING',
			icon: 'ri-sparkling-2-line',
			title: '[경보: 소프트 천장 습도 90%]',
			description: '74회차 진입. 곧 금빛 낙뢰가 떨어질 확률이 매우 높습니다. 우산(확천) 준비!',
			color: {
				bg: 'bg-orange-50 dark:bg-orange-900/30',
				text: 'text-orange-500 dark:text-orange-300',
				border: 'border-orange-200 dark:border-orange-800'
			}
		},
		{
			level: 'WARNING',
			icon: 'ri-windy-line',
			title: '[경보: 무지성 단차 돌풍 주의]',
			description: '계획 없는 뽑기로 인한 잔고 유출 사고가 빈번합니다. 통제력을 유지하세요.',
			color: {
				bg: 'bg-orange-50 dark:bg-orange-900/30',
				text: 'text-orange-500 dark:text-orange-300',
				border: 'border-orange-200 dark:border-orange-800'
			}
		}
	],

	DISSIPATION: [
		{
			level: 'DISSIPATION',
			icon: 'ri-mist-line',
			title: '[특보: 태풍 소멸 단계 진입]',
			description:
				'픽업 전선의 세력이 약화되고 있습니다. 막차 탑승을 고려 중인 유저들은 강풍(픽뚫)에 주의하십시오.',
			color: {
				bg: 'bg-purple-50 dark:bg-purple-900/30',
				text: 'text-purple-600 dark:text-purple-300',
				border: 'border-purple-200 dark:border-purple-800'
			}
		},
		{
			level: 'DISSIPATION',
			icon: 'ri-time-line',
			title: '[특보: 픽업 환절기 주의보]',
			description:
				'막바지 뽑기로 인한 잔고 급락 사고가 예상됩니다. 다음 태풍을 위한 존버 준비를 권장합니다.',
			color: {
				bg: 'bg-purple-50 dark:bg-purple-900/30',
				text: 'text-purple-600 dark:text-purple-300',
				border: 'border-purple-200 dark:border-purple-800'
			}
		},
		{
			level: 'DISSIPATION',
			icon: 'ri-speed-line',
			title: '[특보: 최종 결단 카운트다운]',
			description: '픽업 종료 D-7. 곧 다음 폭풍을 준비하는 가장 긴박한 시기가 도래합니다.',
			color: {
				bg: 'bg-purple-50 dark:bg-purple-900/30',
				text: 'text-purple-600 dark:text-purple-300',
				border: 'border-purple-200 dark:border-purple-800'
			}
		}
	],

	DISASTER: [
		{
			level: 'DISASTER',
			icon: 'ri-alarm-warning-line',
			title: '[재난: 픽뚫 쓰나미 발생]',
			description: '50% 확률 돌파 실패! 픽업 외 기류 유입으로 지갑 전역이 침수되었습니다.',
			color: {
				bg: 'bg-red-50 dark:bg-red-900/30',
				text: 'text-red-500 dark:text-red-300',
				border: 'border-red-200 dark:border-red-800'
			}
		},
		{
			level: 'DISASTER',
			icon: 'ri-earthquake-line',
			title: '[재난: 풀천장 지진 감지]',
			description: '지갑 지각 변동 발생. 90회차까지 금빛 구경 불가. 붕괴 위험이 감지됩니다.',
			color: {
				bg: 'bg-red-50 dark:bg-red-900/30',
				text: 'text-red-500 dark:text-red-300',
				border: 'border-red-200 dark:border-red-800'
			}
		},
		{
			level: 'DISASTER',
			icon: 'ri-error-warning-line',
			title: '[재난: 다중 픽업 연쇄 폭발]',
			description: '4개 게임 동시 픽업 발생. 지갑 시스템 전체 마비 및 생존자 확인 불가.',
			color: {
				bg: 'bg-red-50 dark:bg-red-900/30',
				text: 'text-red-500 dark:text-red-300',
				border: 'border-red-200 dark:border-red-800'
			}
		}
	],

	RECOVERY: [
		{
			level: 'RECOVERY',
			icon: 'ri-gift-line',
			title: '[특보: 긴급 구호 물자 투하]',
			description: '리딤코드 3종 도착! 잔고 가뭄 해소를 위해 즉시 수령하십시오.',
			color: {
				bg: 'bg-cyan-50 dark:bg-cyan-900/30',
				text: 'text-cyan-600 dark:text-cyan-300',
				border: 'border-cyan-200 dark:border-cyan-800'
			}
		},
		{
			level: 'RECOVERY',
			icon: 'ri-tools-line',
			title: '[특보: 안개로 인한 통신 장애]',
			description: '서버 점검 중. 가시거리가 확보될 때까지 게임 접속이 통제됩니다.',
			color: {
				bg: 'bg-cyan-50 dark:bg-cyan-900/30',
				text: 'text-cyan-600 dark:text-cyan-300',
				border: 'border-cyan-200 dark:border-cyan-800'
			}
		},
		{
			level: 'RECOVERY',
			icon: 'ri-heart-pulse-line',
			title: '[특보: 사후 보급 완료]',
			description: '점검 보상 도착. 소모된 정신력을 해당 재화로 보충하시기 바랍니다.',
			color: {
				bg: 'bg-cyan-50 dark:bg-cyan-900/30',
				text: 'text-cyan-600 dark:text-cyan-300',
				border: 'border-cyan-200 dark:border-cyan-800'
			}
		}
	]
};
