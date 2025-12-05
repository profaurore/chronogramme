import { UNIT, ZERO } from "@chronogramme/chronogramme";
import type { LabelFormatFn, Unit } from "../headers/DateHeader";

const MILLISECONDS_PER_SECOND = 1000;
const MILLISECONDS_PER_DAY = 86_400_000;
const MILLISECONDS_PER_WEEK = 604_800_000;
const DAYS_PER_WEEK = 7;
const MONTHS_PER_YEAR = 12;

// biome-ignore lint/style/noMagicNumbers: Math constants
const DIVISORS_OF_TWELVE: number[] = [1, 2, 3, 4, 6, 12];

const THURSDAY_DAY = 4;
const SUNDAY_DAY = 7;

const MEDIUM_LABEL_WIDTH = 50;
const MEDIUM_LONG_LABEL_WIDTH = 100;
const LONG_LABEL_WIDTH = 150;

// Adapted from: https://stackoverflow.com/a/6117889
const weekOfYear = (time: number): number => {
	const date = new Date(time);

	// Copy date so don't modify original
	const d = new Date(
		Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
	);

	// Set to nearest Thursday: current date + 4 - current day number
	// Make Sunday's day number 7
	d.setUTCDate(d.getUTCDate() + THURSDAY_DAY - (d.getUTCDay() || SUNDAY_DAY));

	// Get first day of year
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), ZERO, UNIT));

	// Calculate full weeks to nearest Thursday
	const weekNo = Math.ceil(
		((d.getTime() - yearStart.getTime()) / MILLISECONDS_PER_DAY + UNIT) /
			DAYS_PER_WEEK,
	);

	// Return array of year and week number
	return weekNo;
};

