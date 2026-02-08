# 시스템 모니터링 및 부하 관리 기능 명세

본 문서는 어드민 페이지 내 '시스템 모니터링' 섹션에 대한 기능 명세와 이를 구현하기 위한 백엔드 요구사항을 정의합니다.

## 1. 개요

관리자가 서버의 실시간 상태(CPU, 메모리, 디스크, 네트워크)와 애플리케이션의 부하 정도를 한눈에 파악하여 안정적인 서비스 운영을 돕는 것을 목적으로 합니다.

## 2. 프론트엔드 (UI/UX) 구현 계획

### 2.1 대시보드 레이아웃

- **위치**: 어드민 사이드바 > '시스템 상태' 혹은 '모니터링' 메뉴
- **구성**:
  - **상단 요약 카드**: 현재 핵심 지표 (CPU 부하율, 메모리 사용량, 가동 시간, 활성 프로세스 수)
  - **메인 차트**: 시계열 데이터 그래프 (최근 1시간/24시간 추이)
  - **상세 정보 패널**: 서버 기본 정보 (OS, Node 버전, IP 주소 등)

### 2.2 주요 컴포넌트

#### A. 리소스 사용량 카드 (Real-time Metric Cards)

각 카드는 원형 차트(Gauge) 또는 진행 바(Progress Bar)와 함께 현재 수치를 표시합니다.

- **CPU**: 전체 코어 평균 사용률 (%).
- **Memory**: 사용 중인 메모리 / 전체 메모리 (GB).
- **Disk**: 사용 중인 용량 / 전체 용량 (GB, %).
- **Network**: 실시간 입/출력 트래픽 (KB/s or MB/s).

#### B. 시스템 부하 그래프 (Load History Chart)

- `Chart.js` 또는 `ApexCharts`를 사용하여 시계열 라인 차트 구현.
- 5초~1분 간격으로 데이터 갱신 (WebSocket 또는 Polling).
- CPU 및 메모리 사용량 추이를 시각화하여 특정 시점의 스파이크(Spike) 확인 가능.

#### C. 프로세스 및 환경 정보 (Runtime Info)

- **Environment**: OS 정보(Platform, Distro), 커널 버전, 호스트네임.
- **Node.js**: Node 버전, 현재 힙 메모리 사용량, 가동 시간(Uptime).
- **PM2 상태** (선택 사항): PM2로 관리 중인 경우 각 인스턴스별 상태(Online/Error) 및 재시작 횟수.

---

## 3. 백엔드 (API) 요구사항

프론트엔드에서 위 정보를 표시하기 위해 백엔드에 다음과 같은 API 및 환경 구성이 필요합니다.

### 3.1 권한 및 보안

- **자격 증명 확인**: 모든 시스템 모니터링 API는 **Super Admin** 권한을 가진 사용자만 접근 가능해야 합니다.
- **Rate Limiting**: 과도한 폴링으로 인한 부하를 방지하기 위한 제한 설정 권장.

### 3.2 필요 라이브러리 (권장)

