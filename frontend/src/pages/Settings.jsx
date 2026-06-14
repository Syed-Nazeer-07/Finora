import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Bell, Shield, Mail } from 'lucide-react';

export const Settings = () => {
  const { user, checkAuth } = useAuth();
  const { addToast } = useToast();
  
  // States
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Profile Form
  const [name, setName] = useState('');
  
  // Preferences Form
  const [currency, setCurrency] = useState('INR');
  const [theme, setTheme] = useState('system');

  // Security Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
    api.get('/api/settings').then(data => {
      setSettings(data);
      setCurrency(data.currency || 'INR');
      setTheme(data.theme || 'system');
      setLoading(false);
    }).catch(console.error);
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/settings/update-name', { name });
      addToast('Profile updated successfully.', 'success');
      await checkAuth(); // Refresh user context
    } catch (err) {
      addToast(err.toString(), 'error');
    }
  };

  const handleUpdatePreferences = async (e) => {
    e.preventDefault();
    try {
      await api.put('/api/settings/', { currency, theme });
      addToast('Preferences saved.', 'success');
    } catch (err) {
      addToast(err.toString(), 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/settings/change-password', { current_password: currentPassword, new_password: newPassword });
      addToast('Password updated successfully.', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      addToast(err.toString(), 'error');
    }
  };

  const handleResendVerification = async () => {
    try {
      await api.post('/api/settings/resend-verification', {});
      addToast('Verification email sent!', 'success');
    } catch (err) {
      addToast(err.toString(), 'error');
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-6">
        
        {/* Profile Settings */}
        <div className="rounded-xl border bg-card shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <User className="text-primary" />
            <h2 className="text-xl font-semibold">Profile Information</h2>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input 
                type="email" 
                className="w-full px-3 py-2 bg-muted text-muted-foreground border rounded-lg cursor-not-allowed"
                value={user?.email || ''}
                disabled
              />
              {!user?.email_verified && (
                <div className="mt-2 flex items-center gap-2 text-sm text-amber-500">
                  <Mail size={14} />
                  <span>Email not verified.</span>
                  <button type="button" onClick={handleResendVerification} className="underline font-medium hover:text-amber-600">
                    Resend link
                  </button>
                </div>
              )}
            </div>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium">
              Save Profile
            </button>
          </form>
        </div>

        {/* Preferences */}
        <div className="rounded-xl border bg-card shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <Bell className="text-primary" />
            <h2 className="text-xl font-semibold">Preferences</h2>
          </div>
          
          <form onSubmit={handleUpdatePreferences} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1">Default Currency</label>
              <select 
                className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Theme</label>
              <select 
                className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System Default</option>
              </select>
            </div>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium">
              Save Preferences
            </button>
          </form>
        </div>

        {/* Security */}
        <div className="rounded-xl border bg-card shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <Shield className="text-primary" />
            <h2 className="text-xl font-semibold">Security</h2>
          </div>
          
          {user?.is_google_auth ? (
            <p className="text-sm text-muted-foreground">
              You signed in using Google. Password changes are disabled.
            </p>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium">
                Update Password
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
