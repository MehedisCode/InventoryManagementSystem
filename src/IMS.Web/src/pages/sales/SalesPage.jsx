import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { getSales, deleteSale, getSale } from "../../api/saleApi";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable from "../../components/shared/DataTable";
import Modal from "../../components/ui/Modal";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import SaleForm from "./SaleForm";
import SaleView from "./SaleView";
import { formatDate } from "../../utils/formatters";

export default function SalesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  // const [selectedSale, setSelectedSale] = useState(null);
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [isLoadingSale, setIsLoadingSale] = useState(false);

  const queryClient = useQueryClient();

  const { data: salesRes, isLoading } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const res = await getSales();
      return res?.data?.data || [];
    },
  });

  const rawData = Array.isArray(salesRes) ? salesRes : [];

  const data = useMemo(() => {
    if (statusFilter === "All") return rawData;
    return rawData.filter((s) => s.status === statusFilter);
  }, [rawData, statusFilter]);

  const deleteMutation = useMutation({
    mutationFn: deleteSale,
    onSuccess: () => {
      toast.success("Sale deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      setIsDeleteDialogOpen(false);
    },
    onError: () => toast.error("Failed to delete sale"),
  });

  const handleDelete = (sale) => {
    setSaleToDelete(sale);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (saleToDelete) {
      deleteMutation.mutate(saleToDelete.id);
    }
  };

  const loadSaleDetails = async (saleId) => {
    try {
      const res = await getSale(saleId);
      return res?.data?.data;
    } catch (error) {
      toast.error("Failed to load sale details");
      return null;
    }
  };

  const columns = [
    { header: "Ref No", accessor: "referenceNo" },
    {
      header: "Customer",
      render: (row) => row?.customerName || "Unknown",
    },
    { header: "Date", render: (row) => formatDate(row.saleDate) },
    {
      header: "Total Amount",
      render: (row) => `$${(row.totalAmount || 0).toFixed(2)}`,
    },
    {
      header: "Paid Amount",
      render: (row) => `$${(row.paidAmount || 0).toFixed(2)}`,
    },
    {
      header: "Due Amount",
      render: (row) => `$${(row.dueAmount || 0).toFixed(2)}`,
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
              setSelectedSaleId(row.id);
              setIsViewOpen(true);
            }}
            className="p-1 text-slate-400 hover:text-green-500 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={async () => {
              const sale = await loadSaleDetails(row.id);
              if (sale) {
                setSelectedSaleId(sale.id);
                setIsFormOpen(true);
              }
            }}
            className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={async () => {
              const sale = await loadSaleDetails(row.id);
              if (sale) {
                setSelectedSaleId(sale.id);
                setIsViewOpen(true);
              }
            }}
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
        title="Sales"
        subtitle="Manage sales and customer invoices"
        action={
          <Button
            iconLeft={Plus}
            onClick={() => {
              setSelectedSaleId(null);
              setIsFormOpen(true);
            }}
          >
            New Sale
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
        onClose={() => setIsFormOpen(false)}
        title={selectedSaleId ? "Edit Sale" : "New Sale"}
        size="2xl"
      >
        <SaleForm
          saleId={selectedSaleId}
          onSuccess={() => {
            setIsFormOpen(false);
            setSelectedSaleId(null);
          }}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedSaleId(null);
          }}
        />
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Sale Details"
        size="2xl"
      >
        <SaleView saleId={selectedSaleId} />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Sale"
        message="Are you sure you want to delete this sale? This action cannot be undone."
      />
    </div>
  );
}
