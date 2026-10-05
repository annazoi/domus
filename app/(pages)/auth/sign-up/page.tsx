import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SignUpForm } from '../_components/sign-up-form';

export const metadata: Metadata = {
	title: 'Create platform - Hozya',
};

export default function SignUpPage() {
	return (
		<Suspense>
			<SignUpForm />
		</Suspense>
	);
}
