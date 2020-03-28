const dotenv = require("dotenv")
dotenv.config()
const { windowManager, Window } = require("node-window-manager")
const Data = require("./data")
const server = require("./server")

new Data().then(
	/** @param {Data} data */
	data => {
		async function tick() {
			const windows = windowManager.getWindows().map(w => w.getTitle())
			const active = windowManager.getActiveWindow().getTitle()
			const master = data.config.masterTitle
			const aux = data.config.auxTitles

			const masterTitle = windows.find(t => t.includes(master))
			const isTracking = !!masterTitle
			const isWorking =
				isTracking && [master, ...aux].some(t => active.includes(t))

			if (isTracking && isWorking) {
				data.track(masterTitle)
			}

			setTimeout(tick, data.config.sampleInterval)
		}
		tick()
		process.addListener("SIGINT", () => data.save().then(process.exit))
		process.addListener("uncaughtException", () =>
			data.save().then(process.exit),
		)

		const app = server()
		app.listen(process.env.PORT || 3000, () =>
			console.log(`UI served on port ${process.env.PORT || 3000}`),
		)
	},
)
