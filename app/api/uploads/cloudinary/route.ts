import { uploadFiles } from '@/app/api/services/cloudinary.service';

export async function POST(request: Request) {
	try {
		const formData = await request.formData();
		const files = formData.getAll('files').filter((entry): entry is File => entry instanceof File);
		const uploadedUrls = await uploadFiles(files);

		return Response.json({ urls: uploadedUrls }, { status: 201 });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Could not upload files.';
		const status = message === 'No files provided.' ? 400 : 500;
		return Response.json({ message }, { status });
	}
}
