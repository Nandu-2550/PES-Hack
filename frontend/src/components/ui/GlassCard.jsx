import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.008, y: -2, borderColor: 'rgba(52, 211, 153, 0.28)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      className={`nfv-card ${className}`}
    >
      {children}
    </motion.div>
  );
}
