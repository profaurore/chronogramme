import * as emotion from "@emotion/eslint-plugin";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";
import jsdoc from "eslint-plugin-jsdoc";
import nodePlugin from "eslint-plugin-n";
import perfectionist from "eslint-plugin-perfectionist";
import perfectionistNatural from "eslint-plugin-perfectionist/configs/recommended-natural";
import jsxRuntime from "eslint-plugin-react/configs/jsx-runtime.js";
import reactRecommended from "eslint-plugin-react/configs/recommended.js";
import pluginReactRefresh from "eslint-plugin-react-refresh";
import typescriptSortKeys from "eslint-plugin-typescript-sort-keys";
import globals from "globals";
import path from "path";
import { fileURLToPath } from "url";

// For converting legacy plugins to the new flat config.
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const compat = new FlatCompat({
	baseDirectory: dirname,
});

// Files
const javascriptConfigs = ["eslint.config.js"];
const tsProjectConfigs = [
	"tsconfig.json",
	"tsconfig.lib.json",
	"tsconfig.node.json",
];
const tsxFiles = ["**/*.tsx"];
const tsFiles = ["**/*.ts", "**/*.d.ts", ...tsxFiles];
const jsLikeFiles = ["**/*.js", ...tsFiles];

const config = [
	{
		ignores: ["coverage", "dist"],
	},

	// Node
	nodePlugin.configs["flat/recommended-module"],

	// Javascript
	js.configs.recommended,

	// React
	{
		...reactRecommended,
		settings: {
			react: {
				version: "999.999.999",
			},
		},
	},
	jsxRuntime,

	// React Hooks
	...compat.extends("plugin:react-hooks/recommended"),

	// Typescript defaults
	...compat
		.extends("plugin:@typescript-eslint/strict-type-checked")
		.map((plugin) => {
			// Ignore JSON and JS configuration files.
			plugin.files = tsFiles;

			// `languageOptions.parserOptions.project` is required for
			// `@typescript-eslint/await-thenable`.
			plugin.languageOptions = {
				...plugin.languageOptions,
				parserOptions: {
					...plugin.parserOptions,
					project: tsProjectConfigs,
				},
			};

			return plugin;
		}),
	...compat
		.extends("plugin:@typescript-eslint/stylistic-type-checked")
		.map((plugin) => {
			// Ignore JSON and JS configuration files.
			plugin.files = tsFiles;

			return plugin;
		}),

	// Javascript
	{
		files: jsLikeFiles,
		plugins: {
			"@stylistic": stylistic,
		},
		rules: (() => {
			const possibleProblemRules = {
				"array-callback-return": "error",
				"no-constant-binary-expression": "error",
				"no-duplicate-imports": "error",
				"no-new-native-nonconstructor": "error",
				"no-promise-executor-return": "error",
				"no-prototype-builtins": "error",
				"no-self-compare": "error",
				"no-template-curly-in-string": "error",
				"no-unmodified-loop-condition": "error",
				"no-unreachable-loop": "error",
				"no-unused-private-class-members": "error",
				"require-atomic-updates": "error",
			};

			const suggestionRules = {
				"accessor-pairs": "error",
				"arrow-body-style": "error",
				"camelcase": "error",
				"curly": "error",
				"default-case-last": "error",
				"dot-notation": "warn",
				"eqeqeq": "warn",
				"func-name-matching": "error",
				"func-names": "error",
				"func-style": "error",
				"grouped-accessor-pairs": "error",
				"logical-assignment-operators": "warn",
				"multiline-comment-style": ["warn", "separate-lines"],
				"no-alert": "error",
				"no-array-constructor": "error",
				"no-bitwise": "error",
				"no-caller": "error",
				"no-console": "warn",
				"no-else-return": "warn",
				"no-empty-static-block": "error",
				"no-eval": "error",
				"no-extend-native": "error",
				"no-extra-bind": "warn",
				"no-implicit-coercion": ["warn", { disallowTemplateShorthand: true }],
				"no-implicit-globals": "error",
				"no-implied-eval": "error",
				"no-inline-comments": "error",
				"no-invalid-this": "error",
				"no-iterator": "error",
				"no-labels": "error",
				"no-lonely-if": "warn",
				"no-multi-assign": "error",
				"no-multi-str": "error",
				"no-negated-condition": "error",
				"no-nested-ternary": "error",
				"no-new": "error",
				"no-new-func": "error",
				"no-new-wrappers": "error",
				"no-octal-escape": "error",
				"no-param-reassign": "error",
				"no-plusplus": "error",
				"no-proto": "error",
				"no-return-assign": "error",
				"no-script-url": "error",
				"no-sequences": "error",
				"no-throw-literal": "error",
				"no-underscore-dangle": "error",
				"no-unneeded-ternary": "warn",
				"no-useless-call": "error",
				"no-useless-computed-key": "warn",
				"no-useless-concat": "error",
				"no-useless-constructor": "error",
				"no-useless-rename": "warn",
				"no-useless-return": "warn",
				"no-var": "warn",
				"no-void": "error",
				"no-warning-comments": "error",
				"object-shorthand": "warn",
				"operator-assignment": "warn",
				"prefer-arrow-callback": "warn",
				"prefer-const": "warn",
				"prefer-destructuring": "warn",
				"prefer-exponentiation-operator": "warn",
				"prefer-named-capture-group": "error",
				"prefer-numeric-literals": "warn",
				"prefer-object-has-own": "warn",
				"prefer-object-spread": "warn",
				"prefer-promise-reject-errors": "error",
				"prefer-regex-literals": "error",
				"prefer-rest-params": "error",
				"prefer-spread": "error",
				"prefer-template": "warn",
				"radix": ["error", "as-needed"],
				"require-await": "error",
				"require-unicode-regexp": "error",
				"require-yield": "error",
				"sort-keys": "error",
				"strict": ["warn", "never"],
				"symbol-description": "error",
				"yoda": "warn",
			};

			const stylisticRules = {
				"@stylistic/lines-around-comment": [
					"warn",
					{
						allowArrayStart: true,
						allowBlockEnd: true,
						allowBlockStart: true,
						allowClassStart: true,
						allowEnumStart: true,
						allowInterfaceStart: true,
						allowModuleStart: true,
						allowObjectStart: true,
						allowTypeStart: true,
						beforeBlockComment: true,
						beforeLineComment: true,
					},
				],
				"@stylistic/lines-between-class-members": "warn",
				"@stylistic/max-len": [
					"warn",
					{
						code: 80,
						ignoreComments: false,
						ignorePattern: "^\\s*// eslint-disable-next-line.*",
						ignoreRegExpLiterals: true,
						ignoreStrings: true,
						ignoreTemplateLiterals: true,
						ignoreUrls: true,
						tabWidth: 2,
					},
				],
				"@stylistic/no-floating-decimal": "warn",
				"@stylistic/padding-line-between-statements": [
					"warn",

					// Line before
					{
						blankLine: "always",
						next: [
							"return",
							"case",
							"default",
							"block",
							"class",
							"do",
							"export",
							"for",
							"function",
							"if",
							"iife",
							"switch",
							"try",
							"while",
						],
						prev: "*",
					},

					// Line after
					{ blankLine: "always", next: "*", prev: ["block-like", "import"] },

					// No lines between
					{ blankLine: "any", next: "import", prev: "import" },
				],
				"@stylistic/quotes": ["warn", "double"],
				"@stylistic/spaced-comment": [
					"warn",
					"always",
					{
						block: {
							balanced: true,
						},
						line: {
							markers: ["/"],
						},
					},
				],
			};

			return {
				...possibleProblemRules,
				...suggestionRules,
				...stylisticRules,
			};
		})(),
	},

	// TSX
	{
		files: tsxFiles,
		rules: {
			// JSX
			"react/jsx-no-useless-fragment": "warn",
			"react/prefer-read-only-props": "warn",
		},
	},

	// Typescript
	{
		files: tsFiles,
		languageOptions: {
			globals: {
				...globals.browser,
			},
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: "latest",
				project: tsProjectConfigs,
				tsconfigRootDir: dirname,
			},
			sourceType: "module",
		},
		linterOptions: {
			reportUnusedDisableDirectives: true,
		},
		plugins: {
			"@emotion": emotion,
			perfectionist,
			"react-refresh": pluginReactRefresh,
			"typescript-sort-keys": typescriptSortKeys,
		},
		rules: (() => {
			const javascriptOverrideRules = {
				"default-param-last": "off",
				"no-loop-func": "off",
				"no-magic-numbers": "off",
				"no-unused-expressions": "off",
				"no-use-before-define": "off",
			};

			const typescriptRules = {
				// Typescript
				"@typescript-eslint/class-methods-use-this": [
					"error",
					{ ignoreOverrideMethods: true },
				],
				"@typescript-eslint/consistent-type-exports": "warn",
				"@typescript-eslint/consistent-type-imports": "warn",
				"@typescript-eslint/default-param-last": "error",
				"@typescript-eslint/explicit-function-return-type": "error",
				"@typescript-eslint/explicit-member-accessibility": "warn",
				"@typescript-eslint/explicit-module-boundary-types": "error",
				"@typescript-eslint/method-signature-style": ["warn", "property"],
				"@typescript-eslint/naming-convention": [
					"error",
					{
						format: ["strictCamelCase"],
						leadingUnderscore: "allow",
						selector: "default",
						trailingUnderscore: "allow",
					},

					// CSS Variables in Objects and Types
					{
						filter: "--[a-z](?:-[a-z])*",
						format: [],
						selector: ["objectLiteralProperty", "typeProperty"],
					},

					{
						format: ["strictCamelCase", "UPPER_CASE"],
						leadingUnderscore: "allow",
						selector: "variable",
						trailingUnderscore: "allow",
						types: ["array", "boolean", "number", "string"],
					},

					{
						format: ["strictCamelCase", "PascalCase"],
						leadingUnderscore: "allow",
						selector: ["variable", "import"],
						trailingUnderscore: "allow",
						types: ["function"],
					},

					{
						format: ["PascalCase"],
						selector: ["enumMember", "typeLike"],
					},
				],
				"@typescript-eslint/no-empty-function": [
					"error",
					{ allow: ["overrideMethods"] },
				],
				"@typescript-eslint/no-import-type-side-effects": "warn",
				"@typescript-eslint/no-loop-func": "error",
				"@typescript-eslint/no-magic-numbers": [
					"error",
					{ ignoreTypeIndexes: true },
				],
				"@typescript-eslint/no-require-imports": "error",
				"@typescript-eslint/no-unnecessary-qualifier": "warn",
				"@typescript-eslint/no-unused-expressions": "error",
				"@typescript-eslint/no-use-before-define": "error",
				"@typescript-eslint/no-useless-empty-export": "warn",
				"@typescript-eslint/parameter-properties": "error",
				"@typescript-eslint/prefer-readonly": "warn",
				"@typescript-eslint/prefer-readonly-parameter-types": [
					"error",
					{
						allow: [
							"MutationRecord",
							"MutationObserver",
							"ResizeObserver",
							"ResizeObserverEntry",
							"VitePluginOptions",
						],
						ignoreInferredTypes: true,
					},
				],
				"@typescript-eslint/prefer-regexp-exec": "warn",
				"@typescript-eslint/promise-function-async": "warn",
				"@typescript-eslint/require-array-sort-compare": "error",
				"@typescript-eslint/strict-boolean-expressions": "warn",
				"@typescript-eslint/switch-exhaustiveness-check": "error",
			};

			const reactRefreshRules = {
				"react-refresh/only-export-components": [
					"warn",
					{
						allowConstantExport: true,
					},
				],
			};

			const emotionRules = {
				"@emotion/styled-import": "error",
				"@emotion/syntax-preference": ["error", "string"],
			};

			return {
				...javascriptOverrideRules,
				...typescriptRules,
				...reactRefreshRules,
				...emotionRules,
			};
		})(),
	},

	// Common JS
	{
		files: ["**/*.cjs"],
		languageOptions: {
			globals: {
				...globals.browser,
				module: true,
			},
		},
	},

	{
		files: ["**/*.test.ts", "**/*.test.tsx"],
		rules: {
			"@typescript-eslint/no-magic-numbers": "off",
		},
	},

	// JSON
	...compat.extends("plugin:jsonc/recommended-with-json"),

	// JSON with comments
	{
		files: [
			"**/*.jsonc",
			".vscode/settings.json",
			"tsconfig.base.json",
			...tsProjectConfigs,
		],
		languageOptions: {},
		rules: {
			"jsonc/no-comments": "off",
		},
	},

	// Javascript
	{
		files: javascriptConfigs,
	},

	// JS Docs
	jsdoc.configs["flat/recommended-typescript"],

	{
		rules: {
			"jsdoc/tag-lines": ["warn", "any", { startLines: 1 }],
		},
	},

	// Ordering
	perfectionistNatural,

	// Vitest
	...compat.extends("plugin:vitest/recommended"),

	// ESLint
	...compat.extends("plugin:eslint-comments/recommended"),

	// Disable ESLint rules that conflict with Prettier
	(() => {
		const config = eslintConfigPrettier;

		// The selected configuration for the `curly` rule does not conflict
		// with prettier.
		delete config.rules.curly;

		return config;
	})(),
	...compat.extends("plugin:jsonc/prettier"),
];

export default config;
