import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, radii, shadows, typography } from '../theme';

type Props = {
  label: string;
  amount: string;
  icon: string;
  trend?: string;       // e.g. "+12.5%"
  trendUp?: boolean;    // true = green, false = red
  bgColor: string;
  accentColor: string;
  style?: ViewStyle;
};

export default function SummaryItem({
  label,
  amount,
  icon,
  trend,
  trendUp,
  bgColor,
  accentColor,
  style,
}: Props) {
  return (
    <View style={[styles.container, { backgroundColor: bgColor }, style]}>
      <View style={styles.iconRow}>
        <View style={[styles.iconCircle, { backgroundColor: accentColor + '20' }]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        {trend !== undefined && (
          <View style={[styles.trendBadge, { backgroundColor: trendUp ? colors.incomeBg : colors.expenseBg }]}>
            <Text style={[styles.trendText, { color: trendUp ? colors.incomeDark : colors.expenseDark }]}>
              {trend}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.amount, { color: accentColor }]}>{amount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: radii.lg,
    padding: spacing.base,
    ...shadows.card,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
  },
  label: {
    ...typography.caption,
    marginBottom: 4,
  },
  amount: {
    fontSize: 20,
    fontWeight: '800',
  },
});
