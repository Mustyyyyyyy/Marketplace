import React from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from './theme';

export function Button({ title, onPress, loading, disabled, variant = 'primary', style, icon }: { title: string; onPress: () => void; loading?: boolean; disabled?: boolean; variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent'; style?: ViewStyle; icon?: keyof typeof Ionicons.glyphMap }) {
  const palette = {
    primary: { bg: colors.brand, fg: colors.onBrand, border: 'transparent' },
    accent: { bg: colors.accent, fg: colors.onAccent, border: 'transparent' },
    secondary: { bg: colors.card, fg: colors.text, border: colors.border },
    danger: { bg: colors.danger, fg: '#fff', border: 'transparent' },
    ghost: { bg: 'transparent', fg: colors.accent, border: 'transparent' },
  } as const;
  const p = palette[variant];
  return (
    <Pressable onPress={onPress} disabled={loading || disabled} style={({ pressed }) => [styles.btn, { backgroundColor: p.bg, borderColor: p.border, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 }, style]}>
      {loading ? <ActivityIndicator color={p.fg} /> : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {icon ? <Ionicons name={icon} size={16} color={p.fg} /> : null}
          <Text style={[styles.btnText, { color: p.fg }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function Input({ label, error, style, ...props }: TextInputProps & { label?: string; error?: string }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput placeholderTextColor={colors.subtle} style={[styles.input, error ? { borderColor: colors.danger } : null, style]} {...props} />
      {error ? <Text style={styles.err}>{error}</Text> : null}
    </View>
  );
}

export function Card({ children, style, onPress }: { children: React.ReactNode; style?: ViewStyle; onPress?: () => void }) {
  if (onPress) {
    return <Pressable onPress={onPress} style={[styles.card, style]}>{children}</Pressable>;
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Pill({ label, tone = 'default' }: { label: string; tone?: 'default' | 'success' | 'warning' | 'danger' | 'brand' | 'accent' | 'neutral' }) {
  const palette: Record<string, { bg: string; fg: string }> = {
    default: { bg: '#E2E8F0', fg: '#334155' },
    neutral: { bg: colors.surfaceHigh, fg: colors.text },
    success: { bg: '#CCFBF1', fg: '#0F766E' },
    warning: { bg: '#FEF3C7', fg: '#92400E' },
    danger: { bg: '#FEE2E2', fg: '#B91C1C' },
    brand: { bg: colors.surface, fg: colors.brand },
    accent: { bg: colors.accentFixed, fg: '#003EA8' },
  };
  const p = palette[tone] || palette.default;
  return <View style={{ backgroundColor: p.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' }}><Text style={{ color: p.fg, fontSize: 11, fontWeight: '600' }}>{label}</Text></View>;
}

export function Spacer({ h = 12 }: { h?: number }) { return <View style={{ height: h }} />; }

export function Row({ children, gap = 8, style }: { children: React.ReactNode; gap?: number; style?: ViewStyle }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}

export function Avatar({ name, size = 40, src }: { name?: string | null; size?: number; src?: string | null }) {
  const letter = (name || '?')[0]?.toUpperCase() || '?';
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.accentFixed, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {src ? (
        <Image source={{ uri: src }} style={{ width: size, height: size }} contentFit="cover" />
      ) : (
        <Text style={{ color: colors.accent, fontSize: size * 0.4, fontWeight: '700' }}>{letter}</Text>
      )}
    </View>
  );
}

export function StarRating({ value, size = 14 }: { value: number; size?: number }) {
  const full = Math.round(value || 0);
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons key={i} name={i < full ? 'star' : 'star-outline'} size={size} color="#F59E0B" />
      ))}
    </View>
  );
}

export function Icon({ name, size = 18, color }: { name: keyof typeof Ionicons.glyphMap; size?: number; color?: string }) {
  return <Ionicons name={name} size={size} color={color || colors.text} />;
}

export function Screen({ children, scroll = true, refreshing, onRefresh, contentStyle, padded = true }: { children: React.ReactNode; scroll?: boolean; refreshing?: boolean; onRefresh?: () => void; contentStyle?: ViewStyle; padded?: boolean }) {
  if (!scroll) return <View style={{ flex: 1, backgroundColor: colors.bg, padding: padded ? spacing.lg : 0 }}>{children}</View>;
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[{ padding: padded ? spacing.lg : 0, paddingBottom: spacing.xxxl }, contentStyle]}
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.accent} /> : undefined}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

export function ErrorText({ message }: { message?: string | null }) {
  if (!message) return null;
  return <Text style={{ color: colors.danger, marginBottom: spacing.sm, fontSize: 13 }}>{message}</Text>;
}

export function Greeting({ name, eyebrow, subtitle, right }: { name: string; eyebrow?: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <View style={styles.greeting}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={[typography.h1, { marginTop: 2 }]}>{name}</Text>
        {subtitle ? <Text style={[typography.small, { marginTop: 4 }]}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function StatCard({ label, value, hint, icon, tone = 'neutral' }: { label: string; value: string | number; hint?: string; icon: keyof typeof Ionicons.glyphMap; tone?: 'neutral' | 'accent' | 'success' | 'warning' }) {
  const palette = {
    neutral: { bg: colors.surfaceHigh, fg: colors.text },
    accent: { bg: colors.accentFixed, fg: colors.accent },
    success: { bg: '#CCFBF1', fg: '#0F766E' },
    warning: { bg: '#FEF3C7', fg: '#92400E' },
  } as const;
  const p = palette[tone];
  return (
    <View style={styles.statCard}>
      <View style={styles.statTop}>
        <Text style={typography.label}>{label}</Text>
        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: p.bg, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={18} color={p.fg} />
        </View>
      </View>
      <Text style={[typography.h2, { marginTop: 4 }]}>{value}</Text>
      {hint ? <Text style={[typography.tiny, { marginTop: 2 }]}>{hint}</Text> : null}
    </View>
  );
}

export function TrustCallout({ title = 'TaskSphere Escrow Protection', body = 'Every contract dollar is secured in segregated Escrow before work begins.', primaryLabel = 'Learn more', onPrimary, secondaryLabel, onSecondary }: { title?: string; body?: string; primaryLabel?: string; onPrimary?: () => void; secondaryLabel?: string; onSecondary?: () => void }) {
  return (
    <View style={styles.trust}>
      <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="shield-checkmark" size={26} color={colors.successContainer} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{title}</Text>
        <Text style={{ color: colors.accentFixed, fontSize: 13, marginTop: 2 }}>{body}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          {onPrimary ? <Button title={primaryLabel} onPress={onPrimary} variant="accent" style={{ paddingHorizontal: 14, paddingVertical: 8 }} /> : null}
          {secondaryLabel && onSecondary ? <Button title={secondaryLabel} onPress={onSecondary} variant="secondary" style={{ paddingHorizontal: 14, paddingVertical: 8 }} /> : null}
        </View>
      </View>
    </View>
  );
}

export function EmptyState({ icon = 'inbox-outline', title, body, actionLabel, onAction }: { icon?: keyof typeof Ionicons.glyphMap; title: string; body?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={{ alignItems: 'center', padding: spacing.xl }}>
      <Ionicons name={icon} size={48} color={colors.outlineVariant} />
      <Text style={[typography.h3, { marginTop: spacing.md, textAlign: 'center' }]}>{title}</Text>
      {body ? <Text style={[typography.small, { marginTop: 4, textAlign: 'center' }]}>{body}</Text> : null}
      {actionLabel && onAction ? <View style={{ marginTop: spacing.md }}><Button title={actionLabel} onPress={onAction} /></View> : null}
    </View>
  );
}

export function SectionHeader({ eyebrow, title, right }: { eyebrow?: string; title: string; right?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: spacing.md }}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={[typography.h2, { marginTop: 2 }]}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

export { Logo } from './Logo';

const styles = StyleSheet.create({
  btn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  btnText: { fontSize: 15, fontWeight: '600' },
  input: { backgroundColor: '#F8FAFC', borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.text },
  label: { ...typography.label, marginBottom: 6 },
  err: { color: colors.danger, fontSize: 12, marginTop: 4 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  greeting: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  eyebrow: { ...typography.tiny, color: colors.accent, textTransform: 'uppercase' },
  statCard: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, flex: 1, minWidth: 0 },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  trust: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, backgroundColor: colors.brand, borderRadius: radius.xl, padding: spacing.lg, marginVertical: spacing.lg },
});
