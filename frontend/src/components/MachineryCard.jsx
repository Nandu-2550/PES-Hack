import React from 'react';
import { Phone, Check, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TranslatedText } from '../utils/translate';

const MachineryCard = ({ equipment, isOwner, onToggleAvailable, onDelete }) => {
  const { t } = useLanguage();

  const getCategoryTranslation = () => {
    const key = `machinery.${equipment.category?.toLowerCase()}`;
    const trans = t(key);
    return trans !== key ? trans : equipment.category;
  };

  return (
    <div className="premium-card">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-semibold text-base leading-snug" style={{ margin: 0 }}>
          {getCategoryTranslation()}
        </h3>
        <span className={`badge ${equipment.available ? 'badge-available' : 'badge-sold'}`}>
          {equipment.available ? t('available') : t('unavailable')}
        </span>
      </div>
      
      {equipment.brand && (
        <p className="mb-1 text-sm text-slate-300">
          <strong>{t('brand') || 'Brand'}:</strong> <TranslatedText text={equipment.brand} />
        </p>
      )}
      <p className="mb-2 text-sm text-slate-400">
        {equipment.description ? (
          <TranslatedText text={equipment.description} />
        ) : (
          t('no_description') || "No description provided."
        )}
      </p>

      <div className="mb-3">
        <span className="text-emerald-400 font-bold text-lg">
          ₹{equipment.pricePerDay}
        </span>
        <span className="text-slate-500 text-xs"> / {t('jobs.perDay') || 'day'}</span>
      </div>

      <p className="mb-2 text-xs text-slate-500">
        {t('owner') || 'Owner'}: <TranslatedText text={equipment.owner?.name || 'Unknown'} /> • <TranslatedText text={equipment.district} />
      </p>

      {isOwner ? (
        <div className="flex gap-2">
          <button 
            className="btn-ghost flex items-center justify-center gap-2 flex-1" 
            style={{ padding: '8px' }}
            onClick={() => onToggleAvailable(equipment._id)}
          >
            {equipment.available ? <X size={16} /> : <Check size={16} />}
            {equipment.available ? t('mark_unavailable') : t('mark_available')}
          </button>
          <button 
            className="btn-danger flex items-center justify-center gap-2"
            style={{ padding: '8px', width: 'auto' }}
            onClick={() => onDelete(equipment._id)}
          >
            {t('delete_listing') || 'Delete'}
          </button>
        </div>
      ) : (
        <a 
          href={`tel:${equipment.contactPhone}`} 
          className="btn-emerald flex items-center justify-center gap-2 w-full text-center"
          style={{ display: 'flex', textDecoration: 'none' }}
        >
          <Phone size={18} />
          {t('call_owner')}
        </a>
      )}
    </div>
  );
};

export default MachineryCard;

