import React from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Card, Logo, Row, Screen, Spacer } from '../../ui/components';
import { MarketingCTA, MarketingFeature, MarketingHero, MarketingSectionHeader } from '../../ui/Marketing';
import { colors, spacing, typography } from '../../ui/theme';
import { RootStackParamList } from '../../App';

export function BecomeATaskerScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <Screen>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <MarketingHero
        eyebrow="Become a tasker"
        title="Turn your skills into income."
        subtitle="Join thousands of taskers earning on TaskSphere. You set your own schedule, your own prices, and choose the work you do."
        primaryLabel="Sign up as a tasker"
        onPrimary={() => nav.navigate('Login')}
        secondaryLabel="See open tasks"
        onSecondary={() => nav.navigate('Tabs')}
      />
      <MarketingSectionHeader eyebrow="How to get started" title="Three quick steps" />
      <MarketingFeature icon="person-add-outline" title="1. Create your account" body="Sign up free, choose ‘I want to earn’, and add a few basic details." />
      <MarketingFeature icon="shield-checkmark-outline" title="2. Complete KYC" body="Verify your identity and skills so customers can hire you with confidence." />
      <MarketingFeature icon="briefcase-outline" title="3. Pick up work" body="Browse open tasks, send offers, get hired, and get paid through Escrow." />
      <MarketingSectionHeader eyebrow="What you’ll earn" title="Top categories on TaskSphere" />
      <Card>
        <Row>
          <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: colors.accentFixed, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.accent, fontSize: 18 }}>✦</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={typography.h3}>Premium categories</Text>
            <Text style={[typography.small, { marginTop: 4 }]}>Web development, design, video editing, business consulting, professional writing and translation command higher rates.</Text>
          </View>
        </Row>
      </Card>
      <Card>
        <Row>
          <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: colors.accentFixed, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.accent, fontSize: 18 }}>$</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={typography.h3}>Quick wins</Text>
            <Text style={[typography.small, { marginTop: 4 }]}>Errands, delivery, small home repairs, cleaning, tutoring and virtual assistant work are popular and fast-moving.</Text>
          </View>
        </Row>
      </Card>
      <MarketingCTA title="Ready to start?" subtitle="Create a free account and complete your profile today." primaryLabel="Sign up" onPrimary={() => nav.navigate('Login')} secondaryLabel="Learn more" onSecondary={() => nav.navigate('HowItWorks')} />
    </Screen>
  );
}

