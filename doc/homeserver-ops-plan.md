# 기획안 — 홈서버(172.30.1.20) SSH 원격 관리 시스템

> 작성일: 2026-06-20
> 요청: 홈서버(172.30.1.20)에 SSH로 접속해 배포·운영을 관리하는 시스템 기획.
> 근거: `kingduck-server/deploy/`(docker-compose.prod.yml·Caddyfile·backup-db.sh·crontab.example·README), `docs/home-server-plan.md`.

---

## 0. 한눈에

홈서버는 **Docker Compose 스택**(`db`+`app`+`caddy`) + **cloudflared 터널**로 운영된다. 지금은 SSH로 들어가 `docker compose ...`를 손으로 친다. 이걸 **정의된 운영 작업(배포·재시작·백업·마이그레이션·크롤·로그)** 으로 추상화해 **안전하게 원격 실행**하는 컨트롤 플레인을 만든다.

**핵심 결정 = "누가 명령을 실행하나"와 "어떻게 임의 셸을 막나".** 웹(어드민)에서 곧장 임의 SSH 셸을 여는 건 금물 — **명령 화이트리스트 + 전용 deploy 유저 + 감사로그**가 설계의 중심.

권고: **홈서버에 작은 `ops-agent`(토큰 인증 HTTP, 화이트리스트 명령만)** 를 두고 어드민이 호출(옵션 C). SSH는 사람이 쓰는 백업 채널로 남긴다.

---

## 1. 현 토폴로지 (실측)

| 구성 | 내용 |
|---|---|
| 호스트 | 홈서버 `172.30.1.20`, 경로 `/home/kingduck/{kingduck,kingduck-server}` |
| 오케스트레이션 | `docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.production` |
| `db` | postgres:14, `pgdata` 볼륨 |
| `app` | 백엔드(빌드 이미지), `../static/image` 마운트(크롤 이미지 영속) |
| `caddy` | 리버스 프록시(`:80`) + **`../../kingduck/build` 를 `/srv/web`로 정적 서빙**(프론트) |
| 공개 | cloudflared 터널 → `http://localhost:80`(Caddy) → www.kingduck.xyz (공인IP 불필요) |
| 크롤/백업 | cron: `docker compose run --rm app pnpm run crawl --game X --type Y`, `deploy/backup-db.sh`(일일 pg_dump, 7일 보존) |

→ **프론트 배포 = `kingduck/build` 갱신**(caddy 볼륨이라 파일만 바꾸면 반영). **백엔드 배포 = app 이미지 재빌드+up**. **DB = compose의 db 컨테이너**.

---

## 2. 관리할 작업 (Operations)

| 분류 | 작업 | 현재(수동) | 위험도 |
|---|---|---|---|
| 상태 | 서비스 상태(`ps`)·health·디스크/메모리 | `docker compose ps`, `/health` | 낮음(읽기) |
| 로그 | app/caddy/크롤 로그 조회·스트림 | `docker compose logs -f` | 낮음 |
| 프론트 배포 | 빌드 산출물 게시 | `kingduck/build` rsync/갱신 | 중 |
| 백엔드 배포 | git pull→이미지 빌드→롤링 up | `compose build app && up -d` | 중~높음 |
| DB 마이그레이션 | prisma migrate deploy(+사전 백업) | `compose exec app npx prisma migrate deploy` | **높음** |
| 백업 | 즉시 백업·다운로드·복원 | `deploy/backup-db.sh` | 중(복원은 높음) |
| 크롤러 | 특정 게임/타입 즉시 크롤 | `compose run --rm app pnpm run crawl ...` | 중 |
| 서비스 제어 | restart app/caddy, caddy reload | `compose up -d --build caddy` | 중 |
| SEO | sitemap ping(구글/네이버) | (수동) | 낮음 |

> 어드민 패널엔 이미 **크롤러 상태·로그·실행/중지·data-gaps**가 있다(로컬 app 기준). 이 시스템은 그걸 **홈서버 컨테이너 기준**으로 확장 + 배포/DB/백업까지 포함.

---

## 3. 아키텍처 — 어디서 명령을 실행하나

