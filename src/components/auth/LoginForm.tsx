import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@gymon.in');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    login(email);
    setTimeout(() => {
      setIsLoading(false);
      if (onSuccess) onSuccess();
      navigate('/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row font-sans antialiased bg-white">
      {/* LEFT BRANDING PANEL (SA-001 Login) */}
      <div className="w-full md:w-5/12 bg-[#060D25] text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden shrink-0">
        {/* Spec Screen Tag */}
        <div className="inline-block bg-[#0B1727] text-slate-300 text-[11px] font-bold px-3 py-1 rounded-md border border-slate-800 self-start">
          SA-001 Login
        </div>

        {/* Center Branding & Glowing Shield Icon */}
        <div className="my-auto py-12 flex flex-col items-center text-center">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-4xl lg:text-5xl font-black tracking-tight text-white">GYM</span>
            <span className="text-4xl lg:text-5xl font-black tracking-tight text-[#00C49F]">ON</span>
          </div>
          <p className="text-sm font-semibold text-slate-300 tracking-wider">
            Admin Portal
          </p>

          {/* Central Shield Graphic */}
          <div className="mt-12 relative flex items-center justify-center">
            <div className="w-40 h-48 rounded-full border border-[#00C49F]/30 bg-radial from-[#00C49F]/10 to-transparent flex items-center justify-center shadow-2xl shadow-[#00C49F]/20">
              <div className="w-24 h-28 rounded-2xl border-2 border-[#00C49F] flex items-center justify-center shadow-lg shadow-[#00C49F]/40 bg-[#0B1727]/80 backdrop-blur-xs">
                <ShieldCheck className="h-14 w-14 text-[#00C49F] stroke-[1.75]" />
              </div>
            </div>
          </div>
        </div>

        {/* Left Footer subtle text */}
        <div className="text-[11px] text-slate-500 font-medium">
          Secure Enterprise Infrastructure
        </div>
      </div>

      {/* RIGHT LOGIN FORM CARD */}
      <div className="w-full md:w-7/12 flex flex-col justify-between p-8 sm:p-12 lg:p-16 bg-[#F8FAFC]">
        <div className="max-w-md w-full mx-auto my-auto py-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-10 shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 mb-8">
              Please login to your admin account.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00A389] focus:bg-white transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-11 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00A389] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 text-slate-600 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#00A389] focus:ring-[#00A389]"
                  />
                  <span>Remember me</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset link has been dispatched to administrator.');
                  }}
                  className="font-semibold text-[#00A389] hover:underline"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#00A389] hover:bg-[#008f77] text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md shadow-[#00A389]/25 hover:shadow-lg hover:shadow-[#00A389]/35 cursor-pointer mt-2 disabled:opacity-70"
              >
                {isLoading ? 'Signing In...' : 'Login'}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 font-medium py-4">
          © 2025 GYM ON. All rights reserved.
        </div>
      </div>
    </div>
  );
}
