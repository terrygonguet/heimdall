import * as sapper from "@sapper/app"

sapper.start({
  target: document.querySelector("#sapper"),
})

// force accessibility
if (process.env.NODE_ENV == "development") {
  function disableMouse() {
    let style = document.createElement("style")
    style.innerText = "* { cursor: none !important }"
    document.head.append(style)
  }

  document.addEventListener(
    "keydown",
    e => e.key == "m" && e.altKey && disableMouse(),
  )
}
