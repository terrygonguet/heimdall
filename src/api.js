import Data from "./data"
import { ServerResponse, IncomingMessage } from "http"
import polka from "polka"
import send from "@polka/send-type"
import { windowManager, Window } from "node-window-manager"

/**
 * @typedef {(req: IncomingMessage, res: ServerResponse, next: Function) => void} RouteHandler
 */

/**
 * @param {Data} data
 */
export default function(data) {
	const app = polka()
	app.get(
		"config",
		/** @type {RouteHandler} */
		(req, res) => send(res, 200, { error: false, data: data.config }),
	)
	app.put(
		"config",
		/** @type {RouteHandler} */
		(req, res) => {
			for (const key in data.config) {
				if (req.body[key] != undefined) data.config[key] = req.body[key]
			}
			data.save().then(() =>
				send(res, 200, { error: false, data: data.config }),
			)
		},
	)
	app.get(
		"curwindows",
		/** @type {RouteHandler} */
		(req, res) => {
			const windows = windowManager.getWindows().map(w => w.getTitle())
			send(res, 200, { error: false, data: windows })
		},
	)
	app.get(
		"duration/:project",
		/** @type {RouteHandler} */
		(req, res) =>
			send(res, 200, {
				error: false,
				data: data.projectDuration(req.params.project),
			}),
	)
	app.get(
		"projects",
		/** @type {RouteHandler} */
		(req, res) =>
			send(res, 200, { error: false, data: data.allProjects() }),
	)
	app.delete(
		"project/:project",
		/** @type {RouteHandler} */
		(req, res) => {
			data.deleteProject(req.params.project)
			data.save().then(() =>
				send(res, 200, {
					error: false,
					data: data.allProjects(),
				}),
			)
		},
	)
	app.use(
		/** @type {RouteHandler} */
		(req, res) =>
			send(res, 400, {
				error: true,
				message: "This route does not exist",
			}),
	)
	return app
}
