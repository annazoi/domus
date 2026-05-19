import { WebsiteBuilderClient } from './website-builder-client';

export default function WebsiteBuilderPage() {
	return (
		<div className="space-y-6">
			<div>
				<p className="text-xs uppercase tracking-[0.2em] text-camel">Website builder</p>
				<h1 className="mt-2 font-serif text-3xl tracking-tight md:text-4xl">Studio</h1>
				<p className="mt-2 max-w-xl text-sm text-[#1A1A1A]/55">
					Adjust layout, preview pages, then publish when it feels right.
				</p>
			</div>
			<WebsiteBuilderClient />
		</div>
	);
}
