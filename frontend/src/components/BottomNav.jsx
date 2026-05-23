import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ScanLine, Briefcase, Tractor, CloudSun, ShoppingBasket, FileText, Banknote } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const BottomNav = () => {
  const { t } = useLanguage();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '430px',
      backgroundColor: 'rgba(11, 15, 18, 0.9)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '8px 4px 6px 4px',
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      zIndex: 1000,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.5)'
    }}>
      <NavItem to="/dashboard" icon={<Home size={18} />} label={t('home')} />
      <NavItem to="/diagnose" icon={<ScanLine size={18} />} label={t('diagnose')} />
      <NavItem to="/jobs" icon={<Briefcase size={18} />} label={t('nav_jobs')} />
      <NavItem to="/machinery" icon={<Tractor size={18} />} label={t('nav_machinery')} />
      <NavItem to="/weather" icon={<CloudSun size={18} />} label={t('weather')} />
      <NavItem to="/market" icon={<ShoppingBasket size={18} />} label={t('market')} />
      <NavItem to="/schemes" icon={<FileText size={18} />} label={t('nav_schemes')} />
      <NavItem to="/loans" icon={<Banknote size={18} />} label={t('nav_loans')} />
    </nav>
  );
};

const NavItem = ({ to, icon, label }) => {
  return (
    <NavLink 
      to={to}
      style={({ isActive }) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: isActive ? '#10B981' : 'rgba(255, 255, 255, 0.45)',
        textDecoration: 'none',
        fontSize: '9px',
        fontWeight: isActive ? '600' : '400',
        gap: '2px',
        paddingBottom: '4px',
        borderBottom: isActive ? '2px solid #10B981' : '2px solid transparent',
        transition: 'all 0.2s',
        flex: 1,
        textAlign: 'center'
      })}
    >
      {icon}
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '50px' }}>{label}</span>
    </NavLink>
  );
};

export default BottomNav;
