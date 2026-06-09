import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { getPurchases, deletePurchase } from "../../api/purchaseApi";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable from "../../components/shared/DataTable";
import Modal from "../../components/ui/Modal";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import PurchaseForm from "./PurchaseForm";
import { formatDate } from "../../utils/formatters";

export default function PurchasesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");

  const queryClient = useQueryClient();

  const { data: purchasesRes, isLoading } = useQuery({
    queryKey: ["purchases"],
    queryFn: async () => {
      const res = await getPurchases();
      return res?.data?.data || [];
    },
  });

  const rawData = Array.isArray(purchasesRes) ? purchasesRes : [];

  const data = useMemo(() => {
    if (statusFilter === "All") return rawData;
    return rawData.filter((p) => p.status === statusFilter);
  }, [rawData, statusFilter]);

  const deleteMutation = useMutation({
    mutationFn: deletePurchase,
    onSuccess: () => {
      toast.success("Purchase deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      setIsDeleteDialogOpen(false);
    },
    onError: () => toast.error("Failed to delete purchase"),
  });

  const handleDelete = (purchase) => {
    setPurchaseToDelete(purchase);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (purchaseToDelete) {
      deleteMutation.mutate(purchaseToDelete.id);
    }
  };

  const columns = [
    { header: "Ref No", accessor: "referenceNo" },
    { header: "Supplier", render: (row) => row.supplier?.name || "Unknown" },
    { header: "Date", render: (row) => formatDate(row.purchaseDate) },
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
              setSelectedPurchase(row);
              setIsViewOpen(true);
            }}
            className="p-1 text-slate-400 hover:text-green-500 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedPurchase(row);
              setIsFormOpen(true);
            }}
            className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
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
        title="Purchases"
        subtitle="Manage purchases from suppliers"
        action={
          <Button
            iconLeft={Plus}
            onClick={() => {
              setSelectedPurchase(null);
              setIsFormOpen(true);
            }}
          >
            New Purchase
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
                { value: "Received", label: "Received" },
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
        title={selectedPurchase ? "Edit Purchase" : "New Purchase"}
        size="4xl"
      >
        <PurchaseForm
          purchase={selectedPurchase}
          onSuccess={() => setIsFormOpen(false)}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Purchase Details"
        size="2xl"
      >
        {selectedPurchase && (
          <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase mb-1">
                  Reference No
                </p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {selectedPurchase.referenceNo || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase mb-1">
                  Supplier
                </p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {selectedPurchase.supplier?.name || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase mb-1">
                  Date
                </p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {formatDate(selectedPurchase.purchaseDate)}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase mb-1">
                  Status
                </p>
                <Badge status={selectedPurchase.status}>
                  {selectedPurchase.status}
                </Badge>
              </div>
            </div>

            {selectedPurchase.note && (
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                  Note
                </h4>
                <p className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border dark:border-slate-700">
                  {selectedPurchase.note}
                </p>
              </div>
            )}

            <div>
              <h4 className="font-medium text-slate-900 dark:text-white mb-3 text-lg">
                Items
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
                        Unit Cost
                      </th>
                      <th className="px-4 py-2 font-medium text-right">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-700">
                    {selectedPurchase.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2">
                          {item.product?.name || "Unknown Product"}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-2 text-right">
                          ${(item.unitCost || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          ${(item.quantity * (item.unitCost || 0)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t dark:border-slate-700">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Subtotal:
                  </span>
                  <span>${(selectedPurchase.subTotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Discount:
                  </span>
                  <span>${(selectedPurchase.discount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-2 border-t dark:border-slate-700">
                  <span>Total Amount:</span>
                  <span>${(selectedPurchase.totalAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Paid Amount:</span>
                  <span>${(selectedPurchase.paidAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-600 dark:text-red-400">
                  <span>Due Amount:</span>
                  <span>${(selectedPurchase.dueAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Purchase"
        message="Are you sure you want to delete this purchase? This action cannot be undone."
      />
    </div>
  );
}
