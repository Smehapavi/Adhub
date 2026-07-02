import { useState } from 'react';
import { User, Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    company: user?.company || '',
    phone: user?.phone || '',
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put('/auth/profile', profile);
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account information</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-2xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="badge bg-primary-100 text-primary-700 mt-1 capitalize">{user?.role}</span>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <User className="h-4 w-4" /> Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Email</label>
              <input value={user?.email} className="input bg-gray-50" disabled />
            </div>
            <div>
              <label className="label">Company</label>
              <input value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="input" />
            </div>
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary">
            {savingProfile ? <LoadingSpinner size="sm" /> : <><Save className="h-4 w-4" /> Save Changes</>}
          </button>
        </form>
      </div>

      <div className="card p-6">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <Lock className="h-4 w-4" /> Change Password
          </h3>
          <div>
            <label className="label">Current Password</label>
            <input
              type="password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              className="input"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="input"
                minLength={6}
                required
              />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>
          <button type="submit" disabled={savingPassword} className="btn-primary">
            {savingPassword ? <LoadingSpinner size="sm" /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
