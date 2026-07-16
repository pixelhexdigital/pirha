import { forwardRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Eye, EyeOff } from "lucide-react";

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

  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password" && !textarea;
  const inputType = isPassword
    ? showPassword
      ? "text"
      : "password"
    : type || "text";

  const fieldId =
    id || `field-${(label || placeholder || "")?.replace(/\s+/g, "-").toLowerCase()}`;
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
                isPassword && "pr-11",
                value !== "" && "border-input/80",
                classInput
              )}
              ref={ref}
              type={inputType}
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
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors rounded-r-lg hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          )}
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
