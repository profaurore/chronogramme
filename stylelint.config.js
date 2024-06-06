export default {
	extends: ["stylelint-config-html", "stylelint-config-standard"],
	ignoreFiles: [
		".*",
		".vscode/**/*",
		"**/*.json",
		"**/*.jsonc",
		"**/*.log",
		"**/*.tsbuildinfo",
		"**/*.yml",
		"coverage/**/*",
		"dist/**/*",
		"node_modules/**/*",
		"yarn.lock",
	],
	overrides: [
		{
			customSyntax: "postcss-jsx",
			files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.cjs", "**/*.jsx"],
		},
		{
			customSyntax: "postcss-styled-syntax",
			files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.cjs", "**/*.jsx"],
		},
		{
			customSyntax: "postcss-html",
			files: ["**/*.html"],
		},
		{
			customSyntax: "postcss-markdown",
			files: ["**/*.md"],
		},
	],
	rules: {
		"color-named": "never",
		"declaration-no-important": true,
		"declaration-property-value-no-unknown": true,
		"media-feature-name-value-no-unknown": true,
		"no-unknown-animations": true,
		"selector-no-qualifying-type": true,
	},
};