const formatOptions = {
	year: {
		long: (time: number) =>
			new Intl.DateTimeFormat("en-us", { year: "numeric" }).format(time),
		mediumLong: (time: number) =>
			new Intl.DateTimeFormat("en-us", { year: "numeric" }).format(time),
		medium: (time: number) =>
			new Intl.DateTimeFormat("en-us", { year: "numeric" }).format(time),
		short: (time: number) =>
			new Intl.DateTimeFormat("en-us", { year: "2-digit" }).format(time),
	},
	month: {
		long: (time: number) =>
			new Intl.DateTimeFormat("en-us", {
				month: "long",
				year: "numeric",
			}).format(time),
		mediumLong: (time: number) =>
			new Intl.DateTimeFormat("en-us", { month: "long" }).format(time),
		medium: (time: number) =>
			new Intl.DateTimeFormat("en-us", { month: "long" }).format(time),
		short: (time: number) =>
			new Intl.DateTimeFormat("en-us", {
				month: "2-digit",
				year: "2-digit",
			}).format(time),
	},
	week: {
		long: (time: number) => weekOfYear(time).toString(),
		mediumLong: (time: number) => weekOfYear(time).toString(),
		medium: (time: number) => weekOfYear(time).toString(),
		short: (time: number) => weekOfYear(time).toString(),
	},
	day: {
		long: (time: number) =>
			new Intl.DateTimeFormat("en-us", {
				weekday: "long",
				month: "long",
				day: "numeric",
				year: "numeric",
			}).format(time),
		mediumLong: (time: number) =>
			new Intl.DateTimeFormat("en-us", {
				weekday: "long",
				month: "long",
				day: "numeric",
				year: "numeric",
			}).format(time),
		medium: (time: number) => {
			const parts = new Intl.DateTimeFormat("en-us", {
				weekday: "short",
				day: "numeric",
			}).formatToParts(time);

			const weekday = parts.find((p) => p.type === "weekday")?.value;
			const day = parts.find((p) => p.type === "day")?.value;

			return `${weekday?.substring(0, 2)} ${day}`;
		},
		short: (time: number) =>
			new Intl.DateTimeFormat("en-us", { day: "numeric" }).format(time),
	},
	hour: {
		long: (time: number) => {
			const parts = new Intl.DateTimeFormat("en-us", {
				weekday: "long",
				month: "long",
				day: "numeric",
				year: "numeric",
				hour: "2-digit",
				hourCycle: "h23",
			}).formatToParts(time);

			const weekday = parts.find((p) => p.type === "weekday")?.value;
			const month = parts.find((p) => p.type === "month")?.value;
			const day = parts.find((p) => p.type === "day")?.value;
			const year = parts.find((p) => p.type === "year")?.value;
			const hour = parts.find((p) => p.type === "hour")?.value;

			return `${weekday}, ${month} ${day}, ${year}, ${hour}:00`;
		},
		mediumLong: (time: number) =>
			`${new Intl.DateTimeFormat("en-us", {
				month: "2-digit",
				day: "2-digit",
				year: "numeric",
				hour: "2-digit",
				hourCycle: "h23",
			}).format(time)}:00`,
		medium: (time: number) =>
			`${new Intl.DateTimeFormat("en-us", { hour: "2-digit", hourCycle: "h23" }).format(time)}:00`,
		short: (time: number) =>
			new Intl.DateTimeFormat("en-us", {
				hour: "2-digit",
				hourCycle: "h23",
			}).format(time),
	},
	minute: {
		long: (time: number) =>
			new Intl.DateTimeFormat("en-us", {
				hour: "2-digit",
				hourCycle: "h23",
				minute: "2-digit",
			}).format(time),
		mediumLong: (time: number) =>
			new Intl.DateTimeFormat("en-us", {
				hour: "2-digit",
				hourCycle: "h23",
				minute: "2-digit",
			}).format(time),
		medium: (time: number) =>
			new Intl.DateTimeFormat("en-us", {
				hour: "2-digit",
				hourCycle: "h23",
				minute: "2-digit",
			}).format(time),
		short: (time: number) =>
			new Intl.DateTimeFormat("en-us", {
				minute: "2-digit",
			}).format(time),
	},
	second: {
		long: (time: number) =>
			new Intl.DateTimeFormat("en-us", {
				minute: "2-digit",
				second: "2-digit",
			}).format(time),
		mediumLong: (time: number) =>
			new Intl.DateTimeFormat("en-us", {
				minute: "2-digit",
				second: "2-digit",
			}).format(time),
		medium: (time: number) =>
			new Intl.DateTimeFormat("en-us", {
				minute: "2-digit",
				second: "2-digit",
			}).format(time),
		short: (time: number) =>
			new Intl.DateTimeFormat("en-us", {
				second: "2-digit",
			}).format(time),
	},
} as const;

export const MILLISECONDS_PER_MINUTE = 60_000;
export const MILLISECONDS_PER_FIFTEEN_MINUTES = 900_000;
export const MILLISECONDS_PER_HOUR = 3_600_000;

export function startOfUnit(unit: Unit, time: number): number {
	const date = new Date(time);

	// biome-ignore lint/nursery/noUnnecessaryConditions: Biome bug - https://github.com/biomejs/biome/issues/8332
	switch (unit) {
		case "year": {
			date.setMonth(0, 0);
			date.setHours(0, 0, 0, 0);
			break;
		}

		case "month": {
			date.setDate(0);
			date.setHours(0, 0, 0, 0);
			break;
		}

		case "week": {
			date.setHours(0, 0, 0, 0);
			date.setDate(date.getDate() - date.getDay());
			break;
		}

		case "day": {
			date.setHours(0, 0, 0, 0);
			break;
		}

		case "hour": {
			date.setMinutes(0, 0, 0);
			break;
		}

		case "minute": {
			date.setSeconds(0, 0);
			break;
		}

		case "second": {
			date.setMilliseconds(0);
			break;
		}

		default:
			break;
	}

	return date.getTime();
}

