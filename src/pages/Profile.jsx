import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAccountProfile,
  updateAccountProfile,
  changePassword,
} from '../api/account.api';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,          // ✅ fixed import
} from '../api/profiles.api';

export default function Profile() {
  const { user, logout } = useAuth();

  // ----- Profile state -----
  const [name, setName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // ----- Password state -----
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // ----- Address state -----
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: '',
    full_name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    is_default_shipping: false,
    is_default_billing: false,
  });

  // ---- Load profile and addresses ----
  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAddresses();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await getAccountProfile();
      if (res.ok) {
        if (res.user) {
          setName(res.user.full_name || '');
          setEmail(res.user.email || '');
        }
        if (res.customer) {
          setPhone(res.customer.phone || '');
        }
      }
    } catch (err) {
      console.warn('Could not fetch profile', err);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {
        full_name: name.trim(),
        name: name.trim(),
        phone: phone.trim(),
      };
      const res = await updateAccountProfile(payload);
      if (res.ok) {
        alert('Profile updated successfully');
        await fetchProfile();
      } else {
        alert('Profile update failed');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // ---- Password handlers ----
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (passwordMessage.text) setPasswordMessage({ type: '', text: '' });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { current_password, new_password, confirm_password } = passwordForm;

    if (!current_password || !new_password) {
      setPasswordMessage({ type: 'error', text: 'Current password and new password are required.' });
      return;
    }
    if (new_password !== confirm_password) {
      setPasswordMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    if (new_password.length < 8) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(current_password, new_password);
      setPasswordMessage({ type: 'success', text: 'Password changed successfully.' });
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to change password. Please check your current password.';
      setPasswordMessage({ type: 'error', text: errorMsg });
    } finally {
      setChangingPassword(false);
    }
  };

  // ---- Address handlers ----
  const fetchAddresses = useCallback(async () => {
    setLoadingAddresses(true);
    try {
      const res = await getAddresses();
      if (res.ok) setAddresses(res.addresses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const openNewAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      label: '', full_name: '', phone: '', line1: '', line2: '',
      city: '', state: '', postal_code: '', country: '',
      is_default_shipping: false, is_default_billing: false,
    });
    setShowAddressForm(true);
  };

  const openEditAddress = (id) => {
    const addr = addresses.find((a) => a.id === id);
    if (addr) {
      setEditingAddressId(id);
      setAddressForm({
        label: addr.label || '',
        full_name: addr.full_name || '',
        phone: addr.phone || '',
        line1: addr.line1 || '',
        line2: addr.line2 || '',
        city: addr.city || '',
        state: addr.state || '',
        postal_code: addr.postal_code || '',
        country: addr.country || '',
        is_default_shipping: addr.is_default_shipping,
        is_default_billing: addr.is_default_billing,
      });
      setShowAddressForm(true);
    }
  };

  const handleAddressSave = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, addressForm);
      } else {
        await createAddress(addressForm);
      }
      setShowAddressForm(false);
      fetchAddresses();
    } catch (err) {
      console.error(err);
      alert('Failed to save address');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await deleteAddress(id);   // ✅ fixed
      fetchAddresses();
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-gold-700 tracking-widest">
            My Account
          </h1>
          <p className="text-charcoal mt-2">Manage your profile, phone, passwords, and addresses.</p>
        </div>

        {/* Profile Form */}
        <div className="bg-white border border-gold-200 p-8 rounded-sm shadow-sm">
          <h2 className="font-serif text-2xl text-gold-600 mb-6">Profile Information</h2>
          <form onSubmit={handleProfileSave} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-widest text-gold-600 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gold-300 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-gold-600 mb-2">Email</label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full border border-gold-300 bg-gold-50 px-4 py-3 text-charcoal text-sm"
              />
              <p className="text-xs text-gold-500 mt-1">Email cannot be changed here.</p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-gold-600 mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gold-300 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold-500"
              />
            </div>
            <button
              type="submit"
              disabled={savingProfile}
              className="px-8 py-3 bg-gold-500 text-white uppercase tracking-widest text-sm hover:bg-gold-600 transition disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="bg-white border border-gold-200 p-8 rounded-sm shadow-sm">
          <h2 className="font-serif text-2xl text-gold-600 mb-6">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-widest text-gold-600 mb-2">Current Password</label>
              <input
                type="password"
                name="current_password"
                value={passwordForm.current_password}
                onChange={handlePasswordChange}
                className="w-full border border-gold-300 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold-500"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-gold-600 mb-2">New Password</label>
              <input
                type="password"
                name="new_password"
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
                className="w-full border border-gold-300 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold-500"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-gold-600 mb-2">Confirm New Password</label>
              <input
                type="password"
                name="confirm_password"
                value={passwordForm.confirm_password}
                onChange={handlePasswordChange}
                className="w-full border border-gold-300 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold-500"
                autoComplete="new-password"
              />
            </div>
            {passwordMessage.text && (
              <div className={`text-sm ${passwordMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                {passwordMessage.text}
              </div>
            )}
            <button
              type="submit"
              disabled={changingPassword}
              className="px-8 py-3 bg-gold-500 text-white uppercase tracking-widest text-sm hover:bg-gold-600 transition disabled:opacity-50"
            >
              {changingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Addresses Section */}
        <div className="bg-white border border-gold-200 p-8 rounded-sm shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl text-gold-600">Saved Addresses</h2>
            <button
              onClick={openNewAddress}
              className="px-6 py-2 border border-gold-500 text-gold-600 text-sm uppercase tracking-widest hover:bg-gold-50 transition"
            >
              + Add New
            </button>
          </div>

          {loadingAddresses ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div>
            </div>
          ) : addresses.length === 0 ? (
            <p className="text-charcoal">No addresses saved yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((addr) => (
                <div key={addr.id} className="border border-gold-100 p-5 rounded-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-charcoal">
                      {addr.label || 'Address'}
                      {addr.is_default_shipping && (
                        <span className="ml-2 text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full">Default Shipping</span>
                      )}
                      {addr.is_default_billing && (
                        <span className="ml-2 text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full">Default Billing</span>
                      )}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => openEditAddress(addr.id)} className="text-gold-600 hover:text-gold-700 text-sm">Edit</button>
                      <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-600 hover:text-red-700 text-sm">Delete</button>
                    </div>
                  </div>
                  <p className="text-charcoal text-sm">{addr.full_name}</p>
                  <p className="text-charcoal text-sm">{addr.line1}</p>
                  {addr.line2 && <p className="text-charcoal text-sm">{addr.line2}</p>}
                  <p className="text-charcoal text-sm">
                    {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postal_code}
                  </p>
                  <p className="text-charcoal text-sm">{addr.country}</p>
                  <p className="text-charcoal text-sm">{addr.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Address Form Modal */}
        {showAddressForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg mx-4 p-8 rounded-sm shadow-xl border border-gold-200 max-h-[90vh] overflow-y-auto">
              <h3 className="font-serif text-2xl text-gold-600 mb-6">
                {editingAddressId ? 'Edit Address' : 'New Address'}
              </h3>
              <form onSubmit={handleAddressSave} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase text-gold-600 mb-1">Label</label>
                  <input type="text" name="label" value={addressForm.label} onChange={handleAddressChange}
                    className="w-full border border-gold-300 px-3 py-2 text-sm" placeholder="Home, Office, etc." />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gold-600 mb-1">Full Name</label>
                  <input type="text" name="full_name" value={addressForm.full_name} onChange={handleAddressChange}
                    className="w-full border border-gold-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gold-600 mb-1">Phone</label>
                  <input type="text" name="phone" value={addressForm.phone} onChange={handleAddressChange}
                    className="w-full border border-gold-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gold-600 mb-1">Line 1</label>
                  <input type="text" name="line1" value={addressForm.line1} onChange={handleAddressChange}
                    className="w-full border border-gold-300 px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gold-600 mb-1">Line 2</label>
                  <input type="text" name="line2" value={addressForm.line2} onChange={handleAddressChange}
                    className="w-full border border-gold-300 px-3 py-2 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-gold-600 mb-1">City</label>
                    <input type="text" name="city" value={addressForm.city} onChange={handleAddressChange}
                      className="w-full border border-gold-300 px-3 py-2 text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-gold-600 mb-1">State</label>
                    <input type="text" name="state" value={addressForm.state} onChange={handleAddressChange}
                      className="w-full border border-gold-300 px-3 py-2 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-gold-600 mb-1">Postal Code</label>
                    <input type="text" name="postal_code" value={addressForm.postal_code} onChange={handleAddressChange}
                      className="w-full border border-gold-300 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-gold-600 mb-1">Country</label>
                    <input type="text" name="country" value={addressForm.country} onChange={handleAddressChange}
                      className="w-full border border-gold-300 px-3 py-2 text-sm" />
                  </div>
                </div>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="is_default_shipping" checked={addressForm.is_default_shipping} onChange={handleAddressChange} />
                    <span className="text-sm text-charcoal">Default Shipping</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="is_default_billing" checked={addressForm.is_default_billing} onChange={handleAddressChange} />
                    <span className="text-sm text-charcoal">Default Billing</span>
                  </label>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 py-2 bg-gold-500 text-white uppercase tracking-widest text-sm hover:bg-gold-600 transition">
                    Save
                  </button>
                  <button type="button" onClick={() => setShowAddressForm(false)}
                    className="flex-1 py-2 border border-gold-300 text-gold-600 uppercase tracking-widest text-sm hover:bg-gold-50 transition">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="bg-white border border-gold-200 p-8 rounded-sm shadow-sm">
          <h2 className="font-serif text-2xl text-gold-600 mb-6">Account Actions</h2>
          <button
            onClick={handleLogout}
            className="px-8 py-3 border border-red-300 text-red-600 uppercase tracking-widest text-sm hover:bg-red-50 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}