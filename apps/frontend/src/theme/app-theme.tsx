import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type AppThemeMode = 'light' | 'dark';

export type ThemePalette = {
  pageBg: string;
  surface: string;
  surfaceAlt: string;
  surfaceElevated: string;
  border: string;
  borderStrong: string;
  text: string;
  mutedText: string;
  accent: string;
  accentHover: string;
  accentSoft: string;
  accentText: string;
  accentAlt: string;
  accentAltSoft: string;
  headerBg: string;
  sidebarBg: string;
  inputBg: string;
  inputBorder: string;
  shadow: string;
};

const STORAGE_KEY = 'avatir.theme';

export const isThemeToggleEnabled = import.meta.env.VITE_ENABLE_THEME_TOGGLE === 'true';

const palettes: Record<AppThemeMode, ThemePalette> = {
  light: {
    pageBg: '#F7F8FC',
    surface: '#FFFFFF',
    surfaceAlt: '#F4F7FF',
    surfaceElevated: 'rgba(255, 255, 255, 0.88)',
    border: '#DCE4F2',
    borderStrong: '#C9D6EA',
    text: '#1E293B',
    mutedText: '#64748B',
    accent: '#93C5FD',
    accentHover: '#7DB7FB',
    accentSoft: '#DCEBFF',
    accentText: '#0F172A',
    accentAlt: '#D8B4FE',
    accentAltSoft: '#F3E8FF',
    headerBg: 'rgba(247, 248, 252, 0.88)',
    sidebarBg: 'rgba(255, 255, 255, 0.96)',
    inputBg: '#FFFFFF',
    inputBorder: '#D7E1F0',
    shadow: '0 22px 50px rgba(148, 163, 184, 0.14)',
  },
  dark: {
    pageBg: '#0F172A',
    surface: '#172033',
    surfaceAlt: '#1C2740',
    surfaceElevated: 'rgba(23, 32, 51, 0.92)',
    border: '#324156',
    borderStrong: '#43566E',
    text: '#F8FAFC',
    mutedText: '#B6C1D2',
    accent: '#93C5FD',
    accentHover: '#7DB7FB',
    accentSoft: '#26344B',
    accentText: '#0F172A',
    accentAlt: '#D8B4FE',
    accentAltSoft: '#34264A',
    headerBg: 'rgba(15, 23, 42, 0.84)',
    sidebarBg: 'rgba(15, 23, 42, 0.96)',
    inputBg: '#182235',
    inputBorder: '#334155',
    shadow: '0 28px 60px rgba(2, 6, 23, 0.45)',
  },
};

type AppThemeContextValue = {
  mode: AppThemeMode;
  isLight: boolean;
  isDark: boolean;
  palette: ThemePalette;
  setMode: (mode: AppThemeMode) => void;
  toggleMode: () => void;
  isToggleEnabled: boolean;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

const DEFAULT_MODE: AppThemeMode = 'light';

function resolveInitialMode(): AppThemeMode {
  if (!isThemeToggleEnabled || typeof window === 'undefined') {
    return DEFAULT_MODE;
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }

  return DEFAULT_MODE;
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppThemeMode>(resolveInitialMode);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;

    if (isThemeToggleEnabled) {
      window.localStorage.setItem(STORAGE_KEY, mode);
    }
  }, [mode]);

  const value = useMemo<AppThemeContextValue>(
    () => ({
      mode,
      isLight: mode === 'light',
      isDark: mode === 'dark',
      palette: palettes[mode],
      setMode: (next) => {
        if (isThemeToggleEnabled) {
          setModeState(next);
        }
      },
      toggleMode: () => {
        if (isThemeToggleEnabled) {
          setModeState((current) => (current === 'light' ? 'dark' : 'light'));
        }
      },
      isToggleEnabled: isThemeToggleEnabled,
    }),
    [mode],
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }

  return context;
}
