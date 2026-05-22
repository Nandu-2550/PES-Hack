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
    <div className="page-container">
      <h1 className="mb-1">Rent Machinery</h1>
      <SyncBadge syncedAt={syncedAt} isStale={isStale} />

      <div className="flex gap-2 mb-3">
        <button 
          className={view === 'browse' ? 'btn-primary' : 'btn-secondary'} 
          style={{ padding: '8px' }}
          onClick={() => setView('browse')}
        >
          Browse
        </button>
        <button 
          className={view === 'my' ? 'btn-primary' : 'btn-secondary'} 
          style={{ padding: '8px' }}
          onClick={() => setView('my')}
        >
          My Machinery
        </button>
        <button 
          className={view === 'add' ? 'btn-primary' : 'btn-secondary'} 
          style={{ padding: '8px' }}
          onClick={() => setView('add')}
        >
          + Add
        </button>
      </div>

      {view === 'browse' && (
        <>
          <div className="flex gap-2 mb-3" style={{ overflowX: 'auto', paddingBottom: '8px' }}>
            <button 
              className={categoryFilter === '' ? "btn-primary" : "btn-secondary"}
              style={{ width: 'auto', padding: '4px 12px', whiteSpace: 'nowrap' }}
              onClick={() => setCategoryFilter('')}
            >
              All
            </button>
            {categories.map(c => (
              <button 
                key={c}
                className={categoryFilter === c ? "btn-primary" : "btn-secondary"}
                style={{ width: 'auto', padding: '4px 12px', whiteSpace: 'nowrap' }}
                onClick={() => setCategoryFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {filteredList.length === 0 && <p className="text-center">No equipment found.</p>}
          {filteredList.map(item => (
            <MachineryCard key={item._id} equipment={item} isOwner={false} />
          ))}
        </>
      )}

      {view === 'my' && (
        <>
          {myEquipment.length === 0 && <p className="text-center">You haven't listed any equipment.</p>}
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
        </>
      )}

      {view === 'add' && (
        <div className="surface-card">
          <h2 className="mb-2">List Equipment</h2>
          <form onSubmit={handleSubmit}>
            <label className="mb-1 block">Category</label>
            <select 
              value={formData.category} 
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <label className="mb-1 block">Brand (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Mahindra, John Deere"
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value})}
            />

            <label className="mb-1 block">Description</label>
            <input 
              type="text" 
              placeholder="Year, condition, attachments..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />

            <label className="mb-1 block">Price Per Day (₹)</label>
            <input 
              type="number" min="1" required
              value={formData.pricePerDay}
              onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})}
            />

            <label className="mb-1 block">Contact Phone</label>
            <input 
              type="tel" required pattern="[0-9]{10}"
              value={formData.contactPhone}
              onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
            />

            <button type="submit" className="btn-primary">List Equipment</button>
          </form>
        </div>
      )}

    </div>
  );
};

export default Machinery;
