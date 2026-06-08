import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../../api/customerApi";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable from "../../components/shared/DataTable";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").or(z.literal("")).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export default function CustomersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  const { data: customersRes, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await getCustomers();
      return res?.data?.data;
    },
    retry: false,
  });

  const rawData = Array.isArray(customersRes) ? customersRes : [];

  const data = useMemo(() => {
    if (!searchTerm) return rawData;
    const lowerSearch = searchTerm.toLowerCase();
    return rawData.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(lowerSearch) ||
        customer.email?.toLowerCase().includes(lowerSearch),
    );
  }, [rawData, searchTerm]);

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      toast.success("Customer deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: () => toast.error("Failed to delete customer"),
  });

  const handleDelete = (customer) => {
    setCustomerToDelete(customer);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (customerToDelete) {
      deleteMutation.mutate(customerToDelete.id);
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
              setSelectedCustomer(row);
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
    resolver: zodResolver(customerSchema),
    defaultValues: { name: "", email: "", phone: "", address: "" },
  });

  useEffect(() => {
    if (selectedCustomer && isFormOpen) {
      reset({
        name: selectedCustomer.name || "",
        email: selectedCustomer.email || "",
        phone: selectedCustomer.phone || "",
        address: selectedCustomer.address || "",
      });
    } else if (!isFormOpen) {
      reset({ name: "", email: "", phone: "", address: "" });
    }
  }, [selectedCustomer, isFormOpen, reset]);

  const saveMutation = useMutation({
    mutationFn: (formData) =>
      selectedCustomer
        ? updateCustomer(selectedCustomer.id, formData)
        : createCustomer(formData),
    onSuccess: () => {
      toast.success(
        `Customer ${selectedCustomer ? "updated" : "created"} successfully`,
      );
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setIsFormOpen(false);
    },
    onError: () => toast.error("Something went wrong"),
  });

  const onSubmit = (formData) => saveMutation.mutate(formData);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        subtitle="Manage your customers"
        action={
          <Button
            iconLeft={Plus}
            onClick={() => {
              setSelectedCustomer(null);
              setIsFormOpen(true);
            }}
          >
            Add Customer
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
        title={selectedCustomer ? "Edit Customer" : "Add Customer"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              isLoading={saveMutation.isPending}
            >
              {selectedCustomer ? "Update" : "Create"}
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
        title="Delete Customer"
        message={`Are you sure you want to delete "${customerToDelete?.name}"?`}
      />
    </div>
  );
}
