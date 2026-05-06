import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, radii, shadows, typography } from '../theme';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
};

export default function ChartCard({ title, subtitle, children, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.chartArea}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  header: {
    marginBottom: spacing.base,
  },
  title: {
    ...typography.h3,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  chartArea: {
    alignItems: 'center',
  },
});
