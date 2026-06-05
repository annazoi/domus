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
	const userId = authState?.user_uuid;

	// if (authState?.expires_in && isTokenExpired(authState.expires_in)) {
	// 	authState.logout();

	// 	return Promise.reject(new Error('Token expired'));
	// }

	// if (authState.access_token) {
	// 	config.headers.Authorization = `Bearer ${authState.access_token}`;
	// }

	if (userId) {
		config.headers['x-user-id'] = userId;
	}

	return config;
});

export const postMultipart = <T>(url: string, formData: FormData) =>
	axiosInstance.post<T>(url, formData, {
		transformRequest: [
			(data, headers) => {
				if (data instanceof FormData) {
					delete headers['Content-Type'];
				}
				return data;
			},
		],
	});

export default axiosInstance;
