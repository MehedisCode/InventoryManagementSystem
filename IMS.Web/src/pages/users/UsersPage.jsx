import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus, Power, Key } from "lucide-react";
import toast from "react-hot-toast";

import {
  getAll,
  deleteUser,
  toggleStatus,
} from "../../api/userApi";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable from "../../components/shared/DataTable";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import UserForm from "./UserForm";
import ChangePasswordForm from "./ChangePasswordForm";
import { formatDate } from "../../utils/formatters";

export default function UsersPage() {
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [isChangePwdOpen, setIsChangePwdOpen] = useState(false);
  const [selectedUserIdForPwd, setSelectedUserIdForPwd] = useState(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState(null);

  const { data: usersRes, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await getAll();
      return res?.data?.data || [];
    },
  });

  const data = Array.isArray(usersRes) ? usersRes : [];

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsDeleteDialogOpen(false);
    },
    onError: () => toast.error("Failed to delete user"),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: toggleStatus,
    onSuccess: () => {
      toast.success("User status updated");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("Failed to update user status"),
  });

  // Action handlers
  const openCreate = () => {
    setSelectedUserId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (record) => {
    setSelectedUserId(record.id);
    setIsFormOpen(true);
  };

  const handleToggleStatus = (record) => {
    toggleStatusMutation.mutate(record.id);
  };

  const handleChangePassword = (record) => {
    setSelectedUserIdForPwd(record.id);
    setIsChangePwdOpen(true);
  };

  const handleDelete = (record) => {
    setActionTarget(record);
    setIsDeleteDialogOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedUserId(null);
  };

  const closeChangePwd = () => {
    setIsChangePwdOpen(false);
    setSelectedUserIdForPwd(null);
  };

  const confirmDelete = () =>
    actionTarget && deleteMutation.mutate(actionTarget.id);

  const columns = [
    { header: "Full Name", accessor: "fullName" },
    { header: "Email", accessor: "email" },
    {
      header: "Role",
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
          {row.roleName || "—"}
        </span>
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <Badge status={row.isActive ? "completed" : "cancelled"}>
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Created Date",
      render: (row) => formatDate(row.createdAt),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleToggleStatus(row)}
            className={`p-1 transition-colors ${
              row.isActive
                ? "text-slate-400 hover:text-red-500"
                : "text-slate-400 hover:text-green-500"
            }`}
            title={row.isActive ? "Deactivate" : "Activate"}
          >
            <Power className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleChangePassword(row)}
            className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
            title="Change Password"
          >
            <Key className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleDelete(row)}
            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="Manage user accounts and access"
        action={
          <Button iconLeft={Plus} onClick={openCreate}>
            Add User
          </Button>
        }
      />

      <DataTable columns={columns} data={data} isLoading={isLoading} />

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={selectedUserId ? "Edit User" : "Add User"}
        size="2xl"
      >
        <UserForm
          userId={selectedUserId}
          onSuccess={closeForm}
          onCancel={closeForm}
        />
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={isChangePwdOpen}
        onClose={closeChangePwd}
        title="Change Password"
        size="md"
      >
        <ChangePasswordForm
          userId={selectedUserIdForPwd}
          onSuccess={closeChangePwd}
          onCancel={closeChangePwd}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        isDanger
      />
    </div>
  );
}
