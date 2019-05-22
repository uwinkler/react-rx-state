import { distinctUntilChanged } from "rxjs/operators"
import { Patch } from "immer"
import { RxStore } from "./rx-store"

export function connectLogger(appStore: RxStore<any>) {
  const name =
    appStore.options.storeName === "" ? "RxState" : appStore.options.storeName

  appStore.state$.pipe(distinctUntilChanged()).subscribe(update => {
    console.groupCollapsed(`[${name}]: ` + update.type)
    formatPatches(update.patches || [])
    console.log("State:", update.payload)
    console.log("Meta:", update.meta)
    console.groupEnd()
  })

  appStore.messageBus$.subscribe(message => {
    console.groupCollapsed(
      `[${name}] Message: ` + message.type,
      message.payload
    )
    console.log(message.payload)
    console.groupEnd()
  })
}

function formatPatches(patches: Patch[]) {
  patches.forEach(patch => {
    const path = patch.path.join(".")
    switch (patch.op) {
      case "add": {
        console.groupCollapsed(
          '%c Add "' + path + '":',
          "color: green",
          patch.value
        )
        console.log(JSON.stringify(patch.value, null, 2))
        console.groupEnd()
        break
      }
      case "remove": {
        console.groupCollapsed(
          '%c Remove "' + path + '":',
          "color: red",
          patch.value
        )
        console.log(JSON.stringify(patch.value, null, 2))
        console.groupEnd()
        break
      }
      case "replace": {
        console.groupCollapsed(
          '%c Replace "' + path + '":',
          "color: #008800",
          patch.value
        )
        console.log(JSON.stringify(patch.value, null, 2))
        console.groupEnd()
        break
      }

      default: {
        console.groupCollapsed(
          '%c Default "' + path + '":',
          "color: green",
          patch.value
        )
        console.log(JSON.stringify(patch.value, null, 2))
        console.groupEnd()
      }
    }
  })
}