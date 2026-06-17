import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/categoryApi";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable from "../../components/shared/DataTable";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import { formatDate } from "../../utils/formatters";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export default function CategoriesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const queryClient = useQueryClient();

  const { data: categoriesRes, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await getCategories();
      return res?.data?.data;
    },
    retry: false,
  });

  const data = Array.isArray(categoriesRes) ? categoriesRes : [];

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => toast.error("Failed to delete category"),
  });

  const handleDelete = (category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete.id);
    }
  };

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Description", render: (row) => row.description || "-" },
    { header: "Created Date", render: (row) => formatDate(row.createdAt) },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedCategory(row);
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

  // Inline Form Logic
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (selectedCategory && isFormOpen) {
      reset({
        name: selectedCategory.name,
        description: selectedCategory.description || "",
      });
    } else if (!isFormOpen) {
      reset({ name: "", description: "" });
    }
  }, [selectedCategory, isFormOpen, reset]);

  const saveMutation = useMutation({
    mutationFn: (formData) =>
      selectedCategory
        ? updateCategory(selectedCategory.id, formData)
        : createCategory(formData),
    onSuccess: () => {
      toast.success(
        `Category ${selectedCategory ? "updated" : "created"} successfully`,
      );
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsFormOpen(false);
    },
    onError: () => toast.error("Something went wrong"),
  });

  const onSubmit = (formData) => saveMutation.mutate(formData);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        subtitle="Manage product categories"
        action={
          <Button
            iconLeft={Plus}
            onClick={() => {
              setSelectedCategory(null);
              setIsFormOpen(true);
            }}
          >
            Add Category
          </Button>
        }
      />

      <DataTable columns={columns} data={data} isLoading={isLoading} />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedCategory ? "Edit Category" : "Add Category"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              isLoading={saveMutation.isPending}
            >
              {selectedCategory ? "Update" : "Create"}
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
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              {...register("description")}
              className="flex min-h-25 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-900 dark:border-slate-700 dark:text-slate-100 dark:focus:ring-primary-400"
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"?`}
      />
    </div>
  );
}
