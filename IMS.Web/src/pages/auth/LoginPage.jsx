import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, Box } from 'lucide-react';
import { useState } from 'react';
import { useLogin } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen w-full bg-light-bg text-slate-900 dark:bg-dark-bg dark:text-slate-100">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-primary-900 to-primary-800 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
            <Box className="h-7 w-7 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">IMS</span>
        </div>

        <div>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight">
            Inventory Management<br />System
          </h1>
          <p className="mb-8 max-w-md text-lg text-primary-100">
            Manage your business efficiently with our comprehensive inventory solution.
          </p>

          <ul className="space-y-4">
            {[
              'Real-time stock tracking',
              'Automated purchase orders',
              'Advanced reporting & analytics'
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-primary-50">
                <CheckCircle2 className="h-5 w-5 text-primary-300" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-sm text-primary-200">
          &copy; {new Date().getFullYear()} IMS. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full items-center justify-center p-8 sm:p-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="mb-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome Back</h2>
            <p className="text-slate-500 dark:text-slate-400">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-[20px] -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="Email address"
                  className="pl-10"
                  error={errors.email?.message}
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-[20px] -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="pl-10 pr-10"
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[20px] -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={loginMutation.isPending}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <p>Demo: admin@ims.com / Admin@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