export function alignWithUnitStep(
	unit: Unit,
	step: number,
	time: number,
): number {
	if (step < 1) {
		return time;
	}

	const date = new Date(time);

	// biome-ignore lint/nursery/noUnnecessaryConditions: Biome bug - https://github.com/biomejs/biome/issues/8332
	switch (unit) {
		case "year": {
			const year = date.getFullYear();
			date.setFullYear(year - (year % step), 0, 1);
			date.setHours(0, 0, 0, 0);
			break;
		}

		// Months are unusual because they vary in length and repeat every year. If
		// the step is greater than or equal to one year, perform the alignment on a
		// year basis. If the step is less than one year, perform the alignment on a
		// divisor of 12 so that the yearly cycle is maintained.
		case "month": {
			if (step >= MONTHS_PER_YEAR) {
				const yearsStep = Math.round(step / MONTHS_PER_YEAR);
				const year = date.getFullYear();
				date.setFullYear(year - (year % yearsStep), 0, 1);
				date.setHours(0, 0, 0, 0);
				break;
			}

			// Only align on divisors of 12. Get the closest value, favoring a higher
			// value in the case of a tie so that cells are larger as opposed to
			// smaller.
			let monthStep = 0;
			let bestDiff = Number.POSITIVE_INFINITY;
			for (const option of DIVISORS_OF_TWELVE) {
				const diff = Math.abs(step - option);
				if (diff <= bestDiff) {
					monthStep = option;
					bestDiff = diff;
				}
			}

			const month = date.getMonth();
			date.setMonth(month - (month % monthStep), 1);
			date.setHours(0, 0, 0, 0);
			break;
		}

		case "week": {
			date.setTime(time - (time % MILLISECONDS_PER_WEEK));
			break;
		}

		case "day": {
			date.setTime(time - (time % MILLISECONDS_PER_DAY));
			break;
		}

		case "hour": {
			date.setTime(time - (time % MILLISECONDS_PER_HOUR));
			break;
		}

		case "minute": {
			date.setTime(time - (time % MILLISECONDS_PER_MINUTE));
			break;
		}

		case "second": {
			date.setTime(time - (time % MILLISECONDS_PER_SECOND));
			break;
		}

		default:
			break;
	}

	return date.getTime();
}

export function addUnitStep(unit: Unit, step: number, time: number): number {
	if (step < 1) {
		throw new Error("Step < 1 shouldn't happen!");
	}

	const date = new Date(time);

	// biome-ignore lint/nursery/noUnnecessaryConditions: Biome bug - https://github.com/biomejs/biome/issues/8332
	switch (unit) {
		case "year": {
			date.setFullYear(date.getFullYear() + step * UNIT);
			break;
		}

		case "month": {
			date.setMonth(date.getMonth() + step * UNIT);
			break;
		}

		case "week": {
			date.setDate(date.getDate() + step * DAYS_PER_WEEK);
			break;
		}

		case "day": {
			date.setDate(date.getDate() + step * UNIT);
			break;
		}

		case "hour": {
			date.setHours(date.getHours() + step * UNIT);
			break;
		}

		case "minute": {
			date.setMinutes(date.getMinutes() + step * UNIT);
			break;
		}

		case "second": {
			date.setSeconds(date.getSeconds() + step * UNIT);
			break;
		}

		default:
			break;
	}

	return date.getTime();
}

export const defaultLabelFormat: LabelFormatFn = function defaultLabelFormat(
	[timeStart]: [number, number],
	unit: Unit,
	labelWidth: number,
) {
	const unitFormatters = formatOptions[unit];
	let format: (time: number) => string;

	if (labelWidth >= LONG_LABEL_WIDTH) {
		format = unitFormatters.long;
	} else if (labelWidth >= MEDIUM_LONG_LABEL_WIDTH) {
		format = unitFormatters.mediumLong;
	} else if (labelWidth >= MEDIUM_LABEL_WIDTH) {
		format = unitFormatters.medium;
	} else {
		format = unitFormatters.short;
	}

	return format(timeStart);
};
