export const colors = {
  palette: {
    brightPink: '#ef476f',
    coral: '#f78c6b',
    mantis: '#83d483',
    emerald: '#06d6a0',
    lightSeaGreen: '#0cb0a9',
    ncsBlue: '#118ab2',
    midnightGreen: '#073b4c',
  },
  dark: {
    bg: '#0F172A',
    surface: '#1E293B',
    surfaceHover: '#334155',
    text: '#F1F5F9',
    textMuted: '#CBD5E1',
  },
  light: {
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceHover: '#F1F5F9',
    text: '#0F172A',
    textMuted: '#64748B',
  },
};

export const getThemeColors = (isDark: boolean) => 
  isDark ? colors.dark : colors.light;

