interface CloudinaryUploadResponse {
	secure_url?: string;
	error?: { message?: string };
}

const buildSignature = async (paramsToSign: string, apiSecret: string) => {
	const payload = new TextEncoder().encode(`${paramsToSign}${apiSecret}`);
	const digest = await crypto.subtle.digest('SHA-1', payload);
	return Array.from(new Uint8Array(digest))
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
};

export async function POST(request: Request) {
	try {
		const formData = await request.formData();
		const files = formData.getAll('files').filter((entry): entry is File => entry instanceof File);

		if (!files.length) {
			return Response.json({ message: 'No files provided.' }, { status: 400 });
		}

		const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
		const apiKey = process.env.CLOUDINARY_API_KEY;
		const apiSecret = process.env.CLOUDINARY_API_SECRET;
		if (!cloudName || !apiKey || !apiSecret) {
			return Response.json(
				{
					message:
						'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.',
				},
				{ status: 500 },
			);
		}

		const uploadedUrls: string[] = [];
		for (const file of files) {
			const timestamp = Math.floor(Date.now() / 1000);
			const paramsToSign = `timestamp=${timestamp}`;
			const signature = await buildSignature(paramsToSign, apiSecret);

			const payload = new FormData();
			payload.append('file', file);
			payload.append('api_key', apiKey);
			payload.append('timestamp', `${timestamp}`);
			payload.append('signature', signature);

			const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
				method: 'POST',
				body: payload,
			});
			const data = (await uploadResponse.json()) as CloudinaryUploadResponse;

			if (!uploadResponse.ok || !data.secure_url) {
				return Response.json(
					{ message: data.error?.message ?? 'Could not upload image to Cloudinary.' },
					{ status: 400 },
				);
			}

			uploadedUrls.push(data.secure_url);
		}

		return Response.json({ urls: uploadedUrls }, { status: 201 });
	} catch {
		return Response.json({ message: 'Could not upload files.' }, { status: 500 });
	}
}
