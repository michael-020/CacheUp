import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type OptionType = { value: string | number; label: string };

interface ComboboxProps {
    options: OptionType[];
    value: string | number | null;
    onChange: (value: string | number) => void;
    placeholder: string;
    className?: string;
}

export function Combobox({ options, value, onChange, placeholder, className }: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          role="combobox" 
          aria-expanded={open} 
          className={cn("w-full justify-between dark:bg-neutral-500 dark:border-neutral-400", className)}
        >
          <span className="truncate text-left">
            {value ? options.find((opt) => opt.value === value)?.label : placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="center" sideOffset={4} className="p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <Command>
          <CommandList>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={String(opt.value)}
                  onSelect={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <span className="truncate">{opt.label}</span>
                  <Check className={cn("h-4 w-4 ml-auto flex-shrink-0", value === opt.value ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}