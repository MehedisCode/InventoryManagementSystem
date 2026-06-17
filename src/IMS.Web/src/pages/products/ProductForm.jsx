import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createProduct, updateProduct } from "../../api/productApi";
import { getCategories } from "../../api/categoryApi";
import { getUnits } from "../../api/setupApi";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  unitId: z.string().min(1, "Unit is required"),
  costPrice: z.coerce.number().min(0, "Cost price must be >= 0"),
  salePrice: z.coerce.number().min(0, "Sale price must be >= 0"),
  stockQuantity: z.coerce.number().min(0, "Stock quantity must be >= 0"),
  alertQuantity: z.coerce.number().min(0, "Alert quantity must be >= 0"),
  imageUrl: z.string().optional(),
});

export default function ProductForm({ isOpen, onClose, product = null }) {
  const queryClient = useQueryClient();
  const isEditing = !!product;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      categoryId: "",
      unitId: "",
      costPrice: 0,
      salePrice: 0,
      stockQuantity: 0,
      alertQuantity: 0,
      imageUrl: "",
    },
  });

  useEffect(() => {
    if (product && isOpen) {
      reset({
        name: product.name,
        sku: product.sku,
        description: product.description || "",
        categoryId: product.categoryId || product.category?.id || "",
        unitId: product.unitId || product.unit?.id || "",
        costPrice: product.costPrice,
        salePrice: product.salePrice,
        stockQuantity: product.stockQuantity,
        alertQuantity: product.alertQuantity,
        imageUrl: product.imageUrl || "",
      });
    } else if (!isOpen) {
      reset();
    }
  }, [product, isOpen, reset]);

  const { data: categoriesRes } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    retry: false,
  });

  const { data: unitsRes } = useQuery({
    queryKey: ["units"],
    queryFn: getUnits,
    retry: false,
  });

  const categoryOptions = (categoriesRes?.data?.data || []).map((c) => ({
    label: c.name,
    value: c.id,
  }));

  const unitOptions = (unitsRes?.data?.data || []).map((u) => ({
    label: u.name,
    value: u.id,
  }));

  const mutation = useMutation({
    mutationFn: (data) =>
      isEditing ? updateProduct(product.id, data) : createProduct(data),
    onSuccess: () => {
      toast.success(
        `Product successfully ${isEditing ? "updated" : "created"}`,
      );
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });

  const onSubmit = (data) => {
    console.log(data);
    mutation.mutate(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Product" : "Add Product"}
      size="2xl"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            isLoading={mutation.isPending}
          >
            {isEditing ? "Update" : "Create"}
          </Button>
        </>
      }
    >
      <form
        id="product-form"
        className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <div className="col-span-1 sm:col-span-2">
          <Input
            label="Name *"
            {...register("name")}
            error={errors.name?.message}
          />
        </div>
        <Input label="SKU *" {...register("sku")} error={errors.sku?.message} />
        <Select
          label="Category *"
          options={categoryOptions}
          {...register("categoryId")}
          error={errors.categoryId?.message}
        />
        <Select
          label="Unit *"
          options={unitOptions}
          {...register("unitId")}
          error={errors.unitId?.message}
        />
        <Input
          label="Cost Price *"
          type="number"
          step="0.01"
          {...register("costPrice")}
          error={errors.costPrice?.message}
        />
        <Input
          label="Sale Price *"
          type="number"
          step="0.01"
          {...register("salePrice")}
          error={errors.salePrice?.message}
        />
        <Input
          label="Stock Quantity *"
          type="number"
          {...register("stockQuantity")}
          error={errors.stockQuantity?.message}
        />
        <Input
          label="Alert Quantity *"
          type="number"
          {...register("alertQuantity")}
          error={errors.alertQuantity?.message}
        />
        <div className="col-span-1 sm:col-span-2">
          <Input
            label="Image URL"
            {...register("imageUrl")}
            error={errors.imageUrl?.message}
          />
        </div>
        <div className="col-span-1 sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <textarea
            {...register("description")}
            className="flex min-h-20 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent dark:border-slate-700 dark:text-slate-100 dark:focus:ring-primary-400"
          />
        </div>
      </form>
    </Modal>
  );
}
