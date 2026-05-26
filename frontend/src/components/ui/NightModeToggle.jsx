import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function NightModeToggle() {
  const { nightMode, toggleNight } = useTheme();
  return (
    <button
      onClick={toggleNight}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 transition-all"
    >
      {nightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span>{nightMode ? 'Day Mode' : 'Night Field Vision'}</span>
    </button>
  );
}
