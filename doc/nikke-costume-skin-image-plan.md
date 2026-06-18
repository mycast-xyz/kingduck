# 기획안 — 니케 코스튬을 스킨 이미지로 표시 (명조 CostumeView 재사용)

> 작성일: 2026-06-19
> 요청: 니케 코스튬을 명조 스킨처럼 빼서 **스킨 이미지로** 보여주자.

---

## 0. 현황
- 니케 코스튬 metadata는 **텍스트만**: `costumes: [{ name, grade, description }]` (이미지 없음).
  - 과거 "전신 샷 불필요" / L2D 용량 이슈로 이미지를 안 받았음.
- 명조(WuWa)는 **`CostumeView`** 컴포넌트(`src/app/view/info/CostumeView.svelte`)로 스킨을 **이미지 그리드(3:4)** 로 표시:
  - 기대 데이터: `[{ name, image, desc }]` (image = 경로, `{currentUrl}/{image}`로 렌더).
  - WutheringWavesInit layout: `{ component: 'CostumeView', dataKey: 'Skins', props: { title: '코스튬' } }`.
- → **CostumeView 그대로 재사용** 가능. 니케 코스튬에 **이미지만 채우면** 됨.

## 1. 해야 할 일 (핵심 = 코스튬 이미지 크롤)
1. **블라블라링크에서 코스튬 이미지 URL 수집**:
   - `BlablalinkDetailScraper`가 코스튬 name/grade/description은 이미 캡처 중. 같은 상세 JSON/렌더에서 **코스튬별 이미지(아트/썸네일) URL**도 캡처.
   - 스파이크: 코스튬 데이터에 이미지 필드가 있는지(있으면 `sg-tools-cdn` webp). 없으면 코스튬 탭 렌더 시 이미지 src 수집.
2. **이미지 다운로드**: `ImageDownloader.downloadAndSave(url, 'nikke', 'costume', fileName)` → static 저장(webp). 캐릭별·코스튬별 파일명.
3. **metadata 포맷 정리**: 코스튬을 `{ name, image, desc }` 형태로(현재 `description` → `desc`, `image` 추가). grade는 desc에 합치거나 별도 유지.
4. **NikkeInit layout에 CostumeView 추가**: `{ component: 'CostumeView', dataKey: 'costumes', props: { title: '코스튬' } }`.
   - 동시에 **NikkeProfileView의 임시 텍스트 코스튬 섹션 제거**(이미지 뷰로 일원화, 중복 방지).
5. **이미지 없는 코스튬**: CostumeView가 이미 "No Image" 폴백 처리 → 그대로 OK.

## 2. 주의/리스크
- **용량**: 코스튬 이미지가 많으면 용량 증가. 전신 L2D가 아니라 **카드/썸네일(3:4)** 수준 1장씩만 → 부담 적음. 풀아트가 무거우면 썸네일 우선.
- `static/image/nikke/costume/**`는 gitignore → **서버 크롤이 생성**(다른 이미지와 동일).
- 블라블라 구조 변경 취약 → 방어적. 이미지 못 받은 코스튬은 텍스트만(폴백).
- **전부 크롤러 코드**(서버 재현). `BlablalinkDetailScraper` 확장 + 재크롤로 적재.
- currentUrl 프리픽스: CostumeView가 `{currentUrl}/{image}`로 렌더하므로 image는 상대경로(`assets/image/nikke/costume/...`)로 저장.

## 3. 단계
1. 스파이크: 블라블라 상세에서 코스튬 이미지 URL 위치 확인.
2. `BlablalinkDetailScraper`에 코스튬 이미지 다운로드 + `costumes[].image` 채우기(+ desc 정리).
3. NikkeInit layout에 CostumeView 추가 + 프로필 텍스트 코스튬 제거.
4. nikke detail 재크롤 → 코스튬 보유 캐릭(예: 엠마) 상세에 스킨 이미지 그리드 노출 확인.
5. tsc/check 0, 스크린샷 검증.

---

### 요약
> 니케 코스튬은 **명조 `CostumeView`를 그대로 재사용**해 이미지 그리드로 표시 가능. 유일한 추가 작업은
> **블라블라링크에서 코스튬 이미지를 크롤**해 `costumes[].image`(상대경로)를 채우는 것.
> `BlablalinkDetailScraper` 확장 + NikkeInit layout에 CostumeView 추가(+프로필 텍스트 코스튬 제거).
> 풀 L2D가 아닌 카드 썸네일 1장씩이라 용량 부담 적음.
