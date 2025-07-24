// parses, no validation required
export function parseBooleanAttribute(value: string | null): boolean {
	return value !== null;
}

export class NotABooleanError extends Error {
	public readonly value: unknown;

	public readonly valueName: string;

	public constructor(valueName: string, value: unknown) {
		super(`Value is not a boolean. Given: ${String(value)}.`);
		this.name = this.constructor.name;
		this.valueName = valueName;
		this.value = value;
	}
}

export const validateBoolean: (
	valueName: string,
	value: unknown,
) => asserts value is boolean = (valueName, value) => {
	if (typeof value !== "boolean") {
		throw new NotABooleanError(valueName, value);
	}
};
