'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type ToastTone = 'success' | 'error' | 'info';

type ToastContextValue = {
	push: (input: { title: string; description?: string; tone?: ToastTone }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const push = useCallback((input: { title: string; description?: string; tone?: ToastTone }) => {
		const tone = input.tone ?? 'info';
		const content = (
			<div>
				<p className="text-sm text-[#1A1A1A]">{input.title}</p>
				{input.description ? <p className="mt-0.5 text-xs text-[#1A1A1A]/60">{input.description}</p> : null}
			</div>
		);
		if (tone === 'success') {
			toast.success(content);
			return;
		}
		if (tone === 'error') {
			toast.error(content);
			return;
		}
		toast(content);
	}, []);

	const value = useMemo<ToastContextValue>(() => ({ push }), [push]);

	return (
		<ToastContext.Provider value={value}>
			{children}
			<ToastContainer
				position="bottom-right"
				autoClose={2800}
				hideProgressBar
				closeOnClick
				closeButton={false}
				pauseOnHover
				draggable={false}
				newestOnTop
				icon={false}
				toastClassName={() =>
					'min-h-0 rounded-xl border border-black/10 bg-white px-4 py-3 shadow-md text-[#1A1A1A]'
				}
			/>
		</ToastContext.Provider>
	);
}

export function useToast() {
	const ctx = useContext(ToastContext);
	if (!ctx) {
		throw new Error('useToast must be used within ToastProvider.');
	}
	return ctx;
}
