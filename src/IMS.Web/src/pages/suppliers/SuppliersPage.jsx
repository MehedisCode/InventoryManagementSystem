import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../../api/supplierApi";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable from "../../components/shared/DataTable";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";

const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").or(z.literal("")).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export default function SuppliersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  const { data: suppliersRes, isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const res = await getSuppliers();
      return res?.data?.data;
    },
    retry: false,
  });

  const rawData = Array.isArray(suppliersRes) ? suppliersRes : [];

  const data = useMemo(() => {
    if (!searchTerm) return rawData;
    const lowerSearch = searchTerm.toLowerCase();
    return rawData.filter(
      (supplier) =>
        supplier.name?.toLowerCase().includes(lowerSearch) ||
        supplier.email?.toLowerCase().includes(lowerSearch),
    );
  }, [rawData, searchTerm]);

  const deleteMutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      toast.success("Supplier deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: () => toast.error("Failed to delete supplier"),
  });

  const handleDelete = (supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (supplierToDelete) {
      deleteMutation.mutate(supplierToDelete.id);
    }
  };

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Email", render: (row) => row.email || "-" },
    { header: "Phone", render: (row) => row.phone || "-" },
    { header: "Address", render: (row) => row.address || "-" },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedSupplier(row);
              setIsFormOpen(true);
            }}
            className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: { name: "", email: "", phone: "", address: "" },
  });

  useEffect(() => {
    if (selectedSupplier && isFormOpen) {
      reset({
        name: selectedSupplier.name || "",
        email: selectedSupplier.email || "",
        phone: selectedSupplier.phone || "",
        address: selectedSupplier.address || "",
      });
    } else if (!isFormOpen) {
      reset({ name: "", email: "", phone: "", address: "" });
    }
  }, [selectedSupplier, isFormOpen, reset]);

  const saveMutation = useMutation({
    mutationFn: (formData) =>
      selectedSupplier
        ? updateSupplier(selectedSupplier.id, formData)
        : createSupplier(formData),
    onSuccess: () => {
      toast.success(
        `Supplier ${selectedSupplier ? "updated" : "created"} successfully`,
      );
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setIsFormOpen(false);
    },
    onError: () => toast.error("Something went wrong"),
  });

  const onSubmit = (formData) => saveMutation.mutate(formData);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        subtitle="Manage your suppliers"
        action={
          <Button
            iconLeft={Plus}
            onClick={() => {
              setSelectedSupplier(null);
              setIsFormOpen(true);
            }}
          >
            Add Supplier
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="w-full sm:w-1/3 relative">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedSupplier ? "Edit Supplier" : "Add Supplier"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              isLoading={saveMutation.isPending}
            >
              {selectedSupplier ? "Update" : "Create"}
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            label="Name *"
            {...register("name")}
            error={errors.name?.message}
          />
          <Input
            label="Email"
            type="email"
            {...register("email")}
            error={errors.email?.message}
          />
          <Input
            label="Phone"
            {...register("phone")}
            error={errors.phone?.message}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Address
            </label>
            <textarea
              {...register("address")}
              className="flex min-h-25 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-900 dark:border-slate-700 dark:text-slate-100 dark:focus:ring-primary-400"
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Supplier"
        message={`Are you sure you want to delete "${supplierToDelete?.name}"?`}
      />
    </div>
  );
}
