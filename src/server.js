import sirv from "sirv"
import polka from "polka"
import compression from "compression"
import * as sapper from "@sapper/server"
import Data from "./data"
import * as dotenv from "dotenv"
import api from "./api"
import { windowManager, Window } from "node-window-manager"
import bodyParser from "body-parser"

if (process.env.NODE_ENV == "development") dotenv.config()

const { PORT, NODE_ENV } = process.env
const dev = NODE_ENV === "development"

new Data()
	.then(data => {
		polka()
			.use(bodyParser.json())
			.use("api", api(data))
			.use(
				compression({ threshold: 0 }),
				sirv("static", { dev }),
				sapper.middleware(),
			)
			.listen(PORT, err => {
				if (err) console.log("error", err)
			})

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

		process.on("SIGINT", () => data.save().then(process.exit))
		process.on("uncaughtException", () => data.save().then(process.exit))
		process.on("beforeExit", () => data.save().then(process.exit))
		process.on("exit", () => data.saveSync())
	})
	.catch(console.error)
