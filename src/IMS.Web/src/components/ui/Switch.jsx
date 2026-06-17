import { forwardRef } from "react";

const Switch = forwardRef(
  (
    { label, checked = false, onChange, error, disabled, className = "" },
    ref,
  ) => {
    const handleClick = () => {
      if (disabled) return;
      onChange?.(!checked);
    };

    const handleKeyDown = (e) => {
      if (disabled) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        onChange?.(!checked);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label
            className={`block text-sm font-medium mb-1 ${
              disabled
                ? "text-slate-400 dark:text-slate-500"
                : "text-slate-700 dark:text-slate-300"
            }`}
          >
            {label}
          </label>
        )}

        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-disabled={disabled}
          disabled={disabled}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-900 dark:focus:ring-primary-400 ${
            checked ? "bg-primary-900" : "bg-slate-300 dark:bg-slate-600"
          } ${
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          } ${error ? "ring-2 ring-red-500" : ""} ${className}`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              checked ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>

        {/* Hidden checkbox for form-library compatibility (e.g. react-hook-form) */}
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
        />

        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);

Switch.displayName = "Switch";

export default Switch;
