import React from 'react';
import { Phone, CheckCircle, Trash } from 'lucide-react';

const JobCard = ({ job, isOwner, onComplete, onDelete }) => {
  return (
    <div className="surface-card">
      <div className="flex justify-between items-center mb-2">
        <span style={{ 
          backgroundColor: 'var(--primary-color)', 
          padding: '4px 8px', 
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {job.workType}
        </span>
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          {job.district}
        </span>
      </div>
      
      <div className="mb-2" style={{ fontSize: '14px' }}>
        <p><strong>Workers Needed:</strong> {job.workersNeeded}</p>
        <p><strong>Duration:</strong> {job.durationDays} Days</p>
        <p><strong>Salary:</strong> ₹{job.salaryAmount} ({job.salaryType === 'per_day' ? 'Per Day' : 'Contract'})</p>
      </div>

      <div className="flex gap-2 mb-3 flex-wrap">
        {job.amenities.map((amenity, idx) => (
          <span key={idx} style={{
            border: '1px solid var(--accent-color)',
            color: 'var(--accent-color)',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px'
          }}>
            {amenity}
          </span>
        ))}
      </div>

      <p className="mb-2" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        Posted by {job.postedBy?.name || 'Unknown'}
      </p>

      {isOwner ? (
        <div className="flex gap-2">
          <button 
            className="btn-primary flex items-center justify-center gap-2" 
            style={{ padding: '8px' }}
            onClick={() => onComplete(job._id)}
          >
            <CheckCircle size={16} /> Mark as Done
          </button>
          <button 
            className="btn-secondary flex items-center justify-center gap-2"
            style={{ padding: '8px', color: '#ff4d4d', borderColor: '#ff4d4d' }}
            onClick={() => onDelete(job._id)}
          >
            <Trash size={16} /> Delete
          </button>
        </div>
      ) : (
        <a 
          href={`tel:${job.postedBy?.phone}`} 
          className="btn-primary flex items-center justify-center gap-2"
          style={{ display: 'flex', textDecoration: 'none' }}
        >
          <Phone size={18} /> Call to Apply
        </a>
      )}
    </div>
  );
};

export default JobCard;
