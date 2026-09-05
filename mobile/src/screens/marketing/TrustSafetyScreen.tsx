import React from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Logo, Row, Screen } from '../../ui/components';
import { MarketingCTA, MarketingFeature, MarketingHero, MarketingSectionHeader, MarketingStatsRow } from '../../ui/Marketing';
import { colors, spacing, typography } from '../../ui/theme';
import { fetchPublicStats, PublicStats } from '../../lib/marketplace';
import { useState, useEffect } from 'react';
import { RootStackParamList } from '../../App';

export function TrustSafetyScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const [stats, setStats] = useState<PublicStats>({ tasksTotal: 0, completedTasks: 0, taskersTotal: 0, categoriesTotal: 0, openTasks: 0, ratingAvg: 0, reviewCount: 0 });
  useEffect(() => { fetchPublicStats().then(setStats); }, []);

  return (
    <Screen>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <MarketingHero
        eyebrow="Trust & safety"
        title="Built so you can hire — and work — with confidence."
        subtitle="Every task on TaskSphere is protected by Escrow, identity verification, two-way reviews, and a 24/7 dispute team."
        primaryLabel="Learn about Escrow"
        onPrimary={() => nav.navigate('HowPaymentsWork')}
        secondaryLabel="Read policies"
        onSecondary={() => nav.navigate('AntiFraud')}
      />
      <MarketingSectionHeader eyebrow="Our protections" title="How we keep TaskSphere safe" />
      <MarketingFeature icon="shield-checkmark-outline" title="Escrow on every task" body="Customer funds are held in segregated Escrow. Taskers only get paid after the work is approved." />
      <MarketingFeature icon="id-card-outline" title="Identity verification" body="Taskers complete KYC before being matched with high-value tasks. Customers can also verify for an extra trust signal." />
      <MarketingFeature icon="ribbon-outline" title="Two-way reviews" body="Only real customers and taskers can leave reviews. We monitor patterns and remove fake ones." />
      <MarketingFeature icon="lock-closed-outline" title="Secure messaging" body="Keep your personal contact details private. Communicate safely inside the app." />
      <MarketingFeature icon="alert-circle-outline" title="24/7 dispute support" body="Open a dispute from any task page. Our team reviews and resolves in line with our policies." />
      <MarketingFeature icon="flag-outline" title="Anti-fraud" body="We screen tasks, monitor for scams, and back it all up with a zero-tolerance refund policy." />
      <MarketingCTA title="See something off?" subtitle="Report any task, user or message and we’ll investigate within 24 hours." primaryLabel="Report an issue" onPrimary={() => nav.navigate('Report')} secondaryLabel="Read the safety guide" onSecondary={() => nav.navigate('SafetyGuide')} />
    </Screen>
  );
}

