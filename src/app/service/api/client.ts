import axios from 'axios';
import { PUBLIC_API_BASE_URL } from '$env/static/public';

const client = axios.create({
	baseURL: PUBLIC_API_BASE_URL || 'http://localhost:3000',
	headers: {
		'Content-Type': 'application/json'
	}
});

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
