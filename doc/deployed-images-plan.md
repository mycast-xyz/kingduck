# 기획안 — 배포 사이트 이미지 누락 (캐릭터 아이콘 크롤 안 됨)

> 작성일: 2026-06-18
> 증상: https://www.kingduck.xyz/list/genshin — 6명만 이미지가 뜨고 나머지는 깨짐.

---

## 0. 진단 결과 (실측, 2026-06-18)

공개 사이트가 쓰는 API/이미지 호스트는 **`https://api.kingduck.xyz`** (서브도메인 터널 → 백엔드 :3100, express.static `/assets`).
로컬 DB의 genshin imageUrl(129개)을 이 호스트에 대조:

| 게임 | 백엔드(api.kingduck.xyz)에 있는 이미지 |
|---|---|
| starrail | **20/20** (완전) |
| genshin | **6/129** (앞 6명만: 아야카·진·리사·바바라·케이아·다이루크) |
| wutheringwaves | 4/20 |
| nikke | **0/20** |
| zzz | **0/20** |
| reverse1999 | **0/20** |
| endfield | **0/20** |

- 깨진 이미지 응답 = **404 (application/json)** → 백엔드 `/assets` 프록시는 **정상 동작**하고, **파일 자체가 없다.**
- DB에는 imageUrl이 다 차 있다(genshin 129/129). 그래서 리스트엔 129명이 뜨지만 파일이 없어 123명이 깨진다.
- **참고:** LAN의 `172.30.1.20:8080`(Caddy)에는 genshin 129개가 **전부 200**으로 존재 → 백엔드(:3100)의 static/ 과
  Caddy(:8080)의 static/ 이 **서로 다른 사본**이다.

## 1. 근본 원인

> **이미지 파일은 크롤러를 돌린 머신의 로컬 `static/`에 저장되고, `static/`은 `.gitignore`(server 98행) 대상이라
> git/배포로 따라가지 않는다.**

- starrail(+genshin 앞 6, wuwa 앞 4)은 **서버에서 크롤**돼 백엔드 static/에 있음.
- genshin 나머지·**nikke·zzz·reverse1999·endfield는 내가 로컬에서 크롤** → 이미지가 **내 로컬 static/에만** 있고 백엔드엔 없음.
- 즉 "크롤이 안 된 것"이 아니라 **크롤한 이미지가 배포 백엔드로 전달되지 않은 것.** (로컬엔 342MB·8985파일 다 있음)

## 2. 해결 방안 (3안)

### A. 즉시 — 로컬 static/ 을 백엔드로 동기화 (rsync/scp) ⟵ 지금 바로 가능
- 로컬 `kingduck-server/static/image/*` 를 백엔드의 static 볼륨으로 복사.
  ```bash
  # 예: 로컬 → 홈서버(백엔드 컨테이너가 마운트한 static 디렉터리)
  rsync -avz --progress kingduck-server/static/image/ user@172.30.1.20:/path/to/backend/static/image/
  # 도커면 호스트 디렉터리에 넣고 컨테이너가 그 볼륨을 마운트하도록
  ```
- 장점: 이미 받아둔 8985개 즉시 라이브. 단점: 갱신마다 수동 반복, 머신 종속 유지.

### B. 지속책(권장 장기) — 오브젝트 스토리지(Cloudflare R2/S3)로 이전
- `ImageDownloader`가 webp를 **R2/S3에 업로드**하고 `imageUrl`을 **절대 URL**(`https://img.kingduck.xyz/...`)로 저장.
- 그러면 로컬·서버·어느 머신에서 크롤해도 **같은 URL을 참조** → static/ 동기화 문제 자체가 사라짐.
- Cloudflare 이미 사용 중이라 **R2 + 커스텀 도메인**이 자연스럽다. (마이그레이션: 기존 static → R2 일괄 업로드 + DB imageUrl 일괄 치환)
- 장점: 머신 비종속, 배포·확장 단순, CDN 캐싱. 단점: 초기 셋업 + imageUrl 스킴 변경.

### C. 서버에서 크롤 + 단일 static 볼륨
- 모든 크롤을 **서버에서** 실행(스케줄러)하고, 크롤러와 서빙 백엔드가 **같은 static 볼륨**을 공유.
- 서버 크롤이 왜 genshin 6개에서 멈췄는지 원인(타임아웃/레이트리밋/에러) 조사 필요.
- 장점: 서버가 데이터 소유권 가짐. 단점: 서버 자원/네트워크로 전 게임 재크롤, 크롤러 안정화 필요.

