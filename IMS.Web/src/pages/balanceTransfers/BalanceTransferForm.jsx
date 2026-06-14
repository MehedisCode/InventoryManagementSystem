import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { getById, create, update } from "../../api/balanceTransferApi";

import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";

const transferSchema = z
  .object({
    fromAccount: z.string().min(1, "From Account is required"),
    toAccount: z.string().min(1, "To Account is required"),
    amount: z.coerce
      .number({ invalid_type_error: "Amount is required" })
      .positive("Amount must be greater than 0"),
    transferDate: z.string().min(1, "Transfer Date is required"),
    status: z
      .enum(["Pending", "Completed", "Cancelled"])
      .default("Pending"),
    note: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.fromAccount &&
      data.toAccount &&
      data.fromAccount.trim() === data.toAccount.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "To Account must be different from From Account",
        path: ["toAccount"],
      });
    }
  });

const emptyDefaults = {
  fromAccount: "",
  toAccount: "",
  amount: "",
  transferDate: new Date().toISOString().split("T")[0],
  status: "Pending",
  note: "",
};

const buildValues = (record) => ({
  fromAccount: record.fromAccount || "",
  toAccount: record.toAccount || "",
  amount: record.amount ?? "",
  transferDate: record.transferDate
    ? new Date(record.transferDate).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0],
  status: record.status || "Pending",
  note: record.note || "",
});

export default function BalanceTransferForm({
  transferId,
  onSuccess,
  onCancel,
}) {
  const queryClient = useQueryClient();
  const isEditing = !!transferId;

  const { data: transfer, isLoading: isLoadingTransfer } = useQuery({
    queryKey: ["balanceTransfers", transferId],
    queryFn: async () => {
      const res = await getById(transferId);
      return res?.data?.data || null;
    },
    enabled: !!transferId,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transferSchema),
    defaultValues: emptyDefaults,
  });

  useEffect(() => {
    if (transfer) {
      reset(buildValues(transfer));
    }
  }, [transfer, reset]);

  const saveMutation = useMutation({
    mutationFn: (formData) =>
      isEditing ? update(transferId, formData) : create(formData),
    onSuccess: () => {
      toast.success(
        `Balance transfer ${isEditing ? "updated" : "created"} successfully`,
      );
      queryClient.invalidateQueries({ queryKey: ["balanceTransfers"] });
      onSuccess?.();
    },
    onError: () => toast.error("Failed to save balance transfer"),
  });

  const onSubmit = (data) => {
    saveMutation.mutate({
      ...data,
      transferDate: new Date(data.transferDate),
    });
  };

  if (isEditing && isLoadingTransfer) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 flex flex-col"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="From Account *"
          placeholder="e.g. Cash on Hand"
          {...register("fromAccount")}
          error={errors.fromAccount?.message}
        />

        <Input
          label="To Account *"
          placeholder="e.g. Bank Account"
          {...register("toAccount")}
          error={errors.toAccount?.message}
        />

        <Input
          label="Amount *"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          {...register("amount")}
          error={errors.amount?.message}
        />

        <Input
          label="Transfer Date *"
          type="date"
          {...register("transferDate")}
          error={errors.transferDate?.message}
        />
      </div>

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

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Note
        </label>
        <textarea
          rows={3}
          placeholder="Optional notes about this transfer"
          {...register("note")}
          className="flex min-h-20 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-900 dark:border-slate-700 dark:text-slate-100 dark:focus:ring-primary-400"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-800">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={saveMutation.isPending}>
          {isEditing ? "Update Transfer" : "Create Transfer"}
        </Button>
      </div>
    </form>
  );
}
