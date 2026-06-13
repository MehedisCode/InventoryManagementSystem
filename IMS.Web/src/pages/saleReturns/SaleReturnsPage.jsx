import { useState, useMemo, useEffect } from "react";
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
import SaleReturnViewModal from "./SaleReturnViewModal";
import { formatDate } from "../../utils/formatters";

export default function SaleReturnsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedReturnId, setSelectedReturnId] = useState(null);
  const [selectedReturnRow, setSelectedReturnRow] = useState(null);
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
      render: (row) => row?.saleReferenceNo || "Unknown",
    },
    { header: "Customer", render: (row) => row.customerName || "Unknown" },
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
              setSelectedReturnRow(row);
              setIsViewOpen(true);
            }}
            className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setSelectedReturnId(row.id);
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
              setSelectedReturnId(null);
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
        onClose={() => {
          setIsFormOpen(false);
          setSelectedReturnId(null);
        }}
        title={selectedReturnId ? "Edit Sale Return" : "New Sale Return"}
        size="2xl"
      >
        <SaleReturnForm
          saleReturnId={selectedReturnId}
          onSuccess={() => {
            setIsFormOpen(false);
            setSelectedReturnId(null);
          }}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedReturnId(null);
          }}
        />
      </Modal>

      {/* View Modal */}
      <SaleReturnViewModal
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedReturnRow(null);
        }}
        saleReturnId={selectedReturnRow?.id}
      />

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
