import { useState, useMemo, useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import { getSale, createSale, updateSale } from "../../api/saleApi";
import { getCustomers } from "../../api/customerApi";
import { getProducts } from "../../api/productApi";

import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

export default function SaleForm({ saleId, onSuccess, onCancel }) {
  const queryClient = useQueryClient();
  const isEditing = !!saleId;

  const { data: customersRes } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await getCustomers();
      return res?.data?.data || [];
    },
  });
  const customers = Array.isArray(customersRes) ? customersRes : [];

  const { data: productsRes } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await getProducts();
      return res?.data?.data || [];
    },
  });
  const products = Array.isArray(productsRes) ? productsRes : [];

  const { data: sale } = useQuery({
    queryKey: ["sale", saleId],
    queryFn: async () => {
      const res = await getSale(saleId);
      return res?.data?.data;
    },
    enabled: !!saleId,
  });

  // Create schema dynamically to allow stock validation
  const saleSchema = useMemo(() => {
    return z.object({
      customerId: z.string().min(1, "Customer is required"),
      saleDate: z.string().min(1, "Date is required"),
      status: z.enum(["Pending", "Completed", "Cancelled"]),
      note: z.string().optional(),
      items: z
        .array(
          z.object({
            productId: z.string().min(1, "Product is required"),
            quantity: z.coerce.number().min(1, "Min quantity is 1"),
            unitPrice: z.coerce.number().min(0, "Price cannot be negative"),
          }),
        )
        .min(1, "At least 1 item is required")
        .superRefine((items, ctx) => {
          items.forEach((item, index) => {
            const product = products.find((p) => p.id === item.productId);
            if (product && item.quantity > (product.stockQuantity || 0)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Exceeds stock (${product.stockQuantity || 0})`,
                path: [index, "quantity"],
              });
            }
          });
        }),
      discount: z.coerce.number().min(0).optional().default(0),
      paidAmount: z.coerce.number().min(0).optional().default(0),
    });
  }, [products]);

  const defaultValues = useMemo(() => {
    if (isEditing && sale) {
      return {
        customerId: sale.customerId || "",
        saleDate: sale.saleDate
          ? new Date(sale.saleDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        status: sale.status || "Pending",
        note: sale.note || "",
        items: sale.items?.length
          ? sale.items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
            }))
          : [{ productId: "", quantity: 1, unitPrice: 0 }],
        discount: sale.discount || 0,
        paidAmount: sale.paidAmount || 0,
      };
    }
    return {
      customerId: "",
      saleDate: new Date().toISOString().split("T")[0],
      status: "Pending",
      note: "",
      items: [{ productId: "", quantity: 1, unitPrice: 0 }],
      discount: 0,
      paidAmount: 0,
    };
  }, [isEditing, sale]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(saleSchema),
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
    const p = Number(item.unitPrice) || 0;
    return sum + q * p;
  }, 0);

  const discount = Number(watchedDiscount) || 0;
  const totalAmount = subTotal - discount;
  const paidAmount = Number(watchedPaid) || 0;
  const dueAmount = totalAmount - paidAmount;

  const saveMutation = useMutation({
    mutationFn: (formData) =>
      isEditing ? updateSale(sale.id, formData) : createSale(formData),
    onSuccess: () => {
      toast.success(`Sale ${isEditing ? "updated" : "created"} successfully`);
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      onSuccess?.();
    },
    onError: () => toast.error("Failed to save sale"),
  });

  const onSubmit = (data) => {
    saveMutation.mutate({
      ...data,
      saleDate: new Date(data.saleDate),
      totalAmount,
      subTotal,
      dueAmount,
    });
  };

  useEffect(() => {
    if (sale) {
      reset({
        customerId: sale?.customerId || "",
        saleDate: sale.saleDate
          ? new Date(sale.saleDate).toISOString().split("T")[0]
          : "",
        status: sale.status || "Pending",
        note: sale.note || "",
        items:
          sale.items?.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })) || [],
        discount: sale.discount || 0,
        paidAmount: sale.paidAmount || 0,
      });
    }
  }, [sale, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 flex flex-col">
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isEditing ? (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Customer
            </label>
            <div className="flex h-10 w-full items-center rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-not-allowed">
              {customers.find((c) => c.id === sale?.customerId)?.name ||
                sale?.CustomerName}
            </div>
            <input type="hidden" {...register("customerId")} />
          </div>
        ) : (
          <Select
            label="Customer *"
            {...register("customerId")}
            error={errors.customerId?.message}
            options={customers.map((c) => ({ value: c.id, label: c.name }))}
          />
        )}
        <Input
          label="Sale Date *"
          type="date"
          {...register("saleDate")}
          error={errors.saleDate?.message}
        />
        <Select
          label="Status *"
          {...register("status")}
          error={errors.status?.message}
          options={[
            { value: "Pending", label: "Pending" },
            { value: "Completed", label: "Completed" },
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
            onClick={() => append({ productId: "", quantity: 1, unitPrice: 0 })}
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
                <th className="px-4 py-3 min-w-62.5">Product *</th>
                <th className="px-4 py-3 w-32">Quantity *</th>
                <th className="px-4 py-3 w-32">Unit Price *</th>
                <th className="px-4 py-3 w-32">SubTotal</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => {
                const currentProductId = watchedItems?.[index]?.productId;
                const product = products.find((p) => p.id === currentProductId);
                const currentQuantity =
                  Number(watchedItems?.[index]?.quantity) || 0;

                const itemQ = currentQuantity;
                const itemP = Number(watchedItems?.[index]?.unitPrice) || 0;
                const itemSub = itemQ * itemP;

                const qtyError = errors.items?.[index]?.quantity?.message;
                const stockWarning =
                  product && currentQuantity > (product.stockQuantity || 0);

                return (
                  <tr key={field.id} className="border-b dark:border-slate-700">
                    <td className="px-4 py-2 align-top pt-4">
                      <Select
                        {...register(`items.${index}.productId`)}
                        options={products.map((p) => ({
                          value: p.id,
                          label: `${p.name} (Stock: ${p.stockQuantity || 0})`,
                        }))}
                        error={errors.items?.[index]?.productId?.message}
                        onChange={(e) => {
                          const val = e.target.value;
                          setValue(`items.${index}.productId`, val);
                          const prod = products.find((p) => p.id === val);
                          if (prod) {
                            setValue(
                              `items.${index}.unitPrice`,
                              prod.salePrice || 0,
                            );
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 py-2 align-top pt-4">
                      <Input
                        type="number"
                        step="1"
                        {...register(`items.${index}.quantity`)}
                        error={qtyError}
                      />
                      {!qtyError && stockWarning && (
                        <p className="mt-1 flex items-center text-xs text-amber-500">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Exceeds stock
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-2 align-top pt-4">
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.unitPrice`)}
                        error={errors.items?.[index]?.unitPrice?.message}
                      />
                    </td>
                    <td className="px-4 py-2 font-medium align-top pt-6">
                      ${itemSub.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-center align-top pt-5">
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
          {isEditing ? "Update Sale" : "Complete Sale"}
        </Button>
      </div>
    </form>
  );
}
