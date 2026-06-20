# 기획안 — 니케 데이터(blablalink) + L2D(Spine) 도입 검토

> 작성일: 2026-06-19
> 요청: ① blablalink(공식 한국어)로 니케 정보 보강 가능? ② 리스트 이미지 깨짐 ③ L2D(Nikke-db) 가능성 + 기획.

---

## 0. 리스트 이미지 깨짐 — 진단

- **로컬은 정상**: `127.0.0.1:3100/assets/image/nikke/character/icon_Rapi.webp` → 200 image/webp.
- **깨지는 건 배포(api.kingduck.xyz)** — 니케 이미지가 아직 서버에 없다(P0 측정: nikke 0/20).
- → **원인 = 서버에서 니케 크롤을 아직 안 돌림**(P0 진행 중). 서버에서 `nikke character` 크롤하면 채워진다.
  (또는 아래 blablalink로 재소싱 시 그때 채워짐.)

## 1-A. (확정 방향) blablalink로 니케 종합 재소싱 — 헤드리스 렌더 스크래핑

> 검증됨(2026-06-19): blablalink는 Vite SPA(데이터는 `api.blablalink.com` RPC). API 게이트웨이는 인증/서명이
> 얽혀 minified JS만으로 깔끔히 못 부른다(404/스토리지에러). **대신 헤드리스 Chrome로 페이지를 렌더하면**
> 캐릭터명·이미지·속성이 **DOM에서 전부 추출된다** → API 리버스 불필요.

- PoC 결과: 리스트 페이지 렌더 → `sg-tools-cdn.blablalink.com/...webp` 이미지 **192개** + 한글 캐릭터명 매칭 확인
  (예: "엠마" → `dt-85/rc-54/ca3628f9…webp`, 사용자가 준 URL과 일치).
- **이미지**: blablalink 포트레이트(전신 X) 다운로드 → 니케 `imageUrl` 교체(저해상도 fandom 아이콘 문제 해결).
- **캐릭터 정보**: 리스트/상세 페이지에 속성·무기·클래스·기업·버스트 + 기타 정보가 있음 → **긁을 수 있는 건 다 긁는다.**

### 구현 방식
- **새 스크래퍼** `blablalink/CharacterScraper.ts`: 헤드리스 Chrome로 nikke-list(+필요시 상세) 렌더 →
  cheerio/evaluate로 `{ name, imageUrl(sg-tools-cdn), element, weapon, class, corp, burst, ... }` 추출.
  - 이미 프로젝트에 헤드리스 Chrome/puppeteer류 사용 가능(스크린샷·DOM 덤프에 사용 중).
  - lazy-load(현재 12/192만 img 태그) 대응: 스크롤 트리거 또는 페이지 내 데이터 스토어/`evaluate`로 전체 추출.
- **이미지 다운로드**: `ImageDownloader`로 webp 저장(기존 패턴), `imageUrl`에 연결.
- **기존 fandom+Inven 스크래퍼**: blablalink로 대체(또는 스킬 등 일부 폴백 유지 — blablalink 스킬 한국어면 완전 대체).

### 리스크
- 헤드리스 렌더는 무겁고 느림(190여 캐릭) → 1회 수집 후 캐시. lazy-load/스크롤 안정화 필요.
- DOM 구조 변경 시 깨짐(블라블라링크 UI 업데이트). 셀렉터 방어적으로.
- 저작권: 공식 플랫폼 자산 → 표기/비상업 범위 확인.

## 1-B. 니케 필터 5종 (속성/무기/클래스/기업/버스트) 처리

현재 니케 필터는 **속성(코드)·무기**만 = 서버 컬럼 `element_id`/`path_id`로 필터(2개 관계 슬롯 다 씀).
**클래스·기업·버스트는 metadata에만** 있어 서버 필터 불가(현재 상세 표시만).

- **해결책**: 이 3종을 **리스트 응답에 가벼운 문자열 필드로 포함**(백엔드가 metadata→투영) → **클라이언트 필터**.
  (슬림 리스트 유지: 전체 metadata 대신 class/corp/burst 3개만 투영하면 용량 부담 적음.)
  - 또는 denormalize(컬럼화)도 가능하나 JSON 투영이 더 가볍다.
- **프론트**: nikkeInit `type`에 클래스/기업/버스트 필터 추가(클라이언트 필터 모드) + ListFilterMenu가 그대로 렌더.
- blablalink 재소싱 시 이 5종 값을 한국어로 정확히 채움 → 필터 라벨도 한글.

---

## 1. (참고) blablalink API 직접 호출 — 보류

- URL: `https://www.blablalink.com/shiftyspad/nikke-list?lang=ko` — **SHIFT UP/텐센트 공식 커뮤니티 플랫폼**.
- 구조: **API 기반 SPA**. 페이지 HTML에 `api.blablalink.com` 참조. 데이터는 그 API에서 fetch(엔드포인트 경로는 JS 번들 안).
- 장점:
  - **공식 한국어** 데이터(이름·스킬·스토리) → fandom(영문)+Inven(스킬만) 혼합보다 일관·정확.
  - 고품질 공식 이미지 가능성.
