import React from 'react';
import { Phone, CheckCircle, Trash } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TranslatedText } from '../utils/translate';

const JobCard = ({ job, isOwner, onComplete, onDelete }) => {
  const { t } = useLanguage();

  // Helper to translate workType with a localized key or dynamic fallback
  const getWorkType = () => {
    const key = `jobs.${job.workType?.toLowerCase()}`;
    const trans = t(key);
    return trans !== key ? trans : job.workType;
  };

  return (
    <div className="card card-hover p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          {getWorkType()}
        </span>
        <span className="text-slate-400 text-sm">
          <TranslatedText text={job.district} />
        </span>
      </div>
      
      <div className="mb-2 text-sm text-slate-300 space-y-1">
        <p>
          <strong>{t('jobs.workersNeeded') || 'Workers Needed'}:</strong>{' '}
          <span className="text-white">{job.workersNeeded}</span>
        </p>
        <p>
          <strong>{t('jobs.duration') || 'Duration'}:</strong>{' '}
          <span className="text-white">
            {job.durationDays} {t('jobs.days') || 'Days'}
          </span>
        </p>
        <p>
          <strong>{t('jobs.salary') || 'Salary'}:</strong>{' '}
          <span className="text-emerald-400 font-semibold">₹{job.salaryAmount}</span>{' '}
          <span className="text-slate-500 text-xs">
            ({job.salaryType === 'per_day' ? (t('jobs.perDay') || 'per day') : (t('jobs.contract') || 'Contract')})
          </span>
        </p>
      </div>

      <div className="flex gap-1.5 mb-3 flex-wrap">
        {job.amenities.map((amenity, idx) => (
          <span key={idx} className="text-xs font-medium rounded-full px-2.5 py-0.5 border bg-emerald-500/5 text-emerald-400 border-emerald-500/10">
            <TranslatedText text={amenity} />
          </span>
        ))}
      </div>

      <p className="mb-2 text-xs text-slate-500">
        {t('jobs.postedBy') || 'Posted by'}{' '}
        <span className="text-slate-400">
          <TranslatedText text={job.postedBy?.name || 'Unknown'} />
        </span>
      </p>

      {isOwner ? (
        <div className="flex gap-2">
          <button 
            className="btn-primary flex items-center justify-center gap-2 flex-1" 
            style={{ padding: '8px' }}
            onClick={() => onComplete(job._id)}
          >
            <CheckCircle size={16} /> {t('jobs.markAsDone') || 'Mark as Done'}
          </button>
          <button 
            className="border border-red-500/20 text-red-400 hover:bg-red-500/8 hover:border-red-500/40 rounded-xl px-3 py-2 text-xs transition-all duration-200 flex items-center justify-center gap-2"
            style={{ padding: '8px' }}
            onClick={() => onDelete(job._id)}
          >
            <Trash size={16} /> {t('delete_listing') || 'Delete'}
          </button>
        </div>
      ) : (
        <a 
          href={`tel:${job.postedBy?.phone}`} 
          className="btn-primary flex items-center justify-center gap-2 w-full text-center"
          style={{ display: 'flex', textDecoration: 'none' }}
        >
          <Phone size={18} /> {t('jobs.callToApply') || 'Call to Apply'}
        </a>
      )}
    </div>
  );
};

export default JobCard;
