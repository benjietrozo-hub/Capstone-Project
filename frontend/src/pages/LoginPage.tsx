import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Package, Clock, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Footer } from '@/components/common/Footer';
import AuthHeader from '@/components/common/AuthHeader';
import axios from 'axios';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [lockMessage, setLockMessage] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Check lockout status on mount and restore from localStorage
  useEffect(() => {
    const checkLockoutStatus = async () => {
      const savedUsername = localStorage.getItem('login_username');
      const savedLockUntil = localStorage.getItem('login_lock_until');
      const savedLockMessage = localStorage.getItem('login_lock_message');

      if (savedUsername && savedLockUntil) {
        const lockUntilTime = new Date(savedLockUntil).getTime();
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((lockUntilTime - now) / 1000));

        if (remaining > 0) {
          setFormData(prev => ({ ...prev, username: savedUsername }));
          setIsLocked(true);
          setRemainingSeconds(remaining);
          setLockMessage(savedLockMessage || 'Account is temporarily locked');
        } else {
          // Lock expired, clear localStorage
          localStorage.removeItem('login_lock_until');
          localStorage.removeItem('login_lock_message');
        }
      }
    };

    checkLockoutStatus();
  }, []);

  // Save username to localStorage when it changes
  useEffect(() => {
    if (formData.username) {
      localStorage.setItem('login_username', formData.username);
    }
  }, [formData.username]);

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isLocked && remainingSeconds > 0) {
      timer = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setLockMessage('');
            // Clear localStorage when unlocked
            localStorage.removeItem('login_lock_until');
            localStorage.removeItem('login_lock_message');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLocked, remainingSeconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${secs}s`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      toast.error('Please wait until the lockout period expires');
      return;
    }

    setLoading(true);

    // Debug logging
    console.log('Submitting login form with data:', formData);

    try {
      const response = await login(formData);
      const { role } = response;
      
      // Clear lockout data on successful login
      localStorage.removeItem('login_username');
      localStorage.removeItem('login_lock_until');
      localStorage.removeItem('login_lock_message');
      
      toast.success('Login successful');
      
      // Redirect based on role
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'teacher') {
        navigate('/teacher/dashboard');
      }
    } catch (err: any) {
      // Debug logging
      console.log('Login error:', err);
      console.log('Error response:', err.response);
      console.log('Error data:', err.response?.data);
      
      // Check if account is locked
      if (err.response?.status === 429) {
        const data = err.response.data;
        const lockUntil = new Date(data.locked_until).toISOString();
        
        setIsLocked(true);
        setRemainingSeconds(data.remaining_seconds || 0);
        setLockMessage(data.message);
        
        // Save to localStorage
        localStorage.setItem('login_lock_until', lockUntil);
        localStorage.setItem('login_lock_message', data.message);
        
        toast.error(data.message, { duration: 5000 });
      } else {
        const message = err.response?.data?.message || err.response?.data?.errors?.username?.[0] || 'Login failed';
        toast.error(message, { duration: 4000 });
      }
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

      <div className="min-h-[calc(100vh-70px-60px)] flex items-center justify-center bg-white px-4 py-8 overflow-auto">
        <Card className="w-full max-w-[366px] shadow-2xl border-0 bg-[#1C2536] text-white my-auto">
            <CardHeader className="space-y-3 pb-4 bg-gradient-to-r from-[#5B8DEF] to-[#0063F7] rounded-t-lg">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                  {isLocked ? (
                    <Clock className="w-8 h-8 text-white animate-pulse" />
                  ) : (
                    <img 
                      src="/Logo_n.jpg" 
                      alt="Online IMS Logo" 
                      className="w-14 h-14 object-cover rounded-full"
                    />
                  )}
                </div>
              </div>
              <div className="text-center">
                <CardTitle className="text-2xl font-bold text-white">
                  {isLocked ? 'Account Locked' : 'Online IMS'}
                </CardTitle>
                <CardDescription className="text-sm mt-1 text-white/90">
                  {isLocked ? 'Too many failed attempts' : 'Online Inventory Management System'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pb-6 pt-4">
              {isLocked && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-red-200 mb-2">{lockMessage}</p>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-300" />
                        <span className="text-lg font-mono font-bold text-red-300">
                          {formatTime(remainingSeconds)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label 
                    htmlFor="username" 
                    className={`text-sm font-medium ${isLocked ? 'text-gray-500' : 'text-gray-300'}`}
                  >
                    Username/Email
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username or email"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={loading || isLocked}
                    className={`h-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-[#5B8DEF] focus:ring-[#5B8DEF] ${
                      isLocked ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <Label 
                    htmlFor="password" 
                    className={`text-sm font-medium ${isLocked ? 'text-gray-500' : 'text-gray-300'}`}
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={loading || isLocked}
                      className={`h-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-[#5B8DEF] focus:ring-[#5B8DEF] pr-10 ${
                        isLocked ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading || isLocked}
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors ${
                        isLocked ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className={`w-full h-10 bg-gradient-to-r from-[#5B8DEF] to-[#0063F7] text-white font-semibold shadow-lg transition-all duration-200 ${
                    isLocked 
                      ? 'cursor-not-allowed opacity-50' 
                      : 'hover:from-[#4A7FDE] hover:to-[#0052CC] hover:shadow-xl'
                  }`}
                  disabled={loading || isLocked}
                >
                  {loading ? 'Logging in...' : isLocked ? 'Locked' : 'Login'}
                </Button>
              </form>

              {isLocked && (
                <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-lg text-center">
                  <p className="text-xs text-gray-400 mb-2">Need to reset your password?</p>
                  <Link 
                    to="/forgot-password" 
                    className="inline-block text-base font-semibold text-white bg-gradient-to-r from-[#5B8DEF] to-[#0063F7] hover:from-[#4A7FDE] hover:to-[#0052CC] px-6 py-2 rounded-md transition-all duration-200 hover:shadow-lg"
                  >
                    Forgot Password
                  </Link>
                </div>
              )}

              {!isLocked && (
                <div className="mt-4 pt-4 border-t border-white/10 text-center text-sm text-gray-400">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-[#5B8DEF] font-semibold hover:text-[#0063F7] hover:underline transition-colors">
                    Register here
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
      </div>
      <Footer />
    </>
  );
}
