import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { formatDate } from "../../utils/formatters";
import { useQuery } from "@tanstack/react-query";
import { getSaleReturn } from "../../api/saleReturnApi";

const money = (value) => Number(value || 0).toFixed(2);

export default function SaleReturnViewModal({ isOpen, onClose, saleReturnId }) {
  const {
    data: saleReturn,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["saleReturn", saleReturnId],
    queryFn: async () => {
      var res = await getSaleReturn(saleReturnId);
      return res?.data?.data;
    },
    enabled: !!saleReturnId && isOpen,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sale Return Details"
      size="2xl"
    >
      {isLoading && (
        <div className="flex items-center justify-center py-16 text-slate-500">
          Loading...
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center py-16 text-rose-500">
          Failed to load sale return details.
        </div>
      )}

      {saleReturn && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Return #{saleReturn.referenceNo || "N/A"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {saleReturn.returnDate
                    ? formatDate(saleReturn.returnDate)
                    : "N/A"}
                </p>
              </div>
            </div>
            <Badge status={saleReturn.status}>
              {saleReturn.status || "Unknown"}
            </Badge>
          </div>

          {/* Information */}
          <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-200 dark:border-slate-700">
            <div className="p-5 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                Return Ref No
              </p>
              <p className="font-medium text-slate-900 dark:text-white">
                {saleReturn.referenceNo || "N/A"}
              </p>
            </div>
            <div className="p-5 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                Sale Ref No
              </p>
              <p className="font-medium text-slate-900 dark:text-white">
                {saleReturn.saleReferenceNo || "Unknown"}
              </p>
            </div>
            <div className="p-5 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                Customer
              </p>
              <p className="font-medium text-slate-900 dark:text-white">
                {saleReturn.customerName || "Unknown"}
              </p>
            </div>
            <div className="p-5">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                Return Date
              </p>
              <p className="font-medium text-slate-900 dark:text-white">
                {saleReturn.returnDate
                  ? formatDate(saleReturn.returnDate)
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Reason */}
          {saleReturn.reason && (
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                Reason
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {saleReturn.reason}
              </p>
            </div>
          )}

          {/* Items */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Items Returned
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
                  {saleReturn.items?.length > 0 ? (
                    saleReturn.items.map((item, index) => (
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
              <div className="flex justify-between pt-3 border-t dark:border-slate-700 font-semibold text-slate-900 dark:text-white">
                <span>Total Amount</span>
                <span>${money(saleReturn.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
