import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { login as loginApi } from "../api/authApi";
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
      const { token, user } = response.data;
      storeLogin(user, token);
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
  const { logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();

  return () => {
    storeLogout();
    navigate("/login");
  };
};
