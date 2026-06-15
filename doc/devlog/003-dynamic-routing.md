# [kingduck #3] 게임마다 다른 화면을 라우트 하나로 — slug 동적 라우팅과 컴포넌트 맵

<!--
네이버 발행 메모:
- 추천 제목(검색용): "SvelteKit 동적 라우팅으로 여러 게임 화면을 한 페이지에서 (3)"
- 태그: 개인프로젝트, SvelteKit, 동적라우팅, Svelte, 프론트엔드, 원신, 니케, 스타레일, 개발일지
- 코드는 '소스코드' 컴포넌트, 핵심만 발췌.
-->

## 이번 편에서 할 것

[2편](002-metadata-schema.md)에서 데이터는 게임 하나의 스키마로 합쳤다.
이제 화면 차례다. `/starrail/...`, `/nikke/...`처럼 게임마다 다른 페이지를
**파일 하나로** 처리한 방법 — SvelteKit 동적 라우팅과 "컴포넌트 맵" 패턴.

## 배경 / 문제 — 게임 수만큼 페이지를 만들 순 없다

캐릭터 상세 페이지를 떠올려보자. 원신 캐릭터 화면, 스타레일 화면, 니케 화면…
게임마다 폴더와 파일을 따로 만들면 6개 게임 = 6벌의 거의 똑같은 코드다.
게임이 하나 늘 때마다 복붙이 늘어난다. 이건 2편에서 DB를 합친 이유와 정확히 같은 문제다.

목표는 하나다: **URL의 게임 부분을 변수로 받아서, 화면 한 벌이 모든 게임을 처리한다.**

## 접근 — SvelteKit의 `[param]` 폴더

SvelteKit은 폴더명을 `[...]`로 감싸면 그 부분이 URL 파라미터가 된다.
kingduck의 캐릭터 상세 라우트는 이렇게 생겼다:

```
src/routes/content/[gameEnName]/[characterId]/+page.ts      ← 데이터 로드
src/routes/content/[gameEnName]/[characterId]/+page.svelte  ← 화면
```

- `/content/starrail/123` → `params.gameEnName = 'starrail'`, `params.characterId = '123'`
- `/content/nikke/5`       → `params.gameEnName = 'nikke'`, `params.characterId = '5'`

화면 파일은 **딱 하나**. URL만 다르면 같은 코드가 다른 게임을 그린다.

## 구현 1 — load에서 slug로 게임 설정을 고른다

`+page.ts`의 `load`는 URL 파라미터(`params`)를 받는다. 여기서 `gameEnName`(게임 slug)으로
2편에서 만든 게임별 설정(Init)을 골라 주입하고, 그 게임의 캐릭터 데이터를 가져온다.

```ts
export const load: PageLoad = async ({ params, url }) => {
  // slug → 게임 설정 선택
  let gameInitConfig;
  switch (params.gameEnName) {
    case 'HonkaiStarRail':
    case 'starrail':
      gameInitConfig = new HonkaiStarRailInit().setInit();
      break;
    case 'nikke':
      gameInitConfig = new nikkeInit().setInit();
      break;
    case 'reverse1999':
      gameInitConfig = new Reverse1999Init().setInit();
      break;
    // ... 게임별로 계속
  }
  if (gameInitConfig) GameSettingInitService.updateGameInit(gameInitConfig);

  // 같은 slug로 데이터도 가져온다
  const game = await client.get(`/api/v0/game/${params.gameEnName}`);
  const character = await client.get(
    `/api/v0/character/${params.gameEnName}/${params.characterId}`
  );

  return { gameSlug: params.gameEnName, info: character.data, gameInit: gameInitConfig };
};
```

핵심은 **이 switch 하나가 "게임 등록소" 역할**을 한다는 것. 새 게임을 추가하면
여기에 `case`를 한 줄 더하는 게 전부다(+ 그 게임의 Init 파일).

## 구현 2 — 컴포넌트 맵: 화면 조각도 slug로 고른다

화면 안에서도 게임/메뉴에 따라 다른 컴포넌트를 보여줘야 할 때가 있다.
이때 `{#if}`를 잔뜩 늘어놓는 대신 **"키 → 컴포넌트" 맵**으로 고른다.
어드민 페이지(`admin/[slug]/+page.svelte`)가 좋은 예다:

```svelte
<script lang="ts">
  let ContentComponent: any = $state();

  $effect(() => {
    switch (data.slug) {
      case 'game':      ContentComponent = AdminGameList;      break;
      case 'character': ContentComponent = AdminCharacterList; break;
      case 'kanban':    ContentComponent = AdminKanban;        break;
      default:          ContentComponent = null;               break;
    }
  });
</script>

{#if ContentComponent}
  <svelte:component this={ContentComponent} {data} />
{/if}
```

`slug`만 바뀌면 `<svelte:component>`가 그에 맞는 컴포넌트를 그린다.
캐릭터 상세 페이지도 같은 원리로, 2편에서 만든 게임 설정의 `layout` 배열
(`[{ component: 'SkillTreeView', ... }, ...]`)을 순회하며 컴포넌트를 골라 렌더한다.
→ **게임별 화면 구성이 코드가 아니라 데이터(설정)에 들어간다.**

## 막혔던 지점 / 삽질

**1. slug가 게임마다 제각각이었다.**
위 switch를 보면 `'HonkaiStarRail'`과 `'starrail'`이 둘 다 같은 게임으로 매핑된다.
초기에 라우트마다 다른 표기(영문 클래스명 vs 짧은 slug)를 써서 URL이 어긋났고,
"분명 맞는데 404/빈 화면"이 뜨는 걸 한참 헤맸다. 결국 **별칭을 case에 같이 묶어** 막았는데,
지금 보면 이건 임시방편이다 — 진짜 해법은 백엔드 `Game.slug`로 표기를 하나로 통일하는 것.
(다음 리팩터링 후보로 남겨뒀다.)

**2. `<svelte:component>`가 Svelte 5에서 deprecated.**
runes 모드에선 컴포넌트가 기본적으로 동적이라 `<svelte:component>`가 경고를 띄운다.
동작은 하지만 권장 방식이 아니라서, 이것도 정리 목록에 올렸다.

> 이렇게 "당장은 되지만 빚으로 남긴 것"을 글에 적어두면, 나중에 그 빚을 갚는 편이 또 소재가 된다.

## 결과

- 캐릭터 상세/목록/캘린더/티어표가 **게임마다 파일을 복제하지 않고** 라우트 한 벌로 동작.
- 새 게임 추가 = `+page.ts` switch에 case 추가 + Init 파일 1개. 화면 코드는 손대지 않는다.
- 게임별 화면 차이는 `{#if}` 분기가 아니라 **설정의 `layout` 배열**로 표현 → if 지옥 방지.

## 다음 편 예고

데이터(2편)와 라우팅·렌더(3편)가 섰으니, 다음은 **사용자 기능**이다.
가챠 일정을 한눈에 보는 캘린더 뷰 — 그리고 픽업을 "날씨 경보"로 보여준 장난 같은 진지한 기능.

**코드**: (GitHub 저장소 링크 — 발행 시 첨부)
