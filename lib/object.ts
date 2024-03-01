export class NotAnObjectError extends Error {
	public readonly value: unknown;

	public readonly valueName: string;

	public constructor(valueName: string, value: unknown) {
		super("Value is not an object.");
		this.name = this.constructor.name;
		this.valueName = valueName;
		this.value = value;
	}
}

export class MissingPropertyError extends Error {
	public readonly property: string;

	public readonly valueName: string;

	public constructor(valueName: string, property: string) {
		super("Object is missing a required property.");
		this.name = this.constructor.name;
		this.valueName = valueName;
		this.property = property;
	}
}

export class UnknownPropertyError extends Error {
	public readonly property: string;

	public readonly valueName: string;

	public constructor(valueName: string, property: string) {
		super("Object contains an unknown property.");
		this.name = this.constructor.name;
		this.valueName = valueName;
		this.property = property;
	}
}

const isObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object";

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
			throw new MissingPropertyError(valueName, property);
		}
	}

	for (const property in value) {
		if (
			!requiredProperties.includes(property) &&
			!optionalProperties.includes(property)
		) {
			throw new UnknownPropertyError(valueName, property);
		}
	}
};
