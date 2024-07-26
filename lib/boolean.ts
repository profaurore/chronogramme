// parses, no validation required
export function parseBooleanAttribute(value: string | null): boolean {
	return value !== null;
}
