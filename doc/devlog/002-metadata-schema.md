# [kingduck #2] 원신·니케·스타레일을 테이블 하나로 — `metadata`로 푼 다중 게임 스키마

<!--
네이버 발행 메모:
- 추천 제목(검색용): "여러 게임 정보를 DB 하나로 다루기 — Prisma metadata 설계 (2)"
- 태그: 개인프로젝트, 데이터베이스설계, Prisma, PostgreSQL, 스키마설계, 원신, 니케, 스타레일, 개발일지
- 코드는 '소스코드' 컴포넌트로. 표는 그대로 옮기거나 이미지로.
-->

## 이번 편에서 할 것

[1편](001-why-kingduck.md)에서 예고한 이 프로젝트의 핵심 숙제를 푼다:

> 원신의 **원소**, 스타레일의 **운명의 길**, 니케의 **버스트 타입**은 전부 다른데,
> 이걸 어떻게 하나의 데이터베이스로 다룰까?

## 배경 / 문제 — 게임마다 "모양"이 다르다

캐릭터라는 개념은 모든 게임에 있지만, 들고 있는 속성은 게임마다 제각각이다.

| 게임 | 속성 체계 예시 |
|------|----------------|
| 원신 | 원소(Vision), 무기 종류, 운명의 자리 |
| 스타레일 | 운명의 길(Path), 전투 속성 |
| 니케 | 코드(속성), 버스트 타입, 제조사, 클래스 |
| 명조 | 음형, 무기 |

실제로 니케의 설정만 봐도 `manufacturerType`(기업소속), `burstType`(버스트),
`classType`(클래스)처럼 **다른 게임엔 없는 필드**가 잔뜩 있다.

여기서 갈림길이 나온다.

## 접근과 결정 — 세 가지 선택지

**A안. 게임마다 테이블을 따로 만든다** (`GenshinCharacter`, `NikkeCharacter`…)
- 👍 각 게임에 딱 맞는 타입
- 👎 게임이 늘 때마다 테이블·API·쿼리를 통째로 복제. 5개 게임 = 5배 유지보수. **탈락.**

**B안. 가능한 모든 컬럼을 다 때려넣는다** (`burstType`, `vision`, `path`… 한 테이블에)
- 👍 단순 조회는 편함
- 👎 원신 행에서 `burstType`은 항상 NULL. 게임 늘 때마다 컬럼 추가(마이그레이션). 테이블이 NULL 밭이 됨. **탈락.**

**C안. 공통은 컬럼으로, 게임별 가변 데이터는 JSON 한 칸에** ✅
- 모든 게임이 공유하는 것(`name`, `rarity`, `imageUrl`, `gameId`)은 정규 컬럼
- 게임마다 다른 것은 `metadata`(JSON) 한 필드에 통째로
- 게임이 늘어도 **스키마 변경이 없다**

C안을 택했다. 핵심 트레이드오프는 **"유연함을 얻고 타입 안전성을 일부 양보"** 한 것 —
이건 프론트에서 따로 막는다(아래).

## 구현 — 공통 뼈대 + `metadata`

대략 이런 구조다 (Prisma 기준, 단순화).

```prisma
model Character {
  id        Int    @id @default(autoincrement())
  name      String
  rarity    Int
  imageUrl  String?
  gameId    Int          // 어느 게임인지
  elementId Int?         // 공통화한 "속성"(원소/코드…)
  pathId    Int?         // 공통화한 "경로"(운명의 길/무기 계열…)
  metadata  Json?        // ← 게임별 가변 데이터는 전부 여기
}
```

여기서 한 번 더 영리하게 굴린 부분: 게임마다 이름은 다르지만 *역할이 비슷한* 속성
(원신 원소 ≈ 니케 코드, 스타레일 운명의 길 ≈ 무기 계열)은 `Element` 테이블 하나로
통합하고 `type` 으로 구분했다. 그래서 **필터 메뉴를 게임별로 하드코딩하지 않고**
DB를 조회해 동적으로 만들 수 있다.

`metadata`에는 정말 그 게임에만 있는 것만 넣는다.

```json
// 니케 캐릭터의 metadata
{ "burstType": "III", "manufacturer": "Missilis", "weaponType": "SMG" }

// 원신 캐릭터의 metadata
{ "constellation": ["...", "..."] }
```

## 막혔던 지점 — "그래서 이 JSON, 프론트에서 어떻게 믿고 쓰지?"

JSON 필드의 대가는 **타입 안전성**이다. `metadata`는 `any`나 다름없어서,
`character.metadata.burstType`을 쳐도 오타가 나도 컴파일러가 안 잡아준다.

해법은 제네릭으로 "게임별 메타 타입을 주입"하는 것.

```ts
interface Character<T = unknown> {
  id: number;
  name: string;
  gameId: number;
  metadata: T;          // 게임별 인터페이스를 끼워넣는다
}

interface NikkeMeta { burstType: string; manufacturer: string; weaponType: string; }
// 사용처에서: Character<NikkeMeta>
```

실제 필터링 코드에서도 공통 컬럼과 `metadata`를 함께 본다 —
무기 타입은 게임에 따라 정규 컬럼일 수도, metadata 안에 있을 수도 있어서다.

```ts
if (k === 'weaponType') {
  return char.weaponType == v || char.metadata?.weaponType == v;
}
```

이 `||` 한 줄이 바로 "유연함을 택한 대가를 프론트에서 메우는" 지점이다.

## 결과

- 게임을 새로 추가해도 **DB 스키마/마이그레이션 변경이 없다** — `metadata`에 새 모양을 넣으면 끝.
- 캐릭터 목록·필터·상세를 **하나의 API와 컴포넌트**로 모든 게임에 재사용.
- 대가(타입 안전성)는 제네릭과 방어 코드로 국소화.

> 물론 만능은 아니다. `metadata` 안의 값으로 **정밀한 DB 쿼리/정렬**을 하긴 어렵다.
> 자주 거르는 속성은 정규 컬럼으로 끌어올리는 게 맞다 — 그 경계선을 어디에 둘지가 설계의 묘미.

## 다음 편 예고

스키마는 정했으니, 이제 URL이다. `/genshin/character/123`, `/nikke/character/5` 처럼
**게임마다 다른 화면을 라우트 하나로** 처리한 방법 — `slug` 기반 동적 라우팅과 컴포넌트 맵.

**코드**: (GitHub 저장소 링크 — 발행 시 첨부)
