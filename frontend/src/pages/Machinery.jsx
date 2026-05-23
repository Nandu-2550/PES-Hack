import React, { useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import client from '../api/client';
import { AuthContext } from '../context/AuthContext';
import MachineryCard from '../components/MachineryCard';
import SyncBadge from '../components/SyncBadge';
import { useCachedFetch } from '../hooks/useCachedFetch';
import { useLanguage } from '../context/LanguageContext';

const Machinery = () => {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const { data: equipmentListRaw, setData: setEquipmentList, syncedAt, isStale } = useCachedFetch(
    `equipment_${user?.district}`,
    user ? `/api/equipment` : null
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
    try {
      await client.post('/api/equipment', formData);
      toast.success(t('posted_success') || "Equipment listed successfully!");
      setView('my');
    } catch (err) {
      toast.error(t('error'));
    }
  };

  const handleToggle = async (id) => {
    try {
      await client.patch(`/api/equipment/${id}/toggle`);
      toast.success("Availability updated");
      fetchMyEquipment();
      // Re-fetch global equipment silently
      client.get('/api/equipment').then(res => setEquipmentList(res.data)).catch(()=>{});
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
      client.get('/api/equipment').then(res => setEquipmentList(res.data)).catch(()=>{});
    } catch (err) {
      toast.error(t('error'));
    }
  };

  const filteredList = categoryFilter ? equipmentList.filter(e => e.category === categoryFilter) : equipmentList;

  return (
    <div className="page-container pb-20">
      <h1 className="text-white text-3xl font-extrabold mb-1">{t('rent_machinery')}</h1>
      <SyncBadge syncedAt={syncedAt} isStale={isStale} />

      <div className="tab-dock">
        <button 
          className={`tab-pill ${view === 'browse' ? 'active' : ''}`} 
          onClick={() => setView('browse')}
        >
          {t('market') || 'Browse'}
        </button>
        <button 
          className={`tab-pill ${view === 'my' ? 'active' : ''}`} 
          onClick={() => setView('my')}
        >
          {t('my_listings') || 'My Machinery'}
        </button>
        <button 
          className={`tab-pill ${view === 'add' ? 'active' : ''}`} 
          onClick={() => setView('add')}
        >
          + {t('rent_machinery') || 'List Machine'}
        </button>
      </div>

      {view === 'browse' && (
        <>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
            <button 
              className={`text-xs font-semibold px-4 py-2 rounded-full transition-all ${categoryFilter === '' ? "bg-emerald-500 text-black shadow-glow-sm" : "bg-[#13191C] text-slate-300 border border-white/5 hover:bg-[#1A2228] hover:text-white"}`}
              onClick={() => setCategoryFilter('')}
            >
              {t('all') || 'All'}
            </button>
            {categories.map(c => (
              <button 
                key={c}
                className={`text-xs font-semibold px-4 py-2 rounded-full transition-all ${categoryFilter === c ? "bg-emerald-500 text-black shadow-glow-sm" : "bg-[#13191C] text-slate-300 border border-white/5 hover:bg-[#1A2228] hover:text-white"}`}
                style={{ whiteSpace: 'nowrap' }}
                onClick={() => setCategoryFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {filteredList.length === 0 && <p className="text-slate-500 text-center py-8 text-sm">{t('no_listings_found') || 'No equipment found.'}</p>}
          <div className="space-y-3">
            {filteredList.map(item => (
              <MachineryCard key={item._id} equipment={item} isOwner={false} />
            ))}
          </div>
        </>
      )}

      {view === 'my' && (
        <div className="space-y-3">
          {myEquipment.length === 0 && <p className="text-slate-500 text-center py-8 text-sm">{t('no_listings_found') || "You haven't listed any equipment."}</p>}
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
        </div>
      )}

      {view === 'add' && (
        <div className="premium-card">
          <h2 className="text-white text-xl font-bold mb-4">{t('rent_machinery') || 'List Equipment'}</h2>
          <form onSubmit={handleSubmit}>
            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5 block">{t('category') || 'Category'}</label>
            <select 
              value={formData.category} 
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="input-field mb-4 w-full"
            >
              {categories.map(c => <option key={c} value={c} className="bg-[#13191C]">{c}</option>)}
            </select>

            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5 block">{t('brand') || 'Brand (Optional)'}</label>
            <input 
              type="text" 
              placeholder="e.g. Mahindra, John Deere"
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value})}
              className="input-field mb-4 w-full"
            />

            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5 block">{t('description') || 'Description'}</label>
            <input 
              type="text" 
              placeholder="Year, condition, attachments..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="input-field mb-4 w-full"
            />

            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5 block">{t('price_per_day') || 'Price Per Day (₹)'}</label>
            <input 
              type="number" min="1" required
              value={formData.pricePerDay}
              onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})}
              className="input-field mb-4 w-full"
            />

            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5 block">{t('contact') || 'Contact Phone'}</label>
            <input 
              type="tel" required pattern="[0-9]{10}"
              value={formData.contactPhone}
              onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
              className="input-field mb-5 w-full"
            />

            <button type="submit" className="btn-emerald w-full">{t('submit') || 'List Equipment'}</button>
          </form>
        </div>
      )}

    </div>
  );
};

export default Machinery;
