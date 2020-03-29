import { onMount, onDestroy } from "svelte"

export const currencyFormatter = new Intl.NumberFormat(undefined, {
	style: "currency",
	currency: "EUR",
})

export const dateFormatter = new Intl.DateTimeFormat(undefined, {
	year: "numeric",
	month: "long",
	day: "2-digit",
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

/**
 * Calls `fn` every `t` ms and cleans up automatically
 * @param {Function} fn
 * @param {number} t
 * @param {boolean} immediate
 */
export function onInterval(fn, t, immediate) {
	let id
	onMount(() => {
		id = setInterval(fn, t)
		if (immediate) fn()
	})
	onDestroy(() => clearInterval(id))
}

/**
 * Trims `str` on the right so its length is at most `n`
 * @param {string} str
 * @param {number} n
 */
export function clampStr(str, n) {
	return str.length > n ? str.slice(0, n - 3) + "..." : str
}

/**
 * Converts the given number of ms in a human readable string
 * @param {number} ms
 */
export function ms2str(ms) {
	let amounts = []
	let names = ["week", "day", "hour", "minute"]
	let durations = [604800000, 86400000, 3600000, 60000]
	for (const [dur, i] of range(durations)) {
		if (ms < dur) continue
		const a = Math.floor(ms / dur)
		amounts.push(a + " " + names[i] + (a > 1 ? "s" : ""))
		ms = ms % dur
	}
	return amounts.join(" ")
}
