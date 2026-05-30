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

export function SignUpForm() {
	const router = useRouter();
	const setLogin = useAuthStore((state) => state.login);

	const [first_name, setFirstName] = useState('');
	const [last_name, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setIsLoading(true);

		try {
			const response = await axiosInstance.post(ApiRoutes.auth.register, {
				first_name: first_name.trim(),
				last_name: last_name.trim(),
				email,
				password,
			});

			const userData = response.data;

			setLogin({
				isLoggedIn: true,
				user_uuid: userData.user_uuid || userData.uuid,
				first_name: userData.first_name,
				last_name: userData.last_name,
				vat_number: null,
				email: userData.email,
			});

			router.push('/dashboard');
		} catch (err: unknown) {
			if (axios.isAxiosError(err)) {
				setError(err.response?.data?.message || 'Could not create account. Please try again.');
			} else {
				setError('Could not create account. Please try again.');
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<h1>Create Platform</h1>
			<p className="sub">Start building your branded rental experience.</p>

			<form onSubmit={handleSubmit}>
				{error ? <div className="login-alert">{error}</div> : null}

				<div className="field">
					<label htmlFor="first_name">First name</label>
					<input
						id="first_name"
						name="first_name"
						type="text"
						autoComplete="given-name"
						required
						value={first_name}
						onChange={(e) => setFirstName(e.target.value)}
						placeholder="Jane"
					/>
				</div>

				<div className="field">
					<label htmlFor="last_name">Last name</label>
					<input
						id="last_name"
						name="last_name"
						type="text"
						autoComplete="family-name"
						required
						value={last_name}
						onChange={(e) => setLastName(e.target.value)}
						placeholder="Doe"
					/>
				</div>

				<div className="field">
					<label htmlFor="email">Email Address</label>
					<input
						id="email"
						name="email"
						type="email"
						autoComplete="email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="you@example.com"
					/>
				</div>

				<div className="field">
					<label htmlFor="password">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						autoComplete="new-password"
						required
						minLength={8}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Create a strong password"
					/>
				</div>

				<button type="submit" className="login-submit" disabled={isLoading}>
					{isLoading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" strokeWidth={2} /> : 'Sign Up'}
					{isLoading ? null : <AuthFormArrow />}
				</button>

				<p className="login-legal">
					By signing up, you agree to our Terms of Service and Privacy Policy.
				</p>
			</form>

			<p className="signup">
				Already have an account? <Link href="/auth/sign-in">Sign in</Link>
			</p>
		</>
	);
}
