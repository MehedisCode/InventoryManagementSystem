import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { getById, create, update } from "../../api/roleApi";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";

const roleSchema = z.object({
  name: z.string().min(1, "Role Name is required"),
});

const emptyDefaults = { name: "" };

const buildValues = (record) => ({ name: record.name || "" });

export default function RoleForm({ roleId, onSuccess, onCancel }) {
  const queryClient = useQueryClient();
  const isEditing = !!roleId;

  const { data: role, isLoading: isLoadingRole } = useQuery({
    queryKey: ["roles", roleId],
    queryFn: async () => {
      const res = await getById(roleId);
      return res?.data?.data || null;
    },
    enabled: !!roleId,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(roleSchema),
    defaultValues: emptyDefaults,
  });

  useEffect(() => {
    if (role) {
      reset(buildValues(role));
    }
  }, [role, reset]);

  const saveMutation = useMutation({
    mutationFn: (formData) =>
      isEditing ? update(roleId, formData) : create(formData),
    onSuccess: () => {
      toast.success(`Role ${isEditing ? "updated" : "created"} successfully`);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      onSuccess?.();
    },
    onError: () => toast.error("Failed to save role"),
  });

  const onSubmit = (data) => {
    saveMutation.mutate(data);
  };

  if (isEditing && isLoadingRole) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex flex-col">
      <Input
        label="Role Name *"
        placeholder="e.g. Sales Manager"
        {...register("name")}
        error={errors.name?.message}
      />

      <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-800">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={saveMutation.isPending}>
          {isEditing ? "Update Role" : "Create Role"}
        </Button>
      </div>
    </form>
  );
}
