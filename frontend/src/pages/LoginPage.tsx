import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Package } from 'lucide-react';
import { Footer } from '@/components/common/Footer';
import AuthHeader from '@/components/common/AuthHeader';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(formData);
      const { role } = response;
      
      toast.success('Login successful');
      
      // Redirect based on role
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'teacher') {
        navigate('/teacher/dashboard');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthHeader 
        title="Online Inventory Management System" 
        subtitle="Welcome back! Please login to continue"
      />

      <div className="h-[calc(100vh-70px-60px)] flex items-center justify-center bg-white px-4 overflow-hidden">
        <Card className="w-full max-w-[366px] shadow-2xl border-0 bg-[#1C2536] text-white">
            <CardHeader className="space-y-3 pb-4 bg-gradient-to-r from-[#5B8DEF] to-[#0063F7] rounded-t-lg">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Package className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-center">
                <CardTitle className="text-2xl font-bold text-white">OlineIMS</CardTitle>
                <CardDescription className="text-sm mt-1 text-white/90">Online Inventory Management System</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pb-6 pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-300">Username/Email</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username or email"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="h-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-[#5B8DEF] focus:ring-[#5B8DEF]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-300">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="h-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-[#5B8DEF] focus:ring-[#5B8DEF]"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-10 bg-gradient-to-r from-[#5B8DEF] to-[#0063F7] hover:from-[#4A7FDE] hover:to-[#0052CC] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200" 
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>

              <div className="mt-4 pt-4 border-t border-white/10 text-center text-sm text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-[#5B8DEF] font-semibold hover:text-[#0063F7] hover:underline transition-colors">
                  Register here
                </Link>
              </div>
            </CardContent>
          </Card>
      </div>
      <Footer />
    </>
  );
}
