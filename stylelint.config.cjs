module.exports = {
  extends: [
    "stylelint-config-recommended",
    "stylelint-config-styled-components",
    "stylelint-config-prettier",
    "stylelint-config-html",
  ],
  ignoreFiles: ["**/*.json", "yarn.lock", ".*", ".husky/**/*"],
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
  processors: ["stylelint-processor-styled-components"],
  rules: {
    "color-named": "never",
    "declaration-no-important": true,
    "declaration-property-value-no-unknown": true,
    "media-feature-name-value-no-unknown": true,
    "no-unknown-animations": true,
    "selector-no-qualifying-type": true,
  },
};
