const PurgeCSS = require("@fullhuman/postcss-purgecss")

const mode = process.env.NODE_ENV
const dev = mode === "development"

module.exports = {
	plugins: [
		require("tailwindcss"),
		require("autoprefixer"),
		!dev && require("cssnano")(),
	].filter(Boolean),
}