Node.js 환경에서 시스템 정보를 효율적으로 가져오기 위해 [**systeminformation**](https://www.npmjs.com/package/systeminformation) 라이브러리 사용을 강력히 권장합니다.

```bash
npm install systeminformation
```

### 3.3 API 명세 (제안)

#### 1. `GET /api/admin/system/summary` (요약 정보)

- **목적**: 대시보드 진입 시 표시할 기본 정보 조회
- **응답 데이터 구조 (예시)**:

```json
{
	"os": {
		"platform": "linux",
		"distro": "Ubuntu",
		"release": "22.04 LTS",
		"hostname": "kingduck-server"
	},
	"cpu": {
		"manufacturer": "Intel",
		"brand": "Xeon",
		"cores": 4,
		"speed": "2.40"
	},
	"memory": {
		"total": 17179869184, // Bytes
		"free": 8589934592,
		"swaptotal": 2147483648,
		"swapfree": 1073741824
	},
	"node": {
		"version": "v18.16.0",
		"uptime": 123456 // Seconds
	}
}
```

#### 2. `GET /api/admin/system/stats` (실시간 리소스)

- **목적**: 실시간 차트 및 상태 업데이트를 위한 동적 데이터
- **호출 주기**: 5초 ~ 10초 권장
- **응답 데이터 구조 (예시)**:

```json
{
	"timestamp": 1678886400000,
	"cpuLoad": {
		"currentLoad": 45.2, // %
		"currentLoadUser": 30.1,
		"currentLoadSystem": 15.1
	},
	"memory": {
		"active": 4096000000, // Bytes
		"usePercentage": 23.8
	},
	"network": {
		"iface": "eth0",
		"rx_sec": 512000, // Bytes/sec (Receive)
		"tx_sec": 102400 // Bytes/sec (Transmit)
	},
	"process": {
		"heapUsed": 50000000, // Node process heap
		"rss": 120000000
	}
}
```

### 3.4 WebSocket 고려 (고급 옵션)

실시간성을 극대화하고 폴링 오버헤드를 줄이려면 `Socket.io`를 통해 백엔드에서 프론트엔드로 주기적(예: 1초 간격)으로 `system:stats` 이벤트를 emit하는 방식을 고려할 수 있습니다.

---

## 4. 구현 단계

1.  **백엔드**: `systeminformation` 라이브러리 설치 및 서비스 레이어 구현 (`SystemStatsService`).
2.  **백엔드**: `/api/admin/system/*` 엔드포인트 생성 및 권한 가드 적용.
3.  **프론트엔드**: 어드민 사이드바 메뉴 추가 (`System Status`).

## 5. 프론트엔드와 백엔드가 분리된 경우 (서버 분리 환경)

프론트엔드(어드민 UI)와 백엔드(API 서버)가 물리적으로 다른 서버나 도메인에서 운영될 경우 다음 사항을 고려해야 합니다.

### 5.1 통신 아키텍처

기본적으로 **브라우저(클라이언트)**가 백엔드 API 서버로 직접 요청을 보내 데이터를 받아오는 구조입니다.

- **Flow**: `Admin UI (Browser)` -> `HTTPS Request` -> `Backend API Server` -> `Response (System Info)`

### 5.2 필수 설정 (백엔드)

1.  **CORS (Cross-Origin Resource Sharing) 허용**:
    - 프론트엔드 도메인(예: `admin.kingduck.com`)에서의 API 호출을 허용해야 합니다.
2.  **보안 인증 (JWT/API Key)**:
    - 서버 간 통신이 아니라 브라우저에서의 요청이므로, 로그인 등을 통해 발급된 **Admin Token**을 헤더에 포함해야 합니다.

### 5.3 다중 서버 (Load Balancing) 환경 이슈

백엔드 서버가 여러 대(Instance A, B)로 구성된 경우, API 호출 시 로드 밸런서가 연결해주는 **특정 서버 1대**의 정보만 조회되는 한계가 있습니다.

**해결 방안:**

- **Level 1 (단순 식별)**: 응답 데이터에 `hostname` 또는 `server_id`를 포함하여 현재 조회된 정보가 어떤 서버의 것인지 UI에 표시.
- **Level 2 (데이터 취합)**: Redis 등을 활용하여 모든 서버가 자신의 상태를 중앙 저장소에 주기적으로 기록하고, API는 이를 취합하여 목록 형태(Server A, Server B...)로 반환.
- **Level 3 (전문 도구 연동)**: Prometheus + Grafana 같은 전문 모니터링 툴을 도입하고, 어드민 페이지에서는 해당 대시보드 URL로 연결하거나 `iframe`으로 임베딩.

4.  **프론트엔드**: 대시보드 UI 컴포넌트 개발 (`SystemResourceCard`, `LoadChart`).
5.  **프론트엔드**: API 연동 및 데이터 시각화 (Polling or WebSocket).
