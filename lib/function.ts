export class NotAFunctionError extends Error {
	public readonly value: unknown;

	public readonly valueName: string;

	public constructor(valueName: string, value: unknown) {
		super(`Value is not a function. Given: ${value}.`);
		this.name = this.constructor.name;
		this.valueName = valueName;
		this.value = value;
	}
}

function isFunction<Fn extends () => void>(value: unknown): value is Fn {
	return typeof value === "function";
}

export function validateFunction<Fn>(
	valueName: string,
	value: unknown,
): asserts value is Fn {
	if (!isFunction(value)) {
		throw new NotAFunctionError(valueName, value);
	}
}
