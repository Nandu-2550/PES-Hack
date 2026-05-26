import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`
        bg-[#13191C]/75 backdrop-blur-lg
        border border-white/5
        shadow-xl shadow-black/40
        rounded-2xl p-4 glass-card
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
