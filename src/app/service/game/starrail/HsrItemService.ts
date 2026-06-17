// 하위호환 재노출: 실제 구현은 게임 무관이라 공용 GameItemService로 이동했다(redesign-plan E2).
// 기존 소비처(content 라우트·MainItemView·BuildRecommendationView)는 그대로 import 가능.
export {
	GameItemService as HsrItemService,
	gameItemService as hsrItemService
} from '../common/GameItemService';
