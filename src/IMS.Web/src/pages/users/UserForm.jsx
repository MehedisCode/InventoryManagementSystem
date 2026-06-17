import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { getById, create, update } from "../../api/userApi";
import { getAll as getRoles } from "../../api/roleApi";

import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Switch from "../../components/ui/Switch";

const buildSchema = (isEditing) =>
  z.object({
    fullName: z.string().min(1, "Full Name is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: isEditing
      ? z.string().optional()
      : z.string().min(1, "Password is required"),
    roleId: z.string().min(1, "Role is required"),
    isActive: z.boolean().default(true),
  });

const emptyDefaults = {
  fullName: "",
  email: "",
  password: "",
  roleId: "",
  isActive: true,
};

const buildValues = (record) => ({
  fullName: record.fullName || "",
  email: record.email || "",
  password: "",
  roleId: record.roleId ?? "",
  isActive: record.isActive ?? true,
});

export default function UserForm({ userId, onSuccess, onCancel }) {
  const queryClient = useQueryClient();
  const isEditing = !!userId;
  const userSchema = buildSchema(isEditing);

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["users", userId],
    queryFn: async () => {
      const res = await getById(userId);
      return res?.data?.data || null;
    },
    enabled: !!userId,
  });

  const { data: rolesRes } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await getRoles();
      return res?.data?.data || [];
    },
  });
  const roles = Array.isArray(rolesRes) ? rolesRes : [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: emptyDefaults,
  });

  useEffect(() => {
    if (user) {
      reset(buildValues(user));
    }
  }, [user, reset]);

  const saveMutation = useMutation({
    mutationFn: (formData) =>
      isEditing ? update(userId, formData) : create(formData),
    onSuccess: () => {
      toast.success(`User ${isEditing ? "updated" : "created"} successfully`);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onSuccess?.();
    },
    onError: () => toast.error("Failed to save user"),
  });

  const onSubmit = (data) => {
    const payload = { ...data };
    if (isEditing) {
      if (!payload.password) delete payload.password;
    }
    saveMutation.mutate(payload);
  };

  if (isEditing && isLoadingUser) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  const isActiveValue = watch("isActive");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name *"
          placeholder="e.g. John Doe"
          {...register("fullName")}
          error={errors.fullName?.message}
        />

        <Input
          label="Email *"
          type="email"
          placeholder="user@example.com"
          autoComplete="off"
          {...register("email")}
          error={errors.email?.message}
        />

        {!isEditing && (
          <Input
            label="Password *"
            type="password"
            placeholder="Enter password"
            autoComplete="new-password"
            {...register("password")}
            error={errors.password?.message}
          />
        )}

        <Select
          label="Role *"
          {...register("roleId")}
          error={errors.roleId?.message}
          options={roles.map((r) => ({ value: r.id, label: r.name }))}
        />
      </div>

      <Switch
        label="Is Active"
        checked={!!isActiveValue}
        onChange={(v) => setValue("isActive", v, { shouldValidate: true })}
        error={errors.isActive?.message}
      />

      <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-800">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={saveMutation.isPending}>
          {isEditing ? "Update User" : "Create User"}
        </Button>
      </div>
    </form>
  );
}
