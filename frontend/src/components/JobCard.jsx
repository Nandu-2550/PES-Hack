import React from 'react';
import { Phone, CheckCircle, Trash } from 'lucide-react';

const JobCard = ({ job, isOwner, onComplete, onDelete }) => {
  return (
    <div className="card card-hover p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          {job.workType}
        </span>
        <span className="text-slate-400 text-sm">
          {job.district}
        </span>
      </div>
      
      <div className="mb-2 text-sm text-slate-300 space-y-1">
        <p><strong>Workers Needed:</strong> <span className="text-white">{job.workersNeeded}</span></p>
        <p><strong>Duration:</strong> <span className="text-white">{job.durationDays} Days</span></p>
        <p><strong>Salary:</strong> <span className="text-emerald-400 font-semibold">₹{job.salaryAmount}</span> <span className="text-slate-500 text-xs">({job.salaryType === 'per_day' ? 'Per Day' : 'Contract'})</span></p>
      </div>

      <div className="flex gap-1.5 mb-3 flex-wrap">
        {job.amenities.map((amenity, idx) => (
          <span key={idx} className="text-xs font-medium rounded-full px-2.5 py-0.5 border bg-emerald-500/5 text-emerald-400 border-emerald-500/10">
            {amenity}
          </span>
        ))}
      </div>

      <p className="mb-2 text-xs text-slate-500">
        Posted by {job.postedBy?.name || 'Unknown'}
      </p>

      {isOwner ? (
        <div className="flex gap-2">
          <button 
            className="btn-primary flex items-center justify-center gap-2 flex-1" 
            style={{ padding: '8px' }}
            onClick={() => onComplete(job._id)}
          >
            <CheckCircle size={16} /> Mark as Done
          </button>
          <button 
            className="border border-red-500/20 text-red-400 hover:bg-red-500/8 hover:border-red-500/40 rounded-xl px-3 py-2 text-xs transition-all duration-200 flex items-center justify-center gap-2"
            style={{ padding: '8px' }}
            onClick={() => onDelete(job._id)}
          >
            <Trash size={16} /> Delete
          </button>
        </div>
      ) : (
        <a 
          href={`tel:${job.postedBy?.phone}`} 
          className="btn-primary flex items-center justify-center gap-2 w-full text-center"
          style={{ display: 'flex', textDecoration: 'none' }}
        >
          <Phone size={18} /> Call to Apply
        </a>
      )}
    </div>
  );
};

export default JobCard;
