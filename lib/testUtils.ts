export function getError<TError>(call: () => unknown): TError | undefined {
	try {
		call();
	} catch (error: unknown) {
		return error as TError;
	}

	return;
}
