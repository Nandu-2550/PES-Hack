import React, { useState, useContext } from 'react';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import GlassCard from '../components/ui/GlassCard';
import ProgressButton from '../components/ui/ProgressButton';

export default function Profile() {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    district: user?.district || '',
    village: user?.village || '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      toast.success('Profile saved');
      setTimeout(() => setSuccess(false), 2000);
    }, 1000);
  };

  return (
    <div className="page-container pb-20">
      <h1 className="text-white text-3xl font-extrabold mb-6">
        {t('profile') || 'Your Profile'}
      </h1>

      <GlassCard>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1 uppercase tracking-wider">
              {t('name') || 'Full Name'}
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              className="input-field w-full"
              placeholder="e.g., Ramesh Kumar"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1 uppercase tracking-wider">
              {t('phone') || 'Phone Number'}
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleInputChange}
              className="input-field w-full"
              placeholder="e.g., 9876543210"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1 uppercase tracking-wider">
                {t('district') || 'District'}
              </label>
              <input
                type="text"
                name="district"
                value={form.district}
                onChange={handleInputChange}
                className="input-field w-full"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1 uppercase tracking-wider">
                {t('village') || 'Village'}
              </label>
              <input
                type="text"
                name="village"
                value={form.village}
                onChange={handleInputChange}
                className="input-field w-full"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <ProgressButton
              isLoading={loading}
              isSuccess={success}
              className="w-full"
            >
              {t('save') || 'Save Profile'}
            </ProgressButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}

