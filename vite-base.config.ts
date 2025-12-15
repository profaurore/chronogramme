import path from "node:path";

const alias = {
	"@chronogramme/chronogramme": path.resolve(
		__dirname,
		"./packages/chronogramme/src",
	),

	"@chronogramme/chronogramme-rct": path.resolve(
		__dirname,
		"./packages/chronogramme-rct/src",
	),
} as const;

export const baseViteConfig = {
	optimizeDeps: {
		exclude: Object.keys(alias),
	},

	resolve: {
		alias,
		preserveSymlinks: true,
	},

	server: {
		fs: {
			allow: Object.values(alias).map((item) => path.resolve(item, "..")),
		},
	},
} as const;
