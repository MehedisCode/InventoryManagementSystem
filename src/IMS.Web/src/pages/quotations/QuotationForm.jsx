import { useState, useMemo, useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  createQuotation,
  updateQuotation,
  getQuotation,
} from "../../api/quotationApi";
import { getCustomers } from "../../api/customerApi";
import { getProducts } from "../../api/productApi";

import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";

const quotationSchema = z
  .object({
    customerId: z.string().min(1, "Customer is required"),
    quotationDate: z.string().min(1, "Date is required"),
    expiryDate: z.string().min(1, "Expiry Date is required"),
    status: z.enum(["Draft", "Sent", "Accepted", "Rejected"]).default("Draft"),
    note: z.string().optional(),
    items: z
      .array(
        z.object({
          productId: z.string().min(1, "Product is required"),
          quantity: z.coerce.number().min(1, "Min quantity is 1"),
          unitPrice: z.coerce.number().min(0, "Price cannot be negative"),
        }),
      )
      .min(1, "At least 1 item is required"),
    discount: z.coerce.number().min(0).optional().default(0),
  })
  .superRefine((data, ctx) => {
    if (data.quotationDate && data.expiryDate) {
      const qDate = new Date(data.quotationDate);
      const eDate = new Date(data.expiryDate);
      if (eDate < qDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Expiry Date must be after Quotation Date",
          path: ["expiryDate"],
        });
      }
    }
  });

const emptyDefaults = {
  customerId: "",
  quotationDate: new Date().toISOString().split("T")[0],
  expiryDate: new Date(new Date().setDate(new Date().getDate() + 7))
    .toISOString()
    .split("T")[0],
  status: "Draft",
  note: "",
  items: [{ productId: "", quantity: 1, unitPrice: 0 }],
  discount: 0,
};

const buildValues = (quotation) => ({
  customerId: quotation.customerId || "",
  quotationDate: quotation.quotationDate
    ? new Date(quotation.quotationDate).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0],
  expiryDate: quotation.expiryDate
    ? new Date(quotation.expiryDate).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0],
  status: quotation.status || "Draft",
  note: quotation.note || "",
  items: quotation.items?.length
    ? quotation.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      }))
    : [{ productId: "", quantity: 1, unitPrice: 0 }],
  discount: quotation.discount || 0,
});

export default function QuotationForm({ quotationId, onSuccess, onCancel }) {
  const queryClient = useQueryClient();
  const isEditing = !!quotationId;

  const { data: quotation, isLoading: isLoadingQuotation } = useQuery({
    queryKey: ["quotations", quotationId],
    queryFn: async () => {
      const res = await getQuotation(quotationId);
      return res?.data?.data || null;
    },
    enabled: !!quotationId,
  });

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

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(quotationSchema),
    defaultValues: emptyDefaults,
  });

  useEffect(() => {
    if (quotation) {
      reset(buildValues(quotation));
    }
  }, [quotation, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = useWatch({ control, name: "items" });
  const watchedDiscount = useWatch({ control, name: "discount" });

  const subTotal = (watchedItems || []).reduce((sum, item) => {
    const q = Number(item.quantity) || 0;
    const p = Number(item.unitPrice) || 0;
    return sum + q * p;
  }, 0);

  const discount = Number(watchedDiscount) || 0;
  const totalAmount = subTotal - discount;

  const saveMutation = useMutation({
    mutationFn: (formData) =>
      isEditing
        ? updateQuotation(quotationId, formData)
        : createQuotation(formData),
    onSuccess: () => {
      toast.success(
        `Quotation ${isEditing ? "updated" : "created"} successfully`,
      );
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      onSuccess?.();
    },
    onError: () => toast.error("Failed to save quotation"),
  });

  const onSubmit = (data) => {
    saveMutation.mutate({
      ...data,
      quotationDate: new Date(data.quotationDate),
      expiryDate: new Date(data.expiryDate),
      totalAmount,
      subTotal,
    });
  };

  if (isEditing && isLoadingQuotation) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 flex flex-col">
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <Select
            label="Customer *"
            {...register("customerId")}
            disabled
            error={errors.customerId?.message}
            options={customers.map((c) => ({ value: c.id, label: c.name }))}
          />
        </div>

        <Input
          label="Quotation Date *"
          type="date"
          {...register("quotationDate")}
          error={errors.quotationDate?.message}
        />

        <Input
          label="Expiry Date *"
          type="date"
          {...register("expiryDate")}
          error={errors.expiryDate?.message}
        />

        <div className="lg:col-span-2">
          <Select
            label="Status *"
            {...register("status")}
            error={errors.status?.message}
            options={[
              { value: "Draft", label: "Draft" },
              { value: "Sent", label: "Sent" },
              { value: "Accepted", label: "Accepted" },
              { value: "Rejected", label: "Rejected" },
            ]}
          />
        </div>

        <div className="lg:col-span-4">
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
                <th className="px-4 py-3 w-32">Subtotal</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>

            <tbody>
              {fields.map((field, index) => {
                const itemQ = Number(watchedItems?.[index]?.quantity) || 0;
                const itemP = Number(watchedItems?.[index]?.unitPrice) || 0;
                const itemSub = itemQ * itemP;

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
                        error={errors.items?.[index]?.quantity?.message}
                      />
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
      <div className="flex justify-end border-t dark:border-slate-800 pt-4 mt-4">
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
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={saveMutation.isPending}>
          {isEditing ? "Update Quotation" : "Create Quotation"}
        </Button>
      </div>
    </form>
  );
}
