import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Trash2, Plus, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

import {
  getSaleReturns,
  deleteSaleReturn,
  approveSaleReturn,
  rejectSaleReturn,
} from "../../api/saleReturnApi";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable from "../../components/shared/DataTable";
import Modal from "../../components/ui/Modal";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import SaleReturnForm from "./SaleReturnForm";
import { formatDate } from "../../utils/formatters";

export default function SaleReturnsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState(null);

  const queryClient = useQueryClient();

  const { data: saleReturnsRes, isLoading } = useQuery({
    queryKey: ["saleReturns"],
    queryFn: async () => {
      const res = await getSaleReturns();
      return res?.data?.data || [];
    },
  });

  const rawData = Array.isArray(saleReturnsRes) ? saleReturnsRes : [];

  const data = useMemo(() => {
    if (statusFilter === "All") return rawData;
    return rawData.filter((r) => r.status === statusFilter);
  }, [rawData, statusFilter]);

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: deleteSaleReturn,
    onSuccess: () => {
      toast.success("Sale return deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["saleReturns"] });
      setIsDeleteDialogOpen(false);
    },
    onError: () => toast.error("Failed to delete sale return"),
  });

  const approveMutation = useMutation({
    mutationFn: approveSaleReturn,
    onSuccess: () => {
      toast.success("Sale return approved");
      queryClient.invalidateQueries({ queryKey: ["saleReturns"] });
      setIsApproveDialogOpen(false);
    },
    onError: () => toast.error("Failed to approve sale return"),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectSaleReturn,
    onSuccess: () => {
      toast.success("Sale return rejected");
      queryClient.invalidateQueries({ queryKey: ["saleReturns"] });
      setIsRejectDialogOpen(false);
    },
    onError: () => toast.error("Failed to reject sale return"),
  });

  // Action handlers
  const handleDelete = (record) => {
    setActionTarget(record);
    setIsDeleteDialogOpen(true);
  };
  const handleApprove = (record) => {
    setActionTarget(record);
    setIsApproveDialogOpen(true);
  };
  const handleReject = (record) => {
    setActionTarget(record);
    setIsRejectDialogOpen(true);
  };

  const confirmDelete = () =>
    actionTarget && deleteMutation.mutate(actionTarget.id);
  const confirmApprove = () =>
    actionTarget && approveMutation.mutate(actionTarget.id);
  const confirmReject = () =>
    actionTarget && rejectMutation.mutate(actionTarget.id);

  const columns = [
    { header: "Ref No", accessor: "referenceNo" },
    {
      header: "Sale Ref No",
      render: (row) => row.sale?.referenceNo || "Unknown",
    },
    { header: "Customer", render: (row) => row.customer?.name || "Unknown" },
    { header: "Return Date", render: (row) => formatDate(row.returnDate) },
    {
      header: "Total Amount",
      render: (row) => `$${(row.totalAmount || 0).toFixed(2)}`,
    },
    { header: "Reason", render: (row) => row.reason || "-" },
    {
      header: "Status",
      render: (row) => <Badge status={row.status}>{row.status}</Badge>,
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedReturn(row);
              setIsViewOpen(true);
            }}
            className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setSelectedReturn(row);
              setIsFormOpen(true);
            }}
            className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>

          {row.status === "Pending" && (
            <>
              <button
                onClick={() => handleApprove(row)}
                className="p-1 text-slate-400 hover:text-green-500 transition-colors"
                title="Approve"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleReject(row)}
                className="p-1 text-slate-400 hover:text-orange-500 transition-colors"
                title="Reject"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={() => handleDelete(row)}
            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Returns"
        subtitle="Manage customer returns"
        action={
          <Button
            iconLeft={Plus}
            onClick={() => {
              setSelectedReturn(null);
              setIsFormOpen(true);
            }}
          >
            New Return
          </Button>
        }
      />

      <div className="flex justify-between items-center bg-white dark:bg-dark-card p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "All", label: "All Statuses" },
                { value: "Pending", label: "Pending" },
                { value: "Approved", label: "Approved" },
                { value: "Rejected", label: "Rejected" },
              ]}
            />
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} />

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedReturn ? "Edit Sale Return" : "New Sale Return"}
        size="4xl"
      >
        <SaleReturnForm
          saleReturn={selectedReturn}
          onSuccess={() => setIsFormOpen(false)}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Sale Return Details"
        size="2xl"
      >
        {selectedReturn && (
          <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase mb-1">
                  Ref No
                </p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {selectedReturn.referenceNo || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase mb-1">
                  Sale Ref No
                </p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {selectedReturn.sale?.referenceNo || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase mb-1">
                  Return Date
                </p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {formatDate(selectedReturn.returnDate)}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase mb-1">
                  Status
                </p>
                <Badge status={selectedReturn.status}>
                  {selectedReturn.status}
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                Reason
              </h4>
              <p className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border dark:border-slate-700">
                {selectedReturn.reason || "-"}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 dark:text-white mb-3 text-lg">
                Items Returned
              </h4>
              <div className="overflow-x-auto border rounded-lg dark:border-slate-700">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-2 font-medium">Product</th>
                      <th className="px-4 py-2 font-medium text-right">
                        Quantity
                      </th>
                      <th className="px-4 py-2 font-medium text-right">
                        Unit Price
                      </th>
                      <th className="px-4 py-2 font-medium text-right">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-700">
                    {selectedReturn.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2">
                          {item.product?.name || "Unknown Product"}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-2 text-right">
                          ${(item.unitPrice || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          ${(item.quantity * (item.unitPrice || 0)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t dark:border-slate-700">
              <div className="w-64 space-y-2">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-2">
                  <span>Total Amount:</span>
                  <span>${(selectedReturn.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmations */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Sale Return"
        message="Are you sure you want to delete this return? This action cannot be undone."
      />
      <ConfirmDialog
        isOpen={isApproveDialogOpen}
        onClose={() => setIsApproveDialogOpen(false)}
        onConfirm={confirmApprove}
        title="Approve Return"
        message="Are you sure you want to approve this return?"
      />
      <ConfirmDialog
        isOpen={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        onConfirm={confirmReject}
        title="Reject Return"
        message="Are you sure you want to reject this return?"
      />
    </div>
  );
}
