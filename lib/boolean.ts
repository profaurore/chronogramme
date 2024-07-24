// parses, no validation required
export const parseBooleanAttribute = (value: string | null): boolean => {
	return value !== null;
};
