import mongoose from "mongoose"

const configSchema = new mongoose.Schema({
	dayChange: { type: Number, min: 0, max: 23, default: 7, required: true },
	sampleInterval: { type: Number, default: 5000, min: 1000, required: true },
	maxGap: { type: Number, default: 300000, min: 1000, required: true },
	masterTitle: { type: String, default: "", required: true },
	auxTitles: { type: [String], default: [], required: true },
	extractor: { type: String, default: "", required: true },
})

const projectSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, unique: true, index: true },
		blocks: {
			type: [
				new mongoose.Schema(
					{
						start: { type: Date, required: true },
						end: { type: Date, required: true },
					},
					{
						toJSON: {
							transform: ({ start, end }) => ({ start, end }),
						},
					},
				),
			],
			required: true,
			default: [],
		},
	},
	{
		toJSON: {
			transform: ({ name, blocks, duration }) => ({
				name,
				blocks,
				duration,
			}),
		},
		virtuals: true,
	},
)

projectSchema.virtual("duration").get(function() {
	return this.blocks.reduce((acc, cur) => acc + (cur.end - cur.start), 0)
})

export const Config = mongoose.model("Config", configSchema)

export const Project = mongoose.model("Project", projectSchema)

export const configKeys = [
	"dayChange",
	"sampleInterval",
	"maxGap",
	"masterTitle",
	"auxTitles",
	"extractor",
]

export async function connect() {
	if (!process.env.DB_URL) throw new Error("No DB_URL env var provided")

	await mongoose.connect(process.env.DB_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		autoIndex: process.env.NODE_ENV != "production",
		useCreateIndex: true,
	})

	let config = await Config.findOne()
	if (!config) config = new Config().save()

	process.on("exit", () => mongoose.connection.close())
	process.on("SIGINT", () => mongoose.connection.close())
	process.on("SIGUSR1", () => mongoose.connection.close())
	process.on("SIGUSR2", () => mongoose.connection.close())
	process.on("uncaughtException", () => mongoose.connection.close())

	return config
}
