import React from 'react';
import { Phone, Check, X } from 'lucide-react';

const MachineryCard = ({ equipment, isOwner, onToggleAvailable, onDelete }) => {
  return (
    <div className="card card-hover p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-semibold text-base leading-snug" style={{ margin: 0 }}>{equipment.category}</h3>
        <span className={equipment.available ? 'badge-available' : 'badge-sold'}>
          {equipment.available ? 'Available' : 'Unavailable'}
        </span>
      </div>
      
      {equipment.brand && <p className="mb-1 text-sm text-slate-300"><strong>Brand:</strong> {equipment.brand}</p>}
      <p className="mb-2 text-sm text-slate-400">
        {equipment.description || "No description provided."}
      </p>

      <div className="mb-3">
        <span className="text-emerald-400 font-bold text-lg">
          ₹{equipment.pricePerDay}
        </span>
        <span className="text-slate-500 text-xs"> / day</span>
      </div>

      <p className="mb-2 text-xs text-slate-500">
        Owner: {equipment.owner?.name || 'Unknown'} • {equipment.district}
      </p>

      {isOwner ? (
        <div className="flex gap-2">
          <button 
            className="btn-outline flex items-center justify-center gap-2 flex-1" 
            style={{ padding: '8px' }}
            onClick={() => onToggleAvailable(equipment._id)}
          >
            {equipment.available ? <X size={16} /> : <Check size={16} />}
            {equipment.available ? 'Mark Unavailable' : 'Mark Available'}
          </button>
          <button 
            className="border border-red-500/20 text-red-400 hover:bg-red-500/8 hover:border-red-500/40 rounded-xl px-3 py-2 text-xs transition-all duration-200 flex items-center justify-center"
            style={{ padding: '8px', width: 'auto' }}
            onClick={() => onDelete(equipment._id)}
          >
            Delete
          </button>
        </div>
      ) : (
        <a 
          href={`tel:${equipment.contactPhone}`} 
          className="btn-primary flex items-center justify-center gap-2 w-full text-center"
          style={{ display: 'flex', textDecoration: 'none' }}
        >
          <Phone size={18} /> Call Owner
        </a>
      )}
    </div>
  );
};

export default MachineryCard;
