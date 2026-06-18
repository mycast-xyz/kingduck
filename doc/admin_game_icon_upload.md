# 기획안 — 어드민 게임 아이콘 업로드/교체

> 작성일: 2026-06-18
> 목적: 어드민에서 게임별 아이콘 이미지를 **업로드**해 교체할 수 있게 한다.
> 배경: 홈서버(https://www.kingduck.xyz) 오픈 후 사이드바의 게임 아이콘이 깨짐.

---

## 0. 현황 (아이콘 저장·렌더 구조)

| 항목 | 값 |
|---|---|
| DB | `games.icon_url = "assets/logo/{slug}.webp"` (상대경로) |
| 실제 파일 | `kingduck-server/static/logo/{slug}.webp` |
| 서빙 | 백엔드 express `app.use('/assets', static('static'))` → `/assets/logo/{slug}.webp` |
| 프론트 렌더 | `MainMenu.svelte`: `src={data.url + '/' + game.iconUrl}` = **`{API_BASE}/assets/logo/{slug}.webp`** |
| 어드민 | `AdminGameList.svelte`가 이미 게임 목록+아이콘 표시(`data.url + '/' + game.iconUrl`) — **여기에 업로드 추가** |

## 1. ⚠️ 아이콘이 깨지는 진짜 원인 (업로드 기능과 별개 — 먼저 확인)

게임 아이콘은 **`{API_BASE}/assets/...`** 로 불린다(프론트 자체 로고 `/assets/logo/500.png`는 루트경로라 정상). 따라서:

- 확인된 사실: 배포에서 `https://www.kingduck.xyz/api/v0/game/list` 가 **JSON이 아니라 SPA HTML**을 반환 →
  **리버스 프록시가 `/api`(및 `/assets`)를 백엔드로 라우팅하지 않고 있다.** (정적 `/assets/logo/genshin.webp` 자체는 200)
- 즉 프론트의 `API_BASE`가 백엔드의 `/assets`에 닿지 못해 아이콘이 깨진다.
- **→ 업로드 기능을 만들어도 이 프록시/베이스가 안 고쳐지면 새 아이콘도 똑같이 깨진다.**

**선행 조치(택1):**
1. 리버스 프록시에서 `/api/*`·`/assets/*` 를 백엔드로 프록시 (내가 만든 `kingduck-server/deploy/Caddyfile`이 이미 그렇게 돼 있음 — 실제 배포 설정이 이걸 안 쓰는 듯).
2. 프론트 빌드의 `PUBLIC_API_BASE_URL`을 `/assets`가 닿는 주소로(같은 도메인 경로 방식 권장, `https://www.kingduck.xyz`).

> 업로드 기능은 "아이콘 교체 UI"를 제공하지만, **표시가 되려면 위 프록시/베이스가 정상이어야 한다.** 둘은 분리된 문제다.

## 2. 기능 범위 (업로드)

- 어드민 **게임 관리** 화면(기존 `AdminGameList` 확장)에서 게임별로:
  - 현재 아이콘 미리보기
  - **이미지 업로드**(파일 선택/드래그앤드롭) → 서버 저장 → `icon_url` 갱신 → 즉시 반영
- 권한: 기존 어드민 가드(ADMIN/MANAGER) + **백엔드 인증 필수**(진짜 가드는 서버).

## 3. 백엔드 (`kingduck-server`)

**업로드 엔드포인트 (신규):**
```
POST /api/v0/admin/game/:slug/icon   (multipart/form-data, field: file)
```
- **multer**(이미 설치됨)로 메모리 수신 → **sharp**로 webp 변환(ImageDownloader가 이미 sharp 사용) →
  `static/logo/{slug}.webp` 덮어쓰기.
- `games.icon_url` 갱신. **캐시 무효화**를 위해 `assets/logo/{slug}.webp?v={timestamp}` 처럼 버전 쿼리 부여(아래 4).
- 검증: `mimetype.startsWith('image/')`, 용량 제한(예: 2MB), 변환 실패 시 4xx.
- 관리자 인증 미들웨어(기존 admin 라우터에 붙은 가드) 적용.
- 라우트는 `src/routes/admin/router.ts`에 추가, 컨트롤러는 `AdminController`(또는 신규 `GameAdminController`).

**참고**: 게임 일반 수정(이름 등)도 필요하면 `PUT /api/v0/admin/game/:slug` 를 같이 둘 수 있으나, 1차는 아이콘만.

## 4. 캐시 버스팅 (중요)

같은 파일명(`{slug}.webp`)에 덮어쓰면 브라우저/프록시 캐시 때문에 즉시 안 바뀐다. 택1:
- `icon_url`에 버전 쿼리: `assets/logo/{slug}.webp?v=1718...` (업로드 시각). 프론트 `src`에 그대로 반영.
- 또는 파일명에 해시: `{slug}.{hash}.webp` (이전 파일 정리 필요).
→ **버전 쿼리가 가장 단순**(파일명 고정 유지).

## 5. 프론트 (`kingduck`)

- `AdminGameList.svelte` 확장(또는 `routes/admin/game/+page.svelte` 신설):
  - 각 게임 행에 "아이콘 변경" 버튼 + `<input type="file" accept="image/*">`(숨김) / 드래그앤드롭 영역.
  - 선택 시 `FormData`로 `POST /api/v0/admin/game/:slug/icon` → 성공 토스트(`toastStore.success`) → 목록의 `iconUrl` 갱신(버전 쿼리 포함)으로 즉시 미리보기.
- 어드민 사이드 메뉴(`AdminSiedMenuService` / 어드민 레이아웃)에 "게임 관리" 진입점(이미 게임 list가 있으면 거기에 통합).
- 업로드 중 로딩/실패 처리, 미리보기 즉시 교체.

## 6. 작업 분해

**백엔드**
1. `router.ts`: `POST /admin/game/:slug/icon` (multer single('file')).
2. 컨트롤러: 검증 → sharp webp 변환 → `static/logo/{slug}.webp` 저장 → `prisma.game.update({ icon_url })`(버전 쿼리 포함).
3. 인증 가드 확인.

**프론트**
4. `AdminGameList`에 업로드 UI + 업로드 서비스 호출(FormData, 인증 헤더는 client.ts 인터셉터가 첨부).
5. 업로드 후 목록 갱신 + 토스트.

**검증**
6. 로컬에서 업로드 → `static/logo/{slug}.webp` 교체 확인 → 사이드바 아이콘 즉시 반영(캐시버스팅).
7. 배포: **프록시/베이스 선행 조치 후** 동일 확인.

## 7. 주의점

- **권한**: 업로드는 관리자만. 백엔드에서 role 검증(프론트 가드는 UX용).
- **파일 검증**: 이미지 MIME/용량 제한, sharp 변환으로 악성/비정상 파일 차단.
- **경로 일관성**: 저장은 `static/logo/`, DB는 `assets/logo/...`(서빙 매핑과 일치). 신규 게임도 동일 규칙.
- **선행 의존**: §1의 프록시/베이스가 정상이어야 업로드한 아이콘이 실제로 보인다.

---

### 요약

> 어드민 `AdminGameList`에 게임별 **아이콘 업로드** 추가 → 백엔드 `POST /admin/game/:slug/icon`(multer+sharp→webp,
> `static/logo/{slug}.webp` 교체, `icon_url`에 버전 쿼리) → 프론트 즉시 반영. **단, 배포에서 `/api`·`/assets`가
> 백엔드로 프록시되도록(또는 프론트 base 정상화) 하는 게 아이콘 표시의 선행 조건**이다.
