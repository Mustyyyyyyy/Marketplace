export const colors = {
  brand: '#0E1C2F',
  brandDim: '#1B2A3F',
  brandSurface: '#E5EEFF',
  accent: '#0051D5',
  accentFixed: '#D6E3FE',
  bg: '#F8F9FF',
  surfaceLowest: '#FFFFFF',
  surfaceLow: '#EFF4FF',
  surface: '#E5EEFF',
  surfaceHigh: '#DCE9FF',
  surfaceHighest: '#D3E4FE',
  card: '#FFFFFF',
  text: '#0B1C30',
  textSecondary: '#44474C',
  muted: '#475569',
  subtle: '#75777D',
  border: '#C5C6CD',
  outline: '#75777D',
  outlineVariant: '#C5C6CD',
  success: '#0C9488',
  successContainer: '#89F5E7',
  warning: '#F59E0B',
  warningContainer: '#FEF3C7',
  danger: '#BA1A1A',
  dangerContainer: '#FFdad6',
  onBrand: '#FFFFFF',
  onAccent: '#FFFFFF',
  onSuccess: '#FFFFFF',
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };

export const typography = {
  display: { fontSize: 32, fontWeight: '800' as const, color: colors.text, letterSpacing: -0.5 },
  h1: { fontSize: 24, fontWeight: '700' as const, color: colors.text, letterSpacing: -0.3 },
  h2: { fontSize: 20, fontWeight: '700' as const, color: colors.text, letterSpacing: -0.2 },
  h3: { fontSize: 17, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, color: colors.text },
  small: { fontSize: 13, color: colors.textSecondary },
  tiny: { fontSize: 11, color: colors.subtle, fontWeight: '600' as const },
  label: { fontSize: 12, color: colors.muted, fontWeight: '600' as const, letterSpacing: 0.3 },
};
