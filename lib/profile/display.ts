export const cloudinaryDisplayUrl = (url: string) => {
	if (!url.includes('res.cloudinary.com/')) return url;
	return url
		.replace('/upload/', '/upload/f_auto,q_auto/')
		.replace(/\.(avif|webp|jpe?g|png)$/i, '');
};

export const profileInitials = (first: string, last: string) => {
	const a = first.trim().charAt(0);
	const b = last.trim().charAt(0);
	return (a + b).toUpperCase() || '?';
};

export const formatProfileMemberSince = (iso: string) =>
	new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(new Date(iso));
