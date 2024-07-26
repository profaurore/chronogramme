export class NotAnObjectError extends Error {
	public readonly value: unknown;

	public readonly valueName: string;

	public constructor(valueName: string, value: unknown) {
		super(`Value is not an object. Given: ${value}.`);
		this.name = this.constructor.name;
		this.valueName = valueName;
		this.value = value;
	}
}

export class MissingPropertyError extends Error {
	public readonly property: string;

	public readonly valueName: string;

	public readonly value: Record<string, unknown>;

	public constructor(
		valueName: string,
		value: Record<string, unknown>,
		property: string,
	) {
		super(
			`Object is missing a required property. Expected: ${property}; Given: ${value}.`,
		);
		this.name = this.constructor.name;
		this.valueName = valueName;
		this.value = value;
		this.property = property;
	}
}

export class UnknownPropertyError extends Error {
	public readonly property: string;

	public readonly valueName: string;

	public readonly value: Record<string, unknown>;

	public constructor(
		valueName: string,
		value: Record<string, unknown>,
		property: string,
	) {
		super(
			`Object contains an unknown property. Expected: not ${property}; Given: ${value}.`,
		);
		this.name = this.constructor.name;
		this.valueName = valueName;
		this.value = value;
		this.property = property;
	}
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object";
}

export const validateObject: (
	valueName: string,
	value: unknown,
	requiredProperties: readonly string[],
	optionalProperties: readonly string[],
) => asserts value is Record<string, unknown> = (
	valueName,
	value,
	requiredProperties,
	optionalProperties,
) => {
	if (!isObject(value)) {
		throw new NotAnObjectError(valueName, value);
	}

	for (const property of requiredProperties) {
		if (!(property in value)) {
			throw new MissingPropertyError(valueName, value, property);
		}
	}

	for (const property in value) {
		if (
			!(
				requiredProperties.includes(property) ||
				optionalProperties.includes(property)
			)
		) {
			throw new UnknownPropertyError(valueName, value, property);
		}
	}
};
