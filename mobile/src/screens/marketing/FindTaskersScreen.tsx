import React, { useState } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Card, Logo, Row, Screen, Spacer } from '../../ui/components';
import { MarketingCTA, MarketingFeature, MarketingHero, MarketingSectionHeader, MarketingStatsRow } from '../../ui/Marketing';
import { fetchPublicStats, PublicStats } from '../../lib/marketplace';
import { colors, spacing, typography } from '../../ui/theme';
import { RootStackParamList } from '../../App';

export function FindTaskersScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const [stats, setStats] = useState<PublicStats>({ tasksTotal: 0, completedTasks: 0, taskersTotal: 0, categoriesTotal: 0, openTasks: 0, ratingAvg: 0, reviewCount: 0 });
  React.useEffect(() => { fetchPublicStats().then(setStats); }, []);

  return (
    <Screen>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <MarketingHero
        eyebrow="Find a tasker"
        title="Hire {taskers} verified taskers worldwide."
        subtitle="From a quick fix to a long-running project, we have the right person for it."
        primaryLabel="Browse taskers"
        onPrimary={() => nav.navigate('Taskers')}
        secondaryLabel="Post a task"
        onSecondary={() => nav.navigate('CreateTask')}
      />
      <MarketingStatsRow stats={stats} />
      <MarketingSectionHeader eyebrow="Why hire on TaskSphere" title="A safer way to get work done" />
      <MarketingFeature icon="shield-checkmark-outline" title="Escrow protects every payment" body="Your money sits in segregated Escrow until the work is complete. You only release on approval." />
      <MarketingFeature icon="id-card-outline" title="Verified profiles" body="KYC, skills tests, and reference checks. See exactly who you’re hiring." />
      <MarketingFeature icon="star-outline" title="Real, verified reviews" body="Only customers who hired a tasker can leave a review — and only taskers who completed the job." />
      <MarketingFeature icon="chatbubbles-outline" title="In-app messaging" body="Discuss the details, share files and agree on terms without sharing your phone number." />
      <MarketingCTA title="Need a hand today?" subtitle="It takes 60 seconds to post a task and start receiving offers." primaryLabel="Post a task" onPrimary={() => nav.navigate('CreateTask')} />
    </Screen>
  );
}

