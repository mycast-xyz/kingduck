// 기상특보 등급
export type WeatherAlertLevel =
	| 'SAFE' // 평시 (파란색)
	| 'ADVISORY' // 주의보 (노란색)
	| 'WARNING' // 경보 (주황색)
	| 'DISSIPATION' // 소멸 단계 (보라색)
	| 'DISASTER' // 재난 (빨간색)
	| 'RECOVERY'; // 복구/보급 (하늘색)

// 기상특보 메시지
export interface WeatherAlert {
	level: WeatherAlertLevel;
	icon: string; // Remix Icon 클래스명
	title: string; // 특보 제목
	description: string; // 특보 상세
	color: {
		bg: string;
		text: string;
		border: string;
	};
}
