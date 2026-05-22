import React from 'react';
import { Phone, Check, X } from 'lucide-react';

const MachineryCard = ({ equipment, isOwner, onToggleAvailable, onDelete }) => {
  return (
    <div className="surface-card">
      <div className="flex justify-between items-center mb-2">
        <h3 style={{ margin: 0 }}>{equipment.category}</h3>
        <span style={{ 
          backgroundColor: equipment.available ? 'var(--primary-color)' : '#444', 
          padding: '4px 8px', 
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          {equipment.available ? 'Available' : 'Unavailable'}
        </span>
      </div>
      
      {equipment.brand && <p className="mb-1" style={{ fontSize: '14px' }}><strong>Brand:</strong> {equipment.brand}</p>}
      <p className="mb-2" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
        {equipment.description || "No description provided."}
      </p>

      <div className="mb-3">
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-highlight)' }}>
          ₹{equipment.pricePerDay}
        </span>
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}> / day</span>
      </div>

      <p className="mb-2" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        Owner: {equipment.owner?.name || 'Unknown'} • {equipment.district}
      </p>

      {isOwner ? (
        <div className="flex gap-2">
          <button 
            className="btn-secondary flex items-center justify-center gap-2" 
            style={{ padding: '8px' }}
            onClick={() => onToggleAvailable(equipment._id)}
          >
            {equipment.available ? <X size={16} /> : <Check size={16} />}
            {equipment.available ? 'Mark Unavailable' : 'Mark Available'}
          </button>
          <button 
            className="btn-secondary flex items-center justify-center"
            style={{ padding: '8px', color: '#ff4d4d', borderColor: '#ff4d4d', width: 'auto', flex: 1 }}
            onClick={() => onDelete(equipment._id)}
          >
            Delete
          </button>
        </div>
      ) : (
        <a 
          href={`tel:${equipment.contactPhone}`} 
          className="btn-primary flex items-center justify-center gap-2"
          style={{ display: 'flex', textDecoration: 'none' }}
        >
          <Phone size={18} /> Call Owner
        </a>
      )}
    </div>
  );
};

export default MachineryCard;
