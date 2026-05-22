import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import client from '../api/client';
import JobCard from '../components/JobCard';
import SyncBadge from '../components/SyncBadge';
import { useCachedFetch } from '../hooks/useCachedFetch';
import { ScanLine, Briefcase, Tractor, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
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
          <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Namaskara,</h2>
          <h1 className="text-white text-3xl font-extrabold mt-0.5">{user.name}!</h1>
        </div>
        <span className="bg-[#13191C] text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/5 shadow-glow-sm">
          📍 {user.district}
        </span>
      </div>

      <SyncBadge syncedAt={weatherSync} isStale={weatherStale} />

      {/* Weather Card */}
      <div className="card p-5 mb-6 flex items-center justify-between shadow-glow-sm">
        {weather ? (
          weather.current ? ( // If weather data and current weather data are available
            <>
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Current Weather</p>
                <h2 className="text-white text-4xl font-extrabold my-1">{Math.round(weather.current.temp)}°C</h2>
                <p className="text-emerald-400 text-sm font-semibold capitalize">{weather.current.description}</p>
              </div>
              {weather.current.icon && ( // Conditionally render icon if it exists
                <img
                  src={`https://openweathermap.org/img/wn/${weather.current.icon}@2x.png`}
                  alt="weather"
                  className="w-16 h-16 drop-shadow-glow"
                />
              )}
            </>
          ) : ( // If weather data is available, but current weather data is not
            <p className="text-slate-400 text-sm">Current weather data not available.</p>
          )
        ) : (
          <p className="text-slate-400 text-sm">Loading weather...</p>
        )}
      </div>

      {/* Quick Actions Grid */}
      <h3 className="text-white font-bold text-lg mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <QuickActionCard 
          icon={<ScanLine size={28} className="text-emerald-400" />} 
          title="Diagnose Crop" 
          onClick={() => navigate('/diagnose')} 
        />
        <QuickActionCard 
          icon={<Briefcase size={28} className="text-emerald-400" />} 
          title="Find Workers" 
          onClick={() => navigate('/jobs')} 
        />
        <QuickActionCard 
          icon={<Tractor size={28} className="text-emerald-400" />} 
          title="Rent Machinery" 
          onClick={() => navigate('/machinery')} 
        />
        <QuickActionCard 
          icon={<TrendingUp size={28} className="text-emerald-400" />} 
          title="Market Prices" 
          onClick={() => navigate('/weather')} 
        />
      </div>

      {/* Recent Activity */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white font-bold text-lg">Recent Jobs near you</h3>
        <span 
          onClick={() => navigate('/jobs')} 
          className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer text-sm transition-colors"
        >
          See all
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
    className="card card-hover flex flex-col items-center justify-center text-center p-5 shadow-glow-sm cursor-pointer" 
    onClick={onClick}
  >
    <div className="mb-2">{icon}</div>
    <span className="text-white font-semibold text-sm">{title}</span>
  </div>
);

export default Dashboard;
