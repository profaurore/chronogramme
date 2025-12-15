import type {
	BaseGroup as CoreBaseGroup,
	BaseItem as CoreBaseItem,
} from "@chronogramme/chronogramme";

export type FullRequired<T extends object> = {
	[K in keyof T]-?: Exclude<T[K], undefined>;
};

export interface RctToCoreItem<TGroupId, TItemId, TItem>
	extends CoreBaseItem<TGroupId, TItemId> {
	originalItem: TItem;
}

export interface RctToCoreGroup<TGroupId, TGroup>
	extends CoreBaseGroup<TGroupId> {
	originalGroup: TGroup;
}