| 옵션 | 방식 | 장점 | 단점/위험 |
|---|---|---|---|
| **A. 웹→백엔드 SSH exec** | 어드민 버튼 → kingduck-server 엔드포인트가 `ssh deploy@172.30.1.20 <cmd>` 실행 | 추가 컴포넌트 없음 | **웹 프로세스가 SSH 키 보유 + 셸 실행** = 키 유출 시 서버 장악. 비권장 |
| **B. 별도 ops CLI/러너** | 개발 PC(또는 컨트롤러)의 CLI/스크립트가 SSH로 작업 | 어드민과 분리, 웹에 키 없음 | UI 없음(터미널), 사람이 돌려야 함 |
| **C. 홈서버 `ops-agent` (권고)** | 홈서버에 작은 데몬(HTTP+토큰). 어드민이 호출 → 에이전트가 **로컬에서** 화이트리스트 docker 명령 실행 | SSH 키를 웹에 안 둠, 명령 화이트리스트 강제, 로컬 실행이라 빠름, 어드민 UI 연동 | 에이전트 1개 추가 구현·보호 필요 |

**권고: C(ops-agent) + B(SSH는 사람용 백업).**
- `ops-agent`는 홈서버에서 `deploy` 유저로 실행, **사전 정의된 작업만** 노출(임의 셸 없음).
- 어드민(kingduck-server)은 에이전트에 **서명된 작업 요청**만 보냄(서버↔에이전트 mTLS 또는 공유 토큰 + HMAC).
- 외부 노출 없이 **터널/LAN 내부**에서만 에이전트 접근(172.30.1.20 LAN, 또는 cloudflared 별도 라우트 + Access 정책).

---

## 4. 보안 설계 (핵심)

1. **임의 셸 금지 — 작업 화이트리스트.** `deploy_front`, `deploy_back`, `migrate`, `backup`, `restore`, `crawl`, `restart`, `logs`, `status`, `ping_sitemap` 등 **열거된 작업만**. 파라미터도 검증(게임 slug는 enum, 경로 주입 차단).
2. **인증/인가.**
   - SSH: 키 인증만(비밀번호 금지), 전용 `deploy` 유저, `sudoers`/`docker` 그룹 **최소권한**, 필요시 `command=`로 강제 명령.
   - ops-agent: ADMIN 토큰 + 요청 서명(HMAC/짧은 만료). 어드민 가드(ADMIN role)와 연동.
3. **파괴적 작업 2차 확인 + 게이트.** `migrate`/`restore`/`deploy_back`은 **확인 문구 + 사전 자동 백업** 필수. `restore`는 ADMIN 전용 + 별도 승인.
4. **감사 로그.** 모든 작업: 누가·언제·무슨 작업·파라미터·결과·로그링크. (기존 `UserActivityLog` 재사용 — `OPS_DEPLOY_FRONT` 등.)
5. **동시성 락.** 배포/마이그레이션 중복 실행 방지(작업별 락, 진행 중이면 거절).
6. **시크릿 관리.** SSH 키/에이전트 토큰은 **repo 밖**(서버 `.env`/시크릿 매니저). 절대 커밋 금지(현재 `.env.production`은 example만 커밋됨 — 유지).
7. **드라이런/롤백.** 배포는 이전 build/이미지 보존 → 실패 시 즉시 롤백. 마이그레이션은 백업 스냅샷으로 복원 경로.
8. **레이트리밋 + 타임아웃.** 장시간 작업(크롤/빌드)은 비동기 + 진행 스트림, 타임아웃·취소 지원.

---

## 5. 작업별 구현 (명령 매핑)

| 작업 | 에이전트가 홈서버에서 실행 | 안전장치 |
|---|---|---|
| status | `docker compose -f deploy/... ps` + `curl localhost:80/api/v0/health` | 읽기 |
| logs(stream) | `docker compose ... logs --tail=N -f <svc>` | 읽기, SSE로 어드민에 스트림 |
| deploy_front | (CI/PC에서 빌드된) `kingduck/build` rsync 수신 → caddy 볼륨 갱신(무중단) | 이전 build 백업→롤백 |
| deploy_back | `git -C kingduck-server pull` → `compose build app` → `up -d app` | 헬스체크 통과 후 트래픽, 실패 롤백 |
| migrate | **사전 backup** → `compose exec -T app npx prisma migrate deploy` | `deploy`만(절대 `migrate dev`/reset 금지), 백업+확인 게이트 |
| backup | `deploy/backup-db.sh` → 산출물 목록/다운로드 | 보존정책 |
| restore | `compose exec -T db pg_restore ... --clean --if-exists < dump` | ADMIN+2차확인+현재상태 백업 선행 |
| crawl | `compose run --rm app pnpm run crawl --game <slug> --type <t>` | slug/type enum 검증, 동시 1개 |
| restart | `compose up -d --build <svc>`(caddy/app) | 락 |
| ping_sitemap | google/naver sitemap submit URL 호출 | 읽기성, 저위험 |

