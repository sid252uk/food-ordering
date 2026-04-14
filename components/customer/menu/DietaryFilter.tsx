"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { DIETARY_FLAGS } from "@/lib/constants"
import { Filter } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  value: Record<string, boolean>
  onChange: (val: Record<string, boolean>) => void
}

export function DietaryFilter({ value, onChange }: Props) {
  const activeCount = Object.values(value).filter(Boolean).length

  const toggle = (key: string) => {
    onChange({ ...value, [key]: !value[key] })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn(activeCount > 0 && "border-blue-400 text-blue-700")}>
          <Filter className="h-4 w-4 mr-1.5" />
          Filters {activeCount > 0 && `(${activeCount})`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52">
        <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Dietary</p>
        <div className="space-y-2">
          {DIETARY_FLAGS.map((f) => (
            <div key={f.key} className="flex items-center gap-2">
              <Checkbox
                id={f.key}
                checked={!!value[f.key]}
                onCheckedChange={() => toggle(f.key)}
              />
              <Label htmlFor={f.key} className="cursor-pointer flex items-center gap-1.5 font-normal">
                <span>{f.emoji}</span> {f.label}
              </Label>
            </div>
          ))}
        </div>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" className="w-full mt-3 text-muted-foreground" onClick={() => onChange({})}>
            Clear all
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}
