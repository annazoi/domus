export const getHostIdFromRequest = (request: Request) => {
	const hostId = request.headers.get('x-user-id');
	if (!hostId) return null;
	return hostId;
};
