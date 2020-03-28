import Data from "./data"
import { ServerResponse, IncomingMessage } from "http"
import polka from "polka"

/**
 * @typedef {(req: IncomingMessage, res: ServerResponse, next: Function) => void} RouteHandler
 */

/**
 * @param {Data} data
 */
export default function(data) {
	const app = polka()
	app.use(
		/** @type {RouteHandler} */
		(req, res, next) => {
			res.setHeader("Content-Type", "application/json")
			next()
		},
	)
	app.get(
		"config",
		/** @type {RouteHandler} */
		(req, res) => {
			res.write(JSON.stringify({ error: false, data: data.config }))
			res.end()
		},
	)
	app.get(
		"duration/:project",
		/** @type {RouteHandler} */
		(req, res, next) => {
			const { project } = req.params
			res.write(
				JSON.stringify({
					error: false,
					data: data.projectDuration(project),
				}),
			)
			res.end()
		},
	)
	app.use(
		/** @type {RouteHandler} */
		(req, res, next) => {
			res.statusCode = 400
			res.write(
				JSON.stringify({
					error: true,
					message: "This route does not exist",
				}),
			)
			res.end()
		},
	)
	return app
}
