'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import axiosInstance from '@/config/api/axios';
import { ApiRoutes } from '@/config/api/routes';
import { useAuthStore } from '@/store/auth';
import { AuthFormArrow } from './auth-form-arrow';

export function SignInForm() {
	const router = useRouter();
	const setLogin = useAuthStore((state) => state.login);

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setIsLoading(true);

		try {
			const response = await axiosInstance.post(ApiRoutes.auth.login, {
				email,
				password,
			});

			const userData = response.data;

			setLogin({
				isLoggedIn: true,
				user_uuid: userData.user_uuid || userData.uuid,
				first_name: userData.first_name,
				last_name: userData.last_name,
				vat_number: userData.vat_number ?? null,
				email: userData.email,
			});

			router.push('/dashboard');
		} catch (err: unknown) {
			if (axios.isAxiosError(err)) {
				setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
			} else {
				setError('Invalid credentials. Please try again.');
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<h1>Sign In</h1>
			<p className="sub">Welcome back to your platform.</p>

			<form onSubmit={handleSubmit}>
				{error ? <div className="login-alert">{error}</div> : null}

				<div className="field">
					<label htmlFor="email">Email Address</label>
					<input
						id="email"
						name="email"
						type="email"
						autoComplete="email"
						placeholder="you@example.com"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>

				<div className="field">
					<div className="field-head">
						<label htmlFor="password">Password</label>
						<Link href="/auth/forgot-password">Forgot password?</Link>
					</div>
					<input
						id="password"
						name="password"
						type="password"
						autoComplete="current-password"
						placeholder="••••••••"
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>

				<button type="submit" className="login-submit" disabled={isLoading}>
					{isLoading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" strokeWidth={2} /> : 'Sign In'}
					{isLoading ? null : <AuthFormArrow />}
				</button>
			</form>

			<p className="signup">
				Don&apos;t have an account?{' '}
				<Link href="/auth/sign-up">Create platform</Link>
			</p>
		</>
	);
}
