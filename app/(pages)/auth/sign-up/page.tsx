import type { Metadata } from 'next';
import { SignUpForm } from '../_components/sign-up-form';

export const metadata: Metadata = {
	title: 'Create platform - Hozya',
};

export default function SignUpPage() {
	return <SignUpForm />;
}
