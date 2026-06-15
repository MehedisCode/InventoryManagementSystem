import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { getCompany, updateCompany, getCurrencies } from "../../api/setupApi";

import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";

const companySchema = z.object({
  companyName: z.string().min(1, "Company Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  logoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  currencyId: z.string().min(1, "Currency is required"),
});

const emptyDefaults = {
  companyName: "",
  email: "",
  phone: "",
  address: "",
  logoUrl: "",
  currencyId: "",
};

const buildValues = (record) => ({
  companyName: record.companyName || "",
  email: record.email || "",
  phone: record.phone || "",
  address: record.address || "",
  logoUrl: record.logoUrl || "",
  currencyId: record.currencyId != null ? String(record.currencyId) : "",
});

export default function CompanySettingsForm() {
  const queryClient = useQueryClient();

  const { data: company, isLoading } = useQuery({
    queryKey: ["setup", "company"],
    queryFn: async () => {
      const res = await getCompany();
      return res?.data?.data || null;
    },
    retry: false,
  });

  const { data: currenciesRes } = useQuery({
    queryKey: ["setup", "currencies"],
    queryFn: async () => {
      const res = await getCurrencies();
      return res?.data?.data || [];
    },
  });
  const currencies = Array.isArray(currenciesRes) ? currenciesRes : [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: emptyDefaults,
  });

  useEffect(() => {
    if (company) {
      reset(buildValues(company));
    }
  }, [company, reset]);

  const saveMutation = useMutation({
    mutationFn: updateCompany,
    onSuccess: () => {
      toast.success("Company settings saved");
      queryClient.invalidateQueries({ queryKey: ["setup", "company"] });
    },
    onError: () => toast.error("Failed to save company settings"),
  });

  const onSubmit = (data) => {
    saveMutation.mutate({
      ...data,
      currencyId: data.currencyId ? Number(data.currencyId) : null,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Company Name *"
          placeholder="e.g. Acme Corp"
          {...register("companyName")}
          error={errors.companyName?.message}
        />

        <Input
          label="Email *"
          type="email"
          placeholder="info@example.com"
          autoComplete="off"
          {...register("email")}
          error={errors.email?.message}
        />

        <Input
          label="Phone"
          type="tel"
          placeholder="+1 555 000 0000"
          {...register("phone")}
          error={errors.phone?.message}
        />

        <Input
          label="Logo URL"
          type="url"
          placeholder="https://example.com/logo.png"
          {...register("logoUrl")}
          error={errors.logoUrl?.message}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Address
        </label>
        <textarea
          rows={3}
          placeholder="Street, City, Country"
          {...register("address")}
          className="flex min-h-20 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-900 dark:border-slate-700 dark:text-slate-100 dark:focus:ring-primary-400"
        />
        {errors.address?.message && (
          <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
        )}
      </div>

      <Select
        label="Currency *"
        {...register("currencyId")}
        error={errors.currencyId?.message}
        options={currencies.map((c) => ({
          value: c.id,
          label: c.code ? `${c.name} (${c.code})` : c.name,
        }))}
      />

      <div className="flex justify-end pt-4 border-t dark:border-slate-800">
        <Button type="submit" isLoading={saveMutation.isPending}>
          Save
        </Button>
      </div>
    </form>
  );
}
