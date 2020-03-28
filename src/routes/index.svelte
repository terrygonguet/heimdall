<script>
	import { fade } from "svelte/transition";
</script>

<svelte:head>
  <title>Calibron 12</title>
</svelte:head>

<main
  class="overflow-hidden flex-center relative"
  in:fade={{ duration: 200, delay: 200 }}
  out:fade={{ duration: 200 }}>
  <p>YO</p>
</main>
