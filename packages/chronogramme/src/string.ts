function validateString(
	valueName: string,
	value: unknown,
): asserts value is string {
	if (typeof value !== "string") {
		throw new NotAStringError(valueName, value);
	}
}

export class NotAStringError extends Error {
	public readonly value: unknown;

	public readonly valueName: string;

	public constructor(valueName: string, value: unknown) {
		super(`Value is not a string. Given: ${String(value)}.`);
		this.name = this.constructor.name;
		this.valueName = valueName;
		this.value = value;
	}
}

export class UnknownStringOptionError extends Error {
	public readonly options: readonly string[];

	public readonly value: unknown;

	public readonly valueName: string;

	public constructor(
		valueName: string,
		value: unknown,
		options: readonly string[],
	) {
		super(
			`Value is not a valid option. Expected: ${options.join(", ")}; Given: ${String(value)}.`,
		);
		this.name = this.constructor.name;
		this.valueName = valueName;
		this.value = value;
		this.options = options;
	}
}

export function validateStringOptions<TOptions extends readonly string[]>(
	valueName: string,
	value: unknown,
	options: TOptions,
): asserts value is TOptions[number] {
	validateString(valueName, value);

	if (!options.includes(value)) {
		throw new UnknownStringOptionError(valueName, value, options);
	}
}

export function parseStringOptions<TOptions extends readonly string[]>(
	valueName: string,
	value: unknown,
	options: TOptions,
): TOptions[number] | undefined {
	if (value === null) {
		return;
	}

	validateStringOptions(valueName, value, options);

	return value;
}
