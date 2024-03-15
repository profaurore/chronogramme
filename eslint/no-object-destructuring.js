"use strict";

import noObjectDestructuringRule from "./no-object-destructuring-rule.js";

export default {
	plugins: {
		"no-object-destructuring": {
			meta: {
				name: "no-object-destructuring",
				version: "1.0.0",
			},
			rules: {
				"no-object-destructuring": noObjectDestructuringRule,
			},
		},
	},
	rules: {
		"no-object-destructuring/no-object-destructuring": "warn",
	},
};
