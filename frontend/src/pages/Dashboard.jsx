import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import SyncBadge from '../components/SyncBadge';
import { useCachedFetch } from '../hooks/useCachedFetch';
import { useLanguage } from '../context/LanguageContext';
import { ScanLine, Briefcase, Tractor, CloudSun, ShoppingBasket, FileText, Landmark, Droplets, Wind, MapPin } from 'lucide-react';

const glassCard = {
  background: 'rgba(26,36,33,0.42)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 20,
  boxShadow: '0 16px 48px rgba(0,0,0,0.30)',
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: 'easeOut' } },
};

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

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-between items-start mb-5"
      >
        <div>
          <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>
            {t('welcome') || 'Namaskara'} 🌾
          </p>
          <h1 className="text-white text-2xl font-extrabold tracking-tight">{user.name}</h1>
        </div>
        <span style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(26,36,33,0.52)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.10)', borderRadius: 999,
          padding: '6px 14px', color: 'rgba(255,255,255,0.70)', fontSize: 11, fontWeight: 600,
        }}>
          <MapPin size={11} color="#34D399" />
          {user.district}
        </span>
      </motion.div>

      <SyncBadge syncedAt={weatherSync} isStale={weatherStale} />

      {/* ── Weather Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="nfv-weather-hero p-5 mb-6 overflow-hidden relative"
      >
        <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, background: 'rgba(52,211,153,0.06)', borderRadius: '50%', transform: 'translate(30%, -30%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
        {weather ? (
          weather.current ? (
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: 'rgba(52,211,153,0.70)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                  {t('weather') || 'Current Weather'} · {user.district}
                </p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                  <h2 className="text-white font-black" style={{ fontSize: 52, lineHeight: 1 }}>
                    {Math.round(weather.current.temp)}°
                  </h2>
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 18, marginBottom: 4 }}>C</span>
                </div>
                <p style={{ color: '#34D399', fontSize: 13, fontWeight: 500, textTransform: 'capitalize', marginTop: 4 }}>
                  {weather.current.description}
                </p>
                <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                  {weather.current.humidity && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.50)', fontSize: 11 }}>
                      <Droplets size={11} color="#60A5FA" /> {weather.current.humidity}%
                    </span>
                  )}
                  {weather.current.wind_speed && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.50)', fontSize: 11 }}>
                      <Wind size={11} color="rgba(255,255,255,0.45)" /> {Math.round(weather.current.wind_speed)} km/h
                    </span>
                  )}
                </div>
              </div>
              {weather.current.icon && (
                <img
                  src={`https://openweathermap.org/img/wn/${weather.current.icon}@2x.png`}
                  alt="weather"
                  style={{ width: 80, height: 80, filter: 'drop-shadow(0 0 14px rgba(52,211,153,0.45))' }}
                />
              )}
            </div>
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13 }}>Current weather data not available.</p>
          )
        ) : (
          <div className="flex items-center gap-4">
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.05)' }} className="shimmer" />
            <div className="space-y-2 flex-1">
              <div style={{ height: 36, width: '40%', borderRadius: 99, background: 'rgba(255,255,255,0.05)' }} className="shimmer" />
              <div style={{ height: 12, width: '55%', borderRadius: 99, background: 'rgba(255,255,255,0.04)' }} className="shimmer" />
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Quick Actions ── */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white font-bold text-base">{t('quick_actions')}</h3>
      </div>

      <motion.div
        variants={containerVariants} initial="hidden" animate="visible"
        className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-7"
      >
        {[
          { icon: <ScanLine size={22} color="#34D399" />, title: t('scan_crop'), path: '/diagnose', glow: 'rgba(52,211,153,0.25)' },
          { icon: <Briefcase size={22} color="#60A5FA" />, title: t('find_jobs'), path: '/jobs', glow: 'rgba(96,165,250,0.25)' },
          { icon: <Tractor size={22} color="#FBBF24" />, title: t('rent_machinery'), path: '/machinery', glow: 'rgba(251,191,36,0.25)' },
          { icon: <CloudSun size={22} color="#38BDF8" />, title: t('weather'), path: '/weather', glow: 'rgba(56,189,248,0.25)' },
          { icon: <ShoppingBasket size={22} color="#A78BFA" />, title: t('sell_crops'), path: '/market', glow: 'rgba(167,139,250,0.25)' },
          { icon: <FileText size={22} color="#FB7185" />, title: t('view_schemes'), path: '/schemes', glow: 'rgba(251,113,133,0.25)' },
          { icon: <Landmark size={22} color="#FB923C" />, title: t('find_loans'), path: '/loans', glow: 'rgba(251,146,60,0.25)' },
        ].map(({ icon, title, path, glow }) => (
          <motion.div key={path} variants={itemVariants}>
            <QuickActionCard icon={icon} title={title} glow={glow} onClick={() => navigate(path)} />
          </motion.div>
        ))}
      </motion.div>

      {/* ── Recent Jobs ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white font-bold text-base">{t('recent_jobs') || 'Recent Jobs near you'}</h3>
          <span
            onClick={() => navigate('/jobs')}
            style={{ color: '#34D399', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            {t('see_all') || 'See all'} →
          </span>
        </div>
        {recentJobs.length > 0 ? (
          <div className="space-y-3">
            {recentJobs.map(job => <JobCard key={job._id} job={job} isOwner={false} />)}
          </div>
        ) : (
          <div style={{ ...glassCard, padding: 32, textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: 13 }}>No recent jobs found in your area.</p>
            <button onClick={() => navigate('/jobs')} className="btn-emerald mt-4" style={{ fontSize: 13, padding: '8px 20px' }}>
              Browse All Jobs
            </button>
          </div>
        )}
      </motion.div>

    </div>
  );
};

const QuickActionCard = ({ icon, title, onClick, glow }) => (
  <motion.div
    whileHover={{ scale: 1.03, y: -2 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: 'spring', stiffness: 400, damping: 26 }}
    onClick={onClick}
    className="group cursor-pointer"
    style={{
      background: 'rgba(26,36,33,0.45)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: '16px 8px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      minHeight: 80,
      transition: 'border-color 0.25s, box-shadow 0.25s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = glow.replace('0.25)', '0.40)');
      e.currentTarget.style.boxShadow = `0 0 20px ${glow}`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    <div className="mb-1.5 nfv-icon-glow">{icon}</div>
    <span style={{ color: 'rgba(255,255,255,0.78)', fontWeight: 600, fontSize: 10, lineHeight: 1.3 }}>
      {title}
    </span>
  </motion.div>
);

export default Dashboard;

