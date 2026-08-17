import * as React from "react"

function subscribe(onChange: () => void) {
  const mql = window.matchMedia("(pointer: coarse)")
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

function getSnapshot() {
  return window.matchMedia("(pointer: coarse)").matches
}

function getServerSnapshot() {
  return false
}

export function useCoarsePointer() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
