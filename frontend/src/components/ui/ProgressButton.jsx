import { motion, AnimatePresence } from 'framer-motion';

export default function ProgressButton({ isLoading, isSuccess, onClick, children, className = '' }) {
  return (
    <motion.button
      onClick={!isLoading && !isSuccess ? onClick : undefined}
      disabled={isLoading}
      animate={{
        backgroundColor: isSuccess ? '#059669' : '#166534', // emerald-600 on success
      }}
      transition={{ duration: 0.3 }}
      className={`relative flex items-center justify-center px-5 py-2.5 rounded-xl text-white font-medium
        bg-emerald-900 border border-white/10 shadow-lg shadow-black/30
        disabled:opacity-70 disabled:cursor-not-allowed
        transition-all duration-200 min-w-[120px] ${className}`}
      whileHover={!isLoading && !isSuccess ? { scale: 1.02, y: -1 } : {}}
      whileTap={!isLoading && !isSuccess ? { scale: 0.97 } : {}}
    >
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.span
            key="spinner"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </motion.span>
        )}
        {isSuccess && !isLoading && (
          <motion.span
            key="check"
            initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </motion.span>
        )}
        {!isLoading && !isSuccess && (
          <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
