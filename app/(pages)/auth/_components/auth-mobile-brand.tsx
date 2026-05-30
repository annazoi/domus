import Image from 'next/image';
import Link from 'next/link';
import logo from '@/public/images/logo.png';

export function AuthMobileBrand() {
	return (
		<header className="login-mobile-header">
			<Link href="/" className="login-mobile-brand" aria-label="Domus home">
				<Image
					src={logo}
					alt="Domus"
					width={320}
					height={96}
					priority
					className="login-mobile-brand-logo"
				/>
			</Link>
		</header>
	);
}
