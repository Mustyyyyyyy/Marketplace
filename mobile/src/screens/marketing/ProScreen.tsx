import React from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Card, Logo, Row, Screen, Spacer } from '../../ui/components';
import { MarketingCTA, MarketingFeature, MarketingHero, MarketingSectionHeader } from '../../ui/Marketing';
import { colors, spacing, typography } from '../../ui/theme';
import { RootStackParamList } from '../../App';

export function ProScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();

  const plans = [
    { name: 'Starter', price: 'Free', desc: 'For occasional customers', features: ['Post up to 3 tasks/month', 'Standard Escrow', 'In-app messaging', 'Basic reviews'], cta: 'Get started', onPress: () => nav.navigate('Login'), accent: false },
    { name: 'Pro', price: '$19', desc: 'Per month · For active customers', features: ['Unlimited task posts', 'Priority matching', 'Premium 24/7 support', 'Advanced filters', 'Bulk invites & saved taskers'], cta: 'Try Pro free for 14 days', onPress: () => nav.navigate('Login'), accent: true },
    { name: 'Business', price: 'Custom', desc: 'For teams and agencies', features: ['Everything in Pro', 'Multi-user workspace', 'API access', 'Dedicated account manager', 'SLA & invoicing'], cta: 'Talk to sales', onPress: () => nav.navigate('Contact'), accent: false },
  ];

  return (
    <Screen>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <MarketingHero
        eyebrow="TaskSphere Pro"
        title="For power users and teams."
        subtitle="Get unlimited posts, priority matching, premium support and advanced tools — for one flat monthly fee."
        primaryLabel="Try Pro free"
        onPrimary={() => nav.navigate('Login')}
        secondaryLabel="Talk to sales"
        onSecondary={() => nav.navigate('Contact')}
      />
      <MarketingSectionHeader eyebrow="Pricing" title="Plans that scale with you" />
      {plans.map((p) => (
        <View key={p.name} style={{ backgroundColor: colors.card, borderRadius: 16, borderWidth: 2, borderColor: p.accent ? colors.accent : colors.border, padding: spacing.lg, marginBottom: spacing.md, position: 'relative' }}>
          {p.accent ? <View style={{ position: 'absolute', top: -10, right: 16, backgroundColor: colors.accent, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}><Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>MOST POPULAR</Text></View> : null}
          <Text style={[typography.h2]}>{p.name}</Text>
          <Text style={{ color: colors.accent, fontSize: 28, fontWeight: '800', marginTop: 4 }}>{p.price}{p.price !== 'Custom' && p.price !== 'Free' ? <Text style={{ fontSize: 14, color: colors.muted, fontWeight: '600' }}> /mo</Text> : null}</Text>
          <Text style={[typography.small, { marginTop: 4, marginBottom: spacing.md }]}>{p.desc}</Text>
          <View style={{ gap: 6, marginBottom: spacing.md }}>
            {p.features.map((f) => (
              <Row key={f} gap={8}>
                <Text style={{ color: colors.accent, fontSize: 16 }}>✓</Text>
                <Text style={{ ...typography.body, flex: 1 }}>{f}</Text>
              </Row>
            ))}
          </View>
          <View>
            <Card>
              <Row>
                <View style={{ flex: 1 }}><Text style={typography.h3}>{p.cta}</Text></View>
              </Row>
            </Card>
          </View>
        </View>
      ))}
      <MarketingCTA title="Need something different?" subtitle="We also offer Enterprise plans for large organisations. Get in touch and we’ll tailor a plan." primaryLabel="Contact sales" onPrimary={() => nav.navigate('Contact')} />
    </Screen>
  );
}

