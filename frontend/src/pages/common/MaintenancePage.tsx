import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, AlertTriangle } from 'lucide-react';
import { settingsAPI } from '@/api';

const MaintenancePage: React.FC = () => {
  const navigate = useNavigate();
  const isCheckingRef = useRef(false);

  useEffect(() => {
    const isMaintenanceActive = (value: unknown) => (
      value === true || value === 'true' || value === 1 || value === '1'
    );

    const getReturnPath = () => {
      const role = localStorage.getItem('role');
      if (role === 'admin' || role === 'super_admin') return '/admin/dashboard';
      if (role === 'teacher') return '/teacher/dashboard';
      return '/login';
    };

    const checkMaintenanceStatus = async () => {
      if (isCheckingRef.current) return;
      isCheckingRef.current = true;

      try {
        const response = await settingsAPI.getMaintenanceStatus();
        if (response.data?.success && !isMaintenanceActive(response.data.data)) {
          navigate(getReturnPath(), { replace: true });
        }
      } catch (error) {
        console.error('Failed to check maintenance status:', error);
      } finally {
        isCheckingRef.current = false;
      }
    };

    checkMaintenanceStatus();
    const intervalId = window.setInterval(checkMaintenanceStatus, 3000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkMaintenanceStatus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-10 text-center">
        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Settings className="w-12 h-12 text-rose-500 animate-[spin_4s_linear_infinite]" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">System Under Maintenance</h1>
        
        <p className="text-slate-500 mb-8 leading-relaxed">
          We are currently performing scheduled maintenance to improve the system. 
          Please check back later. We apologize for any inconvenience.
        </p>

        <div className="flex items-center gap-3 bg-amber-50 text-amber-700 p-4 rounded-2xl text-left border border-amber-100">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <p className="text-sm font-medium">
            Administrators are actively working on the platform. Operations will resume shortly.
          </p>
        </div>
      </div>
      
      <p className="mt-8 text-sm font-black text-slate-400 tracking-widest uppercase">
        OIMS System Status
      </p>
    </div>
  );
};

export default MaintenancePage;
