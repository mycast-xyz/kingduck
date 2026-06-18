# 기획안 — 게임별 속성 아이콘 크롤(서버 재현 + DB 적재)

> 작성일: 2026-06-19
> 요청: 니케처럼 원신/스타레일/명조/엔드필드도 **속성 아이콘을 DB에 적재**하고 **서버 크롤러로 재현**되게.
> (니케는 `BlablalinkIconScraper`로 Element.iconUrl + `game.attr_icons` 완료.)

---

## 0. 전제 — 홈서버는 "아이콘 0" 백지 상태

> 로컬 DB엔 일부 아이콘이 있지만(수동/어드민 업로드/과거 크롤 잔재, **머신 로컬**), **배포 홈서버에는 아이콘이 하나도 없다고
> 가정**한다. `static/image/**`는 gitignore라 git으로 안 옮겨지고, 어드민 업로드는 로컬 DB만 바꾼다. 따라서 **서버는 처음부터
> 크롤러로 전부 생성**해야 한다. 로컬 보유 현황은 무의미 — 모든 게임의 element/path(및 부가) 아이콘을 **크롤로 0에서 채운다.**

대상 게임과 분류(서버에서 전부 새로 크롤):
- genshin: 원소(DamageType 7) + 무기타입(Path 5)
- starrail: 속성(DamageType 7) + 운명의 길(Path 9)
- wutheringwaves: 속성(element 6) + 무기(weapon 5)
- endfield: 원소(DamageType 5) + 특성(Path 5)
- (확장) reverse1999, zzz도 동일하게
- nikke는 이미 `BlablalinkIconScraper`로 완료(참고 모델).

→ **목표: 신규 홈서버에서 `<game>/icon` 크롤만 돌리면 전 게임 속성 아이콘이 DB(Element.iconUrl)+static에 0에서 채워진다.**

## 1. 목표
1. 각 게임의 **속성/특성(Element) 아이콘을 그 게임의 소스에서 크롤**해 `Element.iconUrl`에 적재(서버 재현·반복 가능).
2. (있으면) 게임별 **부가 분류 아이콘**을 `game.attr_icons`(JSON)에 적재 — 단 이 4개는 element/path 외 분류가 마땅치 않아 부가 아이콘은 선택.
3. 전부 **크롤러 태스크**(스케줄러 `<game>/icon` 또는 character 크롤 내 단계)로 서버에서 동일 작동.

## 2. 설계 — 게임별 아이콘 크롤(니케 `BlablalinkIconScraper` 패턴)
공통: 소스에서 속성/특성별 아이콘 URL 확보 → `ImageDownloader.downloadAndSave('<game>','element' 등)` → 해당 `Element` 행(gameId,name,type) `iconUrl` update. `<game>/icon` 태스크로 등록.

### 게임별 소스 (스파이크로 URL 확정)
- **genshin (Ambr / gi.yatta.moe)**: 원소 아이콘(`/api/v2/static/...` 또는 element 메타), 무기타입 아이콘. (캐릭터 스크래퍼가 이미 일부 채웠다면 그 로직을 icon 태스크로 분리/명시화.)
- **starrail (starrailstation.com)**: DamageType(물리/불/얼음/번개/바람/양자/허수) + Path(파멸/수렵/지능/화신/공허/존속/풍요) 아이콘.
- **wutheringwaves (encore.moe)**: element(6) + weapon(5) 아이콘.
- **endfield (endfieldtools.dev)**: element(5) + path(5) 아이콘.
- **reverse1999 / zzz** (확장): r1999=Afflatus/속성, zzz=속성/특성 아이콘 소스 확보(zzz는 zzz.gg, r1999는 기존 소스).

### 매핑
- Element 행 이름(영문 키)과 소스 아이콘 키를 매핑(니케 Electronic→Electric처럼 표기 차이 매핑표). 실패분 로깅.

## 3. 구현 단계
1. **감사(audit)**: 각 게임 캐릭터/Element 스크래퍼가 이미 iconUrl을 채우는지 코드 확인. 채우면 → 그대로 두되 **icon 전용 재실행 경로** 보장(서버에서 돌리면 재현). 안 채우면 → 아래.
2. **게임별 IconScraper**(또는 기존 스크래퍼에 아이콘 다운로드 단계): 소스 아이콘 URL → 다운로드 → Element.iconUrl. ni케 패턴 재사용.
3. **스케줄러 `<game>/icon` 태스크** 등록(서버 크롤).
4. (선택) 부가 분류가 있는 게임은 `game.attr_icons`에 적재(현재 4개는 해당 거의 없음).
5. **reverse1999/zzz**까지 확장(현재 0).
6. **검증**: 각 게임 `<game>/icon` 실행 → Element.iconUrl 채워짐 → 필터 아이콘 표시. 배포 서버에서도 동일 실행으로 재현.

## 4. 주의
- `static/image/**`는 gitignore(머신로컬) → **서버가 직접 크롤**해야 배포에 아이콘이 생김(이미지 누락 이슈와 동일 계열). 그래서 "크롤러 코드화"가 핵심.
- 소스 아이콘 URL은 사이트별로 다름 + 변동 가능 → 스파이크로 확정 후 방어적 셀렉터/매핑.
- 기존에 채워진 4개는 회귀 주의(덮어쓸 때 동일 키 매핑 확인). 어드민 업로드로 수동 보정한 아이콘이 있으면 크롤이 덮어쓸 수 있음 → 크롤은 "비어있을 때만" 채우는 옵션 고려.

---

### 요약
> **홈서버는 아이콘 0 백지 가정.** 니케 `BlablalinkIconScraper` 패턴으로 **게임별 `<game>/icon` 크롤**
> (소스→`ImageDownloader`→`Element.iconUrl`, +필요시 `game.attr_icons`)을 만들어, **신규 서버에서 크롤만 돌리면
> genshin/starrail/wuwa/endfield(+r1999/zzz)의 속성·특성 아이콘이 0에서 전부 DB+static에 채워지게** 한다.
> 각 게임 소스(Ambr/starrailstation/encore/endfieldtools/zzz.gg 등)의 아이콘 URL은 스파이크로 확정.
