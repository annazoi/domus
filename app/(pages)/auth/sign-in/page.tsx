'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import axiosInstance from '@/config/api/axios';
import { ApiRoutes } from '@/config/api/routes';
import { useAuthStore } from '@/store/auth';

export default function SignInPage() {
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

			// Assuming the response returns the user object and a token
			const userData = response.data;

			setLogin({
				isLoggedIn: true,
				user_uuid: userData.user_uuid || userData.uuid,
				account_uuid: userData.account_uuid,
				first_name: userData.first_name,
				last_name: userData.last_name,
				email: userData.email,
				access_token: userData.access_token || userData.token,
				expires_in: userData.expires_in,
				avatar: userData.avatar,
				account: userData.account,
				login: () => {},
				logout: () => {},
				updateUser: () => {},
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
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
		>
			<div className="mb-10 text-center md:text-left">
				<h1 className="font-serif text-3xl md:text-4xl text-stone-900 mb-3">Sign In</h1>
				<p className="text-stone-500 font-light">Welcome back to your platform.</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{error && (
					<div className="p-4 bg-red-50 text-red-700 text-sm font-light rounded-sm border border-red-100">
						{error}
					</div>
				)}

				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-stone-700 mb-1.5">Email Address</label>
						<input
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full px-4 py-3 bg-white border border-stone-200 rounded-sm focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition-colors font-light text-stone-900 placeholder:text-stone-300"
							placeholder="you@example.com"
						/>
					</div>

					<div>
						<div className="flex items-center justify-between xl:mb-1.5">
							<label className="block text-sm font-medium text-stone-700 mb-1.5 xl:mb-0">Password</label>
							<Link
								href="/auth/forgot-password"
								className="text-xs text-stone-500 hover:text-stone-900 transition-colors hidden xl:block"
							>
								Forgot password?
							</Link>
						</div>
						<input
							type="password"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full px-4 py-3 bg-white border border-stone-200 rounded-sm focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition-colors font-light text-stone-900"
							placeholder="••••••••"
						/>
					</div>

					<Link
						href="/auth/forgot-password"
						className="text-xs text-stone-500 hover:text-stone-900 transition-colors xl:hidden inline-block"
					>
						Forgot password?
					</Link>
				</div>

				<button
					type="submit"
					disabled={isLoading}
					className="cursor-pointer w-full bg-stone-900 text-stone-50 py-3.5 rounded-sm text-sm font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
				>
					{isLoading ? (
						<Loader2 className="w-4 h-4 animate-spin" />
					) : (
						<>
							Sign In
							<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
						</>
					)}
				</button>
			</form>

			<div className="mt-8 text-center text-sm text-stone-500 font-light">
				Don&apos;t have an account?{' '}
				<Link href="/auth/sign-up" className="text-stone-900 font-medium hover:underline underline-offset-4">
					Create platform
				</Link>
			</div>
		</motion.div>
	);
}
