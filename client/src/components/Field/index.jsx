import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

import Icon from "components/Icon";

const Field = forwardRef((props, ref) => {
  const {
    className,
    classInput,
    label,
    textarea,
    note,
    type,
    value,
    onChange,
    placeholder,
    required,
    icon,
    error,
    id,
    ...otherProps
  } = props;

  const fieldId = id || `field-${(label || placeholder || "")?.replace(/\s+/g, "-").toLowerCase()}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const ariaLabel = label || placeholder;

  return (
    <div className={`${className}`}>
      <div className="">
        {label && (
          <label
            htmlFor={fieldId}
            className="flex mb-2 text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {textarea ? (
            <textarea
              id={fieldId}
              className={twMerge(
                "w-full h-24 px-3.5 py-3 bg-background border border-input rounded-lg text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring resize-none",
                icon && "pl-[3.125rem]",
                value !== "" && "border-input/80",
                classInput
              )}
              value={value}
              onChange={onChange}
              ref={ref}
              placeholder={placeholder}
              required={required}
              aria-label={!label ? ariaLabel : undefined}
              aria-invalid={!!error}
              aria-describedby={errorId}
              {...otherProps}
            />
          ) : (
            <input
              id={fieldId}
              className={twMerge(
                "w-full h-12 px-3.5 py-3 bg-background border border-input rounded-lg text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring",
                icon && "pl-[3.125rem]",
                value !== "" && "border-input/80",
                classInput
              )}
              ref={ref}
              type={type || "text"}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              required={required}
              aria-label={!label ? ariaLabel : undefined}
              aria-invalid={!!error}
              aria-describedby={errorId}
              {...otherProps}
            />
          )}
          <Icon
            className={`absolute top-3.5 left-4 fill-muted-foreground pointer-events-none transition-colors ${
              value !== "" && "fill-foreground"
            }`}
            name={icon}
          />
        </div>
        {note && (
          <div className="mt-2 text-sm text-muted-foreground">{note}</div>
        )}
        {error && (
          <div id={errorId} role="alert" className="mt-2 text-destructive text-xs font-medium">
            {error}
          </div>
        )}
      </div>
    </div>
  );
});

Field.displayName = "Field";

export default Field;
