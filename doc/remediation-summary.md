# 감사 대응 요약 (Remediation Summary)

작성일: 2026-06-15 · 대상: `kingduck`(프론트) + `kingduck-server`(백엔드)
상세 항목별 기록은 [`code-audit.md`](./code-audit.md)의 changelog 참고.

> 이 문서는 한 장짜리 핸드오프다. **무엇을 고쳤고 / 무엇이 남았고(왜) / 당신이 직접 할 일**을 담는다.

## 0. 진행 방식

전 과정을 **Opus 오케스트레이션 + Sonnet 팀 에이전트 구현** 모델로 처리했다.
Opus(메인)가 감사 종합·작업 분해·위임·검증(빌드/타입체크/부팅)을 맡고, 실제 코드 수정은
`model: sonnet`로 고정된 팀 에이전트([`.claude/agents/`](../.claude/agents/))가 수행했다.
모든 수정은 빌드 green 확인 후 **논리 단위로 커밋·푸시**했다.

## 1. 완료 (Critical·High 전부 + 안전한 Medium)

| 단계 | 항목 | 핵심 |
|------|------|------|
| **Phase 0** 배포차단·Critical | B-C1~C6 | 빌드/부팅 살림(start 경로·config 복사·env JWT), video 크래시(Prisma 재작성), 인증 핸들러 try/catch, 전역 에러 미들웨어, 어드민 이벤트 CRUD, 크롤러 브라우저 누수 |
| **Phase 1** 보안 | B-S1~S4, B-S7, F-S1, F-S3, F-A1 | 시크릿 제거+env 전환+로테이션, CORS 잠금, role 상승 차단, rate limit+helmet, 어드민 가드 선렌더 차단, XSS sanitize(DOMPurify), baseURL 일원화 |
| **Phase 2** 기능 | B-H1, B-H4a | 누락/오라우팅 엔드포인트 3건(밴·스킬·어드민캐릭터), originalId top-level 노출 |
| **Phase 3** 안정성 | B-H2, B-H3, B-H7, B-H8 | 목록 take 상한, 페이지네이션 클램프, 크롤러 axios timeout, 크롤러 중복 실행 차단 |
| **Medium** | B-M2, B-M3, B-M4 | 에러클래스 500 정정, 토큰 필드(reviewedBy), update 경쟁 원자화 |

추가로 프론트 **svelte-check 타입 에러 39→0**(세션 초반)도 처리. 양쪽 repo 빌드 green 유지.

## 2. 의도적으로 남긴 것 (보류 — 사유 포함)

| 항목 | 무엇 | 보류 사유 / 선행조건 |
|------|------|---------------------|
| **B-M1** | 응답 envelope 통일 | 공개/어드민 응답 형태 변경 = 프론트 파싱 계약을 깨뜨릴 위험. 프론트와 함께하는 의도적 리팩터링으로 처리 |
| **B-H5** | N+1 동기화/조회 최적화 | 크롤러 sync 로직 변경 리스크. 부하 커지기 전엔 우선순위 낮음 |
| **B-H4b** | originalId 컬럼 정규화 + `@@unique` + Item 컬럼 | **실 DB 변경**(backfill + 마이그레이션). 절차는 code-audit.md에 5단계로 문서화. 배포/크롤러 운영 전 일괄 적용 |
| **B-M5** | 누락 인덱스(`RedeemCode.groupId` 등), Element `@@unique` | 마이그레이션 필요 |
| **B-M7/M8** | Docker DB 호스트 하드코딩, 크롤러 타임존 | 배포 구성 시점 작업 |
| **B-S6 / F-S2** | 토큰 무효화(DB 재확인) / localStorage→HttpOnly 쿠키 | 설계 변경 동반(백엔드 세션·프론트 인증 흐름) |

전부 [`code-audit.md`](./code-audit.md)에 사유와 함께 기록돼 있다.

## 3. ⚠️ 사용자 직접 처리 (배포/운영 전 필수)

코드로는 못 하는, 당신만 할 수 있는 것:

1. **프로덕션에 새 `JWT_SECRET_KEY` 주입** — 새 시크릿은 로컬 `kingduck-server/.env`(gitignored)에 있음. 운영 서버/도커 환경변수로 설정. (안 하면 prod 부팅 거부)
2. **Postgres 비밀번호 변경** (`102468` → 강한 값) + 운영 `DATABASE_URL` 갱신.
3. **(선택) git 히스토리 시크릿 스크럽** — 보류함. 절차/명령은 세션 기록 참고. *실질 방어는 위 1·2(로테이션)이며 이미 준비됨.*
4. **(배포 전) B-H4b 마이그레이션** — code-audit.md 절차대로.

## 4. 운영 메모

- 백엔드 `pnpm build` → `dist/index.js`. 실행은 `pnpm start`. **prod는 `JWT_SECRET_KEY` env 필수**(미설정 시 fail-fast).
- CORS 화이트리스트는 코드 기본값 + `CORS_ORIGINS`(콤마구분 env)로 확장.
- 프론트 API base는 `PUBLIC_API_BASE_URL`(미설정 시 `현재호스트:3000` 폴백).
- 환경변수 템플릿: 백엔드 [`.env.example`](../../kingduck-server/.env.example), 프론트 `.env.example`.
