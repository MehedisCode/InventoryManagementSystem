import { useState } from "react";
import { Search, Inbox } from "lucide-react";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";

export default function DataTable({
  columns,
  data = [],
  isLoading = false,
  onSearch,
  pagination = true,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase()),
    );
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = pagination
    ? filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredData;

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setCurrentPage(1);
    if (onSearch) onSearch(val);
  };

  return (
    <div className="rounded-lg border border-light-border bg-white shadow-sm dark:border-dark-border dark:bg-dark-card">
      <div className="flex flex-col gap-4 border-b border-light-border p-4 sm:flex-row sm:items-center sm:justify-between dark:border-dark-border">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="h-10 w-full rounded-md border border-slate-300 bg-transparent pl-10 pr-4 text-sm focus:border-primary-900 focus:outline-none focus:ring-1 focus:ring-primary-900 dark:border-slate-700 dark:text-slate-100 dark:focus:ring-primary-400"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        {pagination && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Rows per page:
            </span>
            <select
              className="h-9 rounded-md border border-slate-300 bg-transparent px-2 text-sm focus:border-primary-900 focus:outline-none focus:ring-1 focus:ring-primary-900 dark:border-slate-700 dark:bg-dark-card dark:text-slate-100 dark:focus:ring-primary-400"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 text-xs uppercase text-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              {columns.map((col, index) => (
                <th key={index} className="px-6 py-3 font-medium">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-light-border dark:divide-dark-border">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                    <Spinner size="lg" className="mb-4" />
                    <p>Loading data...</p>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      {col.accessor
                        ? row[col.accessor]
                        : col.render
                          ? col.render(row)
                          : null}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                    <Inbox className="mb-4 h-12 w-12 opacity-20" />
                    <p className="text-lg font-medium">No records found</p>
                    <p className="text-sm opacity-70">
                      Try adjusting your search criteria
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && !isLoading && filteredData.length > 0 && (
        <div className="flex items-center justify-between border-t border-light-border p-4 dark:border-dark-border">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
            {filteredData.length} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
