import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";

import { getAll, deleteRole } from "../../api/roleApi";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable from "../../components/shared/DataTable";
import Modal from "../../components/ui/Modal";
import RoleForm from "./RoleForm";

export default function RolesPage() {
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState(null);

  const { data: rolesRes, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await getAll();
      return res?.data?.data || [];
    },
  });

  const data = Array.isArray(rolesRes) ? rolesRes : [];

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      toast.success("Role deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setIsDeleteDialogOpen(false);
    },
    onError: () => toast.error("Failed to delete role"),
  });

  const openCreate = () => {
    setSelectedRoleId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (record) => {
    setSelectedRoleId(record.id);
    setIsFormOpen(true);
  };

  const handleDelete = (record) => {
    if (record.isSystem) return;
    setActionTarget(record);
    setIsDeleteDialogOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedRoleId(null);
  };

  const confirmDelete = () =>
    actionTarget && deleteMutation.mutate(actionTarget.id);

  const columns = [
    { header: "Role Name", accessor: "name" },
    {
      header: "User Count",
      render: (row) => row.userCount ?? 0,
    },
    {
      header: "Actions",
      render: (row) => {
        const system = row.isSystem;
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(row)}
              className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleDelete(row)}
              disabled={system}
              title={system ? "Cannot delete system role" : "Delete"}
              className="p-1 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-40 disabled:hover:text-slate-400 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Access"
        subtitle="Manage user roles"
        action={
          <Button iconLeft={Plus} onClick={openCreate}>
            Add Role
          </Button>
        }
      />

      <DataTable columns={columns} data={data} isLoading={isLoading} />

      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={selectedRoleId ? "Edit Role" : "Add Role"}
        size="md"
      >
        <RoleForm
          roleId={selectedRoleId}
          onSuccess={closeForm}
          onCancel={closeForm}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Role"
        message="Are you sure you want to delete this role? This action cannot be undone."
        isDanger
      />
    </div>
  );
}
