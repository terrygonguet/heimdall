const dotenv = require("dotenv")
dotenv.config()
const { windowManager, Window } = require("node-window-manager")
const Data = require("./data.js")

const aux = process.env.AUX_TITLES.split(",").map(t => t.trim())
const master = process.env.MASTER_TITLE

new Data().then(
	/** @param {Data} data */
	data => {
		async function tick() {
			const windows = windowManager.getWindows().map(w => w.getTitle())
			const active = windowManager.getActiveWindow().getTitle()

			const masterTitle = windows.find(t => t.includes(master))
			const isTracking = !!masterTitle
			const isWorking =
				isTracking && [master, ...aux].some(t => active.includes(t))

			if (isTracking && isWorking) {
				data.track(masterTitle)
			}

			console.log("--------------------")
			for (const name in data.projects) {
				let d = data.projectDuration(name) / 60000
				console.log(`${name}: ${Math.round(d)}min`)
			}
		}
		process.addListener("SIGINT", () => data.save().then(process.exit))
		setInterval(tick, process.env.SAMPLE_INTERVAL)
		tick()
	},
)
