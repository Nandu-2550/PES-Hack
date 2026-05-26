import React, { useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { Phone, Check, Trash2, ShoppingBasket } from 'lucide-react';
import client from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import SyncBadge from '../components/SyncBadge';
import { useCachedFetch } from '../hooks/useCachedFetch';
import { TranslatedText } from '../utils/translate';
import GlassCard from '../components/ui/GlassCard';
import { SkeletonListingGrid } from '../components/ui/SkeletonCard';
import SwipeCard from '../components/ui/SwipeCard';

export default function CropMarket() {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const { data: listingsRaw, setData: setListings, syncedAt, isStale, loading: browseLoading } = useCachedFetch(
    `crops_${user?.district}`,
    user ? `/api/crops` : null
  );
  const listings = listingsRaw || [];

  const [myListings, setMyListings] = useState([]);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'sell', 'mine'
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    cropName: '',
    quantity: '',
    pricePerKg: '',
    location: '',
    description: '',
  });

  // Socket connection
  useEffect(() => {
    if (!user) return;
    const socket = io();

    socket.on('crop:soldout', ({ id }) => {
      setListings((prev) => prev.filter((item) => item._id !== id));
      setMyListings((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: 'sold_out' } : item))
      );
    });

    socket.on('crop:deleted', ({ id }) => {
      setListings((prev) => prev.filter((item) => item._id !== id));
      setMyListings((prev) => prev.filter((item) => item._id !== id));
    });

    return () => socket.disconnect();
  }, [user, setListings]);

  // Fetch my listings when mine tab is active
  useEffect(() => {
    if (activeTab === 'mine') {
      fetchMyListings();
    }
  }, [activeTab]);

  const fetchMyListings = async () => {
    setLoading(true);
    const t0 = Date.now();
    try {
      const res = await client.get('/api/crops/mine');
      const wait = Math.max(0, 300 - (Date.now() - t0));
      setTimeout(() => {
        setMyListings(res.data);
        setLoading(false);
      }, wait);
    } catch (err) {
      setLoading(false);
      toast.error('Connection slow — retrying…', { duration: 5000 });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.cropName || !form.quantity || !form.pricePerKg || !form.location) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const res = await client.post('/api/crops', {
        cropName: form.cropName,
        quantity: Number(form.quantity),
        pricePerKg: Number(form.pricePerKg),
        location: form.location,
        description: form.description,
      });
      toast.success(t('posted_success') || 'Crop listed successfully!');
      setForm({ cropName: '', quantity: '', pricePerKg: '', location: '', description: '' });
      // Prepend to current browse list silently if it's the same district
      if (res.data.district === user.district) {
        setListings((prev) => [res.data, ...prev]);
      }
      setActiveTab('browse');
    } catch (err) {
      toast.error(t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkSoldOut = async (id) => {
    try {
      await client.patch(`/api/crops/${id}/soldout`);
      toast.success(t('sold_out_success') || 'Crop marked as sold out!');
      fetchMyListings();
    } catch (err) {
      toast.error(t('error'));
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm(t('confirm_delete') || 'Are you sure you want to delete this listing?')) return;
    try {
      await client.delete(`/api/crops/${id}`);
      toast.success(t('deleted_success') || 'Listing removed successfully!');
      fetchMyListings();
    } catch (err) {
      toast.error(t('error'));
    }
  };

  const activeBrowseListings = listings.filter((item) => item.status === 'available');

  return (
    <div className="page-container pb-20">
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-white text-3xl font-extrabold flex items-center gap-2">
          <ShoppingBasket className="text-emerald-400" size={28} />
          {t('crop_market')}
        </h1>
      </div>
      <SyncBadge syncedAt={syncedAt} isStale={isStale} />

      {/* Pill tabs dock */}
      <div className="tab-dock">
        <button
          className={`tab-pill ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          {t('market')}
        </button>
        <button
          className={`tab-pill ${activeTab === 'sell' ? 'active' : ''}`}
          onClick={() => setActiveTab('sell')}
        >
          {t('sell_your_crop')}
        </button>
        <button
          className={`tab-pill ${activeTab === 'mine' ? 'active' : ''}`}
          onClick={() => setActiveTab('mine')}
        >
          {t('my_listings') || 'My Listings'}
        </button>
      </div>

      {activeTab === 'browse' && (
        <div>
          {browseLoading ? (
            <SkeletonListingGrid count={4} />
          ) : activeBrowseListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBrowseListings.map((item) => (
                <GlassCard key={item._id}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="text-white text-xl font-bold">
                        <TranslatedText text={item.cropName} />
                      </h2>
                      <p className="text-slate-400 text-xs mt-0.5">
                        📍 <TranslatedText text={item.location} />, <TranslatedText text={item.district} />
                      </p>
                    </div>
                    <span className="badge badge-available">{t('available')}</span>
                  </div>

                  {item.description && (
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                      <TranslatedText text={item.description} />
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3 mb-4">
                    <div>
                      <span className="text-slate-500 text-xs block uppercase tracking-wider">
                        {t('quantity')}
                      </span>
                      <span className="text-white font-bold text-sm">{item.quantity} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block uppercase tracking-wider">
                        {t('price_per_kg')}
                      </span>
                      <span className="text-emerald-400 font-bold text-sm">₹{item.pricePerKg}/kg</span>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-3 flex flex-col gap-2">
                    <p className="text-xs text-slate-500">
                      {t('seller_info')}: <TranslatedText text={item.sellerName} />
                    </p>
                    <a
                      href={`tel:${item.sellerContact}`}
                      className="btn-emerald flex items-center justify-center gap-2 text-center text-sm"
                      style={{ textDecoration: 'none' }}
                    >
                      <Phone size={16} />
                      {t('call_seller')}
                    </a>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-slate-500 text-sm">
                {t('no_listings_found') || 'No crop listings found in your area.'}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'sell' && (
        <GlassCard>
          <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1 uppercase tracking-wider">
              {t('crop_name')} *
            </label>
            <input
              type="text"
              name="cropName"
              value={form.cropName}
              onChange={handleInputChange}
              className="input-field w-full"
              placeholder="e.g., Basmati Rice, Sugarcane"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1 uppercase tracking-wider">
                {t('quantity')} *
              </label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleInputChange}
                className="input-field w-full"
                placeholder="e.g., 500"
                required
                min="1"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1 uppercase tracking-wider">
                {t('price_per_kg')} *
              </label>
              <input
                type="number"
                name="pricePerKg"
                value={form.pricePerKg}
                onChange={handleInputChange}
                className="input-field w-full"
                placeholder="e.g., 60"
                required
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1 uppercase tracking-wider">
              {t('location')} *
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleInputChange}
              className="input-field w-full"
              placeholder="e.g., Mandya APMC Yard"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1 uppercase tracking-wider">
              {t('description')}
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleInputChange}
              className="input-field w-full"
              placeholder="Provide crop quality details, harvest date..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-emerald w-full flex items-center justify-center gap-2 text-center"
          >
            {submitting ? t('loading') : t('post_crop')}
          </button>
          </form>
        </GlassCard>
      )}

      {activeTab === 'mine' && (
        <div>
          {loading ? (
            <SkeletonListingGrid count={4} />
          ) : myListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myListings.map((item) => (
                <SwipeCard
                  key={item._id}
                  item={item}
                  onDelete={() => handleDeleteListing(item._id)}
                  onEdit={() => toast.success('Edit not implemented yet')}
                >
                  <GlassCard>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="text-white text-xl font-bold">
                        <TranslatedText text={item.cropName} />
                      </h2>
                      <p className="text-slate-400 text-xs mt-0.5">
                        📍 <TranslatedText text={item.location} />
                      </p>
                    </div>
                    <span
                      className={`badge ${
                        item.status === 'available' ? 'badge-available' : 'badge-sold'
                      }`}
                    >
                      {item.status === 'available' ? t('available') : t('sold_out')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3 mb-4">
                    <div>
                      <span className="text-slate-500 text-xs block uppercase tracking-wider text-muted">
                        {t('quantity')}
                      </span>
                      <span className="text-white font-semibold text-sm">{item.quantity} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block uppercase tracking-wider text-muted">
                        {t('price_per_kg')}
                      </span>
                      <span className="text-emerald-400 font-semibold text-sm">₹{item.pricePerKg}/kg</span>
                    </div>
                  </div>

                  {item.status === 'available' ? (
                    <div className="flex gap-2 border-t border-white/5 pt-3">
                      <button
                        onClick={() => handleMarkSoldOut(item._id)}
                        className="btn-ghost flex items-center justify-center gap-1.5 text-xs flex-1"
                        style={{ padding: '8px' }}
                      >
                        <Check size={14} />
                        {t('sold_out')}
                      </button>
                      <button
                        onClick={() => handleDeleteListing(item._id)}
                        className="btn-danger flex items-center justify-center gap-1.5 text-xs"
                        style={{ padding: '8px' }}
                      >
                        <Trash2 size={14} />
                        {t('delete_listing')}
                      </button>
                    </div>
                  ) : (
                    <div className="border-t border-white/5 pt-3 text-center">
                      <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block py-1.5 bg-white/3 rounded-lg">
                        {t('sold_out')}
                      </span>
                    </div>
                  )}
                  </GlassCard>
                </SwipeCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-slate-500 text-sm">
                {t('no_listings_found') || 'You have not listed any crops yet.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
