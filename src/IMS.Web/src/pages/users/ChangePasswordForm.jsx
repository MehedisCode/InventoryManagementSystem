import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { changePassword } from "../../api/userApi";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current Password is required"),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm the new password"),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

const emptyDefaults = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function ChangePasswordForm({ userId, onSuccess, onCancel }) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: emptyDefaults,
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data) => changePassword(userId, data),
    onSuccess: () => {
      toast.success("Password changed successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      reset(emptyDefaults);
      onSuccess?.();
    },
    onError: () => toast.error("Failed to change password"),
  });

  const onSubmit = (data) => {
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 flex flex-col"
    >
      <Input
        label="Current Password *"
        type="password"
        placeholder="Enter current password"
        autoComplete="current-password"
        {...register("currentPassword")}
        error={errors.currentPassword?.message}
      />

      <Input
        label="New Password *"
        type="password"
        placeholder="At least 6 characters"
        autoComplete="new-password"
        {...register("newPassword")}
        error={errors.newPassword?.message}
      />

      <Input
        label="Confirm New Password *"
        type="password"
        placeholder="Re-enter the new password"
        autoComplete="new-password"
        {...register("confirmPassword")}
        error={errors.confirmPassword?.message}
      />

      <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-800">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={changePasswordMutation.isPending}
        >
          Change Password
        </Button>
      </div>
    </form>
  );
}
