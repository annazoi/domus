/** Authenticated user id (host or guest), from `x-user-id` header. */
export const getUserIdFromRequest = (request: Request) => {
	const id = request.headers.get('x-user-id');
	if (!id) return null;
	return id;
};

export const getHostIdFromRequest = getUserIdFromRequest;
