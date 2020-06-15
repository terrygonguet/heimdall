import sirv from "sirv"
import polka from "polka"
import compression from "compression"
import * as sapper from "@sapper/server"
import * as dotenv from "dotenv"
import api from "./api"
import bodyParser from "body-parser"
import { connect } from "./db"
import monitor from "./monitor"

if (process.env.NODE_ENV != "production") dotenv.config()

const { PORT, NODE_ENV } = process.env
const dev = NODE_ENV != "production"

connect().then(async (config) => {
	monitor(config)
	polka()
		.use(bodyParser.json())
		.use("api", api(config))
		.use(
			compression({ threshold: 0 }),
			sirv("static", { dev }),
			sapper.middleware(),
		)
		.listen(PORT, (err) => {
			if (err) console.error("error", err)
		})
})
