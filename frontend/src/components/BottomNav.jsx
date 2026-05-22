import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ScanLine, Briefcase, Tractor, CloudSun } from 'lucide-react';

const BottomNav = () => {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '430px',
      backgroundColor: 'rgba(19, 25, 28, 0.8)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '12px 0',
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      zIndex: 1000
    }}>
      <NavItem to="/dashboard" icon={<Home size={24} />} label="Home" />
      <NavItem to="/diagnose" icon={<ScanLine size={24} />} label="Diagnose" />
      <NavItem to="/jobs" icon={<Briefcase size={24} />} label="Jobs" />
      <NavItem to="/machinery" icon={<Tractor size={24} />} label="Machinery" />
      <NavItem to="/weather" icon={<CloudSun size={24} />} label="Weather" />
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
        color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
        textDecoration: 'none',
        fontSize: '12px',
        gap: '4px'
      })}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

export default BottomNav;
