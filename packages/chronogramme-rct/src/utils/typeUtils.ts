import type {
	BaseGroup as CoreBaseGroup,
	BaseItem as CoreBaseItem,
	Timeline as HTMLTimeline,
} from "@chronogramme/chronogramme";
import type { BaseGroup, BaseItem, Keys } from "../Timeline";

export type CoreTimeline<
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
> = InstanceType<
	typeof HTMLTimeline<
		TGroup["id"],
		RctToCoreGroup<TKeys, TGroup>,
		TItem["id"],
		RctToCoreItem<TKeys, TGroup, TItem>
	>
>;

export type AnyKeys = Keys<
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string
>;

export type AnyGroup<TKeys extends AnyKeys> = BaseGroup<TKeys, unknown>;

export type AnyItem<
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
> = BaseItem<TKeys, TGroup["id"], unknown>;

export type FullRequired<T extends object> = {
	[K in keyof T]-?: Exclude<T[K], undefined>;
};

export interface RctToCoreItem<
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
> extends CoreBaseItem<TGroup["id"], TItem["id"]> {
	originalItem: TItem;
}

export interface RctToCoreGroup<
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
> extends CoreBaseGroup<TGroup["id"]> {
	originalGroup: TGroup;
}
