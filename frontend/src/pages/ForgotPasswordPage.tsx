import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Package, ArrowLeft, Mail } from 'lucide-react';
import { Footer } from '@/components/common/Footer';
import AuthHeader from '@/components/common/AuthHeader';
import axios from 'axios';
import { API_BASE_URL } from '@/utils/constants';

export function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email
      });
      
      toast.success(response.data.message);
      setSubmitted(true);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to send reset email';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthHeader 
        title="Online Inventory Management System" 
        subtitle="Reset your password"
      />

      <div className="min-h-[calc(100vh-70px-60px)] flex items-center justify-center bg-white px-4 py-8 overflow-auto">
        <Card className="w-full max-w-[400px] shadow-2xl border-0 bg-[#1C2536] text-white my-auto">
          <CardHeader className="space-y-3 pb-4 bg-gradient-to-r from-[#5B8DEF] to-[#0063F7] rounded-t-lg">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg">
                {submitted ? (
                  <Mail className="w-8 h-8 text-white" />
                ) : (
                  <Package className="w-8 h-8 text-white" />
                )}
              </div>
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl font-bold text-white">
                {submitted ? 'Check Your Email' : 'Forgot Password'}
              </CardTitle>
              <CardDescription className="text-sm mt-1 text-white/90">
                {submitted 
                  ? 'We sent you a password reset link' 
                  : 'Enter your email to reset your password'
                }
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="pb-6 pt-4">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                  <p className="text-gray-300 text-sm">
                    If an account exists with <span className="text-[#5B8DEF] font-semibold">{email}</span>, 
                    you will receive a password reset link shortly.
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    Please check your inbox and spam folder.
                  </p>
                </div>
                
                <Button 
                  onClick={() => setSubmitted(false)}
                  variant="outline"
                  className="w-full h-10 bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  Send Another Link
                </Button>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-sm text-[#5B8DEF] font-semibold hover:text-[#0063F7] hover:underline transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
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