- 리스크/제약:
  - **API 리버스 엔지니어링 필요**(엔드포인트·인증 토큰·지역 헤더). 공개 GET이 아닐 수 있음.
  - 비공식 사용은 **ToS/안정성** 리스크(엔드포인트 변경 시 깨짐).
- **권장 접근(스파이크 먼저)**:
  1. 브라우저 네트워크 탭에서 nikke-list가 호출하는 `api.blablalink.com/...` 엔드포인트·헤더 확인(1~2시간 스파이크).
  2. 공개로 호출 가능하면 → **니케 스크래퍼를 blablalink 기반으로 교체**(한국어 일원화). 인증 필요하면 보류/대안 유지.
  3. 교체 시 기존 fandom/Inven 스크래퍼는 폴백 또는 제거.

> 결론: **가능성 높음(한국어 일원화의 best)**, 단 API가 공개 호출되는지 스파이크로 먼저 확인 후 진행.

## 2. L2D — Nikke-db(Spine) 도입

### 핵심 사실 (실측)
- 소스: `https://github.com/Nikke-db/Nikke-db.github.io` — 캐릭터별 `l2d/<id>/` 폴더.
- 포맷: **`*.skel` + `*.atlas` + `*.png` = Spine(Esoteric) 스켈레탈 애니메이션** (Cubism Live2D 아님!).
  - 예) `l2d/absolute/{absolute_00.skel, absolute_00.atlas, EventScene_absolute_01.png}`.
- 즉 NIKKE의 "움직이는 일러스트"는 **Spine**으로 제작됨 → 웹에선 **Spine 런타임**으로 렌더.

### 구현 방안
- **렌더러**: `pixi-spine`(PixiJS + spine) 또는 `@esotericsoftware/spine-player`. `.skel` 버전에 맞는 런타임 버전 필요(중요).
- **컴포넌트**: 캐릭터 상세에 "L2D 보기" 탭/모달 → 캔버스에 Spine 모델 로드(.skel/.atlas/.png) + idle 애니메이션 재생.
- **에셋 호스팅(셋 중 택)**:
  - (a) **Nikke-db raw 핫링크**(`raw.githubusercontent.com/.../l2d/<id>/...`) — 즉시 가능하나 외부 의존·대역폭·안정성 리스크.
  - (b) **자체 호스팅**: 필요한 캐릭터 에셋을 우리 static(또는 R2)에 복사 — 안정적이나 용량 큼(캐릭당 수~수십 MB).
  - (c) 하이브리드: 자주 보는 것만 자체 호스팅.
- **매핑**: 우리 DB 니케 캐릭터 ↔ Nikke-db `l2d/<id>` 폴더명 매핑 테이블 필요(이름/코드로).

### 리스크/주의
- **법적/저작권**: 에셋은 SHIFT UP 소유, Nikke-db는 팬 아카이브. 비공식 사이트 특성상 **저작권 표기/비상업** 범위 확인.
- **용량/성능**: Spine 에셋은 큼 → 지연 로드(탭 클릭 시), 모바일 성능 고려.
- **런타임 버전 호환**: `.skel` 바이너리 버전과 spine 런타임 메이저 버전 불일치 시 로드 실패 → 버전 확인 필수.
- **유지보수**: Nikke-db 구조 변경 시 매핑/핫링크 깨짐.

### 단계
1. **스파이크**: 한 캐릭터(.skel 버전 확인) + pixi-spine로 로컬 렌더 PoC(1일).
2. 매핑 테이블(우리 캐릭터 ↔ l2d id) 작성 방식 결정(수동/자동).
3. 상세 페이지 "L2D" 탭 + 지연 로드 뷰어 컴포넌트.
4. 에셋 호스팅 정책 결정(핫링크 → 자체 호스팅 마이그레이션).

> 결론: **기술적으로 가능**(Spine 런타임). 단 ① 저작권 범위 ② 에셋 용량/호스팅 ③ 런타임 버전 호환을 PoC로 먼저 검증.

## 3. 권장 우선순위
1. (지금) **서버 니케 크롤** → 배포 이미지 깨짐 해결(P0, 별도 소스 없이 즉시).
2. **blablalink API 스파이크** → 공개 호출 가능하면 니케 한국어 일원화(중간 가치, 중간 노력).
3. **L2D PoC**(pixi-spine + 한 캐릭터) → 가능성·용량·법적 검증 후 본격화(높은 가치, 큰 노력).

---

### 요약
> 깨진 이미지는 **배포에 니케 미크롤**(로컬 정상) → 서버 크롤로 해결. blablalink는 **공식 한국어 API 소스**라 매력적이나
> **API 공개 여부 스파이크** 선행. L2D는 Nikke-db가 **Spine(.skel/.atlas)** 포맷 → `pixi-spine`로 렌더 가능, 단
> 저작권·용량·런타임버전을 PoC로 검증 후 진행.

---

# 업데이트 (2026-06-19) — 에이전트 조사 결과 반영

