export default function Badge({ children, status, className = '' }) {
  const colorMap = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    received: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    draft: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400',
    sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const statusKey = (status || children)?.toString().toLowerCase();
  const colorClass = colorMap[statusKey] || 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass} ${className}`}>
      {children}
    </span>
  );
}