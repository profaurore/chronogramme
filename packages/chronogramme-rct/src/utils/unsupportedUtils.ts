export type UnsupportedType<
	_TOriginal,
	TMessage extends string,
> = `This value is unsupported. ${TMessage}`;

export class UnsupportedPropertyValueError extends Error {
	public constructor(message: string, property: string, value: unknown) {
		super(
			`Unsupported property value: \`${property}: ${String(value)}\`. ${message}`,
		);
		this.name = this.constructor.name;
	}
}

class UnsupportedPropertyError extends Error {
	public constructor(objectName: string, property: string | number | symbol) {
		super(`Unsupported property: \`${objectName}.${String(property)}\`.`);
		this.name = this.constructor.name;
	}
}

export const buildUnsupportedPropertiesProxy = <
	TObject extends object,
	TUnsupportedKeys extends readonly (keyof TObject)[],
>(
	objectName: string,
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
				if (
					unsupportedPropertiesWidened.includes(property) &&
					!Reflect.has(getTarget, property)
				) {
					throw new UnsupportedPropertyError(objectName, property);
				}

				return Reflect.get(getTarget, property, receiver);
			},
		}),
	);
};

export class UnsupportedFunctionError extends Error {
	public constructor(functionName: string, message: string) {
		super(`Unsupported function: \`${functionName}\`. ${message}`);
		this.name = this.constructor.name;
	}
}

export const validateComponentProperties: <
	TObject extends object,
	TUnsupportedKeys extends readonly (keyof TObject)[],
>(
	componentName: string,
	properties: TObject,
	unsupportedProperties: TUnsupportedKeys,
) => asserts properties is TObject & Record<TUnsupportedKeys[number], never> = <
	TObject extends object,
	TUnsupportedKeys extends readonly (keyof TObject)[],
>(
	componentName: string,
	properties: TObject,
	unsupportedProperties: TUnsupportedKeys,
): asserts properties is TObject & Record<TUnsupportedKeys[number], never> => {
	for (const property of unsupportedProperties) {
		if (property in properties) {
			throw new UnsupportedPropertyError(componentName, property);
		}
	}
};

export const validateTime: (
	valueName: string,
	value: unknown,
) => asserts value is EpochTimeStamp = (
	valueName: string,
	value: unknown,
): asserts value is EpochTimeStamp => {
	if (typeof value !== "number") {
		throw new UnsupportedPropertyValueError(
			"Use epoch timestamps instead.",
			valueName,
			value,
		);
	}
};
