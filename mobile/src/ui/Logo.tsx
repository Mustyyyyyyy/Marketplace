import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from './theme';

export function Logo({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 36 : size === 'md' ? 28 : 22;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
      <View style={{ width: dim, height: dim, borderRadius: dim / 3, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="checkmark-done" size={dim * 0.55} color={colors.onBrand} />
      </View>
      <Text style={[typography.h2, { fontSize: size === 'lg' ? 22 : 18 }]}>TaskSphere</Text>
    </View>
  );
}