## 3. 채택: C — 서버에서 크롤 (오브젝트 스토리지 이전 안 함)

> 결정(2026-06-18): **C안 채택.** B(R2 이전)는 하지 않는다. 서버가 직접 크롤해 자기 static/에 이미지를 쌓는다.

### 좋은 소식 — 새 코드 없이 실행 가능 (이미 갖춰짐)
- 백엔드: **`POST /api/v0/admin/crawler/run`**(`CrawlerController.runCrawler`)가 스크래퍼 실행 +
  `DataSyncService` → `ImageDownloader`로 이미지를 **백엔드 자신의 `static/`** 에 저장한다.
- 어드민: `/admin/crawler` 화면에 게임·타입별 **"실행" 버튼**이 이미 있다(→ `/admin/crawler/run` 호출).
- 백엔드가 서빙하는 static/ 과 크롤러가 쓰는 static/ 이 **같은 디렉터리**(단일 프로세스/컨테이너)이므로,
  **서버에서 크롤 = 즉시 서빙**된다. (starrail이 이미 그렇게 채워져 있는 증거)

### 실행 절차
1. **백엔드 먼저 배포 갱신**: 어드민 인증 수정(`d66dc5b`: login userId, 세션) 등 미반영분 `git pull` + 재빌드.
   (안 그러면 배포 어드민 로그인/크롤 트리거가 401날 수 있음.)
2. 배포 어드민 `/admin/crawler` 접속 → **이미지 빠진 게임의 character 크롤러 "실행"**:
   genshin · nikke · zzz · reverse1999 · endfield (+ wutheringwaves 보충).
3. 진행/실패는 **크롤러 로그 상세 모달**(이번에 추가)로 모니터 — 특히 **genshin이 왜 6개에서 멈췄는지**
   에러/중단 원인 확인(레이트리밋·타임아웃·소스 차단 등).
4. 안정화되면 **스케줄러로 정기 실행** 등록(신규/갱신분이 서버 static에 계속 쌓이게).

### genshin 6개 중단 — 조사 포인트
- 서버에서 genshin character 크롤이 6개 처리 후 멈춘 흔적 → 로그 상세에서 errorMsg/metadata 확인.
- 후보: Ambr(yatta.moe) 레이트리밋/일시차단, 네트워크 타임아웃, 중간 예외로 조기 종료, 또는
  **과거에 6개까지만 돌린 부분 실행**이 남은 것. 재실행 시 끝까지 도는지 확인.

> 보조(A): 급하면 1회에 한해 로컬 `static/image` → 서버 static 볼륨 rsync로 메꿀 수 있으나(이미 8985개 보유),
> 본 방침은 **서버 크롤이 원본**이 되는 것(C). rsync는 임시 수단으로만.

## 4. 검증 체크리스트

- [ ] 백엔드 static 볼륨 경로 확인(도커 마운트/호스트 경로).
- [ ] rsync 후 `https://api.kingduck.xyz/assets/image/genshin/character/icon_*.webp` 가 image/webp 200 인지 표본 확인.
- [ ] 전 게임 표본 재대조(genshin/nikke/zzz/r1999/endfield 0→정상).
- [ ] 프론트 `/list/genshin` 에서 깨짐 사라졌는지 육안 확인.

## 5. 주의점

- `static/` 은 gitignore라 **앞으로도 git으로는 절대 안 따라간다** — A/C는 별도 동기화 절차가 항상 필요. 그래서 B(R2)가 근본책.
- 백엔드와 Caddy(:8080)의 static/ 이 갈라져 있음 → **서빙 주체(api.kingduck.xyz=백엔드)** 기준으로 채워야 함.
- rsync 용량 342MB(8985파일) — 1회는 가볍지만, 매 크롤 후 반복은 비효율 → 결국 B 권장.
- 이미지 외 영상(static/video)도 동일 구조라 같은 정책 적용.

---

### 요약 (C안 채택)
> 이미지가 "크롤 안 된" 게 아니라, **로컬에서 크롤한 파일이 배포 백엔드(api.kingduck.xyz)의 static/ 에 없다**
> (static/은 gitignore·머신로컬). 측정: starrail 완전, genshin 6/129, nikke/zzz/r1999/endfield 0.
> **해결 = C: 서버에서 크롤.** 새 코드 불필요 — 백엔드 배포 갱신 후 `/admin/crawler`에서 게임별 "실행"하면
> 백엔드가 직접 받아 자기 static/에 저장→즉시 서빙. genshin 6개 중단 원인은 로그 상세로 조사. R2 이전(B)은 안 함.
