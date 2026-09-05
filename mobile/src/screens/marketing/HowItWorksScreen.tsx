import React, { useState } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Card, Logo, Row, Screen, Spacer } from '../../ui/components';
import { colors, spacing, typography } from '../../ui/theme';
import { MarketingCTA, MarketingFeature, MarketingHero, MarketingSectionHeader } from '../../ui/Marketing';
import { fetchPublicStats, PublicStats } from '../../lib/marketplace';
import { RootStackParamList } from '../../App';

export function HowItWorksScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const [stats, setStats] = useState<PublicStats>({ tasksTotal: 0, completedTasks: 0, taskersTotal: 0, categoriesTotal: 0, openTasks: 0, ratingAvg: 0, reviewCount: 0 });
  React.useEffect(() => { fetchPublicStats().then(setStats); }, []);

  return (
    <Screen>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <MarketingHero
        eyebrow="How it works"
        title="From ‘I need help’ to ‘done’ in four steps."
        subtitle="Whether you’re posting a task or picking up work, TaskSphere makes every step clear and safe."
        primaryLabel="Post a task"
        onPrimary={() => nav.navigate('Tabs')}
        secondaryLabel="Become a tasker"
        onSecondary={() => nav.navigate('BecomeATasker')}
      />
      <MarketingSectionHeader eyebrow="For customers" title="Get help in minutes" />
      <MarketingFeature icon="create-outline" title="1. Post a task" body="Describe what you need, set a budget, and choose a category. Most posts take under 60 seconds." />
      <MarketingFeature icon="paper-plane-outline" title="2. Receive offers" body="Verified taskers apply within minutes. Compare profiles, reviews and prices side-by-side." />
      <MarketingFeature icon="chatbubbles-outline" title="3. Chat & confirm" body="Message your chosen tasker, agree on the details, and pay securely into Escrow." />
      <MarketingFeature icon="checkmark-done-outline" title="4. Approve & release" body="Once the work is done, release the funds and leave a review. Funds are only released on your approval." />

      <MarketingSectionHeader eyebrow="For taskers" title="Earn on your terms" />
      <MarketingFeature icon="search-outline" title="1. Find work" body="Browse open tasks or get personalised recommendations based on your skills and location." />
      <MarketingFeature icon="document-text-outline" title="2. Send an offer" body="Send a price, a timeline and a short proposal. Customers choose the best fit." />
      <MarketingFeature icon="briefcase-outline" title="3. Do the work" body="Get hired, message the customer, and complete the task. Funds sit safely in Escrow." />
      <MarketingFeature icon="wallet-outline" title="4. Get paid" body="Once approved, withdraw to your bank, mobile money or PayPal. We pay out in your currency." />

      <MarketingCTA title="Try it for yourself" subtitle="It’s free to post a task, and free to sign up as a tasker." primaryLabel="Get started" onPrimary={() => nav.navigate('Login')} secondaryLabel="Browse tasks" onSecondary={() => nav.navigate('Tabs')} />
    </Screen>
  );
}

