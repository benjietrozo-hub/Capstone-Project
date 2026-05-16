import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Camera, ShieldAlert, Mail, Phone, Lock, Save, LayoutDashboard, KeyRound } from 'lucide-react';
import NavHeader from '../../components/NavHeader';
import NotificationProfile from '../../components/NotificationProfile';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { useToast } from '../../hooks/use-toast';
import { profileAPI, settingsAPI } from '../../api';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'system'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // Profile Form State
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    department: '',
  });
  
  // Account Form State
  const [accountData, setAccountData] = useState({
    username: '',
    email: '',
    password_confirm: '',
  });
  
  // Password Form State
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  useEffect(() => {
    // Load current user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      
      setProfileData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        department: user.department || '',
      });
      
      setAccountData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
      }));
      
      const roleStr = localStorage.getItem('role') || '';
      setUserRole(roleStr);
      
      if (roleStr === 'admin' || roleStr === 'super_admin') {
        fetchMaintenanceStatus();
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchMaintenanceStatus = async () => {
    try {
      const response = await settingsAPI.getSetting('maintenance_mode');
      if (response.data.success && response.data.data !== null) {
        setMaintenanceMode(response.data.data === 'true' || response.data.data === true);
      }
    } catch (error) {
      console.error('Failed to fetch maintenance status:', error);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Error", description: "Image size must be less than 5MB", variant: "destructive" });
        return;
      }
      
      setIsSaving(true);
      try {
        const formData = new FormData();
        formData.append('profile_image', file);
        formData.append('full_name', profileData.full_name);
        
        const response = await profileAPI.updateProfile(formData);
        if (response.data.status === 'success') {
          // Update local storage
          const updatedUser = { ...currentUser, profile_image: response.data.data.profile_image };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setCurrentUser(updatedUser);
          toast({ title: "Success", description: "Profile picture updated successfully." });
        }
      } catch (error: any) {
        toast({ title: "Update Failed", description: error.response?.data?.message || "Failed to update profile picture", variant: "destructive" });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('full_name', profileData.full_name);
      formData.append('phone', profileData.phone);
      if (userRole === 'teacher') {
        formData.append('department', profileData.department);
      }
      
      const response = await profileAPI.updateProfile(formData);
      if (response.data.status === 'success') {
        const updatedUser = { ...currentUser, ...response.data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        toast({ title: "Success", description: "Profile details updated successfully." });
      }
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.response?.data?.message || "Failed to update profile", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountData.password_confirm) {
      toast({ title: "Validation Error", description: "Please enter your current password to save changes.", variant: "destructive" });
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await profileAPI.updateAccount(accountData);
      if (response.data.status === 'success') {
        const updatedUser = { ...currentUser, ...response.data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        setAccountData(prev => ({ ...prev, password_confirm: '' }));
        toast({ title: "Success", description: "Account credentials updated successfully." });
      }
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.response?.data?.message || "Failed to update account", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast({ title: "Validation Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await profileAPI.changePassword(passwordData);
      if (response.data.status === 'success') {
        setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
        toast({ title: "Success", description: "Password changed successfully." });
      }
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.response?.data?.message || "Failed to change password", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMaintenanceToggle = async (checked: boolean) => {
    try {
      setMaintenanceMode(checked);
      await settingsAPI.updateSetting('maintenance_mode', { value: checked });
      toast({ 
        title: checked ? "Maintenance Mode Enabled" : "Maintenance Mode Disabled", 
        description: checked ? "Non-admin users will now be blocked from accessing the system." : "System is now open to all users.",
        variant: checked ? "destructive" : "default"
      });
    } catch (error) {
      setMaintenanceMode(!checked); // revert
      toast({ title: "Error", description: "Failed to toggle maintenance mode.", variant: "destructive" });
    }
  };

  if (!currentUser) return null;

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-10">
      <NavHeader 
        title="Account Profile" 
        subtitle="Manage your personal details and settings"
        showBackButton={false}
        showHomeButton={true}
        showMenuButton={true}
      >
        <NotificationProfile currentUser={currentUser} />
      </NavHeader>

      <div className="p-4 md:p-10 space-y-6 md:space-y-10 max-w-[1600px] mx-auto">
        {/* Profile Header Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden text-white flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Abstract background shapes */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>

          <div className="relative z-10 group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/30 overflow-hidden bg-white shadow-xl flex items-center justify-center relative">
              {currentUser.profile_image ? (
                <img 
                  src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://127.0.0.1:8000'}/storage/${currentUser.profile_image}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-slate-300" />
              )}
              
              {/* Overlay for avatar upload */}
              <div 
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
                onClick={handleAvatarClick}
              >
                <Camera className="w-8 h-8 text-white mb-1" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Change</span>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </div>

          <div className="relative z-10 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">{currentUser.full_name}</h1>
            <p className="text-blue-100 font-medium flex items-center justify-center md:justify-start gap-2 mb-4 text-lg">
              <Mail className="w-5 h-5" />
              {currentUser.email}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
              <ShieldAlert className="w-4 h-4 text-white" />
              <span className="text-sm font-bold uppercase tracking-wider">
                {userRole === 'super_admin' ? 'Super Administrator' : userRole === 'admin' ? 'Administrator' : 'Teacher'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs & Content */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden flex flex-col md:flex-row">
          
          {/* Sidebar */}
          <div className="w-full md:w-72 bg-slate-50 border-r border-slate-100 p-6 flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-6 py-4 rounded-[20px] font-bold text-sm transition-all ${
                activeTab === 'profile'
                  ? "bg-white text-blue-600 shadow-md border border-slate-100"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
              }`}
            >
              <User className="w-5 h-5" />
              Personal Profile
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-3 px-6 py-4 rounded-[20px] font-bold text-sm transition-all ${
                activeTab === 'settings'
                  ? "bg-white text-blue-600 shadow-md border border-slate-100"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
              }`}
            >
              <Settings className="w-5 h-5" />
              Account Settings
            </button>
            {(userRole === 'admin' || userRole === 'super_admin') && (
              <button
                onClick={() => setActiveTab('system')}
                className={`flex items-center gap-3 px-6 py-4 rounded-[20px] font-bold text-sm transition-all mt-4 border-t border-slate-200 pt-4 ${
                  activeTab === 'system'
                    ? "bg-white text-rose-600 shadow-md border border-slate-100"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
                }`}
              >
                <ShieldAlert className="w-5 h-5" />
                System Settings
              </button>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-8 md:p-12">
            {activeTab === 'profile' ? (
              <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 border-b border-slate-100 pb-6">
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    <LayoutDashboard className="w-6 h-6 text-blue-600" />
                    Personal Details
                  </h2>
                  <p className="text-slate-500 mt-2">Update your personal information and contact details.</p>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="text-xs font-black text-slate-400 uppercase tracking-wider">Full Name</Label>
                      <Input 
                        id="full_name"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                        className="h-12 bg-slate-50 border-slate-200 font-medium"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs font-black text-slate-400 uppercase tracking-wider">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          className="h-12 pl-12 bg-slate-50 border-slate-200 font-medium"
                          placeholder="+63 9XX XXX XXXX"
                        />
                      </div>
                    </div>

                    {currentUser.role === 'teacher' && (
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="department" className="text-xs font-black text-slate-400 uppercase tracking-wider">Department</Label>
                        <Input 
                          id="department"
                          value={profileData.department}
                          onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                          className="h-12 bg-slate-50 border-slate-200 font-medium"
                        />
                      </div>
                    )}
                  </div>

                  <Button type="submit" disabled={isSaving} className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 mt-4 transition-all">
                    {isSaving ? "Saving..." : "Save Profile Details"}
                    {!isSaving && <Save className="ml-2 w-4 h-4" />}
                  </Button>
                </form>
              </div>
            ) : activeTab === 'settings' ? (
              <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                
                {/* Account Credentials Section */}
                <div>
                  <div className="mb-8 border-b border-slate-100 pb-6">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                      <Lock className="w-6 h-6 text-blue-600" />
                      Account Credentials
                    </h2>
                    <p className="text-slate-500 mt-2">Update your login username and email address.</p>
                  </div>

                  <form onSubmit={handleAccountSubmit} className="space-y-6 bg-slate-50 p-6 md:p-8 rounded-[24px] border border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-wider">Username</Label>
                        <Input 
                          value={accountData.username}
                          onChange={(e) => setAccountData({...accountData, username: e.target.value})}
                          className="h-12 border-slate-200 font-medium bg-white"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-wider">Email Address</Label>
                        <Input 
                          type="email"
                          value={accountData.email}
                          onChange={(e) => setAccountData({...accountData, email: e.target.value})}
                          className="h-12 border-slate-200 font-medium bg-white"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2 border-t border-slate-200 pt-6 mt-2">
                      <Label className="text-xs font-black text-slate-400 uppercase tracking-wider">Confirm Password to Save</Label>
                      <Input 
                        type="password"
                        placeholder="Enter your current password"
                        value={accountData.password_confirm}
                        onChange={(e) => setAccountData({...accountData, password_confirm: e.target.value})}
                        className="h-12 border-slate-200 font-medium bg-white"
                        required
                      />
                    </div>

                    <Button type="submit" disabled={isSaving} className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all">
                      {isSaving ? "Updating..." : "Update Credentials"}
                    </Button>
                  </form>
                </div>

                {/* Change Password Section */}
                <div>
                  <div className="mb-8 border-b border-slate-100 pb-6">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                      <KeyRound className="w-6 h-6 text-emerald-600" />
                      Change Password
                    </h2>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="space-y-6 bg-slate-50 p-6 md:p-8 rounded-[24px] border border-slate-100">
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-slate-400 uppercase tracking-wider">Current Password</Label>
                      <Input 
                        type="password"
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                        className="h-12 border-slate-200 font-medium bg-white"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-wider">New Password</Label>
                        <Input 
                          type="password"
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                          className="h-12 border-slate-200 font-medium bg-white"
                          required
                          minLength={8}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-wider">Confirm New Password</Label>
                        <Input 
                          type="password"
                          value={passwordData.new_password_confirmation}
                          onChange={(e) => setPasswordData({...passwordData, new_password_confirmation: e.target.value})}
                          className="h-12 border-slate-200 font-medium bg-white"
                          required
                          minLength={8}
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={isSaving} className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all">
                      {isSaving ? "Changing..." : "Change Password"}
                    </Button>
                  </form>
                </div>
              </div>
            ) : activeTab === 'system' && (userRole === 'admin' || userRole === 'super_admin') ? (
              <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                <div>
                  <div className="mb-8 border-b border-slate-100 pb-6">
                    <h2 className="text-2xl font-black text-rose-600 flex items-center gap-3">
                      <ShieldAlert className="w-6 h-6" />
                      Danger Zone / System Controls
                    </h2>
                    <p className="text-slate-500 mt-2">Manage global platform configurations and emergency states.</p>
                  </div>

                  <div className="bg-rose-50 border border-rose-100 p-6 md:p-8 rounded-[24px] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                    <div>
                      <h3 className="text-lg font-black text-rose-900 mb-1">Maintenance Mode</h3>
                      <p className="text-rose-700/80 text-sm font-medium">
                        When enabled, non-administrative users will be completely blocked from accessing the system.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-sm border border-rose-100 shrink-0">
                      <span className="text-sm font-black text-slate-600 uppercase tracking-wider">
                        {maintenanceMode ? "Active" : "Disabled"}
                      </span>
                      <Switch 
                        checked={maintenanceMode} 
                        onCheckedChange={handleMaintenanceToggle}
                        className="data-[state=checked]:bg-rose-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
