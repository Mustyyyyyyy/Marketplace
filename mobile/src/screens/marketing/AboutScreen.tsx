import React, { useState } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Button, Logo, Row, Screen, Spacer } from '../../ui/components';
import { colors, spacing, typography } from '../../ui/theme';
import { MarketingCTA, MarketingFeature, MarketingHero, MarketingSectionHeader, MarketingStatsRow } from '../../ui/Marketing';
import { fetchPublicStats, PublicStats } from '../../lib/marketplace';
import { RootStackParamList } from '../../App';

export function AboutScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const [stats, setStats] = useState<PublicStats>({ tasksTotal: 0, completedTasks: 0, taskersTotal: 0, categoriesTotal: 0, openTasks: 0, ratingAvg: 0, reviewCount: 0 });
  React.useEffect(() => { fetchPublicStats().then(setStats); }, []);

  return (
    <Screen>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <MarketingHero
        eyebrow="Our mission"
        title="Make work visible, trusted, and worth doing."
        subtitle="TaskSphere is a global marketplace where customers post tasks and verified taskers earn a living — safely, on their own terms."
        primaryLabel="Browse tasks"
        onPrimary={() => nav.navigate('Tabs')}
        secondaryLabel="Become a tasker"
        onSecondary={() => nav.navigate('BecomeATasker')}
      />
      <MarketingStatsRow stats={stats} />
      <MarketingSectionHeader eyebrow="Why TaskSphere" title="Built for trust" />
      <MarketingFeature icon="shield-checkmark-outline" title="Escrow protection" body="Funds are held securely until the work is delivered. Customers release on approval." />
      <MarketingFeature icon="id-card-outline" title="Verified taskers" body="KYC, background checks and skills verification give customers confidence." />
      <MarketingFeature icon="ribbon-outline" title="Real reviews" body="Honest, two-way ratings build reputation that travels across categories." />
      <MarketingFeature icon="globe-outline" title="Global by default" body="Local, remote and worldwide — work across borders, get paid in your currency." />
      <MarketingCTA title="Ready to get started?" subtitle="Join thousands of customers and taskers on TaskSphere today." primaryLabel="Post a task" onPrimary={() => nav.navigate('Tabs')} secondaryLabel="Sign in" onSecondary={() => nav.navigate('Login')} />
    </Screen>
  );
}

