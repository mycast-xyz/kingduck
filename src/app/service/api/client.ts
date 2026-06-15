import axios from 'axios';
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { authTokenService } from '../auth/AuthTokenService';

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

// Response interceptor for error handling
client.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		// Handle common errors here (e.g., 401 Unauthorized)
		console.error('API Error:', error);
		return Promise.reject(error);
	}
);

export default client;
