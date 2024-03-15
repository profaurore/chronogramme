/**
 * @author Toru Nagashima
 *   [https://github.com/mysticatea](https://github.com/mysticatea) See
 *   LICENSE file in root directory for full license.
 */
"use strict";

export default {
	meta: {
		fixable: "code",
		messages: {
			objectDestructuring: "Object destructuring is forbidden.",
		},
		schema: [],
		type: "problem",
	},
	create(context) {
		return {
			":matches(:function, AssignmentExpression, VariableDeclarator, :function > :matches(AssignmentPattern, RestElement), ForInStatement, ForOfStatement) > ObjectPattern"(
				node,
			) {
				context.report({
					node,
					messageId: "objectDestructuring",
				});
			},
		};
	},
};
