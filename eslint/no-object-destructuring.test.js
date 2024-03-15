"use strict";

import rule from "./no-object-destructuring-rule.js";
import { RuleTester } from "eslint";

const ruleTester = new RuleTester({
	parserOptions: {
		ecmaVersion: "latest",
	},
});

ruleTester.run("no-object-destructuring", rule, {
	valid: [
		{
			code: "const a = x.a",
		},
	],

	invalid: [
		{
			code: "const { a, b: c } = x",
			errors: [{ message: rule.meta.messages.objectDestructuring }],
		},
	],
});
