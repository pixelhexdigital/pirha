import { Check, X } from "lucide-react";
import { twMerge } from "tailwind-merge";

import { PASSWORD_RULES } from "lib/authConstants";

// Live checklist of password rules; renders once the user starts typing.
const PasswordRequirements = ({ value = "", className }) => {
  if (!value) return null;

  return (
    <ul
      aria-label="Password requirements"
      className={twMerge("mt-2 space-y-1", className)}
    >
      {PASSWORD_RULES.map(({ label, test }) => {
        const passed = test(value);
        return (
          <li
            key={label}
            className={twMerge(
              "flex items-center gap-1.5 text-xs transition-colors",
              passed ? "text-success" : "text-muted-foreground"
            )}
          >
            {passed ? (
              <Check className="size-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <X className="size-3.5 shrink-0" aria-hidden="true" />
            )}
            <span>{label}</span>
          </li>
        );
      })}
    </ul>
  );
};

export default PasswordRequirements;
