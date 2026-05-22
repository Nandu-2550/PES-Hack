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
    <div className="page-container">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 style={{ color: 'var(--text-primary)' }}>Namaskara,</h2>
          <h1 style={{ color: 'var(--accent-color)' }}>{user.name}!</h1>
        </div>
        <span style={{ 
          backgroundColor: 'var(--surface-color)', 
          padding: '6px 12px', 
          borderRadius: '16px',
          border: '1px solid var(--primary-color)'
        }}>
          📍 {user.district}
        </span>
      </div>

      <SyncBadge syncedAt={weatherSync} isStale={weatherStale} />

      {/* Weather Card */}
      <div className="surface-card mb-3 flex items-center justify-between">
        {weather ? (
          <>
            <div>
              <p style={{ fontSize: '14px' }}>Current Weather</p>
              <h2 style={{ fontSize: '32px', margin: '4px 0' }}>{Math.round(weather.current.temp)}°C</h2>
              <p style={{ textTransform: 'capitalize' }}>{weather.current.description}</p>
            </div>
            {weather.current.icon && (
              <img src={`https://openweathermap.org/img/wn/${weather.current.icon}@2x.png`} alt="weather" />
            )}
          </>
        ) : (
          <p>Loading weather...</p>
        )}
      </div>

      {/* Quick Actions Grid */}
      <h3 className="mb-2">Quick Actions</h3>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '12px',
        marginBottom: '24px'
      }}>
        <QuickActionCard 
          icon={<ScanLine size={32} color="var(--accent-color)" />} 
          title="Diagnose Crop" 
          onClick={() => navigate('/diagnose')} 
        />
        <QuickActionCard 
          icon={<Briefcase size={32} color="var(--accent-color)" />} 
          title="Find Workers" 
          onClick={() => navigate('/jobs')} 
        />
        <QuickActionCard 
          icon={<Tractor size={32} color="var(--accent-color)" />} 
          title="Rent Machinery" 
          onClick={() => navigate('/machinery')} 
        />
        <QuickActionCard 
          icon={<TrendingUp size={32} color="var(--accent-color)" />} 
          title="Market Prices" 
          onClick={() => navigate('/weather')} 
        />
      </div>

      {/* Recent Activity */}
      <div className="flex justify-between items-center mb-2">
        <h3>Recent Jobs near you</h3>
        <span onClick={() => navigate('/jobs')} style={{ color: 'var(--accent-color)', cursor: 'pointer', fontSize: '14px' }}>See all</span>
      </div>
      
      {recentJobs.length > 0 ? (
        recentJobs.map(job => (
          <JobCard key={job._id} job={job} isOwner={false} />
        ))
      ) : (
        <p className="text-center" style={{ marginTop: '20px' }}>No recent jobs found.</p>
      )}

    </div>
  );
};

const QuickActionCard = ({ icon, title, onClick }) => (
  <div 
    className="surface-card flex flex-col items-center justify-center text-center" 
    style={{ cursor: 'pointer', padding: '20px 10px', margin: 0 }}
    onClick={onClick}
  >
    <div style={{ marginBottom: '8px' }}>{icon}</div>
    <span style={{ fontWeight: '600', fontSize: '14px' }}>{title}</span>
  </div>
);

export default Dashboard;
