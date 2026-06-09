import { useState, useMemo, useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { createPurchase, updatePurchase } from "../../api/purchaseApi";
import { getSuppliers } from "../../api/supplierApi";
import { getProducts } from "../../api/productApi";

import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

const purchaseItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().min(1, "Min quantity is 1"),
  unitCost: z.coerce.number().min(0, "Cost cannot be negative"),
});

const purchaseSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  purchaseDate: z.string().min(1, "Date is required"),
  status: z.enum(["Pending", "Received", "Cancelled"]),
  note: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, "At least 1 item is required"),
  discount: z.coerce.number().min(0).optional().default(0),
  paidAmount: z.coerce.number().min(0).optional().default(0),
});

export default function PurchaseForm({ purchase, onSuccess, onCancel }) {
  const queryClient = useQueryClient();
  const isEditing = !!purchase;

  const { data: suppliersRes } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const res = await getSuppliers();
      return res?.data?.data || [];
    },
  });
  const suppliers = Array.isArray(suppliersRes) ? suppliersRes : [];

  const { data: productsRes } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await getProducts();
      return res?.data?.data || [];
    },
  });
  const products = Array.isArray(productsRes) ? productsRes : [];

  const defaultValues = useMemo(() => {
    if (isEditing && purchase) {
      return {
        supplierId: purchase.supplierId || "",
        purchaseDate: purchase.purchaseDate
          ? new Date(purchase.purchaseDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        status: purchase.status || "Pending",
        note: purchase.note || "",
        items: purchase.items?.length
          ? purchase.items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitCost: i.unitCost,
            }))
          : [{ productId: "", quantity: 1, unitCost: 0 }],
        discount: purchase.discount || 0,
        paidAmount: purchase.paidAmount || 0,
      };
    }
    return {
      supplierId: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      status: "Pending",
      note: "",
      items: [{ productId: "", quantity: 1, unitCost: 0 }],
      discount: 0,
      paidAmount: 0,
    };
  }, [isEditing, purchase]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(purchaseSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = useWatch({ control, name: "items" });
  const watchedDiscount = useWatch({ control, name: "discount" });
  const watchedPaid = useWatch({ control, name: "paidAmount" });

  const subTotal = (watchedItems || []).reduce((sum, item) => {
    const q = Number(item.quantity) || 0;
    const c = Number(item.unitCost) || 0;
    return sum + q * c;
  }, 0);

  const discount = Number(watchedDiscount) || 0;
  const totalAmount = subTotal - discount;
  const paidAmount = Number(watchedPaid) || 0;
  const dueAmount = totalAmount - paidAmount;

  const saveMutation = useMutation({
    mutationFn: (formData) =>
      isEditing
        ? updatePurchase(purchase.id, formData)
        : createPurchase(formData),
    onSuccess: () => {
      toast.success(
        `Purchase ${isEditing ? "updated" : "created"} successfully`,
      );
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      onSuccess?.();
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0] ||
        error?.message ||
        "Failed to save purchase";

      toast.error(message);
    },
  });

  const onSubmit = (data) => {
    console.log("data", data);
    saveMutation.mutate({
      ...data,
      purchaseDate: new Date(data.purchaseDate).toISOString(),
      totalAmount,
      subTotal,
      dueAmount,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 flex flex-col">
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Supplier *"
          {...register("supplierId")}
          error={errors.supplierId?.message}
          options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
        />
        <Input
          label="Purchase Date *"
          type="date"
          {...register("purchaseDate")}
          error={errors.purchaseDate?.message}
        />
        <Select
          label="Status *"
          {...register("status")}
          error={errors.status?.message}
          options={[
            { value: "Pending", label: "Pending" },
            { value: "Received", label: "Received" },
            { value: "Cancelled", label: "Cancelled" },
          ]}
        />
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Note
          </label>
          <textarea
            {...register("note")}
            className="flex min-h-20 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-900 dark:border-slate-700 dark:text-slate-100 dark:focus:ring-primary-400"
          />
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Items
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            iconLeft={Plus}
            onClick={() => append({ productId: "", quantity: 1, unitCost: 0 })}
          >
            Add Item
          </Button>
        </div>

        {errors.items?.root?.message && (
          <p className="text-sm text-red-500">{errors.items.root.message}</p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3 min-w-50">Product *</th>
                <th className="px-4 py-3 w-32">Quantity *</th>
                <th className="px-4 py-3 w-32">Unit Cost *</th>
                <th className="px-4 py-3 w-32">SubTotal</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => {
                const itemQ = Number(watchedItems?.[index]?.quantity) || 0;
                const itemC = Number(watchedItems?.[index]?.unitCost) || 0;
                const itemSub = itemQ * itemC;

                return (
                  <tr key={field.id} className="border-b dark:border-slate-700">
                    <td className="px-4 py-2">
                      <Select
                        {...register(`items.${index}.productId`)}
                        options={products.map((p) => ({
                          value: p.id,
                          label: p.name,
                        }))}
                        error={errors.items?.[index]?.productId?.message}
                        onChange={(e) => {
                          const val = e.target.value;
                          setValue(`items.${index}.productId`, val);
                          const prod = products.find((p) => p.id === val);
                          if (prod) {
                            setValue(
                              `items.${index}.unitCost`,
                              prod.costPrice || 0,
                            );
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.quantity`)}
                        error={errors.items?.[index]?.quantity?.message}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.unitCost`)}
                        error={errors.items?.[index]?.unitCost?.message}
                      />
                    </td>
                    <td className="px-4 py-2 font-medium">
                      ${itemSub.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {fields.length === 0 && (
            <div className="text-center py-4 text-slate-500 dark:text-slate-400">
              No items added. Please add at least one item.
            </div>
          )}
        </div>
      </div>

      {/* Summary Section */}
      <div className="flex justify-end">
        <div className="w-full sm:w-1/2 md:w-1/3 space-y-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600 dark:text-slate-300">
              Subtotal:
            </span>
            <span className="font-medium text-slate-900 dark:text-white">
              ${subTotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
              Discount:
            </span>
            <div className="w-32">
              <Input
                type="number"
                step="0.01"
                {...register("discount")}
                error={errors.discount?.message}
              />
            </div>
          </div>
          <div className="flex justify-between items-center text-lg font-semibold border-t dark:border-slate-700 pt-3">
            <span className="text-slate-900 dark:text-white">
              Total Amount:
            </span>
            <span className="text-primary-600 dark:text-primary-400">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
              Paid Amount:
            </span>
            <div className="w-32">
              <Input
                type="number"
                step="0.01"
                {...register("paidAmount")}
                error={errors.paidAmount?.message}
              />
            </div>
          </div>
          <div className="flex justify-between items-center text-md font-medium border-t dark:border-slate-700 pt-3">
            <span className="text-slate-700 dark:text-slate-200">
              Due Amount:
            </span>
            <span
              className={`${
                dueAmount > 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              ${dueAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-800">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={saveMutation.isPending}>
          {isEditing ? "Update Purchase" : "Save Purchase"}
        </Button>
      </div>
    </form>
  );
}
