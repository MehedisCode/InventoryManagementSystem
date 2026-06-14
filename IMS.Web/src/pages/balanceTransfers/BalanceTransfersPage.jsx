import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus, CheckCircle2, Ban } from "lucide-react";
import toast from "react-hot-toast";

import {
  getAll,
  deleteTransfer,
  complete,
  cancel,
} from "../../api/balanceTransferApi";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable from "../../components/shared/DataTable";
import Modal from "../../components/ui/Modal";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import BalanceTransferForm from "./BalanceTransferForm";
import { formatDate } from "../../utils/formatters";

export default function BalanceTransfersPage() {
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTransferId, setSelectedTransferId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState(null);

  const { data: transfersRes, isLoading } = useQuery({
    queryKey: ["balanceTransfers", statusFilter],
    queryFn: async () => {
      const res = await getAll(statusFilter === "All" ? undefined : statusFilter);
      return res?.data?.data || [];
    },
  });

  const data = useMemo(() => {
    const raw = Array.isArray(transfersRes) ? transfersRes : [];
    return raw;
  }, [transfersRes]);

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: deleteTransfer,
    onSuccess: () => {
      toast.success("Balance transfer deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["balanceTransfers"] });
      setIsDeleteDialogOpen(false);
    },
    onError: () => toast.error("Failed to delete balance transfer"),
  });

  const completeMutation = useMutation({
    mutationFn: complete,
    onSuccess: () => {
      toast.success("Balance transfer completed");
      queryClient.invalidateQueries({ queryKey: ["balanceTransfers"] });
      setIsCompleteDialogOpen(false);
    },
    onError: () => toast.error("Failed to complete balance transfer"),
  });

  const cancelMutation = useMutation({
    mutationFn: cancel,
    onSuccess: () => {
      toast.success("Balance transfer cancelled");
      queryClient.invalidateQueries({ queryKey: ["balanceTransfers"] });
      setIsCancelDialogOpen(false);
    },
    onError: () => toast.error("Failed to cancel balance transfer"),
  });

  // Action handlers
  const openCreate = () => {
    setSelectedTransferId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (record) => {
    setSelectedTransferId(record.id);
    setIsFormOpen(true);
  };

  const handleDelete = (record) => {
    setActionTarget(record);
    setIsDeleteDialogOpen(true);
  };

  const handleComplete = (record) => {
    setActionTarget(record);
    setIsCompleteDialogOpen(true);
  };

  const handleCancel = (record) => {
    setActionTarget(record);
    setIsCancelDialogOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedTransferId(null);
  };

  const confirmDelete = () =>
    actionTarget && deleteMutation.mutate(actionTarget.id);
  const confirmComplete = () =>
    actionTarget && completeMutation.mutate(actionTarget.id);
  const confirmCancel = () =>
    actionTarget && cancelMutation.mutate(actionTarget.id);

  const columns = [
    { header: "Ref No", accessor: "refNo" },
    { header: "From Account", accessor: "fromAccount" },
    { header: "To Account", accessor: "toAccount" },
    {
      header: "Amount",
      render: (row) => `$${(row.amount || 0).toFixed(2)}`,
    },
    {
      header: "Transfer Date",
      render: (row) => formatDate(row.transferDate),
    },
    { header: "Note", render: (row) => row.note || "-" },
    {
      header: "Status",
      render: (row) => <Badge status={row.status}>{row.status}</Badge>,
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>

          {row.status === "Pending" && (
            <>
              <button
                onClick={() => handleComplete(row)}
                className="p-1 text-slate-400 hover:text-green-500 transition-colors"
                title="Complete"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleCancel(row)}
                className="p-1 text-slate-400 hover:text-orange-500 transition-colors"
                title="Cancel"
              >
                <Ban className="w-4 h-4" />
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
        title="Balance Transfers"
        subtitle="Move funds between accounts"
        action={
          <Button iconLeft={Plus} onClick={openCreate}>
            New Transfer
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
                { value: "Completed", label: "Completed" },
                { value: "Cancelled", label: "Cancelled" },
              ]}
            />
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} />

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={selectedTransferId ? "Edit Transfer" : "New Transfer"}
        size="2xl"
      >
        <BalanceTransferForm
          transferId={selectedTransferId}
          onSuccess={closeForm}
          onCancel={closeForm}
        />
      </Modal>

      {/* Confirmations */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Balance Transfer"
        message="Are you sure you want to delete this transfer? This action cannot be undone."
        isDanger
      />
      <ConfirmDialog
        isOpen={isCompleteDialogOpen}
        onClose={() => setIsCompleteDialogOpen(false)}
        onConfirm={confirmComplete}
        title="Complete Transfer"
        message="Are you sure you want to mark this transfer as completed?"
        confirmText="Complete"
        isDanger={false}
      />
      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={confirmCancel}
        title="Cancel Transfer"
        message="Are you sure you want to cancel this transfer?"
        confirmText="Cancel Transfer"
        isDanger
      />
    </div>
  );
}
