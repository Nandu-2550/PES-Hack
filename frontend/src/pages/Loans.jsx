import React, { useState, useEffect } from 'react';
import { Landmark, ArrowRight, Info } from 'lucide-react';
import client from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export default function Loans() {
  const { t } = useLanguage();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const res = await client.get('/api/loans');
      setLoans(res.data);
    } catch (err) {
      console.error('Failed to load loans', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container pb-20">
      <div className="flex flex-col mb-6">
        <h1 className="text-white text-3xl font-extrabold flex items-center gap-2 mt-1">
          <Landmark className="text-emerald-400" size={28} />
          {t('agri_loans')}
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          {t('loans_subtitle') || 'Find trusted agricultural credit facilities and crop loans with low interest rates.'}
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="premium-card animate-pulse space-y-3">
              <div className="h-5 bg-white/5 rounded w-1/2" />
              <div className="h-4 bg-white/5 rounded w-full" />
              <div className="h-4 bg-white/5 rounded w-3/4" />
              <div className="h-10 bg-white/5 rounded w-full pt-3" />
            </div>
          ))}
        </div>
      ) : loans.length > 0 ? (
        <div className="space-y-4">
          {loans.map((loan) => (
            <div key={loan._id} className="premium-card">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-white text-lg font-extrabold leading-snug">
                  {loan.providerName}
                </h2>
                <span className="badge badge-interest shrink-0">
                  {loan.interestRate.includes('%') ? loan.interestRate.split(' ')[0] : 'Subsidized'}
                </span>
              </div>

              {loan.description && (
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  {loan.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3 mb-4">
                <div>
                  <span className="text-slate-500 text-xs block uppercase tracking-wider">
                    {t('max_limit') || 'Max Limit'}
                  </span>
                  <span className="text-white font-bold text-sm">{loan.maxAmount || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block uppercase tracking-wider">
                    {t('interest_rate')}
                  </span>
                  <span className="text-emerald-400 font-bold text-sm">{loan.interestRate}</span>
                </div>
              </div>

              {loan.eligibility && (
                <div className="mb-4 bg-white/3 p-3 rounded-lg border border-white/5">
                  <span className="text-slate-500 text-xs block uppercase tracking-wider mb-1">
                    {t('eligibility') || 'Eligibility'}
                  </span>
                  <span className="text-slate-300 text-xs leading-relaxed block">{loan.eligibility}</span>
                </div>
              )}

              <div className="border-t border-white/5 pt-3">
                <a
                  href={loan.guidelinesLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-emerald w-full flex items-center justify-center gap-1.5 text-center text-sm"
                  style={{ textDecoration: 'none' }}
                >
                  {t('know_more')}
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          ))}

          {/* Legal Disclaimer at bottom */}
          <div className="bg-amber-500/5 border border-amber-500/15 p-4 rounded-xl flex gap-3 items-start mt-6">
            <Info className="text-amber-400 shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-amber-300/80 leading-relaxed margin-0">
              {t('loans_disclaimer') ||
                'These are informational listings only. Always verify interest rates, processing fees, and loan terms directly with the lending bank or cooperative society before submitting documents.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-slate-500 text-sm">
            {t('no_loans_found') || 'No agricultural loan offers found.'}
          </p>
        </div>
      )}
    </div>
  );
}
