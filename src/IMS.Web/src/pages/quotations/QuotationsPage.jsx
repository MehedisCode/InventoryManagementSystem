import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Trash2, Plus, ArrowRightCircle } from "lucide-react";
import toast from "react-hot-toast";

import {
  getQuotations,
  getExpiredQuotations,
  deleteQuotation,
  convertToSale,
} from "../../api/quotationApi";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable from "../../components/shared/DataTable";
import Modal from "../../components/ui/Modal";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import QuotationForm from "./QuotationForm";
import QuotationViewModal from "./QuotationViewModal";
import { formatDate } from "../../utils/formatters";

export default function QuotationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState(null);

  const { data: quotationsRes, isLoading: isLoadingAll } = useQuery({
    queryKey: ["quotations", "all"],
    queryFn: async () => {
      const res = await getQuotations();
      return res?.data?.data || [];
    },
  });

  const { data: expiredQuotationsRes, isLoading: isLoadingExpired } = useQuery({
    queryKey: ["quotations", "expired"],
    queryFn: async () => {
      const res = await getExpiredQuotations();
      return res?.data?.data || [];
    },
  });

  const rawData =
    activeTab === "all"
      ? Array.isArray(quotationsRes)
        ? quotationsRes
        : []
      : Array.isArray(expiredQuotationsRes)
        ? expiredQuotationsRes
        : [];

  const isLoading = activeTab === "all" ? isLoadingAll : isLoadingExpired;

  const data = useMemo(() => {
    if (statusFilter === "All") return rawData;
    return rawData.filter((q) => q.status === statusFilter);
  }, [rawData, statusFilter]);

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: deleteQuotation,
    onSuccess: () => {
      toast.success("Quotation deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      setIsDeleteDialogOpen(false);
    },
    onError: () => toast.error("Failed to delete quotation"),
  });

  const convertMutation = useMutation({
    mutationFn: convertToSale,
    onSuccess: () => {
      toast.success("Quotation converted to Sale!");
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      setIsConvertDialogOpen(false);
      navigate("/sales");
    },
    onError: () => toast.error("Failed to convert to sale"),
  });

  // Action handlers
  const handleDelete = (record) => {
    setActionTarget(record);
    setIsDeleteDialogOpen(true);
  };
  const handleConvert = (record) => {
    setActionTarget(record);
    setIsConvertDialogOpen(true);
  };

  const confirmDelete = () =>
    actionTarget && deleteMutation.mutate(actionTarget.id);
  const confirmConvert = () =>
    actionTarget && convertMutation.mutate(actionTarget.id);

  const columns = [
    { header: "Ref No", accessor: "referenceNo" },
    { header: "Customer", render: (row) => row.customerName || "Unknown" },
    {
      header: "Quotation Date",
      render: (row) => formatDate(row.quotationDate),
    },
    { header: "Expiry Date", render: (row) => formatDate(row.expiryDate) },
    {
      header: "Total Amount",
      render: (row) => `$${(row.totalAmount || 0).toFixed(2)}`,
    },
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
              setSelectedQuotation(row);
              setIsViewOpen(true);
            }}
            className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setSelectedQuotation(row);
              setIsFormOpen(true);
            }}
            className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>

          {(row.status === "Draft" || row.status === "Sent") && (
            <button
              onClick={() => handleConvert(row)}
              className="p-1 text-slate-400 hover:text-green-500 transition-colors"
              title="Convert to Sale"
            >
              <ArrowRightCircle className="w-4 h-4" />
            </button>
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
        title="Quotations"
        subtitle="Manage customer quotations and estimates"
        action={
          <Button
            iconLeft={Plus}
            onClick={() => {
              setSelectedQuotation(null);
              setIsFormOpen(true);
            }}
          >
            New Quotation
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-dark-card p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 gap-4">
        <div className="flex space-x-2 border-b dark:border-slate-700 pb-2 sm:pb-0 sm:border-b-0 w-full sm:w-auto">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-t-lg sm:rounded-lg ${
              activeTab === "all"
                ? "bg-slate-100 text-primary-600 dark:bg-slate-800 dark:text-primary-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
            onClick={() => setActiveTab("all")}
          >
            All Quotations
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-t-lg sm:rounded-lg ${
              activeTab === "expired"
                ? "bg-slate-100 text-primary-600 dark:bg-slate-800 dark:text-primary-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
            onClick={() => setActiveTab("expired")}
          >
            Expired
          </button>
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "All", label: "All Statuses" },
              { value: "Draft", label: "Draft" },
              { value: "Sent", label: "Sent" },
              { value: "Accepted", label: "Accepted" },
              { value: "Rejected", label: "Rejected" },
            ]}
          />
        </div>
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} />

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedQuotation ? "Edit Quotation" : "New Quotation"}
        size="2xl"
      >
        <QuotationForm
          quotationId={selectedQuotation?.id || null}
          onSuccess={() => setIsFormOpen(false)}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* View Modal */}
      <Modal
        onClose={() => setIsViewOpen(false)}
        isOpen={isViewOpen}
        title="View Quotation"
        size="2xl"
      >
        <QuotationViewModal
          id={selectedQuotation?.id}
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
        />
      </Modal>

      {/* Confirmations */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Quotation"
        message="Are you sure you want to delete this quotation? This action cannot be undone."
      />
      <ConfirmDialog
        isOpen={isConvertDialogOpen}
        onClose={() => setIsConvertDialogOpen(false)}
        onConfirm={confirmConvert}
        title="Convert to Sale"
        message="Are you sure you want to convert this quotation to a confirmed sale?"
      />
    </div>
  );
}
