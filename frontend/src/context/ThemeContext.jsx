import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [nightMode, setNightMode] = useState(
    () => localStorage.getItem('agri-night-mode') === 'true'
  );

  useEffect(() => {
    const root = document.documentElement;
    if (nightMode) {
      root.classList.add('night-mode');
    } else {
      root.classList.remove('night-mode');
    }
    localStorage.setItem('agri-night-mode', nightMode);
  }, [nightMode]);

  return (
    <ThemeContext.Provider value={{ nightMode, setNightMode, toggleNight: () => setNightMode(p => !p) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
