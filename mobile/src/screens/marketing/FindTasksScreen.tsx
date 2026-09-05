import React, { useState } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Card, EmptyState, Logo, Row, Screen, Spacer } from '../../ui/components';
import { colors, spacing, typography } from '../../ui/theme';
import { MarketingCTA, MarketingFeature, MarketingHero, MarketingSectionHeader, MarketingStatsRow } from '../../ui/Marketing';
import { fetchPublicStats, PublicStats } from '../../lib/marketplace';
import { RootStackParamList } from '../../App';

export function FindTasksScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const [stats, setStats] = useState<PublicStats>({ tasksTotal: 0, completedTasks: 0, taskersTotal: 0, categoriesTotal: 0, openTasks: 0, ratingAvg: 0, reviewCount: 0 });
  React.useEffect(() => { fetchPublicStats().then(setStats); }, []);

  return (
    <Screen>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <MarketingHero
        eyebrow="Find work"
        title="Browse {openTasks} open tasks near you."
        subtitle="From a 30-minute errand to a multi-day project — there’s work for every skill and every schedule."
        primaryLabel="See open tasks"
        onPrimary={() => nav.navigate('Tabs')}
        secondaryLabel="How payments work"
        onSecondary={() => nav.navigate('HowPaymentsWork')}
      />
      <MarketingStatsRow stats={stats} />
      <MarketingSectionHeader eyebrow="For taskers" title="Why pick up work on TaskSphere" />
      <MarketingFeature icon="cash-outline" title="Get paid reliably" body="Funds are escrowed before work begins. You get paid on completion, every time." />
      <MarketingFeature icon="ribbon-outline" title="Build a reputation" body="Every job adds to your public profile. Top-rated taskers get priority recommendations." />
      <MarketingFeature icon="school-outline" title="Level up your skills" body="Earn specialisations and unlock access to high-value categories." />
      <MarketingFeature icon="calendar-outline" title="Work when you want" body="Set your own hours, pick the tasks you like, and block out time you need." />
      <MarketingCTA title="Sign up as a tasker" subtitle="Verification takes a few minutes. Most taskers are live within 24 hours." primaryLabel="Create tasker account" onPrimary={() => nav.navigate('Login')} secondaryLabel="Browse first" onSecondary={() => nav.navigate('Tabs')} />
    </Screen>
  );
}

