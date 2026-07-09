import { useEffect, useState } from "react"

export function useModifierSymbol() {
  const [symbol, setSymbol] = useState("⌘")
  useEffect(() => {
    setSymbol(navigator.platform.toLowerCase().includes("mac") ? "⌘" : "Ctrl")
  }, [])
  return symbol
}
