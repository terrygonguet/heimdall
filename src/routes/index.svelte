<script context="module">
	export async function preload() {
		const res = await this.fetch("api/projects")
		const { error, data, message } = await res.json()
		if (error) this.error(res.status, message)
		else return { projects: data }
	}
</script>

<script>
	import { fade } from "svelte/transition"
	import { clampStr, ms2str } from "../tools";

	export let projects =[]

	let loading = false

	async function refresh() {
		loading = true
		const res = await fetch(`api/projects`)
		const { error, data, message } = await res.json()
		if (error) throw new Error(message)
		else projects = data
		loading = false
	}

	function deleteProject(name) {
		return async function () {
			if (!confirm(`Are you sure you want to delete ${name} and all of its data?\nThis action is irreversable!`)) return
			loading = true
			const res = await fetch(`api/project/${name}`, { method: "DELETE" })
			const { error, data, message } = await res.json()
			if (error) throw new Error(message)
			else projects = data
			loading = false
		}
	}
</script>

<svelte:head>
  <title>Heimdall</title>
</svelte:head>

<main
	class="flex-center absolute w-full h-full"
	in:fade={{ duration: 200, delay: 200 }}
	out:fade={{ duration: 200 }}>
	<table class="max-w-1k w-full">
		<tr>
			<td colspan=3 class="text-right">
				<span on:click={refresh} class="p-2 cursor-pointer select-none">🔄</span>
			</td>
		</tr>
		{#each projects as project}
			<tr class="border-b">
				<td class="p-2 text-center whitespace-no-wrap">{ms2str(project.duration)}</td>
				<td class="p-2 w-full">{clampStr(project.name, 50)}</td>
				<td class="p-2">
					<button class="btn" disabled={loading} on:click={deleteProject(project.name)}>Delete</button>
				</td>
			</tr>
		{:else}
			<tr>
				<td colspan=3>No projects</td>
			</tr>
		{/each}
	</table>
	<a href="config" rel="prefetch" class="a m-4">Config</a>
</main>
