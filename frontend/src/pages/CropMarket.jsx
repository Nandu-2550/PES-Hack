import React, { useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { Phone, Check, Trash2, ShoppingBasket, Search, X, Plus, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import SyncBadge from '../components/SyncBadge';
import { useCachedFetch } from '../hooks/useCachedFetch';
import { TranslatedText } from '../utils/translate';
import GlassCard from '../components/ui/GlassCard';
import { SkeletonListingGrid } from '../components/ui/SkeletonCard';
import SwipeCard from '../components/ui/SwipeCard';
import ProgressButton from '../components/ui/ProgressButton';

// Crop emoji map for visual flair
const CROP_EMOJI = {
  rice: '🌾', wheat: '🌾', sugarcane: '🎋', tomato: '🍅', potato: '🥔',
  onion: '🧅', corn: '🌽', banana: '🍌', mango: '🥭', cotton: '🌿',
  default: '🌱',
};

const getCropEmoji = (name = '') => {
  const key = name.toLowerCase().split(' ')[0];
  return CROP_EMOJI[key] || CROP_EMOJI.default;
};

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: 'easeOut' } },
};

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
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // searchQuery: pure UI state — client-side filter on cropName only.
  // Does not conflict with existing status filter (activeBrowseListings).
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState({
    cropName: '',
    quantity: '',
    pricePerKg: '',
    location: '',
    description: '',
  });

  // Socket connection — event names and handlers untouched
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
    setSubmitSuccess(false);
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
      setSubmitSuccess(true);
      // Prepend to current browse list silently if it's the same district
      if (res.data.district === user.district) {
        setListings((prev) => [res.data, ...prev]);
      }
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab('browse');
      }, 700);
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

  // activeBrowseListings: existing status filter preserved
  const activeBrowseListings = listings.filter((item) => item.status === 'available');
  
  // searchQuery filter applied on top — pure client-side, no API changes
  const filteredBrowseListings = searchQuery.trim()
    ? activeBrowseListings.filter(item =>
        item.cropName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeBrowseListings;

  return (
    <div className="page-container pb-20">
      
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="page-header"
      >
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ShoppingBasket className="text-emerald-400" size={24} />
            {t('crop_market')}
          </h1>
          <p className="page-subtitle">Live listings · {user?.district}</p>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400/60 text-xs font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </div>
      </motion.div>

      <SyncBadge syncedAt={syncedAt} isStale={isStale} />

      {/* ── Tab Dock ── */}
      <div className="tab-dock">
        <button className={`tab-pill ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>
          {t('market')}
        </button>
        <button className={`tab-pill ${activeTab === 'sell' ? 'active' : ''}`} onClick={() => setActiveTab('sell')}>
          {t('sell_your_crop')}
        </button>
        <button className={`tab-pill ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>
          {t('my_listings') || 'My Listings'}
        </button>
      </div>

      {/* ── BROWSE TAB ── */}
      <AnimatePresence mode="wait">
        {activeTab === 'browse' && (
          <motion.div
            key="browse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            {/* Search bar */}
            <div className="relative mb-4">
              <Search size={15} className="absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search crops, locations…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="nfv-search pl-9 pr-9"
                style={{ marginBottom: 0 }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {browseLoading ? (
              <SkeletonListingGrid count={4} />
            ) : filteredBrowseListings.length > 0 ? (
              <motion.div
                variants={gridVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filteredBrowseListings.map((item) => (
                  <motion.div key={item._id} variants={cardVariants}>
                    <GlassCard>
                      {/* Crop header */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl" aria-hidden="true">{getCropEmoji(item.cropName)}</span>
                          <div>
                            <h2 className="text-white text-base font-bold leading-tight">
                              <TranslatedText text={item.cropName} />
                            </h2>
                            <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                              📍 <TranslatedText text={item.location} />, <TranslatedText text={item.district} />
                            </p>
                          </div>
                        </div>
                        <span className="badge badge-available">{t('available')}</span>
                      </div>

                      {item.description && (
                        <p className="text-slate-400 text-xs mb-3 line-clamp-2 leading-relaxed">
                          <TranslatedText text={item.description} />
                        </p>
                      )}

                      {/* Stats row */}
                      <div className="grid grid-cols-2 gap-3 rounded-xl p-3 mb-3" style={{ background: 'rgba(0,0,0,0.22)' }}>
                        <div>
                          <span className="text-slate-500 text-[10px] block uppercase tracking-wider">{t('quantity')}</span>
                          <span className="text-white font-bold text-sm">{item.quantity} kg</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block uppercase tracking-wider">{t('price_per_kg')}</span>
                          <span className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                            <TrendingUp size={11} />
                            ₹{item.pricePerKg}/kg
                          </span>
                        </div>
                      </div>

                      {/* Seller + CTA */}
                      <div className="border-t border-white/5 pt-3">
                        <p className="text-xs text-slate-500 mb-2">
                          {t('seller_info')}: <span className="text-slate-400"><TranslatedText text={item.sellerName} /></span>
                        </p>
                        <a
                          href={`tel:${item.sellerContact}`}
                          className="btn-emerald flex items-center justify-center gap-2 text-center text-sm w-full"
                          style={{ textDecoration: 'none' }}
                        >
                          <Phone size={15} />
                          {t('call_seller')}
                        </a>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-14">
                <span className="text-4xl mb-3 block">🌱</span>
                <p className="text-slate-500 text-sm">
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : (t('no_listings_found') || 'No crop listings found in your area.')}
                </p>
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-emerald-400 text-xs mt-2 hover:text-emerald-300 transition-colors">
                    Clear search
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── SELL TAB ── */}
        {activeTab === 'sell' && (
          <motion.div
            key="sell"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <GlassCard>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <Plus size={16} className="text-emerald-400" />
                </div>
                <h2 className="text-white font-bold text-base">List Your Crop</h2>
              </div>
              
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="nfv-label">{t('crop_name')} *</label>
                  <input
                    type="text" name="cropName" value={form.cropName} onChange={handleInputChange}
                    className="input-field w-full mb-0" placeholder="e.g., Basmati Rice, Sugarcane" required
                    style={{ marginBottom: 0 }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="nfv-label">{t('quantity')} *</label>
                    <input
                      type="number" name="quantity" value={form.quantity} onChange={handleInputChange}
                      className="input-field w-full mb-0" placeholder="500" required min="1"
                      style={{ marginBottom: 0 }}
                    />
                  </div>
                  <div>
                    <label className="nfv-label">{t('price_per_kg')} *</label>
                    <input
                      type="number" name="pricePerKg" value={form.pricePerKg} onChange={handleInputChange}
                      className="input-field w-full mb-0" placeholder="₹ 60" required min="1"
                      style={{ marginBottom: 0 }}
                    />
                  </div>
                </div>

                <div>
                  <label className="nfv-label">{t('location')} *</label>
                  <input
                    type="text" name="location" value={form.location} onChange={handleInputChange}
                    className="input-field w-full mb-0" placeholder="e.g., Mandya APMC Yard" required
                    style={{ marginBottom: 0 }}
                  />
                </div>

                <div>
                  <label className="nfv-label">{t('description')}</label>
                  <textarea
                    name="description" value={form.description} onChange={handleInputChange}
                    className="input-field w-full mb-0 resize-none"
                    placeholder="Quality details, harvest date…"
                    rows={3}
                    style={{ marginBottom: 0, background: '#1A2228', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e2e8f0' }}
                  />
                </div>

                <ProgressButton
                  isLoading={submitting}
                  isSuccess={submitSuccess}
                  className="w-full py-3 text-sm mt-1"
                >
                  {t('post_crop')}
                </ProgressButton>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {/* ── MY LISTINGS TAB ── */}
        {activeTab === 'mine' && (
          <motion.div
            key="mine"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
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
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl" aria-hidden="true">{getCropEmoji(item.cropName)}</span>
                          <div>
                            <h2 className="text-white text-base font-bold leading-tight">
                              <TranslatedText text={item.cropName} />
                            </h2>
                            <p className="text-slate-500 text-xs mt-0.5">📍 <TranslatedText text={item.location} /></p>
                          </div>
                        </div>
                        <span className={`badge ${item.status === 'available' ? 'badge-available' : 'badge-sold'}`}>
                          {item.status === 'available' ? t('available') : t('sold_out')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 rounded-xl p-3 mb-3" style={{ background: 'rgba(0,0,0,0.22)' }}>
                        <div>
                          <span className="text-slate-500 text-[10px] block uppercase tracking-wider">{t('quantity')}</span>
                          <span className="text-white font-semibold text-sm">{item.quantity} kg</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block uppercase tracking-wider">{t('price_per_kg')}</span>
                          <span className="text-emerald-400 font-semibold text-sm">₹{item.pricePerKg}/kg</span>
                        </div>
                      </div>

                      {item.status === 'available' ? (
                        <div className="flex gap-2 border-t border-white/5 pt-3">
                          <button
                            onClick={() => handleMarkSoldOut(item._id)}
                            className="btn-ghost flex items-center justify-center gap-1.5 text-xs flex-1 min-h-[44px]"
                          >
                            <Check size={13} />
                            {t('sold_out')}
                          </button>
                          <button
                            onClick={() => handleDeleteListing(item._id)}
                            className="btn-danger flex items-center justify-center gap-1.5 text-xs min-h-[44px]"
                            style={{ padding: '8px 14px' }}
                          >
                            <Trash2 size={13} />
                            {t('delete_listing')}
                          </button>
                        </div>
                      ) : (
                        <div className="border-t border-white/5 pt-3 text-center">
                          <span className="text-xs font-semibold uppercase tracking-wider block py-2 rounded-xl" style={{ color: 'rgba(255,255,255,0.40)', background: 'rgba(255,255,255,0.05)' }}>
                            {t('sold_out')}
                          </span>
                        </div>
                      )}
                    </GlassCard>
                  </SwipeCard>
                ))}
              </div>
            ) : (
              <div className="text-center py-14">
                <span className="text-4xl mb-3 block">📦</span>
                <p className="text-slate-500 text-sm">{t('no_listings_found') || 'You have not listed any crops yet.'}</p>
                <button onClick={() => setActiveTab('sell')} className="btn-emerald mt-4 text-sm py-2 px-5">
                  List Your First Crop
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


