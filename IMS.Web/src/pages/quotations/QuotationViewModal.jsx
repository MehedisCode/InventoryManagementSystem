import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { getQuotation } from "../../api/quotationApi";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import { formatDate } from "../../utils/formatters";

const money = (value) => Number(value || 0).toFixed(2);

export default function QuotationViewModal({ id, isOpen }) {
  const {
    data: quotation,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["quotations", id],
    queryFn: async () => {
      const res = await getQuotation(id);
      return res?.data?.data || null;
    },
    enabled: !!id && isOpen,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (isError || !quotation) {
    return (
      <div className="flex justify-center py-10">
        <p className="text-slate-500 dark:text-slate-400">
          Quotation not found.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Quotation #{quotation.referenceNo || "N/A"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {quotation.quotationDate
                ? formatDate(quotation.quotationDate)
                : "N/A"}
            </p>
          </div>
        </div>

        <Badge status={quotation.status}>{quotation.status || "Unknown"}</Badge>
      </div>

      {/* Information */}
      <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-200 dark:border-slate-700">
        <div className="p-5 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700">
          <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
            Reference No
          </p>
          <p className="font-medium text-slate-900 dark:text-white">
            {quotation.referenceNo || "N/A"}
          </p>
        </div>

        <div className="p-5 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700">
          <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
            Customer
          </p>
          <p className="font-medium text-slate-900 dark:text-white">
            {quotation.customerName || "Unknown"}
          </p>
        </div>

        <div className="p-5 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700">
          <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
            Quotation Date
          </p>
          <p className="font-medium text-slate-900 dark:text-white">
            {quotation.quotationDate
              ? formatDate(quotation.quotationDate)
              : "N/A"}
          </p>
        </div>

        <div className="p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
            Expiry Date
          </p>
          <p className="font-medium text-slate-900 dark:text-white">
            {quotation.expiryDate ? formatDate(quotation.expiryDate) : "N/A"}
          </p>
        </div>
      </div>

      {/* Note */}
      {quotation.note && (
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h4 className="font-medium text-slate-900 dark:text-white mb-2">
            Note
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {quotation.note}
          </p>
        </div>
      )}

      {/* Items */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Quotation Items
        </h3>

        <div className="overflow-x-auto border rounded-lg dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-center">Quantity</th>
                <th className="px-4 py-3 text-right">Unit Price</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
              </tr>
            </thead>

            <tbody>
              {quotation.items?.length > 0 ? (
                quotation.items.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="border-b dark:border-slate-700"
                  >
                    <td className="px-4 py-3">
                      {item.product?.name ||
                        item.productName ||
                        "Unknown Product"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.quantity || 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      ${money(item.unitPrice)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      ${money((item.quantity || 0) * (item.unitPrice || 0))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-5 flex justify-end">
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
            <span className="font-medium">${money(quotation.subTotal)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Discount</span>
            <span className="font-medium text-green-600">
              ${money(quotation.discount)}
            </span>
          </div>

          <div className="flex justify-between pt-3 border-t dark:border-slate-700 font-semibold text-slate-900 dark:text-white">
            <span>Total Amount</span>
            <span>${money(quotation.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
