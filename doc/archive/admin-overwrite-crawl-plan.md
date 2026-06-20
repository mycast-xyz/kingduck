# 기획안 — 어드민 "덮어쓰기 실행" 버튼 (강제 새로고침 / 완전 재구축)

> 작성일: 2026-06-19
> 요청: 어드민 크롤 실행 시 일반 실행 외에 **덮어쓰기 형태로 실행하는 버튼**도 추가. (모드 선택형으로 결정)

---

## 0. 배경
현재 크롤은 "스마트": 추천/빌드 키 보존, 이미 받은 이미지 skip(ImageDownloader), Element 아이콘은 **비어있을 때만** 채움.
→ 소스가 바뀌어도 갱신이 안 되는 경우가 있음. **강제 실행 모드**가 필요.

## 1. 두 모드 (버튼에서 선택)
1. **강제 새로고침(force)** — 안전, 권장 기본:
   - ImageDownloader가 **존재해도 재다운로드**(skip 무시).
   - DataSyncService가 Element.iconUrl을 **값이 있어도 덮어씀**(평소 빈 경우만 → force면 항상).
   - **추천/빌드 키는 그대로 보존**(데이터 손실 없음).
2. **완전 재구축(purge)** — 파괴적:
   - 해당 게임 캐릭터/관련 데이터 `purgeCharacters(gameSlug)`(+ 필요 시 items) 후 처음부터 재크롤.
   - 추천·수동값 등 다 사라지고 재크롤. 확인 모달 필수.

## 2. 구현
### 백엔드 (kingduck-server)
- **CrawlerController 수동 실행 엔드포인트**: body에 `mode?: 'normal' | 'force' | 'purge'`(기본 normal) 받기.
- `syncService`에 모드 전달: `syncService.overwrite = mode`(또는 플래그). DataSyncService/ImageDownloader가 이 플래그를 읽어:
  - force: ImageDownloader `downloadAndSave(..., {force:true})`로 재다운로드, Element.iconUrl 무조건 세팅.
  - purge: 태스크 run 전에 `purgeCharacters(game)` 호출(서버가 안전하게).
- ImageDownloader에 `force` 옵션 추가(존재해도 덮어쓰기).
- 주의: force여도 **추천/빌드 PRESERVE_KEYS는 유지**(데이터 보호). purge만 전부 제거.

### 프론트 (kingduck)
- `AdminCrawlerStatus.svelte`: 각 태스크(또는 게임 전체) 실행 버튼 옆에 **드롭다운/보조 버튼**으로 "강제 새로고침" / "완전 재구축" 선택. purge는 **확인 모달**("정말 해당 게임 데이터를 지우고 재구축?").
- 크롤러 서비스: run 요청에 `mode` 추가.

## 3. 검증
- force: 아이콘/이미지가 이미 있어도 재다운로드되는지 + 추천 보존되는지.
- purge: 게임 데이터 비워지고 재크롤로 채워지는지(확인 모달 동작).
- tsc/check 0.

## 4. 주의
- **ZZZ 종합 에이전트가 DataSyncService/scheduler 수정 중** → 그 작업 머지 후 구현(충돌 방지).
- purge는 위험 — 확인 모달 + 어드민 권한 가드(이미 클라 가드 있음, 서버 가드는 백엔드 책임).
- 전부 기존 패턴 재사용(서버 재현).

---

### 요약
> 어드민 실행 버튼에 모드 선택 추가: **강제 새로고침**(이미지·아이콘 재다운로드/덮어쓰기, 추천 보존) + **완전 재구축**(purge 후 재크롤, 확인 모달).
> 백엔드 CrawlerController가 `mode` 받아 syncService/ImageDownloader에 전달, force 옵션 추가. ZZZ 에이전트 종료 후 구현.
