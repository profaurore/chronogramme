import { HALF, UNIT, ZERO } from "./math.ts";

class BPlusNode<TValue> {
	subnodes: BPlusNode<TValue>[];
	keys: number[];
	values: TValue[][];
	parent: BPlusNode<TValue> | undefined;

	constructor(
		keys: number[] = [],
		values: TValue[][] = [],
		subnodes: BPlusNode<TValue>[] = [],
	) {
		this.subnodes = subnodes;
		this.keys = keys;
		this.values = values;
		this.parent = undefined;
	}

	public isInternal(): boolean {
		return this.subnodes.length > ZERO;
	}

	public insertInLeaf(key: number, value: TValue): void {
		const keys = this.keys;

		for (const [idx, currentKey] of keys.entries()) {
			if (key === currentKey) {
				this.values[idx]?.push(value);
				return;
			}

			if (key < currentKey) {
				keys.splice(idx, ZERO, key);
				this.values.splice(idx, ZERO, [value]);
				return;
			}
		}

		keys.push(key);
		this.values.push([value]);
	}
}

export class BPlusTree<TValue> {
	order: number;
	root: BPlusNode<TValue>;
	underflow: number;

	constructor(order = 3) {
		this.order = order;
		this.root = new BPlusNode();
		this.underflow = Math.ceil(HALF * (order - 1));
	}

	private isOverflowing(node: BPlusNode<TValue>): boolean {
		return node.keys.length >= this.order;
	}

	private fixOverflow(node: BPlusNode<TValue>): void {
		if (!this.isOverflowing(node)) {
			return;
		}

		const middle = Math.ceil(HALF * this.order) - UNIT;
		const middleKey = node.keys[middle];

		if (middleKey === undefined) {
			return;
		}

		const newNode = new BPlusNode<TValue>(
			node.keys.splice(middle, node.keys.length - middle),
			node.values.splice(middle, node.values.length - middle),
			node.subnodes.splice(middle + UNIT, node.subnodes.length - middle),
		);

		// The middle key is only on the parent node when splitting internal nodes.
		if (node.isInternal()) {
			newNode.keys.shift();
		}

		for (const subnode of newNode.subnodes) {
			subnode.parent = newNode;
		}

		const parent = node.parent;

		if (parent) {
			const idxInParent = parent.subnodes.indexOf(node);
			parent.keys.splice(idxInParent, ZERO, middleKey);
			parent.subnodes.splice(idxInParent + UNIT, ZERO, newNode);
			newNode.parent = parent;

			this.fixOverflow(parent);
		} else {
			const newRoot = new BPlusNode<TValue>([middleKey], [], [node, newNode]);

			node.parent = newRoot;
			newNode.parent = newRoot;

			this.root = newRoot;
		}
	}

	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Testing
	private fixUnderflow(node: BPlusNode<TValue>): void {
		const parent = node.parent;

		if (parent) {
			const order = this.order;
			if (node.keys.length < this.underflow) {
				const nodeIdx = parent.subnodes.indexOf(node);

				const prevNode = parent.subnodes[nodeIdx - UNIT];
				const nextNode = parent.subnodes[nodeIdx + UNIT];

				let otherNode: BPlusNode<TValue> | undefined;
				let betweenKeyIdx: number;

				// Determine which node to merge with.
				if (
					prevNode === undefined ||
					(nextNode && node.keys.length + nextNode.keys.length < order)
				) {
					otherNode = nextNode;
					betweenKeyIdx = nodeIdx;
				} else {
					otherNode = prevNode;
					betweenKeyIdx = nodeIdx - UNIT;
				}

				// There should always be at least one neighbouring node.
				if (!otherNode) {
					return;
				}

				// Merging
				if (node.keys.length + otherNode.keys.length < order) {
					let left: BPlusNode<TValue>;
					let right: BPlusNode<TValue>;

					if (otherNode === prevNode) {
						left = otherNode;
						right = node;
					} else {
						left = node;
						right = otherNode;
					}

					const [betweenKey] = parent.keys.splice(betweenKeyIdx, 1);
					parent.subnodes.splice(betweenKeyIdx + UNIT, 1);

					left.values.push(...right.values);
					left.subnodes.push(...right.subnodes);

					if (node.isInternal() && betweenKey !== undefined) {
						left.keys.push(betweenKey);
					}

					left.keys.push(...right.keys);

					for (const subnode of right.subnodes) {
						subnode.parent = left;
					}

					this.fixUnderflow(parent);
				}

				// Redistribution
				else {
					let moveIdx: number;
					let targetKeyIdx: number;
					let targetSubnodeIdx: number;
					let targetValueIdx: number;

					if (otherNode === prevNode) {
						moveIdx = otherNode.keys.length - UNIT;
						targetKeyIdx = ZERO;
						targetSubnodeIdx = ZERO;
						targetValueIdx = ZERO;
					} else {
						moveIdx = ZERO;
						targetKeyIdx = node.keys.length;
						targetSubnodeIdx = node.subnodes.length;
						targetValueIdx = node.values.length;
					}

					const moveKey = otherNode.keys[moveIdx];
					const moveSubnode = otherNode.subnodes[moveIdx];
					const moveValue = otherNode.values[moveIdx];

					if (!moveKey) {
						return;
					}

					node.keys.splice(targetKeyIdx, ZERO, moveKey);

					if (moveSubnode) {
						node.subnodes.splice(targetSubnodeIdx, ZERO, moveSubnode);
						moveSubnode.parent = node;
					} else if (moveValue) {
						node.values.splice(targetValueIdx, ZERO, moveValue);
					}

					parent.keys[betweenKeyIdx] = moveKey;
				}
			}
		} else if (node.subnodes.length === 1) {
			const onlySubnode = node.subnodes[0];

			if (onlySubnode) {
				this.root = onlySubnode;
				onlySubnode.parent = undefined;
			}
		}
	}

	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Testing
	private findLeaf(key: number): BPlusNode<TValue> {
		let node: BPlusNode<TValue> = this.root;

		while (node?.isInternal()) {
			const keys: number[] = node.keys;

			const firstKey = keys[0];
			let nextNode: BPlusNode<TValue> | undefined;

			if (firstKey && key < firstKey) {
				const firstSubnode = node.subnodes[0];
				if (firstSubnode) {
					nextNode = firstSubnode;
				}
			} else {
				for (let i = keys.length - UNIT; i >= ZERO; i--) {
					const currentKey = keys[i];
					if (currentKey === undefined) {
						continue;
					}

					if (key >= currentKey) {
						nextNode = node.subnodes[i + UNIT];
						break;
					}
				}
			}

			if (!nextNode || nextNode === node) {
				break;
			}

			node = nextNode;
		}

		return node;
	}