> **프론트 배포 주의(README 근거)**: 반드시 `PUBLIC_API_BASE_URL=https://www.kingduck.xyz`로 빌드해야 이미지/아이콘 안 깨짐. 빌드는 CI 또는 개발 PC에서 하고 **산출물만** 서버로(서버에서 빌드하면 무겁고 Chromium 등 불필요). 크롤러 일부는 Chromium 의존(니케 제외).

---

## 6. UI — 어드민 "운영(Ops)" 패널

- 신규 어드민 라우트 `/admin/ops`(사이드바 "운영").
- **상태 카드**: 컨테이너 ps(Up/Down), `/health`, 디스크/메모리, 마지막 백업·크롤 시각.
- **작업 버튼**: 프론트 배포 / 백엔드 배포 / 마이그레이션 / 즉시 백업 / 크롤(게임·타입 선택) / 재시작 / sitemap ping. 각 버튼 → 확인 모달(파괴적이면 문구 입력).
- **실시간 로그 스트림**(SSE/WebSocket) + 작업 이력(감사로그 연동, 성공/실패·소요시간).
- 진행 중 작업은 락 표시(중복 차단).

---

## 7. 단계적 로드맵

- **Phase 0 — 읽기 전용(안전).** ops-agent 골격 + status/logs/health. 위험 0. 운영 가시성부터 확보.
- **Phase 1 — 저위험 트리거.** 즉시 백업 · sitemap ping · 크롤(게임 선택) · 서비스 재시작. (모두 가역적/안전)
- **Phase 2 — 배포.** 프론트 배포(산출물 게시+롤백) → 백엔드 배포(빌드+롤링+헬스체크).
- **Phase 3 — DB.** migrate deploy(사전 백업+확인 게이트), restore(ADMIN+승인). 가장 신중.
- **Phase 4 — 고도화.** 스케줄(cron을 UI로), 알림(실패 시 슬랙/디스코드), Uptime 모니터 연동, 드라이런/롤백 자동화.

---

## 8. 리스크 / 주의

- **웹에서 인프라 제어 = 공격면 확대.** ops-agent/SSH 키가 곧 서버 장악 키 → 화이트리스트·최소권한·감사·네트워크 격리가 필수(외부 비노출).
- **명령 인젝션**: 모든 파라미터 enum/정규식 검증, 셸 보간 금지(인자 배열로 exec).
- **부분 실패**: 배포·마이그레이션 중단 시 일관성 깨짐 → 락 + 백업 + 롤백 경로 선설계.
- **SSH 단독(옵션 A) 비권장**: 웹 프로세스에 SSH 키를 두는 구조는 최후수단.
- **프론트 빌드 도메인**: 로컬 URL로 빌드 시 배포 이미지 깨짐(README 트러블슈팅) — 배포 작업에 도메인 빌드 강제.
- **토폴로지(확정)**: 작업 머신은 **개발 PC**(127.0.0.1, watch 백엔드 :3100, 로컬 DB :5432). **172.30.1.20 = 별도 홈서버 = 프로덕션 Docker 스택**(`deploy/` 기준). 즉 개발 PC의 커밋은 **홈서버에 배포(git pull→compose build→migrate deploy→build 게시)해야** 라이브가 된다. 이 기획은 그 홈서버를 대상으로 한다. (api.kingduck.xyz가 dev를 반영했다면 현재 터널이 개발 PC를 향한 임시 상태일 수 있음 — 홈서버 전환 자체가 별도 과제.)

---

### 요약
> 홈서버는 Docker Compose + cloudflared. 관리 시스템은 **ops-agent(홈서버, 화이트리스트 명령) + 어드민 Ops 패널**로, status/logs(Phase0) → 백업·크롤·재시작·sitemap ping(Phase1) → 프론트/백엔드 배포(Phase2) → 마이그레이션/복원(Phase3) 순으로. 보안 핵심은 **임의 셸 금지·최소권한·감사·네트워크 격리·파괴적 작업 게이트**. 웹 백엔드가 직접 SSH 셸을 여는 구조는 지양.
