import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import type { MenuItemOptionWithChoices, MenuItemOptionChoice } from "@/types"

interface Props {
  option: MenuItemOptionWithChoices
  value: MenuItemOptionChoice | MenuItemOptionChoice[] | undefined
  onChange: (val: MenuItemOptionChoice | MenuItemOptionChoice[]) => void
}

export function OptionGroup({ option, value, onChange }: Props) {
  if (option.selection_type === "single") {
    const selected = value as MenuItemOptionChoice | undefined
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <p className="font-medium text-gray-900">{option.name}</p>
          {option.is_required && <Badge variant="destructive" className="text-xs">Required</Badge>}
        </div>
        <RadioGroup
          value={selected?.id || ""}
          onValueChange={(id) => {
            const choice = option.choices.find((c) => c.id === id)
            if (choice) onChange(choice)
          }}
        >
          {option.choices.filter((c) => c.is_active).map((choice) => (
            <div key={choice.id} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-3">
                <RadioGroupItem value={choice.id} id={`${option.id}-${choice.id}`} />
                <Label htmlFor={`${option.id}-${choice.id}`} className="font-normal cursor-pointer">
                  {choice.name}
                </Label>
              </div>
              {choice.price_modifier !== 0 && (
                <span className="text-sm text-muted-foreground">
                  {choice.price_modifier > 0 ? "+" : ""}{formatCurrency(choice.price_modifier)}
                </span>
              )}
            </div>
          ))}
        </RadioGroup>
      </div>
    )
  }

  // Multi-select
  const selected = (value as MenuItemOptionChoice[] | undefined) ?? []
  const toggle = (choice: MenuItemOptionChoice) => {
    const exists = selected.find((c) => c.id === choice.id)
    const updated = exists ? selected.filter((c) => c.id !== choice.id) : [...selected, choice]
    onChange(updated)
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <p className="font-medium text-gray-900">{option.name}</p>
        {option.is_required && <Badge variant="destructive" className="text-xs">Required</Badge>}
        {option.max_selections && (
          <span className="text-xs text-muted-foreground">Choose up to {option.max_selections}</span>
        )}
      </div>
      <div className="space-y-1">
        {option.choices.filter((c) => c.is_active).map((choice) => (
          <div key={choice.id} className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-3">
              <Checkbox
                id={`${option.id}-${choice.id}`}
                checked={!!selected.find((c) => c.id === choice.id)}
                onCheckedChange={() => toggle(choice)}
                disabled={
                  !selected.find((c) => c.id === choice.id) &&
                  !!option.max_selections &&
                  selected.length >= option.max_selections
                }
              />
              <Label htmlFor={`${option.id}-${choice.id}`} className="font-normal cursor-pointer">
                {choice.name}
              </Label>
            </div>
            {choice.price_modifier !== 0 && (
              <span className="text-sm text-muted-foreground">
                {choice.price_modifier > 0 ? "+" : ""}{formatCurrency(choice.price_modifier)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
