<script>
  let inpt = "", konami
  function handleKeyDown(e) {
    inpt = (inpt + e.key).slice(-100)
    if (inpt.endsWith("ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba")) {
      import("../components/Konami").then(k => (konami = k.default))
    }
  }
</script>

<style global type="text/postcss">
@tailwind base;

@tailwind components;

@tailwind utilities;

html,
body {
	height: 100%;
}

:root {
	--bg-dark: #111111;
	--bg-light: #eeeeee;
	--accent-light: #e55b3c;
	--accent: #f62217;
}

* {
	border-width: 0;
	border-style: solid;
}

.translate-center {
	transform: translate(-50%, -50%);
}

.flex-center {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
}

.absolute-center {
	position: absolute;
	left: 50%;
	top: 50%;
}

.scroll-snap-ym {
	scroll-snap-type: y mandatory;
}

.scroll-snap-center {
	scroll-snap-align: center;
}

.inline-code {
	@apply border rounded-sm px-1;
	background-color: rgba(255, 255, 255, 0.1);
	border-color: rgba(255, 255, 255, 0.3);
}

.a {
	@apply text-accent-light;
	transition: color 0.4s;
}

.a:hover {
	@apply text-accent;
}

.btn {
	@apply px-4 py-2 font-semibold text-white;
	background-color: var(--accent-light);
	transition: background-color 0.4s;
}

.btn:hover {
	background-color: var(--accent);
}

.btn:disabled {
	filter: brightness(50%);
	cursor: not-allowed;
}

.btn:disabled:hover {
	background-color: var(--accent-light);
}

.inpt {
	@apply bg-transparent px-2 py-1 border-b;
}
</style>

<svelte:window on:keydown={handleKeyDown}/>

<slot />
{#if konami}
  <svelte:component this={konami} />
{/if}
