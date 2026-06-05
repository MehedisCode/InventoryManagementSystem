export default function Table({ columns, data, emptyMessage = "No records found" }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-light-border dark:border-dark-border">
      <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
        <thead className="bg-slate-50 text-xs uppercase text-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="px-6 py-3 font-medium">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-light-border bg-white dark:divide-dark-border dark:bg-dark-card">
          {data && data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    {col.accessor ? row[col.accessor] : col.render ? col.render(row) : null}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}