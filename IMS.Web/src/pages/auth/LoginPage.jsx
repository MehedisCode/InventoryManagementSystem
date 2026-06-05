import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleLogin = () => {
    login({ id: 1, name: "Admin" }, "fake-jwt-token");
    navigate("/dashboard");
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
      <div className="bg-white dark:bg-dark-card p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-slate-900 dark:text-slate-100">
          Login
        </h1>
        <button
          onClick={handleLogin}
          className="w-full bg-accent hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
        >
          Login as Admin
        </button>
      </div>
    </div>
  );
}
