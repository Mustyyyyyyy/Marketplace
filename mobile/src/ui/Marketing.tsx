import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, EmptyState, Logo, Pill, Row, Screen, Spacer, TrustCallout } from '../ui/components';
import { colors, radius, spacing, typography } from '../ui/theme';
import { fetchPublicStats, PublicStats } from '../lib/marketplace';
import { RootStackParamList } from '../App';

export function MarketingHero({ eyebrow, title, subtitle, primaryLabel, onPrimary, secondaryLabel, onSecondary }: { eyebrow?: string; title: string; subtitle: string; primaryLabel: string; onPrimary: () => void; secondaryLabel?: string; onSecondary?: () => void }) {
  return (
    <View style={{ backgroundColor: colors.brand, borderRadius: radius.xxl, padding: spacing.xl, marginBottom: spacing.lg, overflow: 'hidden' }}>
      {eyebrow ? (
        <View style={{ alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 999, marginBottom: 12 }}>
          <Text style={{ color: '#fff', ...typography.tiny, fontSize: 11, fontWeight: '700' }}>{eyebrow}</Text>
        </View>
      ) : null}
      <Text style={{ color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: -0.5, lineHeight: 38 }}>{title}</Text>
      <Text style={{ color: colors.accentFixed, fontSize: 16, marginTop: 8, lineHeight: 22 }}>{subtitle}</Text>
      <Row gap={8} style={{ marginTop: 16 }}>
        <Button title={primaryLabel} onPress={onPrimary} variant="accent" />
        {secondaryLabel && onSecondary ? <Button title={secondaryLabel} onPress={onSecondary} variant="secondary" /> : null}
      </Row>
    </View>
  );
}

export function MarketingStatsRow({ stats }: { stats: PublicStats }) {
  const cards: { label: string; value: string; tone: 'accent' | 'success' | 'warning' | 'neutral'; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: 'Open tasks', value: stats.openTasks.toLocaleString(), tone: 'accent', icon: 'briefcase-outline' },
    { label: 'Taskers', value: stats.taskersTotal.toLocaleString(), tone: 'success', icon: 'people-outline' },
    { label: 'Categories', value: stats.categoriesTotal.toLocaleString(), tone: 'warning', icon: 'grid-outline' },
    { label: 'Avg. rating', value: stats.ratingAvg ? stats.ratingAvg.toFixed(1) + '★' : '—', tone: 'neutral', icon: 'star-outline' },
  ];
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.lg }}>
      {cards.map((c) => (
        <View key={c.label} style={{ flex: 1, minWidth: '46%', backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: spacing.md }}>
          <Row>
            <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: c.tone === 'accent' ? colors.accentFixed : c.tone === 'success' ? '#CCFBF1' : c.tone === 'warning' ? '#FEF3C7' : colors.surfaceHigh, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={c.icon} size={16} color={c.tone === 'accent' ? colors.accent : c.tone === 'success' ? '#0F766E' : c.tone === 'warning' ? '#92400E' : colors.text} />
            </View>
          </Row>
          <Text style={{ ...typography.h2, fontSize: 22, marginTop: 6 }}>{c.value}</Text>
          <Text style={{ ...typography.tiny, marginTop: 2 }}>{c.label}</Text>
        </View>
      ))}
    </View>
  );
}

export function MarketingFeature({ icon, title, body }: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }) {
  return (
    <Card>
      <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: colors.accentFixed, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={22} color={colors.accent} />
      </View>
      <Text style={[typography.h3, { marginTop: spacing.md }]}>{title}</Text>
      <Text style={[typography.small, { marginTop: 4 }]}>{body}</Text>
    </Card>
  );
}

export function MarketingSectionHeader({ eyebrow, title, subtitle, right }: { eyebrow?: string; title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <View style={{ marginBottom: spacing.md, marginTop: spacing.lg }}>
      {eyebrow ? <Text style={{ color: colors.accent, ...typography.tiny, textTransform: 'uppercase' }}>{eyebrow}</Text> : null}
      <Text style={[typography.h1, { fontSize: 26, marginTop: 2 }]}>{title}</Text>
      {subtitle ? <Text style={[typography.small, { marginTop: 4 }]}>{subtitle}</Text> : null}
      {right ? <View style={{ marginTop: spacing.md }}>{right}</View> : null}
    </View>
  );
}

export function MarketingCTA({ title, subtitle, primaryLabel, onPrimary, secondaryLabel, onSecondary }: { title: string; subtitle: string; primaryLabel: string; onPrimary: () => void; secondaryLabel?: string; onSecondary?: () => void }) {
  return (
    <View style={{ backgroundColor: colors.accent, borderRadius: radius.xxl, padding: spacing.xl, marginTop: spacing.xl, marginBottom: spacing.lg, alignItems: 'center' }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', textAlign: 'center' }}>{title}</Text>
      <Text style={{ color: colors.accentFixed, fontSize: 15, marginTop: 6, textAlign: 'center' }}>{subtitle}</Text>
      <Row gap={8} style={{ marginTop: 16 }}>
        <Button title={primaryLabel} onPress={onPrimary} variant="secondary" style={{ backgroundColor: '#fff' }} />
        {secondaryLabel && onSecondary ? <Button title={secondaryLabel} onPress={onSecondary} variant="ghost" style={{ backgroundColor: 'transparent' }} /> : null}
      </Row>
    </View>
  );
}

export function MarketingFooter() {
  return (
    <View style={{ padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card, marginTop: spacing.xl, borderRadius: radius.lg, gap: 6 }}>
      <Logo size="sm" />
      <Text style={[typography.tiny, { marginTop: 6 }]}>The global marketplace for trusted local work.</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
        <Pill label="English" />
        <Pill label="USD" tone="accent" />
        <Pill label="v1.0" tone="neutral" />
      </View>
      <Text style={[typography.tiny, { marginTop: 8 }]}>© 2026 TaskSphere. All rights reserved.</Text>
    </View>
  );
}
