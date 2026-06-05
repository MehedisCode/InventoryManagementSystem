import { format } from "date-fns";

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return "";
  return format(new Date(date), "MMM dd, yyyy");
};

export const formatDateTime = (date) => {
  if (!date) return "";
  return format(new Date(date), "MMM dd, yyyy hh:mm a");
};

export const formatStatus = (status) => {
  if (!status) return "";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};
