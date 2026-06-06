import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
}) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${sizes[size]} rounded-lg bg-white shadow-xl dark:bg-dark-card`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-light-border px-6 py-4 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-4 text-slate-600 dark:text-slate-300">
          {children}
        </div>
        {footer && (
          <div className="flex justify-end gap-3 rounded-b-lg border-t border-light-border bg-slate-50 px-6 py-4 dark:border-dark-border dark:bg-slate-800/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
