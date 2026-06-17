import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Pencil,
  Trash2,
  Plus,
  Image as ImageIcon,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getProducts,
  getLowStockProducts,
  deleteProduct,
} from "../../api/productApi";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable from "../../components/shared/DataTable";
import ProductForm from "./ProductForm";
import { formatCurrency } from "../../utils/formatters";

export default function ProductsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showLowStock, setShowLowStock] = useState(false);

  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ["products", showLowStock],
    queryFn: async () => {
      const res = showLowStock
        ? await getLowStockProducts()
        : await getProducts();

      return res?.data?.data;
    },
  });

  const data = Array.isArray(products) ? products : [];

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("Failed to delete product"),
  });

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id);
    }
  };

  const columns = [
    {
      header: "Image",
      render: (row) =>
        row.imageUrl ? (
          <img
            src={row.imageUrl}
            alt={row.name}
            className="w-10 h-10 rounded object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <ImageIcon className="w-5 h-5" />
          </div>
        ),
    },
    { header: "Name", accessor: "name" },
    { header: "SKU", accessor: "sku" },
    { header: "Category", accessor: "categoryName" },
    { header: "Unit", accessor: "unitName" },
    { header: "Cost", render: (row) => formatCurrency(row.costPrice) },
    { header: "Sale", render: (row) => formatCurrency(row.salePrice) },
    {
      header: "Stock",
      render: (row) => (
        <span
          className={`font-medium ${row.stockQuantity <= row.alertQuantity ? "text-red-500" : "text-slate-700 dark:text-slate-300"}`}
        >
          {row.stockQuantity}
        </span>
      ),
    },
    { header: "Alert", accessor: "alertQuantity" },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
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
        title="Products"
        subtitle="Manage your product inventory"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant={showLowStock ? "danger" : "outline"}
              iconLeft={AlertTriangle}
              onClick={() => setShowLowStock(!showLowStock)}
            >
              Low Stock
            </Button>
            <Button
              iconLeft={Plus}
              onClick={() => {
                setSelectedProduct(null);
                setIsFormOpen(true);
              }}
            >
              Add Product
            </Button>
          </div>
        }
      />

      <DataTable columns={columns} data={data} />

      <ProductForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        product={selectedProduct}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete ${productToDelete?.name}? This action cannot be undone.`}
      />
    </div>
  );
}
