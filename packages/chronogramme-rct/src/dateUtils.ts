import { UNIT } from "@chronogramme/chronogramme";
import type { LabelFormatFn, Unit } from "./DateHeader";

// Adapted from: https://stackoverflow.com/a/6117889
const weekOfYear = (time: number): number => {
	const date = new Date(time);
	// Copy date so don't modify original
	const d = new Date(
		Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
	);
	// Set to nearest Thursday: current date + 4 - current day number
	// Make Sunday's day number 7
	d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
	// Get first day of year
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	// Calculate full weeks to nearest Thursday
	const weekNo = Math.ceil(
		((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
	);
	// Return array of year and week number
	return weekNo;
};

export function startOfUnit(unit: Unit, time: number): number {
	const date = new Date(time);

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
	if (step <= 1) {
		return time;
	}

	const date = new Date(time);

	switch (unit) {
		case "year": {
			const year = date.getFullYear();
			date.setFullYear(year - (year % step));
			break;
		}

		// Months are unusual because they vary in length and repeat every year. If
		// the step is greater than or equal to one year, perform the alignment on a
		// year basis. If the step is less than one year, perform the alignment on a
		// divisor of 12 so that the yearly cycle is maintained.
		case "month": {
			if (step >= 12) {
				const yearsStep = Math.round(step / 12);
				const year = date.getFullYear();
				date.setFullYear(year - (year % yearsStep));
				date.setMonth(0);
				break;
			}

			// Only align on divisors of 12. Get the closest value, favoring a higher
			// value in the case of a tie so that cells are larger as opposed to
			// smaller.
			let monthStep = 0;
			let bestDiff = Number.POSITIVE_INFINITY;
			for (const option of [1, 2, 3, 4, 6, 12]) {
				const diff = Math.abs(step - option);
				if (diff <= bestDiff) {
					monthStep = option;
					bestDiff = diff;
				}
			}

			const month = date.getMonth();
			date.setMonth(month - (month % monthStep));
			break;
		}

		case "week": {
			date.setTime(time - (time % 604_800_000));
			break;
		}

		case "day": {
			date.setTime(time - (time % 86_400_000));
			break;
		}

		case "hour": {
			date.setTime(time - (time % 3_600_000));
			break;
		}

		case "minute": {
			date.setTime(time - (time % 60_000));
			break;
		}

		case "second": {
			date.setTime(time - (time % 1000));
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
			date.setDate(date.getDate() + step * 7);
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

export const defaultLabelFormat: LabelFormatFn = function defaultLabelFormat(
	[timeStart],
	unit,
	labelWidth,
) {
	const unitFormatters = formatOptions[unit];
	let format: (time: number) => string;

	if (labelWidth >= 150) {
		format = unitFormatters.long;
	} else if (labelWidth >= 100) {
		format = unitFormatters.mediumLong;
	} else if (labelWidth >= 50) {
		format = unitFormatters.medium;
	} else {
		format = unitFormatters.short;
	}

	return format(timeStart);
};
