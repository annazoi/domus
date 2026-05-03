import { redirect } from 'next/navigation';

/** Legacy URL — listing preview lives at `/{slug}` (slug may be UUID). */
export default async function PropertyBrandingPreviewRedirectPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	redirect(`/${encodeURIComponent(id)}`);
}
