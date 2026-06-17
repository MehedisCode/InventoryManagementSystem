import { forwardRef } from 'react';

const Select = forwardRef(({ label, options = [], error, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>}
      <select
        ref={ref}
        className={`flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-dark-card dark:text-slate-100 dark:focus:ring-primary-400 ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
        {...props}
      >
        <option value="" disabled className="dark:bg-dark-card dark:text-slate-400">Select an option</option>
        {options.map((opt, i) => (
          <option key={i} value={opt.value} className="dark:bg-dark-card dark:text-slate-100">{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;