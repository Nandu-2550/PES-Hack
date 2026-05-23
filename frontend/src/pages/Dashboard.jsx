import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import client from '../api/client';
import JobCard from '../components/JobCard';
import SyncBadge from '../components/SyncBadge';
import { useCachedFetch } from '../hooks/useCachedFetch';
import { useLanguage } from '../context/LanguageContext';
import { ScanLine, Briefcase, Tractor, CloudSun, ShoppingBasket, FileText, Landmark } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const { data: weather, syncedAt: weatherSync, isStale: weatherStale } = useCachedFetch(
    `weather_${user?.district}`,
    user ? `/api/weather?district=${user.district}` : null
  );

  const { data: recentJobsRaw } = useCachedFetch(
    `jobs_${user?.district}`,
    user ? `/api/jobs` : null
  );
  const recentJobs = recentJobsRaw ? recentJobsRaw.slice(0, 3) : [];

  if (!user) return null;

  return (
    <div className="page-container pb-20">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">{t('welcome') || 'Namaskara'},</h2>
          <div className="flex items-center gap-3 mt-0.5">
            <img src="/logo.png" alt="AgriShield" className="w-10 h-10 object-contain drop-shadow-glow" />
            <h1 className="text-white text-3xl font-extrabold">{user.name}!</h1>
          </div>
        </div>
        <span className="bg-[#13191C] text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/5 shadow-glow-sm">
          📍 {user.district}
        </span>
      </div>

      <SyncBadge syncedAt={weatherSync} isStale={weatherStale} />

      {/* Weather Card */}
      <div className="premium-card p-5 mb-6 flex items-center justify-between">
        {weather ? (
          weather.current ? (
            <>
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t('weather') || 'Current Weather'}</p>
                <h2 className="text-white text-4xl font-extrabold my-1">{Math.round(weather.current.temp)}°C</h2>
                <p className="text-emerald-400 text-sm font-semibold capitalize">{weather.current.description}</p>
              </div>
              {weather.current.icon && (
                <img
                  src={`https://openweathermap.org/img/wn/${weather.current.icon}@2x.png`}
                  alt="weather"
                  className="w-16 h-16 drop-shadow-glow"
                />
              )}
            </>
          ) : (
            <p className="text-slate-400 text-sm">Current weather data not available.</p>
          )
        ) : (
          <p className="text-slate-400 text-sm">{t('loading')}</p>
        )}
      </div>

      {/* Quick Actions Grid */}
      <h3 className="text-white font-bold text-lg mb-3">{t('quick_actions')}</h3>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <QuickActionCard 
          icon={<ScanLine size={24} className="text-emerald-400" />} 
          title={t('scan_crop')} 
          onClick={() => navigate('/diagnose')} 
        />
        <QuickActionCard 
          icon={<Briefcase size={24} className="text-emerald-400" />} 
          title={t('find_jobs')} 
          onClick={() => navigate('/jobs')} 
        />
        <QuickActionCard 
          icon={<Tractor size={24} className="text-emerald-400" />} 
          title={t('rent_machinery')} 
          onClick={() => navigate('/machinery')} 
        />
        <QuickActionCard 
          icon={<CloudSun size={24} className="text-emerald-400" />} 
          title={t('weather')} 
          onClick={() => navigate('/weather')} 
        />
        <QuickActionCard 
          icon={<ShoppingBasket size={24} className="text-emerald-400" />} 
          title={t('sell_crops')} 
          onClick={() => navigate('/market')} 
        />
        <QuickActionCard 
          icon={<FileText size={24} className="text-emerald-400" />} 
          title={t('view_schemes')} 
          onClick={() => navigate('/schemes')} 
        />
        <QuickActionCard 
          icon={<Landmark size={24} className="text-emerald-400" />} 
          title={t('find_loans')} 
          onClick={() => navigate('/loans')} 
        />
      </div>

      {/* Recent Activity */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white font-bold text-lg">{t('recent_jobs') || 'Recent Jobs near you'}</h3>
        <span 
          onClick={() => navigate('/jobs')} 
          className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer text-sm transition-colors"
        >
          {t('see_all') || 'See all'}
        </span>
      </div>
      
      {recentJobs.length > 0 ? (
        <div className="space-y-3">
          {recentJobs.map(job => (
            <JobCard key={job._id} job={job} isOwner={false} />
          ))}
        </div>
      ) : (
        <p className="text-slate-500 text-center text-sm mt-6">No recent jobs found.</p>
      )}

    </div>
  );
};

const QuickActionCard = ({ icon, title, onClick }) => (
  <div 
    className="premium-card flex flex-col items-center justify-center text-center p-3 cursor-pointer" 
    onClick={onClick}
    style={{ margin: 0 }}
  >
    <div className="mb-1.5">{icon}</div>
    <span className="text-white font-semibold text-xs leading-tight">{title}</span>
  </div>
);

export default Dashboard;
