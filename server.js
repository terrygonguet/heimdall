const express = require("express")
const Data = require("./data.js")

/**
 * @param {Data} data
 */
module.exports = function(data) {
	const app = express()
	app.get("*", (req, res) => {
		let html = `<table><tr><th>Name</th><th>Duration</th></tr>`
		for (const name in data.projects) {
			let d = data.projectDuration(name)
			if (d < data.config.maxGap) continue
			html += `<tr><td>${name}</td><td>${Math.round(
				d / 60000,
			)}min</td></tr>`
		}
		html += `</table>`
		res.status(200).send(html)
	})

	return app
}
