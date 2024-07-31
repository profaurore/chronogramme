import { expect, test } from "vitest";
import { css } from "./css.ts";

test("css", () => {
	expect(css`font-size: 13px;`).toEqual("font-size: 13px;");
	expect(css`color: #fff;`).toEqual("color: #fff;");
});
