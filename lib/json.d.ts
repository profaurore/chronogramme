export type JSONValue =
  | JSONValue[]
  | boolean
  | number
  | string
  | { [x: string]: JSONValue };
