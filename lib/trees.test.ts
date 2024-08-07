import { describe, test } from "vitest";
import { BPlusTree, printBPlusTree } from "./trees.ts";

describe("BPlusTree", () => {
	test("A test", () => {
		const nodes = [
			[1, "abc"],
			[2, "def"],
			[3, "ghi"],
			[4, "jkl"],
			[5, "mno"],
			[6, "pqr"],
			[7, "stu"],
			[8, "vwx"],
			[9, "yz."],
		] as const;
		const tree = new BPlusTree<string>();
		for (const [key, value] of nodes) {
			// biome-ignore lint/nursery/noConsole: Testing
			console.log(key, value);
			tree.insert(key, value);
			// biome-ignore lint/nursery/noConsole: Testing
			console.log(printBPlusTree(tree));
		}
	});
});
