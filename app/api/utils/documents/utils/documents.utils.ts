export const EXTENSION_MIMETYPE: Record<string, string> = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp',
	'.gif': 'image/gif',
	'.svg': 'image/svg+xml',
	'.avif': 'image/avif',
	'.mp4': 'video/mp4',
	'.webm': 'video/webm',
	'.mov': 'video/quicktime',
	'.m4v': 'video/x-m4v',
	'.ogg': 'video/ogg',
};

export const filenameFromUrl = (url: string) => {
	try {
		const parsed = new URL(url);
		const lastSegment = parsed.pathname.split('/').filter(Boolean).pop() ?? '';
		return decodeURIComponent(lastSegment) || `image-${Date.now()}`;
	} catch {
		return `image-${Date.now()}`;
	}
};

export const mimetypeFromFilename = (filename: string) => {
	const dot = filename.lastIndexOf('.');
	if (dot === -1) return 'application/octet-stream';
	const ext = filename.slice(dot).toLowerCase();
	return EXTENSION_MIMETYPE[ext] ?? 'application/octet-stream';
};