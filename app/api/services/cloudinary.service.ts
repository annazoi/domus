import { environments } from "@/config/environments";
import { CloudinaryUploadResponse } from "./interfaces/cloudinary.interface";
	

const getCloudinaryConfig = () => {
	const cloudName = environments.CLOUDINARY_CLOUD_NAME;
	const apiKey = environments.CLOUDINARY_API_KEY;
	const apiSecret = environments.CLOUDINARY_API_SECRET;

	if (!cloudName || !apiKey || !apiSecret) {
		throw new Error(
			'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.',
		);
	}

	return { cloudName, apiKey, apiSecret };
};

const buildSignature = async (paramsToSign: string, apiSecret: string) => {
	const payload = new TextEncoder().encode(`${paramsToSign}${apiSecret}`);
	const digest = await crypto.subtle.digest('SHA-1', payload);
	return Array.from(new Uint8Array(digest))
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
};

export const uploadFiles = async (files: File[]) => {
	if (!files.length) {
		throw new Error('No files provided.');
	}

	const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
	const uploadedUrls: string[] = [];

	for (const file of files) {
		const timestamp = Math.floor(Date.now() / 1000);
		const signature = await buildSignature(`timestamp=${timestamp}`, apiSecret);

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
			throw new Error(data.error?.message ?? 'Could not upload image to Cloudinary.');
		}

		uploadedUrls.push(data.secure_url);
	}

	return uploadedUrls;
};
