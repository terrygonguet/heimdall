import { windowManager, Window } from "node-window-manager"
import { Project } from "./db"

export default async function monitor(config) {
	const windows = windowManager.getWindows().map((w) => w.getTitle())
	const active = windowManager.getActiveWindow().getTitle()
	const master = config.masterTitle
	const aux = config.auxTitles

	const masterTitle = windows.find((t) => t.includes(master))
	const isTracking = !!masterTitle
	const isWorking =
		isTracking && [master, ...aux].some((t) => active.includes(t))

	if (isTracking && isWorking) {
		const now = Date.now()
		const extractor = new RegExp(config.extractor)
		const result = extractor.exec(masterTitle, "i")
		let name = masterTitle
		if (result) [, name] = result
		const project = await Project.findOne({ name })
		if (!project) {
			await new Project({
				name,
				blocks: [{ start: Date.now(), end: Date.now() }],
			}).save()
		} else {
			const { blocks } = project
			const latest = blocks[blocks.length - 1]
			if (now - latest.end > config.maxGap)
				blocks.push({ start: now, end: now })
			else latest.end = now
			await project.save()
		}
	}

	setTimeout(() => monitor(config), config.sampleInterval)
}
