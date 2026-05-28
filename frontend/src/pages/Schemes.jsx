import React, { useState, useEffect } from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import client from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { TranslatedText } from '../utils/translate';

export default function Schemes() {
  const { t } = useLanguage();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const res = await client.get('/api/schemes');
      setSchemes(res.data);
    } catch (err) {
      console.error('Failed to load schemes', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container pb-20">
      <div className="flex flex-col mb-6">
        <h1 className="text-white text-3xl font-extrabold flex items-center gap-2 mt-1">
          <FileText className="text-emerald-400" size={28} />
          {t('govt_schemes')}
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          <TranslatedText text="Explore active government schemes and agricultural benefits designed for you." />
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="premium-card animate-pulse space-y-3">
              <div className="h-5 bg-white/5 rounded w-1/3" />
              <div className="h-4 bg-white/5 rounded w-full" />
              <div className="h-4 bg-white/5 rounded w-2/3" />
              <div className="h-10 bg-white/5 rounded w-full pt-3" />
            </div>
          ))}
        </div>
      ) : schemes.length > 0 ? (
        <div className="space-y-4">
          {schemes.map((scheme) => (
            <div key={scheme._id} className="premium-card flex flex-col justify-between">
              <div>
                <h2 className="text-white text-xl font-bold mb-2 flex items-center gap-2">
                  <TranslatedText text={scheme.title} />
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  <TranslatedText text={scheme.summary} />
                </p>
              </div>

              <div className="border-t border-white/5 pt-4">
                <a
                  href={scheme.applicationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-emerald w-full flex items-center justify-center gap-2 text-center text-sm"
                  style={{ textDecoration: 'none' }}
                >
                  {t('apply_now')}
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-slate-500 text-sm">
            {t('no_schemes_found') || 'No government schemes found.'}
          </p>
        </div>
      )}
    </div>
  );
}


