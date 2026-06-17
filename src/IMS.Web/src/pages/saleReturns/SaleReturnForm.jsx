import { useState, useMemo, useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  createSaleReturn,
  updateSaleReturn,
  getSaleReturn,
} from "../../api/saleReturnApi";
import { getSales } from "../../api/saleApi";
import { getProducts } from "../../api/productApi";

import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

const saleReturnItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().min(1, "Min quantity is 1"),
  unitPrice: z.coerce.number().min(0, "Price cannot be negative"),
});

const saleReturnSchema = z.object({
  saleId: z.string().min(1, "Sale is required"),
  returnDate: z.string().min(1, "Date is required"),
  reason: z.string().min(1, "Reason is required"),
  status: z.enum(["Pending", "Approved", "Rejected"]).default("Pending"),
  items: z.array(saleReturnItemSchema).min(1, "At least 1 item is required"),
});

export default function SaleReturnForm({ saleReturnId, onSuccess, onCancel }) {
  const queryClient = useQueryClient();
  const isEditing = !!saleReturnId;

  const { data: saleReturn } = useQuery({
    queryKey: ["saleReturn", saleReturnId],
    queryFn: async () => {
      const res = await getSaleReturn(saleReturnId);
      return res?.data?.data;
    },
    enabled: !!saleReturnId,
  });

  const { data: salesRes } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const res = await getSales();
      return res?.data?.data || [];
    },
  });
  const sales = Array.isArray(salesRes) ? salesRes : [];

  const { data: productsRes } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await getProducts();
      return res?.data?.data || [];
    },
  });
  const products = Array.isArray(productsRes) ? productsRes : [];

  const defaultValues = useMemo(() => {
    if (isEditing && saleReturn) {
      return {
        saleId: saleReturn.saleId || "",
        returnDate: saleReturn.returnDate
          ? new Date(saleReturn.returnDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        reason: saleReturn.reason || "",
        status: saleReturn.status || "Pending",
        items: saleReturn.items?.length
          ? saleReturn.items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
            }))
          : [{ productId: "", quantity: 1, unitPrice: 0 }],
      };
    }
    return {
      saleId: "",
      returnDate: new Date().toISOString().split("T")[0],
      reason: "",
      status: "Pending",
      items: [{ productId: "", quantity: 1, unitPrice: 0 }],
    };
  }, [isEditing, saleReturn]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(saleReturnSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = useWatch({ control, name: "items" });

  useEffect(() => {
    if (saleReturn) {
      reset({
        saleId: saleReturn.saleId || "",
        returnDate: saleReturn.returnDate
          ? new Date(saleReturn.returnDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        reason: saleReturn.reason || "",
        status: saleReturn.status || "Pending",
        items: saleReturn.items?.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })) || [{ productId: "", quantity: 1, unitPrice: 0 }],
      });
    }
  }, [saleReturn, reset]);

  const totalAmount = (watchedItems || []).reduce((sum, item) => {
    const q = Number(item.quantity) || 0;
    const p = Number(item.unitPrice) || 0;
    return sum + q * p;
  }, 0);

  const saveMutation = useMutation({
    mutationFn: (formData) =>
      isEditing
        ? updateSaleReturn(saleReturnId, formData)
        : createSaleReturn(formData),
    onSuccess: () => {
      toast.success(
        `Sale Return ${isEditing ? "updated" : "created"} successfully`,
      );
      queryClient.invalidateQueries({ queryKey: ["saleReturns"] });
      onSuccess?.();
    },
    onError: () => toast.error("Failed to save sale return"),
  });

  const onSubmit = (data) => {
    saveMutation.mutate({
      ...data,
      returnDate: new Date(data.returnDate),
      totalAmount,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 flex flex-col">
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Sale Reference *"
          {...register("saleId")}
          disabled
          error={errors.saleId?.message}
          options={sales.map((s) => ({
            value: s.id,
            label: s.referenceNo || `Sale #${s.id}`,
          }))}
        />
        <Input
          label="Return Date *"
          type="date"
          {...register("returnDate")}
          error={errors.returnDate?.message}
        />
        <Select
          label="Status"
          {...register("status")}
          error={errors.status?.message}
          options={[
            { value: "Pending", label: "Pending" },
            { value: "Approved", label: "Approved" },
            { value: "Rejected", label: "Rejected" },
          ]}
        />
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Reason *
          </label>
          <textarea
            {...register("reason")}
            className="flex min-h-20 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-900 dark:border-slate-700 dark:text-slate-100 dark:focus:ring-primary-400"
          />
          {errors.reason && (
            <p className="text-sm text-red-500 mt-1">{errors.reason.message}</p>
          )}
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

        {(errors.items?.message || errors.items?.root?.message) && (
          <p className="text-sm text-red-500">
            {errors.items?.message || errors.items?.root?.message}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3 min-w-50">Product *</th>
                <th className="px-4 py-3 w-32">Quantity *</th>
                <th className="px-4 py-3 w-32">Unit Price *</th>
                <th className="px-4 py-3 w-32">SubTotal</th>
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
                          label: p.name,
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

      {/* Summary */}
      <div className="flex justify-end border-t dark:border-slate-800 pt-4">
        <div className="w-full sm:w-1/2 md:w-1/3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
          <div className="flex justify-between items-center text-lg font-semibold">
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
          {isEditing ? "Update Return" : "Create Return"}
        </Button>
      </div>
    </form>
  );
}
