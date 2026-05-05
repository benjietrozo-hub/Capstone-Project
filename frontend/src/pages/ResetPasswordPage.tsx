import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Package, Eye, EyeOff } from 'lucide-react';
import { Footer } from '@/components/common/Footer';
import AuthHeader from '@/components/common/AuthHeader';
import axios from 'axios';
import { API_BASE_URL } from '@/utils/constants';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    token: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    if (!token || !email) {
      toast.error('Invalid reset link');
      navigate('/login');
      return;
    }

    setFormData(prev => ({
      ...prev,
      token,
      email: decodeURIComponent(email)
    }));
  }, [searchParams, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirmation) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, formData);
      
      toast.success(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Failed to reset password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthHeader 
        title="Online Inventory Management System" 
        subtitle="Create a new password"
      />

      <div className="min-h-[calc(100vh-70px-60px)] flex items-center justify-center bg-white px-4 py-8 overflow-auto">
        <Card className="w-full max-w-[400px] shadow-2xl border-0 bg-[#1C2536] text-white my-auto">
          <CardHeader className="space-y-3 pb-4 bg-gradient-to-r from-[#5B8DEF] to-[#0063F7] rounded-t-lg">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl font-bold text-white">Reset Password</CardTitle>
              <CardDescription className="text-sm mt-1 text-white/90">
                Enter your new password below
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="pb-6 pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="h-10 bg-white/5 border-white/10 text-gray-400 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password (min. 8 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="h-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-[#5B8DEF] focus:ring-[#5B8DEF] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-300">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password_confirmation"
                    name="password_confirmation"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your new password"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="h-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-[#5B8DEF] focus:ring-[#5B8DEF] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-10 bg-gradient-to-r from-[#5B8DEF] to-[#0063F7] hover:from-[#4A7FDE] hover:to-[#0052CC] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200" 
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <Link 
                to="/login" 
                className="text-sm text-[#5B8DEF] font-semibold hover:text-[#0063F7] hover:underline transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}
