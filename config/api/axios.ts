import axios from 'axios';
import { getAuthStoreState } from '@/store/auth';
import { isTokenExpired } from '@/lib/token';
// import { environments } from '@/config/environments';

const axiosInstance = axios.create({
	// Always target Next route handlers to avoid hitting page routes like /auth/sign-up.
	baseURL: '/api',
	headers: {
		'Content-Type': 'application/json',
	},
});

axiosInstance.interceptors.request.use((config) => {
	const authState = getAuthStoreState();

	// if (authState?.expires_in && isTokenExpired(authState.expires_in)) {
	// 	authState.logout();

	// 	return Promise.reject(new Error('Token expired'));
	// }

	// if (authState.access_token) {
	// 	config.headers.Authorization = `Bearer ${authState.access_token}`;
	// }

	return config;
});

export default axiosInstance;
