<script context="module">
	export async function preload() {
		const res = await this.fetch("api/config")
		const { error, data, message } = await res.json()
		if (error) this.error(res.status, message)
		else return { data }
	}
</script>

<script>
	import { fade } from "svelte/transition";
	import { onInterval } from "../tools";

	export let data = {}

	let sampleInterval = data.sampleInterval / 1000
	let maxGap = data.maxGap / 60000
	let auxTitles = data.auxTitles.join(",")
	let curwindows = []
	let loading = false

	$: data.sampleInterval = sampleInterval * 1000
	$: data.maxGap = maxGap * 60000
	$: data.auxTitles = auxTitles.split(",").map(t => t.trim())
	$: masterMatches = data.masterTitle.length > 1 ? curwindows.filter(w => w.includes(data.masterTitle)) : []
	$: auxMatches = curwindows.filter(w => data.auxTitles.some(t => t.length > 1 && w.includes(t)))
	$: extracted = masterMatches.length ? extract(masterMatches[0]) : "nothing"

	function extract(str) {
		try {
			const extractor = new RegExp(data.extractor, "i")
			const [,extracted] = extractor.exec(str)
			return extracted || "nothing"
		} catch (error) {
			return "nothing"
		}
	}

	async function save(e) {
		e.preventDefault()
		loading = true
		const res = await fetch("api/config", {
			method: "PUT",
			body: JSON.stringify(data),
			headers: { "Content-Type": "application/json" }
		})
		const { error, message } = await res.json()
		if (error) throw new Error(message)
		loading = false
	}

	onInterval(async () => {
		const res = await fetch("api/curwindows")
		const { error, data, message } = await res.json()
		if (error) throw new Error(message)
		else curwindows = [...new Set(data)].filter(Boolean)
	}, 5000, true)
</script>

<style>
	form {
		display: grid;
		grid-template-columns: auto 1fr;
		grid-gap: 0 1rem;
		align-items: center;
	}
</style>

<svelte:head>
  <title>Heimdall</title>
</svelte:head>

<main
	class="flex-center absolute w-full h-full"
	in:fade={{ duration: 200, delay: 200 }}
	out:fade={{ duration: 200 }}>
	<form on:submit={save} class="border p-4">
		<label class="text-right" for="txbMasterTitle">Master title</label>
		<input
			disabled={loading}
			class="inpt m-2"
			type="text"
			id="txbMasterTitle"
			bind:value={data.masterTitle} />
		<div style="grid-column:span 2" class="text-center text-base mb-4">
			<p>Currently matching:</p>
			<ul class="list-disc">
				{#each masterMatches as match}
					<li>{match}</li>
				{:else}
					<li>nothing</li>
				{/each}
			</ul>
		</div>
		<label class="text-right" for="txbAuxTitles">Aux titles</label>
		<input
			disabled={loading}
			class="inpt m-2"
			type="text"
			id="txbAuxTitles"
			bind:value={auxTitles} />
		<div style="grid-column:span 2" class="text-center text-base mb-4">
			<p>Currently matching:</p>
			<ul class="list-disc">
				{#each auxMatches as match}
					<li>{match}</li>
				{:else}
					<li>nothing</li>
				{/each}
			</ul>
		</div>
		<label class="text-right" for="txbExtractor">Extractor</label>
		<input
			disabled={loading}
			class="inpt m-2"
			type="text"
			id="txbExtractor"
			bind:value={data.extractor} />
		<div style="grid-column:span 2" class="text-center text-base mb-4">
			<p>Currently extracting: {extracted}</p>
		</div>
		<label class="text-right" for="txbDayChange">Day change</label>
		<input
			disabled={loading}
			class="inpt m-2"
			type="number"
			min=0 max=24 step=0.1
			id="txbDayChange"
			bind:value={data.dayChange} />
		<label class="text-right" for="txbSampleInterval">Sample interval (s)</label>
		<input
			disabled={loading}
			class="inpt m-2"
			type="number"
			min=0.1 step=0.1
			id="txbSampleInterval"
			bind:value={sampleInterval} />
		<label class="text-right" for="txbMaxGap">Max gap (min)</label>
		<input
			disabled={loading}
			class="inpt m-2"
			type="number"
			min=0 step=1
			id="txbMaxGap"
			bind:value={maxGap} />
		<button
			class="btn m-4"
			style="grid-column:span 2"
			on:click={save}
			disabled={loading}>Save</button>
	</form>
</main>
