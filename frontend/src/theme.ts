/**
 * Central design tokens for the finance app (Phase 2 — fintech light theme)
 */
export const colors = {
  // Backgrounds
  background: '#F5F6FA',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F1F5',

  // Brand
  primary: '#4F46E5',       // indigo-600
  primaryLight: '#EEF2FF',  // indigo-50
  primaryDark: '#3730A3',   // indigo-800

  // Semantic
  income: '#10B981',        // emerald-500
  incomeBg: '#ECFDF5',      // emerald-50
  incomeDark: '#047857',    // emerald-700
  expense: '#EF4444',       // red-500
  expenseBg: '#FEF2F2',     // red-50
  expenseDark: '#B91C1C',   // red-700

  // Neutral
  textPrimary: '#1E293B',   // slate-800
  textSecondary: '#64748B', // slate-500
  textMuted: '#94A3B8',     // slate-400
  border: '#E2E8F0',        // slate-200

  // Chart palette
  chart: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#F97316'],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHover: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '800' as const, color: colors.textPrimary },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.textPrimary },
  h3: { fontSize: 18, fontWeight: '600' as const, color: colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.textPrimary },
  caption: { fontSize: 13, fontWeight: '500' as const, color: colors.textSecondary },
  label: { fontSize: 12, fontWeight: '600' as const, color: colors.textMuted, textTransform: 'uppercase' as const, letterSpacing: 0.6 },
  amount: { fontSize: 24, fontWeight: '800' as const },
};
