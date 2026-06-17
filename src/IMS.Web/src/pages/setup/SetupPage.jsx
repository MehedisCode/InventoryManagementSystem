import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";

import {
  getUnits,
  createUnit,
  updateUnit,
  deleteUnit,
  getCurrencies,
  createCurrency,
  updateCurrency,
  deleteCurrency,
} from "../../api/setupApi";

import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable from "../../components/shared/DataTable";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import CompanySettingsForm from "./CompanySettingsForm";

const TABS = [
  { key: "company", label: "Company Settings" },
  { key: "units", label: "Units" },
  { key: "currencies", label: "Currencies" },
];

// --- Units section ---

const unitSchema = z.object({
  name: z.string().min(1, "Name is required"),
  shortName: z.string().min(1, "Short Name is required"),
});

const unitDefaults = { name: "", shortName: "" };
const buildUnitValues = (r) => ({
  name: r.name || "",
  shortName: r.shortName || "",
});

function UnitsSection() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState(null);

  const { data: unitsRes, isLoading } = useQuery({
    queryKey: ["setup", "units"],
    queryFn: async () => {
      const res = await getUnits();
      return res?.data?.data || [];
    },
  });
  const data = Array.isArray(unitsRes) ? unitsRes : [];

  const deleteMutation = useMutation({
    mutationFn: deleteUnit,
    onSuccess: () => {
      toast.success("Unit deleted");
      queryClient.invalidateQueries({ queryKey: ["setup", "units"] });
      setIsDeleteOpen(false);
    },
    onError: () => toast.error("Failed to delete unit"),
  });

  const openCreate = () => {
    setEditingUnit(null);
    setIsFormOpen(true);
  };
  const handleEdit = (record) => {
    setEditingUnit(record);
    setIsFormOpen(true);
  };
  const handleDelete = (record) => {
    setActionTarget(record);
    setIsDeleteOpen(true);
  };
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingUnit(null);
  };
  const confirmDelete = () =>
    actionTarget && deleteMutation.mutate(actionTarget.id);

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Short Name", accessor: "shortName" },
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button iconLeft={Plus} onClick={openCreate}>
          Add Unit
        </Button>
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} />

      <UnitForm
        isOpen={isFormOpen}
        onClose={closeForm}
        existing={editingUnit}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Unit"
        message="Are you sure you want to delete this unit?"
        isDanger
      />
    </div>
  );
}

function UnitForm({ isOpen, onClose, existing }) {
  const queryClient = useQueryClient();
  const isEditing = !!existing;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(unitSchema),
    defaultValues: unitDefaults,
  });

  // Reset form when modal opens with an existing record
  useEffect(() => {
    if (isOpen && existing) reset(buildUnitValues(existing));
    if (isOpen && !isEditing) reset(unitDefaults);
  }, [isOpen, existing, isEditing, reset]);

  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEditing ? updateUnit(existing.id, data) : createUnit(data),
    onSuccess: () => {
      toast.success(`Unit ${isEditing ? "updated" : "created"} successfully`);
      queryClient.invalidateQueries({ queryKey: ["setup", "units"] });
      onClose?.();
    },
    onError: () => toast.error("Failed to save unit"),
  });

  const onSubmit = (data) => saveMutation.mutate(data);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Unit" : "Add Unit"}
      size="md"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 flex flex-col"
      >
        <Input
          label="Name *"
          placeholder="e.g. Piece"
          {...register("name")}
          error={errors.name?.message}
        />
        <Input
          label="Short Name *"
          placeholder="e.g. pc"
          {...register("shortName")}
          error={errors.shortName?.message}
        />

        <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saveMutation.isPending}>
            {isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// --- Currencies section ---

const currencySchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z
    .string()
    .min(1, "Code is required")
    .max(3, "Code must be 3 characters or fewer"),
  symbol: z.string().min(1, "Symbol is required"),
});

const currencyDefaults = { name: "", code: "", symbol: "" };
const buildCurrencyValues = (r) => ({
  name: r.name || "",
  code: r.code || "",
  symbol: r.symbol || "",
});

function CurrenciesSection() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState(null);

  const { data: currenciesRes, isLoading } = useQuery({
    queryKey: ["setup", "currencies"],
    queryFn: async () => {
      const res = await getCurrencies();
      return res?.data?.data || [];
    },
  });
  const data = Array.isArray(currenciesRes) ? currenciesRes : [];

  const deleteMutation = useMutation({
    mutationFn: deleteCurrency,
    onSuccess: () => {
      toast.success("Currency deleted");
      queryClient.invalidateQueries({ queryKey: ["setup", "currencies"] });
      setIsDeleteOpen(false);
    },
    onError: () => toast.error("Failed to delete currency"),
  });

  const openCreate = () => {
    setEditingCurrency(null);
    setIsFormOpen(true);
  };
  const handleEdit = (record) => {
    setEditingCurrency(record);
    setIsFormOpen(true);
  };
  const handleDelete = (record) => {
    setActionTarget(record);
    setIsDeleteOpen(true);
  };
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCurrency(null);
  };
  const confirmDelete = () =>
    actionTarget && deleteMutation.mutate(actionTarget.id);

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Code", accessor: "code" },
    { header: "Symbol", accessor: "symbol" },
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button iconLeft={Plus} onClick={openCreate}>
          Add Currency
        </Button>
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} />

      <CurrencyForm
        isOpen={isFormOpen}
        onClose={closeForm}
        existing={editingCurrency}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Currency"
        message="Are you sure you want to delete this currency?"
        isDanger
      />
    </div>
  );
}

function CurrencyForm({ isOpen, onClose, existing }) {
  const queryClient = useQueryClient();
  const isEditing = !!existing;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(currencySchema),
    defaultValues: currencyDefaults,
  });

  // Reset form when modal opens with an existing record
  useEffect(() => {
    if (isOpen && existing) reset(buildCurrencyValues(existing));
    if (isOpen && !isEditing) reset(currencyDefaults);
  }, [isOpen, existing, isEditing, reset]);

  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEditing ? updateCurrency(existing.id, data) : createCurrency(data),
    onSuccess: () => {
      toast.success(
        `Currency ${isEditing ? "updated" : "created"} successfully`,
      );
      queryClient.invalidateQueries({ queryKey: ["setup", "currencies"] });
      onClose?.();
    },
    onError: () => toast.error("Failed to save currency"),
  });

  const onSubmit = (data) => saveMutation.mutate(data);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Currency" : "Add Currency"}
      size="md"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 flex flex-col"
      >
        <Input
          label="Name *"
          placeholder="e.g. US Dollar"
          {...register("name")}
          error={errors.name?.message}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Code *"
            placeholder="e.g. USD"
            maxLength={3}
            {...register("code")}
            error={errors.code?.message}
          />
          <Input
            label="Symbol *"
            placeholder="e.g. $"
            {...register("symbol")}
            error={errors.symbol?.message}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saveMutation.isPending}>
            {isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// --- Page ---

export default function SetupPage() {
  const [activeTab, setActiveTab] = useState("company");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Setup"
        subtitle="Application configuration and master data"
      />

      <div className="bg-white dark:bg-dark-card p-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === t.key
                  ? "bg-slate-100 text-primary-600 dark:bg-slate-800 dark:text-primary-400"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
        {activeTab === "company" && <CompanySettingsForm />}
        {activeTab === "units" && <UnitsSection />}
        {activeTab === "currencies" && <CurrenciesSection />}
      </div>
    </div>
  );
}
