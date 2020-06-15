import Data from "./monitor"
import { ServerResponse, IncomingMessage } from "http"
import polka from "polka"
import send from "@polka/send-type"
import { windowManager, Window } from "node-window-manager"
import { Document } from "mongoose"
import { configKeys, Project } from "./db"

/**
 * @typedef {(req: IncomingMessage, res: ServerResponse, next: Function) => void} RouteHandler
 */

/**
 * @param {Document} config
 */
export default function(config) {
	const app = polka()
	app.get(
		"config",
		/** @type {RouteHandler} */
		(req, res) => send(res, 200, { error: false, data: config.toJSON() }),
	)
	app.put(
		"config",
		/** @type {RouteHandler} */
		(req, res) => {
			for (const key of configKeys) {
				if (req.body[key]) config[key] = req.body[key]
			}
			config
				.save()
				.then(() =>
					send(res, 200, { error: false, data: config.toJSON() }),
				)
				.catch((error) => {
					console.error(error)
					send(res, 400, { error: true, message: error.message })
				})
		},
	)
	app.get(
		"curwindows",
		/** @type {RouteHandler} */
		(req, res) => {
			const windows = windowManager.getWindows().map((w) => w.getTitle())
			send(res, 200, { error: false, data: windows })
		},
	)
	app.get(
		"duration/:project",
		/** @type {RouteHandler} */
		async (req, res) =>
			send(res, 200, {
				error: false,
				data: await Project.findOne({ name: req.params.project })
					.duration,
			}),
	)
	app.get(
		"projects",
		/** @type {RouteHandler} */
		async (req, res) =>
			send(res, 200, { error: false, data: await Project.find({}) }),
	)
	app.delete(
		"project/:project",
		/** @type {RouteHandler} */
		async (req, res) => {
			await Project.deleteOne({ name: req.params.project })
			send(res, 200, {
				error: false,
				data: await Project.find({}),
			})
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