## A. blablalink 데이터 구조 (실측 확정)
- **리스트**: SPA가 받는 단일 JSON(`sg-tools-cdn .../*.json`, 해시 URL → response 가로채기)에 192캐릭 전원
  `original_rare, class, corporation, use_burst_skill, element_id.element.element, shot_id.element.weapon_type, name_localkey.name, id, resource_id` 완비(누락 0). DOM 카드 순서 == JSON 순서라 이미지(webp)는 인덱스 조인.
  → **이미 스크래퍼 구현**(`BlablalinkImageScraper`): image_url + metadata.bl{Class,Corp,Burst,Element,Weapon} 보강(168캐릭).
- **상세**(`?nikke=<resource_id>`): SPA가 캐릭터별 JSON fetch(해시 URL, body에 `skill1_detail`) — **전부 한국어**:
  - `description_localkey`(스토리/소개), `skill1_detail`/`skill2_detail`/`ulti_skill_detail`(스킬: name_localkey+description_localkey+icon, `{description_value_NN}` 치환 필요),
    `cv_localkey`(CV: 이명호/노토 마미코), `character_costume_list`/`additional_skins`(코스튬: 오피스 테라피 등),
    `critical_ratio/critical_damage` + 레벨별 atk/def/hp 스탯, `squad`.

## B. 상세 데이터 활용 방안 (권장)
blablalink 상세를 2차 스크래퍼로 긁어 **fandom+Inven을 대체**(더 정확한 공식 한국어):
1. **스킬**(최우선): Inven 스킬 → blablalink 스킬로 교체. 한글 스킬명+설명+아이콘 보유.
   단 설명의 `{description_value_NN}` 플레이스홀더는 `skillN_table`(레벨별 값)로 치환 필요 → 레벨 슬라이더까지 가능(다른 게임 SkillTreeView와 동일).
2. **스토리/소개**: `description_localkey` → 니케 프로필에 소개 섹션 추가(현재 없음).
3. **코스튬**: `character_costume_list` 이미지 → 코스튬 갤러리 섹션(신규).
4. **스탯**: 레벨별 atk/def/hp + 크리 → 기초 스탯 섹션(다른 게임처럼).
5. **CV/스쿼드**: 프로필 보강(이미 일부 있음).
- 구현: `nikke/image` enrichment처럼 **상세 enrichment 크롤러**(resource_id 순회 → 상세 JSON 가로채기 → metadata 보강). 헤드리스라 무겁다(190캐릭 × 렌더) → 배치/캐시.

## C. L2D(Spine) — 확정 (에이전트 실측)
- 포맷: **Spine 4.0 + 4.1 혼재**(.skel 헤더 실측: c010=4.0.47, c014=4.1.20). 4.1 런타임으로 4.0 로드 시 깨짐 → **버전별 런타임 둘 다 필요**.
- 버전표: Nikke-db `js/json/l2d.json` = `[{name(영문), id:"cXXX", version?:4.1}]`(version 없으면 4.0).
- 패키지: **`@esotericsoftware/spine-player`** 듀얼 별칭(pnpm):
  `spine-player-40→@…/spine-player@4.0.31`, `spine-player-41→@…/spine-player@4.1.20`. (pixi-spine는 pixi 의존성 때문에 비채택.)
- 컴포넌트: `NikkeL2dView.svelte` — version별 동적 import → `new SpinePlayer(host,{skelUrl,atlasUrl,animation:'idle',premultipliedAlpha:true,alpha:true,showControls:false})`, onDestroy dispose. .png는 atlas가 참조해 자동 로드.
- 에셋: raw.githubusercontent **CORS 열림(실측)** → PoC 핫링크 OK. 캐릭당 ~4–5MB(png 2048²) → **지연 로드 필수**, 운영은 R2/자체호스팅 권장.
- 매핑: **크롤러가 `metadata.nikkeId`(cXXX)+`spineVersion` 저장**(blablalink 재소싱 시 함께) → 프론트는 metadata만 읽음(매핑테이블 유지보수 불필요).
- PoC: c010(4.0)·c014(4.1) 두 캐릭으로 검증 후 화이트리스트 확대.

## D. (별도 기획 필요) 서버 ↔ 로컬 데이터 불일치
- 증상: `172.30.1.20:8080/content/genshin/276` vs `localhost:4173/content/genshin/614` — **같은 캐릭터인데 id도 정보도 다름**.
- 추정 원인: 서버/로컬 DB가 **서로 다른 크롤로 채워져** auto-increment id가 어긋나고(같은 캐릭 다른 id), 크롤 시점·소스 차이로 metadata 내용도 달라짐. (static 이미지가 머신로컬인 것과 같은 뿌리 — 데이터가 머신별로 갈라짐.)
- 해결 방향(후속 기획): ① 캐릭터 식별을 auto-id가 아닌 **originalId(소스 고유키) 기준**으로 일원화, ② 서버를 단일 소스로(서버에서만 크롤) 하거나 DB 동기화 절차 수립, ③ 프론트 링크/참조도 originalId 기반으로. → **별도 문서로 상세화 예정.**
