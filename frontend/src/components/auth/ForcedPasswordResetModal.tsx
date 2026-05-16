import React, { useState, useEffect } from 'react';
import { Shield, Key, Mail, RefreshCw, CheckCircle2, XCircle, AlertCircle, LogOut } from 'lucide-react';
import { authAPI } from '@/api';
import toast from 'react-hot-toast';

interface ForcedPasswordResetModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  userRole: 'admin' | 'teacher';
}

export default function ForcedPasswordResetModal({ isOpen, onSuccess, userRole }: ForcedPasswordResetModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: 'Weak',
    color: 'bg-red-500',
    text: 'text-red-500',
    criteria: {
      length: false,
      upper: false,
      number: false,
      special: false
    }
  });
  const [isOldPassword, setIsOldPassword] = useState(false);
  const [checkingOld, setCheckingOld] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && step === 1) {
      handleSendOTP();
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authAPI.logout();
      window.location.href = '/login';
    } catch (error) {
      // Even if API fails, clear local state and redirect
      localStorage.clear();
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (timer > 0) return;
    try {
      await authAPI.sendOTP(userRole);
      toast.success('Verification code sent to your email');
      setTimer(180); // 3 minutes
    } catch (error) {
      toast.error('Failed to send verification code');
    }
  };

  const calculateStrength = (pass: string) => {
    const criteria = {
      length: pass.length >= 8,
      upper: /[A-Z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[^A-Za-z0-9]/.test(pass)
    };

    let score = 0;
    if (criteria.length) score++;
    if (criteria.upper) score++;
    if (criteria.number) score++;
    if (criteria.special) score++;

    let label = 'Weak';
    let color = 'bg-red-500';
    let text = 'text-red-500';

    if (score >= 4) {
      label = 'Strong';
      color = 'bg-green-500';
      text = 'text-green-500';
    } else if (score >= 2) {
      label = 'Medium';
      color = 'bg-orange-500';
      text = 'text-orange-500';
    }

    setPasswordStrength({ score, label, color, text, criteria });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    calculateStrength(val);
    
    // Clear old password warning as user types
    setIsOldPassword(false);
    
    // Debounced check if it's the old password
    if (val.length >= 8) {
      debounceCheckOld(val);
    }
  };

  const debounceCheckOld = React.useMemo(
    () => {
      let timeout: any;
      return (val: string) => {
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
          if (!val) return;
          try {
            setCheckingOld(true);
            // If verifyPassword returns 200, it means it matches the old password
            await authAPI.verifyPassword(userRole, val);
            setIsOldPassword(true);
          } catch (err) {
            // If it fails (422), it's NOT the old password, which is good
            setIsOldPassword(false);
          } finally {
            setCheckingOld(false);
          }
        }, 800);
      };
    },
    [userRole]
  );

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setOtpError(null);
    try {
      await authAPI.verifyOTP(userRole, otp);
      setShowSuccess(true);
      // Wait for 1.5 seconds for the animation
      setTimeout(() => {
        setShowSuccess(false);
        setStep(2);
      }, 1500);
      toast.success('Code verified successfully');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Invalid verification code';
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordStrength.score < 2) {
      toast.error('Please choose a stronger password');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetForcedPassword(userRole, {
        otp,
        password,
        password_confirmation: confirmPassword
      });
      toast.success('Password updated successfully! Welcome to PIMS.');
      onSuccess();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to update password';
      toast.error(msg);
      if (msg.toLowerCase().includes('otp')) {
        setStep(1);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-md mb-4 animate-bounce">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">Secure Your Account</h2>
          <p className="text-blue-100 mt-2 text-sm">
            For your security, you must change your temporary password before proceeding.
          </p>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}} />

        <div className="p-8">
          {showSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-bounce">
                <CheckCircle2 className="w-16 h-16" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-slate-800">Verified!</h3>
                <p className="text-slate-500">Your security code is correct.</p>
              </div>
              <div className="w-full max-w-[200px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 animate-[progress_1.5s_ease-in-out]" />
              </div>
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-slate-600 text-sm font-medium">
                  We've sent a 6-digit verification code to your registered email.
                </p>
                <p className="text-slate-400 text-xs italic">
                  (Please check your inbox or spam folder)
                </p>
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/[^0-9]/g, ''));
                    setOtpError(null);
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-center text-2xl font-bold tracking-[0.5em]"
                  required
                />
              </div>

              {/* Real-time OTP Error Message */}
              {otpError && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                  <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-700 font-bold leading-tight">
                    {otpError}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 group"
                >
                  Verify Code
                  <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                </button>
                
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={timer > 0}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                  {timer > 0 ? `Resend code in ${timer}s` : 'Resend Verification Code'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={handlePasswordChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                    <span className="text-slate-500">Security Strength:</span>
                    <span className={passwordStrength.text}>{passwordStrength.label}</span>
                  </div>
                  
                  <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
                    <div 
                      className={`absolute left-0 top-0 h-full transition-all duration-700 ease-out shadow-lg ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                    />
                  </div>
                  
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                          i <= passwordStrength.score ? passwordStrength.color : 'bg-slate-200/50'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold ${passwordStrength.criteria.length ? 'text-green-600' : 'text-slate-400'}`}>
                      {passwordStrength.criteria.length ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      8+ CHARACTERS
                    </div>
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold ${passwordStrength.criteria.upper ? 'text-green-600' : 'text-slate-400'}`}>
                      {passwordStrength.criteria.upper ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      UPPERCASE
                    </div>
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold ${passwordStrength.criteria.number ? 'text-green-600' : 'text-slate-400'}`}>
                      {passwordStrength.criteria.number ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      NUMBER
                    </div>
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold ${passwordStrength.criteria.special ? 'text-green-600' : 'text-slate-400'}`}>
                      {passwordStrength.criteria.special ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      SPECIAL CHAR
                    </div>
                  </div>
                </div>

                {isOldPassword && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex gap-3 animate-in slide-in-from-top-2 duration-300">
                    <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <p className="text-xs text-red-700 font-bold leading-relaxed">
                      THIS IS YOUR CURRENT PASSWORD. For security, you must choose a completely new password.
                    </p>
                  </div>
                )}

                <div className="relative">
                  <Key className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                  {confirmPassword && (
                    <div className="absolute right-3 top-3">
                      {password === confirmPassword ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || passwordStrength.score < 2 || password !== confirmPassword || isOldPassword || checkingOld}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Updating...' : 'Set New Password'}
              </button>
              
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-xs text-slate-500 hover:text-blue-600 font-bold uppercase transition-colors"
              >
                Back to OTP Verification
              </button>
            </form>
          )}

          {/* Global Logout Button */}
          {!showSuccess && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full py-2 text-slate-400 hover:text-red-500 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors group"
              >
                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Cancel & Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
