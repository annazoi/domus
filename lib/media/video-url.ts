export const VideoUrlSource = {
	YOUTUBE: 'YOUTUBE',
	VIMEO: 'VIMEO',
	CLOUDINARY: 'CLOUDINARY',
	DIRECT: 'DIRECT',
	OTHER: 'OTHER',
} as const;

export type VideoUrlSource = (typeof VideoUrlSource)[keyof typeof VideoUrlSource];

export const VIDEO_URL_SOURCE_OPTIONS: { value: VideoUrlSource; label: string }[] = [
	{ value: VideoUrlSource.YOUTUBE, label: 'YouTube' },
	{ value: VideoUrlSource.VIMEO, label: 'Vimeo' },
	{ value: VideoUrlSource.CLOUDINARY, label: 'Cloudinary' },
	{ value: VideoUrlSource.DIRECT, label: 'Direct file URL' },
	{ value: VideoUrlSource.OTHER, label: 'Other' },
];

const VIDEO_URL_SOURCE_PATH_PREFIX = 'video-source:';

export const videoUrlSourceDocumentPath = (source: VideoUrlSource) => `${VIDEO_URL_SOURCE_PATH_PREFIX}${source}`;

export const readVideoUrlSourceFromDocumentPath = (path: string | null | undefined): VideoUrlSource | null => {
	if (!path?.startsWith(VIDEO_URL_SOURCE_PATH_PREFIX)) return null;
	const source = path.slice(VIDEO_URL_SOURCE_PATH_PREFIX.length);
	return isVideoUrlSource(source) ? source : null;
};

export const isVideoUrlSource = (value: string): value is VideoUrlSource =>
	Object.values(VideoUrlSource).includes(value as VideoUrlSource);

export const getVideoUrlSourceLabel = (source: VideoUrlSource) =>
	VIDEO_URL_SOURCE_OPTIONS.find((option) => option.value === source)?.label ?? source;

export const getVideoUrlSourcePlaceholder = (source: VideoUrlSource | '') => {
	switch (source) {
		case VideoUrlSource.YOUTUBE:
			return 'https://www.youtube.com/watch?v=…';
		case VideoUrlSource.VIMEO:
			return 'https://vimeo.com/123456789';
		case VideoUrlSource.CLOUDINARY:
			return 'https://res.cloudinary.com/…/video/upload/….mp4';
		case VideoUrlSource.DIRECT:
			return 'https://cdn.example.com/walkthrough.mp4';
		case VideoUrlSource.OTHER:
			return 'https://example.com/video';
		default:
			return 'https://cdn.example.com/walkthrough.mp4';
	}
};

const extractYouTubeId = (url: string) => {
	try {
		const parsed = new URL(url.trim());
		const host = parsed.hostname.replace(/^www\./, '');
		if (host === 'youtu.be') {
			const id = parsed.pathname.slice(1).split('/')[0];
			return id || null;
		}
		if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
			if (parsed.pathname.startsWith('/watch')) return parsed.searchParams.get('v');
			const parts = parsed.pathname.split('/').filter(Boolean);
			if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') return parts[1] ?? null;
		}
		return null;
	} catch {
		return null;
	}
};

const extractVimeoId = (url: string) => {
	try {
		const parsed = new URL(url.trim());
		const host = parsed.hostname.replace(/^www\./, '');
		if (host === 'vimeo.com') {
			const parts = parsed.pathname.split('/').filter(Boolean);
			if (parts[0] === 'video') return parts[1] ?? null;
			return parts[0] ?? null;
		}
		if (host === 'player.vimeo.com') {
			const parts = parsed.pathname.split('/').filter(Boolean);
			if (parts[0] === 'video') return parts[1] ?? null;
		}
		return null;
	} catch {
		return null;
	}
};

export const detectVideoUrlSource = (url: string): VideoUrlSource => {
	const trimmed = url.trim();
	if (!trimmed) return VideoUrlSource.OTHER;
	if (extractYouTubeId(trimmed)) return VideoUrlSource.YOUTUBE;
	if (extractVimeoId(trimmed)) return VideoUrlSource.VIMEO;
	if (trimmed.includes('res.cloudinary.com/') && trimmed.includes('/video/')) return VideoUrlSource.CLOUDINARY;
	try {
		const parsed = new URL(trimmed);
		const pathname = parsed.pathname.toLowerCase();
		if (/\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/.test(pathname)) return VideoUrlSource.DIRECT;
	} catch {
		return VideoUrlSource.OTHER;
	}
	return VideoUrlSource.OTHER;
};

export const getVideoUrlThumbnail = (url: string, source: VideoUrlSource): string | null => {
	const trimmed = url.trim();
	if (!trimmed) return null;

	switch (source) {
		case VideoUrlSource.YOUTUBE: {
			const id = extractYouTubeId(trimmed);
			return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
		}
		case VideoUrlSource.VIMEO: {
			const id = extractVimeoId(trimmed);
			return id ? `https://vumbnail.com/${id}.jpg` : null;
		}
		case VideoUrlSource.CLOUDINARY: {
			if (!trimmed.includes('res.cloudinary.com/') || !trimmed.includes('/video/')) return null;
			return trimmed
				.replace('/video/upload/', '/video/upload/so_0,w_800,h_600,c_fill/')
				.replace(/\.(mp4|webm|mov|avi|mkv|m4v)(\?.*)?$/i, '.jpg$2');
		}
		default:
			return null;
	}
};

export const resolveVideoUrlSource = (url: string, source?: VideoUrlSource | null) =>
	source ?? detectVideoUrlSource(url);

export type VideoPreviewPlayback =
	| { kind: 'embed'; embedUrl: string }
	| { kind: 'file'; src: string };

export const getVideoPreviewPlayback = (url: string, source?: VideoUrlSource | null): VideoPreviewPlayback => {
	const trimmed = url.trim();
	const resolvedSource = resolveVideoUrlSource(trimmed, source);

	if (resolvedSource === VideoUrlSource.YOUTUBE) {
		const id = extractYouTubeId(trimmed);
		if (id) {
			return {
				kind: 'embed',
				embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`,
			};
		}
	}

	if (resolvedSource === VideoUrlSource.VIMEO) {
		const id = extractVimeoId(trimmed);
		if (id) {
			return {
				kind: 'embed',
				embedUrl: `https://player.vimeo.com/video/${id}?autoplay=1`,
			};
		}
	}

	return { kind: 'file', src: trimmed };
};
