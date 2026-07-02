import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type PhoneInputProps = Omit<
  React.ComponentProps<"input">,
  "onChange" | "value" | "ref"
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
    onChange?: (value: RPNInput.Value) => void;
  };

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
  React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
    ({ className, onChange, value, ...props }, ref) => {
      return (
        <RPNInput.default
          ref={ref}
          className={cn("flex", className)}
          flagComponent={FlagComponent}
          countrySelectComponent={CountrySelect}
          inputComponent={InputComponent}
          smartCaret={false}
          value={value || undefined}
          onChange={(value) => onChange?.(value || ("" as RPNInput.Value))}
          {...props}
        />
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

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  options: { label: string; value: RPNInput.Country | undefined }[];
  onChange: (country: RPNInput.Country) => void;
};

const CountrySelect = ({
  disabled,
  value: selectedCountry,
  options: countryList,
  onChange,
}: CountrySelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredCountryList = countryList.filter(
    ({ value, label }) =>
      !value ||
      label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      value.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setSearchQuery("");
      }}
    >
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "flex gap-1 rounded-e-none rounded-s-lg border-r-0 px-3 focus:z-10",
        )}
      >
        <FlagComponent
          country={selectedCountry}
          countryName={selectedCountry}
        />
        <ChevronsUpDown className="-mr-1 size-3.5 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="p-2">
          <input
            placeholder="Search country..."
            className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <ScrollArea className="h-72">
          <div className="p-1">
            {filteredCountryList.map(({ value, label }) => {
              if (!value) return null;
              const isSelected = value === selectedCountry;
              return (
                <button
                  key={value}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                  onClick={() => {
                    onChange(value);
                    setIsOpen(false);
                  }}
                >
                  <FlagComponent country={value} countryName={label} />
                  <span className="flex-1 text-left">{label}</span>
                  <span className="text-xs text-muted-foreground">
                    +{RPNInput.getCountryCallingCode(value)}
                  </span>
                  {isSelected && <Check className="ml-1 size-4" />}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};

export { PhoneInput };
