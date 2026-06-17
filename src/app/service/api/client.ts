import axios from 'axios';
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { browser } from '$app/environment';
import { authTokenService } from '../auth/AuthTokenService';
import { toastStore } from '../ToastService';

export const getApiBaseUrl = (): string => {
	if (PUBLIC_API_BASE_URL) {
		return PUBLIC_API_BASE_URL;
	}
	if (typeof window !== 'undefined') {
		return `${window.location.protocol}//${window.location.hostname}:3000`;
	}
	return 'http://localhost:3000';
};

const client = axios.create({
	baseURL: getApiBaseUrl(),
	headers: {
		'Content-Type': 'application/json'
	}
});

// Request interceptor for API calls
client.interceptors.request.use(
	(config) => {
		const token = authTokenService.getToken();
		if (token) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor for error handling.
// NOTE: Refresh-token exchange (getRefreshToken / needsRefresh / setRefreshToken) is intentionally
// deferred until the backend refresh endpoint is confirmed and coordinated with kingduck-server.
client.interceptors.response.use(
	(response) => {
		// 응답 봉투 unwrap (B-M1): 백엔드 공개 엔드포인트가 표준 봉투
		// `{ resultCode, resultMsg, data }`로 전환되면, 공개 소비처가 기존처럼 raw 페이로드를
		// 읽도록 여기서 data를 꺼낸다 → 소비처 코드 무변경 + 엔드포인트별 점진 마이그레이션 안전.
		// admin(/admin/)은 소비처가 봉투를 직접 읽으므로 unwrap하지 않는다.
		const url = response.config?.url ?? '';
		const body = response.data;
		const isEnvelope =
			body &&
			typeof body === 'object' &&
			'resultCode' in body &&
			'data' in body;
		if (isEnvelope && !url.includes('/admin/')) {
			response.data = body.data;
		}
		return response;
	},
	(error) => {
		if (error.response?.status === 401 && browser) {
			// Token is expired or invalid — clear auth state and redirect to login.
			// Guard against redirect loops: skip navigation if already on /login.
			console.error('API 401: session expired, clearing tokens');
			authTokenService.clearTokens();
			toastStore.error('세션이 만료되었습니다. 다시 로그인해주세요.');
			if (!window.location.pathname.startsWith('/login')) {
				window.location.href = '/login';
			}
		} else {
			console.error('API Error:', error);
		}
		return Promise.reject(error);
	}
);

export default client;
