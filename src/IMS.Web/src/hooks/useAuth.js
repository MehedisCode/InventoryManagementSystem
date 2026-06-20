import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { login as loginApi, getMe } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const useAuth = () => {
  const { user, token, isAuthenticated, login, logout } = useAuthStore();
  return { user, token, isAuthenticated, login, logout };
};

export const useLogin = () => {
  const { login: storeLogin } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }) => loginApi(email, password),
    onSuccess: (response) => {
      const { token, fullName, email, role } = response.data.data;
      storeLogin({ fullName, email, role }, token);
      toast.success("Successfully logged in!");
      navigate("/dashboard");
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to login. Please try again.";
      toast.error(message);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();

  return () => {
    storeLogout();
    queryClient.clear();
    navigate("/login");
  };
};

export const useRole = () => useAuthStore((s) => s.user?.role);

export const useHasRole = (required) => {
  const role = useRole();
  if (!role) return false;
  if (Array.isArray(required)) return required.includes(role);
  return role === required;
};

export const useMe = (enabled = true) =>
  useQuery({
    queryKey: ["auth", "me", useAuthStore.getState().user?.id],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled,
  });
