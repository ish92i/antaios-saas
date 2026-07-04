import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import countryLabels from "react-phone-number-input/locale/en.json";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type PhoneInputProps = Omit<
  React.ComponentProps<"input">,
  "onChange" | "value" | "ref"
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
    onChange?: (value: RPNInput.Value) => void;
  };

type CountryEntry = {
  value: string;
  label: string;
  callingCode: string;
};

const allCountries: CountryEntry[] = (Object.keys(flags) as RPNInput.Country[])
  .filter((code) => code.length === 2)
  .flatMap((code) => {
    try {
      return {
        value: code,
        label: (countryLabels as Record<string, string>)[code] || code,
        callingCode: String(RPNInput.getCountryCallingCode(code)),
      };
    } catch {
      return [];
    }
  })
  .sort((a, b) => a.label.localeCompare(b.label));

function findCountry(value: string | undefined): CountryEntry {
  if (!value || !value.startsWith("+")) {
    return { value: "", label: "", callingCode: "" };
  }
  const sorted = [...allCountries].sort(
    (a, b) => b.callingCode.length - a.callingCode.length,
  );
  for (const c of sorted) {
    if (value.startsWith("+" + c.callingCode)) return c;
  }
  return { value: "", label: "", callingCode: "" };
}

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
  React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
    ({ className, onChange, value, ...props }, ref) => {
      const currentCountry = React.useMemo(
        () => findCountry(value),
        [value],
      );

      return (
        <div className={cn("flex", className)}>
          <CountrySelector
            selected={currentCountry}
            onSelect={(code) => {
              const cc = RPNInput.getCountryCallingCode(code as RPNInput.Country);
              onChange?.("+" + cc);
            }}
          />
          <RPNInput.default
            ref={ref}
            containerComponent={({ children, className, ...rest }) => (
              <div className={cn("flex flex-1", className)} {...rest}>{children}</div>
            )}
            countrySelectComponent={() => null}
            flagComponent={FlagComponent}
            inputComponent={InputComponent}
            smartCaret={false}
            value={value || undefined}
            onChange={(v) => onChange?.(v || ("" as RPNInput.Value))}
            {...props}
          />
        </div>
      );
    },
  );
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => (
  <Input
    className={cn("rounded-e-lg rounded-s-none", className)}
    {...props}
    ref={ref}
  />
));
InputComponent.displayName = "InputComponent";

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];
  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};

function CountrySelector({
  selected,
  onSelect,
}: {
  selected: CountryEntry;
  onSelect: (code: string) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchRef = React.useRef<HTMLInputElement>(null);

  const filteredCountries = allCountries.filter(
    (c) =>
      c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.callingCode.includes(searchQuery) ||
      c.value.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  React.useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setSearchQuery("");
      }}
    >
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "flex gap-1 rounded-e-none rounded-s-lg border-r-0 px-3 focus:z-10",
        )}
      >
        <FlagComponent
          country={selected.value as RPNInput.Country}
          countryName={selected.label}
        />
        <ChevronsUpDown className="-mr-1 size-3.5 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="flex flex-col">
          <div className="p-2">
            <input
              ref={searchRef}
              placeholder="Search country..."
              className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="max-h-72 overflow-y-auto p-1">
            {filteredCountries.map((c) => {
              const isSelected = c.value === selected.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                  onClick={() => {
                    onSelect(c.value);
                    setIsOpen(false);
                  }}
                >
                  <FlagComponent
                    country={c.value as RPNInput.Country}
                    countryName={c.label}
                  />
                  <span className="flex-1 text-left">{c.label}</span>
                  <span className="text-xs text-muted-foreground">
                    +{c.callingCode}
                  </span>
                  {isSelected && <Check className="ml-1 size-4" />}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { PhoneInput };
