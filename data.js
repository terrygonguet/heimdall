const fs = require("fs").promises

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
		this.extractor = new RegExp(process.env.NAME_EXTRACTOR, "i")
		this.lastSave = 0

		return new Promise(async (resolve, reject) => {
			const dbPath = process.env.DB_PATH
			try {
				const h = await fs.open(dbPath)
				const buf = await h.readFile()
				await h.close()
				Object.assign(this, JSON.parse(buf.toString()))
				return resolve(this)
			} catch (error) {
				if (error.code == "ENOENT") {
					const h = await fs.open(dbPath, "w+")
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
			if (now - latest.end > process.env.MAX_GAP)
				blocks.push({ start: now, end: now })
			else latest.end = now
		}

		if (now - this.lastSave > process.env.MAX_GAP) this.save()
	}

	async save() {
		try {
			const h = await fs.open(process.env.DB_PATH, "w+")
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

	toJSON() {
		return { projects: this.projects }
	}

	toString() {
		return JSON.stringify(this.toJSON(), null, "\t")
	}
}

module.exports = Data
