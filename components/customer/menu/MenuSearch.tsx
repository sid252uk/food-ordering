"use client"

import { useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useDebouncedCallback } from "use-debounce"

interface Props {
  value: string
  onChange: (val: string) => void
}

export function MenuSearch({ value, onChange }: Props) {
  const debouncedChange = useDebouncedCallback(onChange, 300)

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search menu…"
        defaultValue={value}
        onChange={(e) => debouncedChange(e.target.value)}
        className="pl-9"
      />
    </div>
  )
}
