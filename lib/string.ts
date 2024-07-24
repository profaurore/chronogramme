class NotAStringError extends Error {
	public readonly value: unknown;

	public readonly valueName: string;

	public constructor(valueName: string, value: unknown) {
		super(`Value is not a string. Given: ${value}.`);
		this.name = this.constructor.name;
		this.valueName = valueName;
		this.value = value;
	}
}

class UnknownStringOptionError extends Error {
	public readonly options: readonly string[];

	public readonly value: unknown;

	public readonly valueName: string;

	public constructor(
		valueName: string,
		value: unknown,
		options: readonly string[],
	) {
		super(
			`Value is not a valid option. Expected: ${options.join(", ")}; Given: ${value}.`,
		);
		this.name = this.constructor.name;
		this.valueName = valueName;
		this.value = value;
		this.options = options;
	}
}

const validateString: (
	valueName: string,
	value: unknown,
) => asserts value is string = (valueName, value) => {
	if (typeof value !== "string") {
		throw new NotAStringError(valueName, value);
	}
};

export const validateStringOptions: <TOptions extends readonly string[]>(
	valueName: string,
	value: unknown,
	options: TOptions,
) => asserts value is TOptions[number] = (valueName, value, options) => {
	validateString(valueName, value);

	if (!options.includes(value)) {
		throw new UnknownStringOptionError(valueName, value, options);
	}
};
