import React from 'react';

const SCOPES = [
  { key: 'district', label: 'Local District', icon: '📍' },
  { key: 'state',    label: 'State Wide',     icon: '🏛️' },
  { key: 'india',    label: 'All India',       icon: '🇮🇳' },
];

const ScopeSelector = ({ activeScope, onScopeChange }) => {
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="inline-flex bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-1 shadow-xl gap-1">
        {SCOPES.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => onScopeChange(key)}
            className={`
              flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium
              transition-all duration-300 ease-in-out
              ${activeScope === key
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                : 'text-white/60 hover:text-white hover:bg-white/10'
              }
            `}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ScopeSelector;
