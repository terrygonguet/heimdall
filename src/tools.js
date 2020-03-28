export const currencyFormatter = new Intl.NumberFormat(undefined, {
	style: "currency",
	currency: "EUR"
})

export const dateFormatter = new Intl.DateTimeFormat(undefined, {
	year: "numeric",
	month: "long",
	day: "2-digit"
})

/**
 * Returns an iterator going from `from` to `to` or over the length
 * of the array if it is the only parameter
 * @param {number|any[]} from start of the range or an array
 * @param {number=} to end of the range (inclusive, optional)
 * @param {number=} step defaults to 1
 */
export function* range(from, to, step = 1) {
	let isarray = Array.isArray(from),
		f = isarray ? 0 : from,
		t = isarray ? from.length - 1 : to
	for (let i = f; i <= t; i += step) yield isarray ? [from[i], i] : i
}
