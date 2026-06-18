# 기획안 — 서버/로컬 캐릭터 데이터 불일치 (genshin 276 vs 614)

> 작성일: 2026-06-19
> 증상: `http://172.30.1.20:8080/content/genshin/276`(서버) 와 `http://localhost:4173/content/genshin/614`(로컬)
> 가 **같은 캐릭터인데 id도 정보도 다르다.**

---

## 1. 원인

- 서버 DB와 로컬 DB가 **서로 다른 크롤 실행으로 채워졌다.** `characters.id`는 `@default(autoincrement())` 이므로
  **크롤 순서/시점이 다르면 같은 캐릭터라도 id가 다르게 부여**된다(로컬 614 ≠ 서버 276).
- 프론트 라우트가 **auto-increment id 기반**(`/content/genshin/<id>`)이라, 머신마다 id가 달라 링크가 안 맞는다.
- 내용(metadata)도 크롤 시점·소스 버전 차이로 미세하게 다를 수 있다.
- 뿌리: **데이터가 머신별로 갈라짐**(static 이미지가 머신로컬인 것과 동일 계열 문제).

## 2. 해결 방향 — 식별을 originalId(소스 고유키)로 일원화

캐릭터의 **안정적 식별자 = `originalId`**(소스가 주는 고유키, 크롤해도 불변)다. 이미 모든 스크래퍼가
`metadata.originalId`(+ `characters.original_id` 컬럼)를 저장하고, `syncCharacters`도 originalId로 매칭한다.
**니케는 방금 originalId를 blablalink 공식 id로 일원화**(클린 재구축)했다 — genshin도 같은 원리로 정리.

### 2-1. 프론트 라우트를 originalId 기반으로
- `/content/<game>/<originalId>` 로 전환(현재 auto-id). 그러면 **서버·로컬·어느 머신이든 같은 URL**이 같은 캐릭터.
- 리스트 카드 링크, 상세 조회(`getCharacterById`)를 originalId 우선으로(현재 id==Number 또는 originalId 둘 다 봄 — originalId를 정식 키로).
- 영향 범위: `routes/content/[gameEnName]/[characterId]`, `ListCardView` href, `CharacterListService.getCharacterById`.

### 2-2. 서버를 단일 소스(authoritative)로
- 크롤은 **서버에서만** 실행 → 로컬은 보지 않거나 서버 DB를 덤프로 동기화. (개발 편의상 로컬 크롤이 필요하면,
  결과를 서버로 밀거나, originalId 기반이라 id 차이는 무해해진다.)

### 2-3. (선택) 데이터 동기화 절차
- 서버 DB를 정본으로 두고, 필요시 `pg_dump`/`pg_restore`로 로컬에 복제하는 절차 문서화.

## 3. 작업 분해
1. 프론트: 캐릭터 상세 라우트/링크/조회를 **originalId 기반**으로 전환(auto-id 폴백 유지 가능).
2. (확인) 모든 게임 캐릭터가 `original_id` 컬럼을 안정적으로 보유하는지 점검(없으면 백필).
3. 운영: 크롤을 서버 단일 실행으로 정리(또는 DB 동기화 절차).

## 4. 주의
- originalId 전환 시 기존 북마크/외부링크(auto-id)는 깨질 수 있음 → auto-id도 폴백 조회 권장.
- 게임별 originalId 형식이 제각각(genshin=Ambr 숫자, starrail=숫자, nikke=blablalink id 등)이라 URL-safe 확인.

---

### 요약
> 서버/로컬이 **다른 크롤로 채워져 auto-increment id가 어긋난 것**(같은 캐릭 다른 번호). 해결 = **식별을
> originalId로 일원화**(라우트/링크/조회를 originalId 기반) + **서버 단일 크롤**(또는 DB 동기화). 니케에 적용한
> originalId 일원화를 전 게임 라우팅으로 확장하는 것이 핵심.
