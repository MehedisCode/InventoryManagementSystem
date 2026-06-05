export default function Card({ title, subtitle, children, className = '', padding = 'p-6' }) {
  return (
    <div className={`rounded-lg border border-light-border bg-white shadow-sm dark:border-dark-border dark:bg-dark-card ${className}`}>
      {(title || subtitle) && (
        <div className="flex flex-col gap-1 border-b border-light-border px-6 py-4 dark:border-dark-border">
          {title && <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      )}
      <div className={padding}>
        {children}
      </div>
    </div>
  );
}