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
    ...otherProps
  } = props;
  // const handleKeyDown = (event) => {
  //   const remainingChars = 880 - value.length;
  //   if (remainingChars <= 0 && event.key !== "Backspace") {
  //     event.preventDefault();
  //   }
  // };

  // const remainingChars = 880 - value.length;

  return (
    <div className={`${className}`}>
      <div className="">
        {label && (
          <div className="flex mb-2 font-semibold base2">
            {label}
            {/* {textarea && (
              <span className="pl-4 ml-auto text-n-4/50">{remainingChars}</span>
            )} */}
          </div>
        )}
        <div className="relative">
          {textarea ? (
            <textarea
              className={twMerge(
                "w-full h-24 px-3.5 py-3 bg-n-8 border-2 border-n-2 rounded-xl base2  text-n-7 outline-none transition-colors placeholder:text-n-4/50 focus:bg-transparent resize-none dark:bg-n-6 dark:border-n-6 dark:text-n-3 dark:focus:bg-transparent",
                icon && "pl-[3.125rem]",
                value !== "" && "bg-transparent border-n-3/50",
                classInput
              )}
              value={value}
              onChange={onChange}
              // onKeyDown={handleKeyDown}
              ref={ref}
              placeholder={placeholder}
              required={required}
              {...otherProps}
            />
          ) : (
            <input
              className={twMerge(
                "w-full h-12 px-3.5 py-3 bg-n-8 border-2 border-n-2 rounded-xl base2  text-n-7 outline-none transition-colors placeholder:text-n-4/50 focus:bg-transparent dark:bg-n-6 dark:border-n-6 dark:text-n-3 dark:focus:bg-transparent",
                icon && "pl-[3.125rem]",
                value !== "" && "bg-transparent border-n-3/50",
                classInput
              )}
              ref={ref}
              type={type || "text"}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              required={required}
              {...otherProps}
            />
          )}
          <Icon
            className={`absolute top-3.5 left-4 fill-n-4/50 pointer-events-none transition-colors ${
              value !== "" && "fill-n-4"
            }`}
            name={icon}
          />
        </div>
        {note && <div className="mt-2 base2 text-n-4/50">{note}</div>}
        {error && <div className="mt-2 text-red-600 caption1">{error}</div>}
      </div>
    </div>
  );
});

Field.displayName = "Field";

export default Field;
