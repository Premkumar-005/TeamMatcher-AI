import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Bell, Shield, LogOut, Lock, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import DashboardLayout from '../components/common/DashboardLayout';
import Button from '../components/ui/Button';

export default function SettingsPage() {
  const { addToast, logoutUser, changeUserPassword } = useApp();
  const navigate = useNavigate();

  const [notifSettings, setNotifSettings] = useState({
    emailAlerts: true,
    teamInvites: true,
    aiSuggestions: true,
    taskUpdates: true
  });

  const [twoFactor, setTwoFactor] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    newPass: '',
    confirm: ''
  });

  const handleSaveSettings = () => {
    addToast('Settings Saved ⚙️', 'Your system preferences and notification settings have been updated.', 'success');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPass !== passwordData.confirm) {
      addToast('Password Mismatch', 'New password and confirm password do not match.', 'error');
      return;
    }
    if (passwordData.newPass.length < 6) {
      addToast('Password Too Short', 'New password must be at least 6 characters long.', 'error');
      return;
    }
    const res = await changeUserPassword({
      currentPassword: passwordData.current,
      newPassword: passwordData.newPass
    });
    if (res?.success) {
      setPasswordData({ current: '', newPass: '', confirm: '' });
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <DashboardLayout title="Account & Platform Settings" maxWidth="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1C1C1F] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-indigo-400" />
            <span>Platform Settings</span>
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            Manage notification preferences, password security, and account access.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSaveSettings}
          icon={Save}
        >
          Save Preferences
        </Button>
      </div>

      {/* Notifications Section */}
      <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-6 rounded-2xl space-y-4">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#1C1C1F] pb-3">
          <Bell className="w-4 h-4 text-indigo-400" /> Notifications & Triggers
        </h3>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0E0E10] border border-[#1C1C1F]">
            <div>
              <h4 className="font-medium text-white">Email Alerts & Team Invites</h4>
              <p className="text-[#71717A] mt-0.5">Receive immediate notifications when candidates accept team invitations.</p>
            </div>
            <input
              type="checkbox"
              checked={notifSettings.emailAlerts}
              onChange={(e) => setNotifSettings({ ...notifSettings, emailAlerts: e.target.checked })}
              className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0E0E10] border border-[#1C1C1F]">
            <div>
              <h4 className="font-medium text-white">Skill Gap & Learning Recommendations</h4>
              <p className="text-[#71717A] mt-0.5">Get notified when new learning paths match your missing tech stack skills.</p>
            </div>
            <input
              type="checkbox"
              checked={notifSettings.aiSuggestions}
              onChange={(e) => setNotifSettings({ ...notifSettings, aiSuggestions: e.target.checked })}
              className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0E0E10] border border-[#1C1C1F]">
            <div>
              <h4 className="font-medium text-white">Workspace Task Assignments</h4>
              <p className="text-[#71717A] mt-0.5">Alert when team members assign Kanban tasks or upload shared files.</p>
            </div>
            <input
              type="checkbox"
              checked={notifSettings.taskUpdates}
              onChange={(e) => setNotifSettings({ ...notifSettings, taskUpdates: e.target.checked })}
              className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Password Security Form */}
      <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-6 rounded-2xl space-y-4">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#1C1C1F] pb-3">
          <Lock className="w-4 h-4 text-indigo-400" /> Change Password
        </h3>

        <form onSubmit={handlePasswordChange} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[#A1A1AA] font-medium mb-1">Current Password</label>
            <input
              type="password"
              required
              value={passwordData.current}
              onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
              className="w-full px-3 py-2 saas-input"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-[#A1A1AA] font-medium mb-1">New Password</label>
            <input
              type="password"
              required
              value={passwordData.newPass}
              onChange={(e) => setPasswordData({ ...passwordData, newPass: e.target.value })}
              className="w-full px-3 py-2 saas-input"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-[#A1A1AA] font-medium mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={passwordData.confirm}
              onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
              className="w-full px-3 py-2 saas-input"
              placeholder="••••••••"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end pt-2">
            <Button type="submit" variant="secondary" size="sm">
              Update Password
            </Button>
          </div>
        </form>
      </div>

      {/* Security & Logout */}
      <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-6 rounded-2xl space-y-4">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#1C1C1F] pb-3">
          <Shield className="w-4 h-4 text-indigo-400" /> Security & Session
        </h3>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0E0E10] border border-[#1C1C1F]">
            <div>
              <h4 className="font-medium text-white">Two-Factor Authentication (2FA)</h4>
              <p className="text-[#71717A] mt-0.5">Secure your TeamMatcher account with two-factor verification.</p>
            </div>
            <button
              onClick={() => {
                setTwoFactor(!twoFactor);
                addToast(twoFactor ? '2FA Disabled' : '2FA Enabled', 'Two-Factor state updated.', 'info');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium border text-xs transition-colors ${
                twoFactor
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                  : 'bg-[#141414] text-[#D4D4D8] border-[#27272A] hover:bg-[#18181B]'
              }`}
            >
              {twoFactor ? 'Enabled ✓' : 'Enable 2FA'}
            </button>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[#1C1C1F]">
            <span className="text-[#71717A]">Sign out of active developer session</span>
            <Button
              variant="danger"
              size="sm"
              onClick={handleLogout}
              icon={LogOut}
            >
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
