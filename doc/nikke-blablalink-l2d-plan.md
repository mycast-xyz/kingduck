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
