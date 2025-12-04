import { Singleton } from "./singleton";
import css from "./styles.css?inline";

function buildScrollerStylesheet(): CSSStyleSheet {
	const stylesheet = new CSSStyleSheet();

	stylesheet.replaceSync(css);

	return stylesheet;
}

/** Lazily instanciated stylesheet singleton. */
export const scrollerStylesheet: Singleton<CSSStyleSheet> = new Singleton(
	buildScrollerStylesheet,
);
