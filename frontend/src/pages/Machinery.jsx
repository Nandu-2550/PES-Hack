import React, { useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Tractor, Plus, ChevronRight } from 'lucide-react';
import client from '../api/client';
import { AuthContext } from '../context/AuthContext';
import MachineryCard from '../components/MachineryCard';
import SyncBadge from '../components/SyncBadge';
import { useCachedFetch } from '../hooks/useCachedFetch';
import { useLanguage } from '../context/LanguageContext';
import ScopeSelector from '../components/ui/ScopeSelector';
import GlassCard from '../components/ui/GlassCard';
import ProgressButton from '../components/ui/ProgressButton';

// Category → emoji map for visual richness
const CATEGORY_EMOJI = {
  'Tractor': '🚜', 'Harvester': '🌾', 'Sprayer': '💦', 'Rotavator': '⚙️',
  'Power Tiller': '🔧', 'Cultivator': '🌱', 'Seed Drill': '🌿', 'Thresher': '🌾',
  'Baler': '📦', 'Chaff Cutter': '✂️', 'Milking Machine': '🐄', 'Brush Cutter': '🪚',
  'Reaper': '🌾', 'Disk Harrow': '⚙️', 'Planter': '🌱', 'JCB / Backhoe Loader': '🏗️',
  'Excavator': '🏗️', 'Bulldozer': '🏗️', 'Road Roller': '🛣️', 'Concrete Mixer': '🔄',
  'Crane': '🏗️', 'Dumper / Tipper': '🚛', 'Borewell Drilling Rig': '⛏️',
  'Grader': '🛤️', 'Paver': '🛤️', 'Scraper': '🔧', 'Pile Driver': '🔨',
  'Concrete Pump': '🔧', 'Rice Mill Machinery': '🌾', 'Flour Mill / Atta Chakki': '⚙️',
  'Sugarcane Crusher': '🎋', 'Generator': '⚡', 'Water Pump': '💧',
  'Forklift': '🏗️', 'Chain Saw': '🪚', 'Air Compressor': '💨',
  'Welding Machine': '🔥', 'Lathe Machine': '⚙️', 'Conveyor Belt': '📦',
};

const tabVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const Machinery = () => {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const [scope, setScope] = useState('district');
  const district = user?.district || localStorage.getItem('userDistrict') || '';
  const state = user?.state || localStorage.getItem('userState') || 'Karnataka';

  const cacheKey = `equipment_${scope}_${district}_${state}`;
  const queryParams = new URLSearchParams({ scope, district, state }).toString();

  const { data: equipmentListRaw, setData: setEquipmentList, syncedAt, isStale } = useCachedFetch(
    cacheKey,
    user ? `/api/equipment?${queryParams}` : null
  );
  const equipmentList = equipmentListRaw || [];
  const [myEquipment, setMyEquipment] = useState([]);
  const [view, setView] = useState('browse'); // 'browse', 'my', 'add'
  const [categoryFilter, setCategoryFilter] = useState('');

  const [formData, setFormData] = useState({
    category: 'Tractor',
    brand: '',
    description: '',
    pricePerDay: 1000,
    contactPhone: user?.phone || ''
  });

  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  const categories = [
    // Agricultural Machinery
    "Tractor", "Harvester", "Sprayer", "Rotavator", "Power Tiller", "Cultivator",
    "Seed Drill", "Thresher", "Baler", "Chaff Cutter", "Milking Machine",
    "Brush Cutter", "Reaper", "Disk Harrow", "Planter",
    // Construction Machinery
    "JCB / Backhoe Loader", "Excavator", "Bulldozer", "Road Roller", "Concrete Mixer",
    "Crane", "Dumper / Tipper", "Borewell Drilling Rig", "Grader", "Paver",
    "Scraper", "Pile Driver", "Concrete Pump",
    // Processing & Industrial Machinery
    "Rice Mill Machinery", "Flour Mill / Atta Chakki", "Sugarcane Crusher", "Generator",
    "Water Pump", "Forklift", "Chain Saw", "Air Compressor", "Welding Machine",
    "Lathe Machine", "Conveyor Belt"
  ];

  useEffect(() => {
    if (view === 'my') {
      fetchMyEquipment();
    }
  }, [view]);

  const fetchMyEquipment = async () => {
    try {
      const res = await client.get('/api/equipment/mine');
      setMyEquipment(res.data);
    } catch (err) {
      toast.error(t('error'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAddSubmitting(true);
    setAddSuccess(false);
    try {
      await client.post('/api/equipment', formData);
      toast.success(t('posted_success') || "Equipment listed successfully!");
      setAddSuccess(true);
      setTimeout(() => {
        setAddSuccess(false);
        setView('my');
      }, 700);
    } catch (err) {
      toast.error(t('error'));
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await client.patch(`/api/equipment/${id}/toggle`);
      toast.success("Availability updated");
      fetchMyEquipment();
      // Re-fetch global equipment silently
      client.get(`/api/equipment?${queryParams}`).then(res => setEquipmentList(res.data)).catch(() => {});
    } catch (err) {
      toast.error(t('error'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirm_delete') || "Delete this listing?")) return;
    try {
      await client.delete(`/api/equipment/${id}`);
      toast.success(t('deleted_success') || "Listing deleted");
      fetchMyEquipment();
      client.get('/api/equipment').then(res => setEquipmentList(res.data)).catch(() => {});
    } catch (err) {
      toast.error(t('error'));
    }
  };

  const filteredList = categoryFilter ? equipmentList.filter(e => e.category === categoryFilter) : equipmentList;

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
            <Tractor className="text-emerald-400" size={22} />
            {t('rent_machinery')}
          </h1>
          <p className="page-subtitle">Equipment rental marketplace</p>
        </div>
        <button
          onClick={() => setView('add')}
          className="flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/25 text-emerald-400 text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-200 min-h-[44px]"
        >
          <Plus size={14} />
          List Machine
        </button>
      </motion.div>

      <SyncBadge syncedAt={syncedAt} isStale={isStale} />

      {/* ── Tab Dock ── */}
      <div className="tab-dock">
        <button className={`tab-pill ${view === 'browse' ? 'active' : ''}`} onClick={() => setView('browse')}>
          {t('market') || 'Browse'}
        </button>
        <button className={`tab-pill ${view === 'my' ? 'active' : ''}`} onClick={() => setView('my')}>
          {t('my_listings') || 'My Machinery'}
        </button>
        <button className={`tab-pill ${view === 'add' ? 'active' : ''}`} onClick={() => setView('add')}>
          + {t('rent_machinery') || 'List Machine'}
        </button>
      </div>

      <AnimatePresence mode="wait">

        {/* ── BROWSE ── */}
        {view === 'browse' && (
          <motion.div key="browse" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
            <ScopeSelector activeScope={scope} onScopeChange={setScope} />
            <p className="text-center text-white/35 text-xs mb-4">
              {scope === 'district' && `Showing equipment in ${district}`}
              {scope === 'state'    && `Showing equipment across ${state}`}
              {scope === 'india'    && 'Showing all equipment across India'}
            </p>

            {/* Category filter — horizontal scroll pill strip */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-none">
              <button
                className={`text-xs font-semibold px-4 py-2 rounded-full whitespace-nowrap transition-all min-h-[36px] flex-shrink-0 ${
                  categoryFilter === ''
                    ? 'bg-emerald-500 text-black shadow-glow-sm'
                    : ' text-white/60 border border-white/10 hover: hover:text-white'
                }`}
                onClick={() => setCategoryFilter('')}
              >
                {t('all') || 'All'} ✨
              </button>
              {categories.map(c => (
                <button
                  key={c}
                  className={`text-xs font-semibold px-4 py-2 rounded-full whitespace-nowrap transition-all min-h-[36px] flex-shrink-0 flex items-center gap-1.5 ${
                    categoryFilter === c
                      ? 'bg-emerald-500 text-black shadow-glow-sm'
                      : ' text-white/60 border border-white/10 hover: hover:text-white'
                  }`}
                  onClick={() => setCategoryFilter(c)}
                >
                  <span aria-hidden="true">{CATEGORY_EMOJI[c] || '⚙️'}</span>
                  {c}
                </button>
              ))}
            </div>

            {filteredList.length === 0 && (
              <div className="text-center py-12">
                <span className="text-4xl mb-3 block">🔍</span>
                <p className="text-slate-500 text-sm">{t('no_listings_found') || 'No equipment found.'}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredList.map(item => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28 }}
                >
                  <MachineryCard equipment={item} isOwner={false} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── MY EQUIPMENT ── */}
        {view === 'my' && (
          <motion.div key="my" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-3">
            {myEquipment.length === 0 && (
              <div className="text-center py-12">
                <span className="text-4xl mb-3 block">🚜</span>
                <p className="text-slate-500 text-sm">{t('no_listings_found') || "You haven't listed any equipment."}</p>
                <button onClick={() => setView('add')} className="btn-emerald mt-4 text-sm py-2 px-5">
                  List Your First Machine
                </button>
              </div>
            )}
            {myEquipment.map(item => (
              <div key={item._id} style={{ opacity: item.available ? 1 : 0.6 }}>
                <MachineryCard
                  equipment={item}
                  isOwner={true}
                  onToggleAvailable={handleToggle}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </motion.div>
        )}

        {/* ── ADD EQUIPMENT FORM ── */}
        {view === 'add' && (
          <motion.div key="add" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
            <GlassCard>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <Plus size={16} className="text-emerald-400" />
                </div>
                <h2 className="text-white text-base font-bold">{t('rent_machinery') || 'List Equipment'}</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category picker */}
                <div>
                  <label className="nfv-label">{t('category') || 'Category'}</label>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none mb-2">
                    {['Tractor', 'Harvester', 'Sprayer', 'Rotavator', 'Power Tiller', 'Generator', 'Water Pump'].map(c => (
                      <button
                        key={c} type="button"
                        onClick={() => setFormData({ ...formData, category: c })}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all min-h-[36px] ${
                          formData.category === c
                            ? 'bg-emerald-500 text-black shadow-glow-sm'
                            : ' text-white/60 border border-white/10 hover:border-white/15'
                        }`}
                      >
                        <span aria-hidden="true">{CATEGORY_EMOJI[c] || '⚙️'}</span>
                        {c}
                      </button>
                    ))}
                  </div>
                  {/* Full select for all categories */}
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field mb-0 w-full"
                    style={{ marginBottom: 0 }}
                  >
                    {categories.map(c => <option key={c} value={c} className="">{CATEGORY_EMOJI[c] || '⚙️'} {c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="nfv-label">{t('brand') || 'Brand (Optional)'}</label>
                  <input
                    type="text" placeholder="e.g. Mahindra, John Deere"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="input-field mb-0 w-full"
                    style={{ marginBottom: 0 }}
                  />
                </div>

                <div>
                  <label className="nfv-label">{t('description') || 'Description'}</label>
                  <input
                    type="text" placeholder="Year, condition, attachments..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field mb-0 w-full"
                    style={{ marginBottom: 0 }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="nfv-label">{t('price_per_day') || 'Price Per Day (₹)'}</label>
                    <input
                      type="number" min="1" required
                      value={formData.pricePerDay}
                      onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                      className="input-field mb-0 w-full"
                      style={{ marginBottom: 0 }}
                    />
                  </div>
                  <div>
                    <label className="nfv-label">{t('contact') || 'Contact Phone'}</label>
                    <input
                      type="tel" required pattern="[0-9]{10}"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="input-field mb-0 w-full"
                      style={{ marginBottom: 0 }}
                    />
                  </div>
                </div>

                <ProgressButton
                  isLoading={addSubmitting}
                  isSuccess={addSuccess}
                  className="w-full py-3 text-sm"
                >
                  {t('submit') || 'List Equipment'}
                </ProgressButton>
              </form>
            </GlassCard>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default Machinery;




