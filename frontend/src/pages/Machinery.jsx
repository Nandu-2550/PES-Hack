import React, { useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import client from '../api/client';
import { AuthContext } from '../context/AuthContext';
import MachineryCard from '../components/MachineryCard';
import SyncBadge from '../components/SyncBadge';
import { useCachedFetch } from '../hooks/useCachedFetch';

const Machinery = () => {
  const { user } = useContext(AuthContext);
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
    contactPhone: user.phone
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
      toast.error("Failed to load your machinery");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await client.post('/api/equipment', formData);
      toast.success("Equipment listed successfully!");
      setView('my');
    } catch (err) {
      toast.error("Failed to list equipment");
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
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await client.delete(`/api/equipment/${id}`);
      toast.success("Listing deleted");
      fetchMyEquipment();
      client.get('/api/equipment').then(res => setEquipmentList(res.data)).catch(()=>{});
    } catch (err) {
      toast.error("Failed to delete listing");
    }
  };

  const filteredList = categoryFilter ? equipmentList.filter(e => e.category === categoryFilter) : equipmentList;

  return (
    <div className="page-container pb-20">
      <h1 className="text-white text-3xl font-extrabold mb-1">Rent Machinery</h1>
      <SyncBadge syncedAt={syncedAt} isStale={isStale} />

      <div className="flex bg-[#13191C] border border-white/5 rounded-xl p-1 gap-1 mb-5">
        <button 
          className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-all duration-150 ${view === 'browse' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`} 
          onClick={() => setView('browse')}
        >
          Browse
        </button>
        <button 
          className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-all duration-150 ${view === 'my' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`} 
          onClick={() => setView('my')}
        >
          My Machinery
        </button>
        <button 
          className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-all duration-150 ${view === 'add' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`} 
          onClick={() => setView('add')}
        >
          + Add
        </button>
      </div>

      {view === 'browse' && (
        <>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
            <button 
              className={`text-xs font-semibold px-4 py-2 rounded-full transition-all ${categoryFilter === '' ? "bg-emerald-500 text-black shadow-glow-sm" : "bg-[#13191C] text-slate-300 border border-white/5 hover:bg-[#1A2228] hover:text-white"}`}
              onClick={() => setCategoryFilter('')}
            >
              All
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

          {filteredList.length === 0 && <p className="text-slate-500 text-center py-8 text-sm">No equipment found.</p>}
          <div className="space-y-3">
            {filteredList.map(item => (
              <MachineryCard key={item._id} equipment={item} isOwner={false} />
            ))}
          </div>
        </>
      )}

      {view === 'my' && (
        <div className="space-y-3">
          {myEquipment.length === 0 && <p className="text-slate-500 text-center py-8 text-sm">You haven't listed any equipment.</p>}
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
        <div className="card p-6 shadow-glow-md">
          <h2 className="text-white text-xl font-bold mb-4">List Equipment</h2>
          <form onSubmit={handleSubmit}>
            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Category</label>
            <select 
              value={formData.category} 
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="input-field mb-4"
            >
              {categories.map(c => <option key={c} value={c} className="bg-[#13191C]">{c}</option>)}
            </select>

            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Brand (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Mahindra, John Deere"
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value})}
              className="input-field mb-4"
            />

            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Description</label>
            <input 
              type="text" 
              placeholder="Year, condition, attachments..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="input-field mb-4"
            />

            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Price Per Day (₹)</label>
            <input 
              type="number" min="1" required
              value={formData.pricePerDay}
              onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})}
              className="input-field mb-4"
            />

            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Contact Phone</label>
            <input 
              type="tel" required pattern="[0-9]{10}"
              value={formData.contactPhone}
              onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
              className="input-field mb-5"
            />

            <button type="submit" className="btn-primary w-full py-3.5 mt-2">List Equipment</button>
          </form>
        </div>
      )}

    </div>
  );
};

export default Machinery;
