import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.008, y: -2, borderColor: 'rgba(52, 211, 153, 0.28)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      className={`rounded-2xl p-4 glass-card ${className}`}
      style={{
        background: 'rgba(26, 36, 33, 0.42)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.09)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.30)',
      }}
    >
      {children}
    </motion.div>
  );
}
