const fs = require("fs").promises
const path = require("path")

/**
 * @typedef {Object} Project
 * @property {string} name
 * @property {Block[]} blocks
 */

/**
 * @typedef {Object} Block
 * @property {number} start
 * @property {number} end
 */

class Data {
	constructor() {
		/** @type {Object<string,Project>} */
		this.projects = {}
		this.config = {
			dayChange: 0,
			sampleInterval: 5000,
			maxGap: 300000,
			masterTitle: "Work",
			auxTitles: [],
			extractor: "(.*)",
		}
		this.lastSave = 0
		this.dbPath =
			process.env.DB_PATH ||
			path.join(process.env.USERPROFILE, "Documents/heimdall.json")

		return new Promise(async (resolve, reject) => {
			try {
				const h = await fs.open(this.dbPath)
				const buf = await h.readFile()
				await h.close()
				Object.assign(this, JSON.parse(buf.toString()))
				return resolve(this)
			} catch (error) {
				if (error.code == "ENOENT") {
					const h = await fs.open(this.dbPath, "w+")
					await h.writeFile(this)
					await h.close()
					return resolve(this)
				} else reject(error)
			}
		})
	}

	/**
	 * @param {string} masterTitle
	 */
	track(masterTitle) {
		const now = Date.now()
		const result = this.extractor.exec(masterTitle)
		let name = masterTitle
		if (result) [, name] = result
		const project = this.projects[name]
		if (!project) {
			this.projects[name] = {
				name,
				blocks: [{ start: Date.now(), end: Date.now() }],
			}
		} else {
			const { blocks } = project
			const latest = blocks[blocks.length - 1]
			if (now - latest.end > this.config.maxGap)
				blocks.push({ start: now, end: now })
			else latest.end = now
		}

		if (now - this.lastSave > this.config.maxGap) this.save()
	}

	async save() {
		try {
			const h = await fs.open(this.dbPath, "w+")
			await h.writeFile(this)
			this.lastSave = Date.now()
			await h.close()
		} catch (error) {
			console.error(error)
		}
	}

	/**
	 * @param {string} name
	 */
	projectDuration(name) {
		const project = this.projects[name]
		if (!name) return 0
		return project.blocks.reduce(
			(acc, cur) => acc + (cur.end - cur.start),
			0,
		)
	}

	get extractor() {
		return new RegExp(this.config.extractor, "i")
	}

	toJSON() {
		return { projects: this.projects, config: this.config }
	}

	toString() {
		return JSON.stringify(this.toJSON(), null, "\t")
	}
}

module.exports = Data
