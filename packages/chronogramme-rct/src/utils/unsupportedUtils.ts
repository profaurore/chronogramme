export class UnsupportedPropertyValueError extends Error {
	public readonly property: string | number | symbol;

	public readonly value: unknown;

	public constructor(error: string, property: string, value: unknown) {
		super(error);
		this.name = this.constructor.name;
		this.property = property;
		this.value = value;
	}
}

export class UnsupportedPropertyError extends Error {
	public readonly property: string | number | symbol;

	public constructor(property: string | number | symbol) {
		super("Unsupported property.");
		this.name = this.constructor.name;
		this.property = property;
	}
}

export const buildUnsupportedPropertiesProxy = <
	TObject extends object,
	TUnsupportedKeys extends readonly (keyof TObject)[],
>(
	target: Omit<TObject, TUnsupportedKeys[number]>,
	unsupportedProperties: TUnsupportedKeys,
): TObject => {
	const unsupportedPropertiesWidened: readonly (string | number | symbol)[] =
		unsupportedProperties;

	return new Proxy<Readonly<TObject>>(
		target as TObject,
		Object.freeze({
			get(
				getTarget: object,
				property: string | number | symbol,
				receiver: unknown,
			): unknown {
				if (unsupportedPropertiesWidened.includes(property)) {
					throw new UnsupportedPropertyError(property);
				}

				return Reflect.get(getTarget, property, receiver);
			},
		}),
	);
};

export class UnsupportedFunctionError extends Error {
	public readonly functionName: string;

	public constructor(functionName: string) {
		super("Unsupported function.");
		this.name = this.constructor.name;
		this.functionName = functionName;
	}
}

export const buildUnsupportedFunction = <TReturn>(
	functionName: string,
): (() => TReturn) => {
	throw new UnsupportedFunctionError(functionName);
};

export const validateComponentProperties: <
	TObject extends object,
	TUnsupportedKeys extends readonly (keyof TObject)[],
>(
	properties: TObject,
	unsupportedProperties: TUnsupportedKeys,
) => asserts properties is TObject & Record<TUnsupportedKeys[number], never> = <
	TObject extends object,
	TUnsupportedKeys extends readonly (keyof TObject)[],
>(
	properties: TObject,
	unsupportedProperties: TUnsupportedKeys,
): asserts properties is TObject & Record<TUnsupportedKeys[number], never> => {
	for (const property of unsupportedProperties) {
		if (property in properties) {
			throw new UnsupportedPropertyError(property);
		}
	}
};
