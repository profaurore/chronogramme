export type FullRequired<T extends object> = {
	[K in keyof T]-?: Exclude<T[K], undefined>;
};
