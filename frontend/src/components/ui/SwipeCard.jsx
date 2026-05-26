import { useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Trash2, Edit } from 'lucide-react';

const SWIPE_THRESHOLD = 60;

export default function SwipeCard({ item, onDelete, onEdit, children }) {
  const x = useMotionValue(0);
  const dragRef = useRef(null);

  // Reveal opacity — left panel shows when swiping left (negative x)
  const deleteOpacity = useTransform(x, [-100, -SWIPE_THRESHOLD, 0], [1, 0.8, 0]);
  const editOpacity   = useTransform(x, [0, SWIPE_THRESHOLD, 100], [0, 0.8, 1]);

  const handleDragEnd = (_, info) => {
    const offset = info.offset.x;
    if (offset < -SWIPE_THRESHOLD) {
      onDelete?.(item);
      animate(x, -120, { type: 'spring', stiffness: 300, damping: 30 });
      setTimeout(() => animate(x, 0, { type: 'spring' }), 400);
    } else if (offset > SWIPE_THRESHOLD) {
      onEdit?.(item);
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 });
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl select-none touch-pan-y">
      {/* DELETE panel (left, behind) */}
      <motion.div
        style={{ opacity: deleteOpacity }}
        className="absolute inset-0 flex items-center justify-end pr-6 bg-rose-950/50 rounded-2xl"
      >
        <div className="flex flex-col items-center gap-1">
          <Trash2 className="text-rose-400 w-5 h-5" />
          <span className="text-rose-400 text-xs font-medium">Delete</span>
        </div>
      </motion.div>

      {/* EDIT panel (right, behind) */}
      <motion.div
        style={{ opacity: editOpacity }}
        className="absolute inset-0 flex items-center justify-start pl-6 bg-slate-800/50 rounded-2xl"
      >
        <div className="flex flex-col items-center gap-1">
          <Edit className="text-slate-300 w-5 h-5" />
          <span className="text-slate-300 text-xs font-medium">Edit</span>
        </div>
      </motion.div>

      {/* Draggable card */}
      <motion.div
        ref={dragRef}
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        // CRITICAL: only drag horizontally, allow vertical scroll
        dragDirectionLock={true}
        className="relative z-10 cursor-grab active:cursor-grabbing"
      >
        {children}
      </motion.div>
    </div>
  );
}
