import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, shadows, spacing } from '../theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated';
};

export default function Card({ children, style, variant = 'default' }: Props) {
  return (
    <View
      style={[
        styles.card,
        variant === 'elevated' && shadows.cardHover,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
});