	public delete(key: number, value: TValue): TValue | undefined {
		const leaf = this.findLeaf(key);
		const keyIdx = leaf.keys.indexOf(key);
		if (keyIdx === -1) {
			return undefined;
		}

		const values = leaf.values[keyIdx];
		if (values === undefined) {
			return undefined;
		}

		const valueIdx = values.indexOf(value);
		if (valueIdx === undefined) {
			return undefined;
		}

		const [deletedValue] = values.splice(valueIdx, UNIT);

		if (values.length === 0) {
			leaf.keys.splice(keyIdx, UNIT);
			leaf.values.splice(keyIdx, UNIT);
			this.fixUnderflow(leaf);
		}

		return deletedValue;
	}

	public insert(key: number, value: TValue): void {
		const leaf = this.findLeaf(key);
		leaf.insertInLeaf(key, value);
		this.fixOverflow(leaf);
	}

	public getMin(): [number | undefined, TValue | undefined] {
		let node: BPlusNode<TValue> = this.root;

		while (true) {
			const firstSubnode = node.subnodes[0];

			if (!firstSubnode) {
				break;
			}

			node = firstSubnode;
		}

		return [node.keys[0], node.values[0]?.[0]];
	}
}

export function printBPlusTree<TValue>(
	node: BPlusTree<TValue> | BPlusNode<TValue> | undefined,
	depth = ZERO,
): string {
	const output: string[] = [];

	if (node instanceof BPlusTree) {
		const rootNode = node.root;
		output.push(
			`order: ${node.order}`,
			rootNode.keys.length > ZERO ? printBPlusTree(rootNode) : "- ∄",
		);
	} else if (node !== undefined) {
		const keys = node.keys;
		const keyCount = keys.length;
		const values = node.values;
		const subnodes = node.subnodes;

		if (node.isInternal()) {
			if (keyCount === ZERO) {
				output.push(`- ${"  ".repeat(depth)}∄`);
			}

			for (let i = ZERO; i < keyCount; i++) {
				output.push(
					printBPlusTree(subnodes[i], depth + UNIT),
					`- ${"  ".repeat(depth)}${JSON.stringify(keys[i])}`,
				);
			}

			output.push(printBPlusTree(subnodes.at(-UNIT), depth + UNIT));
		} else {
			for (let i = ZERO; i < keyCount; i++) {
				output.push(
					`- ${"  ".repeat(depth)}${JSON.stringify(keys[i])} ${JSON.stringify(values[i])}`,
				);
			}
		}
	}

	return output.join("\n");
}
