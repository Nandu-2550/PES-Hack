import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ScanLine, Briefcase, Tractor, CloudSun, ShoppingBasket, FileText, Banknote } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { to: '/dashboard', icon: Home,          labelKey: 'home' },
  { to: '/diagnose',  icon: ScanLine,      labelKey: 'diagnose' },
  { to: '/jobs',      icon: Briefcase,     labelKey: 'nav_jobs' },
  { to: '/machinery', icon: Tractor,       labelKey: 'nav_machinery' },
  { to: '/weather',   icon: CloudSun,      labelKey: 'weather' },
  { to: '/market',    icon: ShoppingBasket, labelKey: 'market' },
  { to: '/schemes',   icon: FileText,      labelKey: 'nav_schemes' },
  { to: '/loans',     icon: Banknote,      labelKey: 'nav_loans' },
];

const BottomNav = () => {
  const { t } = useLanguage();

  return (
    /* Floating glass dock — centered, rounded pill shape */
    <nav
      style={{
        position: 'fixed',
        bottom: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 24px)',
        maxWidth: 520,
        background: 'rgba(6, 10, 8, 0.72)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.10)',
        borderRadius: 24,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '8px 6px 10px',
        zIndex: 1000,
        boxShadow: '0 8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset',
      }}
    >
      {NAV_ITEMS.map(({ to, icon: Icon, labelKey }) => (
        <NavLink key={to} to={to} style={{ textDecoration: 'none', flex: 1 }}>
          {({ isActive }) => (
            <motion.div
              whileTap={{ scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
              }}
            >
              {/* Icon container — active gets emerald spotlight */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isActive
                    ? 'rgba(52, 211, 153, 0.18)'
                    : 'transparent',
                  boxShadow: isActive
                    ? '0 0 12px rgba(52, 211, 153, 0.30), 0 0 0 1px rgba(52,211,153,0.20) inset'
                    : 'none',
                  transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                <Icon
                  size={17}
                  color={isActive ? '#34D399' : 'rgba(255,255,255,0.42)'}
                  style={{ transition: 'color 0.25s ease' }}
                />
              </div>
              {/* Label */}
              <span
                style={{
                  fontSize: 9,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#34D399' : 'rgba(255,255,255,0.38)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 44,
                  transition: 'color 0.25s ease',
                }}
              >
                {t(labelKey)}
              </span>
            </motion.div>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
