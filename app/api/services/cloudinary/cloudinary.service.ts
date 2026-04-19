import { environments } from "@/config/environments";
import { CloudinaryUploadResponse } from "./interfaces/cloudinary.interface";

export type UploadedCloudinaryFile = {
	url: string;
	public_id: string;
	size: number;
	format: string;
	resource_type: string;
	original_filename: string;
};

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
	const uploadedFiles: UploadedCloudinaryFile[] = [];

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
		if (
			!uploadResponse.ok ||
			!data.secure_url ||
			!data.public_id ||
			typeof data.bytes !== 'number' ||
			!data.format
		) {
			throw new Error(data.error?.message ?? 'Could not upload image to Cloudinary.');
		}

		uploadedFiles.push({
			url: data.secure_url,
			public_id: data.public_id,
			size: data.bytes,
			format: data.format,
			resource_type: data.resource_type ?? 'image',
			original_filename: data.original_filename ?? data.public_id,
		});
	}

	return uploadedFiles;
};

export const deleteFile = async (publicId: string) => {
	if (!publicId.trim()) {
		throw new Error('Missing cloudinary public id.');
	}

	const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
	const timestamp = Math.floor(Date.now() / 1000);
	const signature = await buildSignature(`public_id=${publicId}&timestamp=${timestamp}`, apiSecret);
	const payload = new FormData();
	payload.append('public_id', publicId);
	payload.append('api_key', apiKey);
	payload.append('timestamp', `${timestamp}`);
	payload.append('signature', signature);

	const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
		method: 'POST',
		body: payload,
	});

	const data = (await response.json()) as { result?: string; error?: { message?: string } };
	if (!response.ok || (data.result !== 'ok' && data.result !== 'not found')) {
		throw new Error(data.error?.message ?? 'Could not remove image from Cloudinary.');
	}
};
