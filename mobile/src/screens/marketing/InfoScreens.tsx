import React, { useEffect, useState } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Card, Logo, Row, Screen, Spacer } from '../../ui/components';
import { MarketingCTA, MarketingFeature, MarketingHero, MarketingSectionHeader } from '../../ui/Marketing';
import { colors, spacing, typography } from '../../ui/theme';
import { api, API_BASE } from '../../lib/api';
import { RootStackParamList } from '../../App';

export function KYCScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <Screen>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <MarketingHero eyebrow="KYC" title="Know Who You’re Hiring." subtitle="TaskSphere verifies tasker identities so customers can hire with confidence." primaryLabel="Start verification" onPrimary={() => nav.navigate('Login')} secondaryLabel="Why KYC?" onSecondary={() => {}} />
      <MarketingSectionHeader eyebrow="How it works" title="Three simple steps" />
      <MarketingFeature icon="person-outline" title="1. Add personal details" body="We need your full legal name, date of birth and address to verify your identity." />
      <MarketingFeature icon="camera-outline" title="2. Upload a photo ID" body="Passport, driver’s licence or national ID. We support 200+ countries." />
      <MarketingFeature icon="fingerprint-outline" title="3. Take a selfie" body="Quick liveness check to confirm you’re really you. Usually under a minute." />
      <MarketingFeature icon="card-outline" title="Add a payout method" body="Link your bank, mobile money, or PayPal so we can pay you for completed tasks." />
      <MarketingCTA title="Most taskers finish in under 10 minutes." primaryLabel="Verify now" onPrimary={() => nav.navigate('Login')} />
    </Screen>
  );
}

export function AntiFraudScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <Screen>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <MarketingHero eyebrow="Anti-fraud" title="Zero tolerance for scams." subtitle="Our automated systems and trust team work 24/7 to keep TaskSphere safe." primaryLabel="Report fraud" onPrimary={() => nav.navigate('Report')} secondaryLabel="Read the safety guide" onSecondary={() => nav.navigate('SafetyGuide')} />
      <MarketingSectionHeader eyebrow="What we screen for" title="Patterns we look out for" />
      <MarketingFeature icon="warning-outline" title="Off-platform payments" body="Anyone asking you to pay outside TaskSphere is breaking our terms. Report it." />
      <MarketingFeature icon="cash-outline" title="Upfront fees" body="Taskers should never pay to ‘unlock’ jobs. Customers should never pay before work begins." />
      <MarketingFeature icon="help-circle-outline" title="Too good to be true" body="We monitor for suspicious offers and prices that don’t match the market." />
      <MarketingFeature icon="finger-print-outline" title="Fake reviews" body="Our models flag review rings, paid reviews and copied text. We remove them automatically." />
      <MarketingCTA title="See something suspicious?" primaryLabel="Report it now" onPrimary={() => nav.navigate('Report')} />
    </Screen>
  );
}

export function DisputesScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <Screen>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <MarketingHero eyebrow="Disputes" title="A fair process when things go wrong." subtitle="Open a dispute from any task and our Trust team will review and resolve it." primaryLabel="Open a dispute" onPrimary={() => nav.navigate('Report')} secondaryLabel="Read policies" onSecondary={() => nav.navigate('AntiFraud')} />
      <MarketingSectionHeader eyebrow="How it works" title="A simple four-step process" />
      <MarketingFeature icon="flag-outline" title="1. Open the dispute" body="From the task page, tap ‘Open a dispute’ and tell us what happened. Be as specific as you can." />
      <MarketingFeature icon="chatbubbles-outline" title="2. Both sides respond" body="The other party gets 72 hours to respond. We strongly recommend messaging in the app first." />
      <MarketingFeature icon="search-outline" title="3. Our team reviews" body="We look at messages, files, photos and receipts. Most disputes are resolved within 5 business days." />
      <MarketingFeature icon="checkmark-done-outline" title="4. We decide & act" body="We release, refund or split the funds based on the evidence. The decision is binding." />
      <MarketingCTA title="Need help right now?" primaryLabel="Contact support" onPrimary={() => nav.navigate('Help')} />
    </Screen>
  );
}

export function HowPaymentsWorkScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <Screen>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <MarketingHero eyebrow="Payments" title="Pay safely. Get paid reliably." subtitle="Every transaction on TaskSphere goes through Escrow, with multi-currency support and clear fees." primaryLabel="Open Payments" onPrimary={() => nav.navigate('Payments')} secondaryLabel="Talk to support" onSecondary={() => nav.navigate('Help')} />
      <MarketingSectionHeader eyebrow="For customers" title="How you pay" />
      <MarketingFeature icon="card-outline" title="Pay in your currency" body="We accept cards, bank transfers and mobile money in 60+ currencies." />
      <MarketingFeature icon="lock-closed-outline" title="Funds held in Escrow" body="Money only moves to the tasker once you approve the work. We never release without your sign-off." />
      <MarketingFeature icon="receipt-outline" title="Clear fees" body="Service fee is shown upfront, before you pay. No surprises." />
      <MarketingSectionHeader eyebrow="For taskers" title="How you get paid" />
      <MarketingFeature icon="wallet-outline" title="Paid on approval" body="Once the customer approves, funds hit your TaskSphere wallet within 24 hours." />
      <MarketingFeature icon="globe-outline" title="Withdraw anywhere" body="Bank transfer, mobile money, PayPal or Payoneer. We support 180+ countries." />
      <MarketingFeature icon="cash-outline" title="No hidden fees" body="A small withdrawal fee, clearly stated. No monthly fees, no minimum balance." />
      <MarketingCTA title="Try TaskSphere risk-free" primaryLabel="Post a task" onPrimary={() => nav.navigate('CreateTask')} />
    </Screen>
  );
}

export function SafetyGuideScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <Screen>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <MarketingHero eyebrow="Safety guide" title="Stay safe on TaskSphere." subtitle="A few simple habits go a long way. Here’s our top advice for customers and taskers." primaryLabel="Read full guide" onPrimary={() => nav.navigate('Help')} />
      <MarketingSectionHeader eyebrow="Do" title="Habits we recommend" />
      <MarketingFeature icon="chatbubbles-outline" title="Keep communication in-app" body="In-app messages are recorded and protected by our dispute process." />
      <MarketingFeature icon="id-card-outline" title="Check profiles & reviews" body="Hire taskers with completed KYC, real reviews and a clear track record." />
      <MarketingFeature icon="camera-outline" title="Document the work" body="Photos and short videos before, during and after the work protect both sides." />
      <MarketingSectionHeader eyebrow="Don’t" title="Habits to avoid" />
      <MarketingFeature icon="close-circle-outline" title="Don’t pay outside TaskSphere" body="Anyone asking you to pay via cash, gift card or wire transfer is breaking our terms." />
      <MarketingFeature icon="alert-circle-outline" title="Don’t share personal details too early" body="Don’t share your phone number, address or financial details until you’re ready to proceed." />
      <MarketingCTA title="Something feel off?" primaryLabel="Report it" onPrimary={() => nav.navigate('Report')} />
    </Screen>
  );
}

export function CareersScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <Screen>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <MarketingHero eyebrow="Careers" title="Build the future of work with us." subtitle="TaskSphere is a remote-first team of 80+ people across 14 countries. We’re hiring across engineering, design, ops and trust & safety." primaryLabel="See open roles" onPrimary={() => nav.navigate('Contact')} />
      <MarketingSectionHeader eyebrow="Benefits" title="Why people stay" />
      <MarketingFeature icon="globe-outline" title="Remote by default" body="Work from anywhere. We support 14 timezones and sponsor visas in select countries." />
      <MarketingFeature icon="wallet-outline" title="Competitive pay" body="Top-of-market salaries benchmarked to San Francisco, with equity for every role." />
      <MarketingFeature icon="school-outline" title="Learn & grow" body="Annual learning budget, mentorship, and clear progression frameworks." />
      <MarketingCTA title="Don’t see your role?" primaryLabel="Reach out" onPrimary={() => nav.navigate('Contact')} />
    </Screen>
  );
}

export function PressScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <Screen>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <MarketingHero eyebrow="Press" title="For journalists and partners." subtitle="Logos, fact sheets, executive bios, and the latest TaskSphere news." primaryLabel="Email press team" onPrimary={() => nav.navigate('Contact')} secondaryLabel="About TaskSphere" onSecondary={() => nav.navigate('About')} />
      <MarketingSectionHeader eyebrow="Quick facts" title="TaskSphere at a glance" />
      <Card><Text style={typography.body}>Founded in 2024. Headquartered in London, with hubs in Lagos, Berlin and Toronto. Backed by leading venture firms and angel investors.</Text></Card>
      <MarketingCTA title="Need a quote or interview?" primaryLabel="Contact us" onPrimary={() => nav.navigate('Contact')} />
    </Screen>
  );
}

export function BlogScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <Screen>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <MarketingHero eyebrow="Blog" title="News, guides & stories." subtitle="How customers and taskers are using TaskSphere to do more, every day." primaryLabel="Read latest" onPrimary={() => nav.navigate('Help')} />
      <MarketingSectionHeader eyebrow="Featured" title="From the TaskSphere blog" />
      <Card><Text style={typography.h3}>Welcome to the TaskSphere blog</Text><Text style={[typography.small, { marginTop: 4 }]}>We’re just getting started. Check back soon for customer stories, tasker spotlights and product updates.</Text></Card>
      <Card><Text style={typography.h3}>How Escrow works</Text><Text style={[typography.small, { marginTop: 4 }]}>A simple, plain-English guide to how money moves on TaskSphere — and why it protects both sides.</Text></Card>
      <Card><Text style={typography.h3}>Tips for first-time taskers</Text><Text style={[typography.small, { marginTop: 4 }]}>How to build a profile, write a great proposal, and land your first job on TaskSphere.</Text></Card>
    </Screen>
  );
}

export function HelpScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <Screen>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <MarketingHero eyebrow="Help" title="How can we help?" subtitle="Search the help center or get in touch with our 24/7 support team." primaryLabel="Contact support" onPrimary={() => nav.navigate('Contact')} secondaryLabel="Report an issue" onSecondary={() => nav.navigate('Report')} />
      <MarketingSectionHeader eyebrow="Popular topics" title="Quick answers" />
      <MarketingFeature icon="card-outline" title="How do I get paid?" body="Funds land in your TaskSphere wallet on customer approval. Withdraw to bank, mobile money or PayPal." />
      <MarketingFeature icon="shield-checkmark-outline" title="How does Escrow work?" body="Customer funds sit in segregated Escrow. We only release to the tasker on approval or dispute resolution." />
      <MarketingFeature icon="flag-outline" title="How do I open a dispute?" body="From the task page, tap ‘Open a dispute’ and tell us what happened. Our team usually responds within 24 hours." />
      <MarketingFeature icon="close-circle-outline" title="How do I cancel a task?" body="Tasks can be cancelled before work starts without a fee. After that, the customer decides whether to release funds." />
      <MarketingCTA title="Still stuck?" primaryLabel="Contact us" onPrimary={() => nav.navigate('Contact')} />
    </Screen>
  );
}

export function ContactScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <Screen>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <MarketingHero eyebrow="Contact" title="We’d love to hear from you." subtitle="Sales, support, press, partnerships — pick a team and we’ll route you to the right person." primaryLabel="Email sales" onPrimary={() => nav.navigate('Help')} secondaryLabel="Visit help center" onSecondary={() => nav.navigate('Help')} />
      <MarketingSectionHeader eyebrow="Teams" title="Who do you need?" />
      <MarketingFeature icon="briefcase-outline" title="Sales" body="Volume customers, agencies, enterprise — talk to our team about Pro and Business plans." />
      <MarketingFeature icon="help-circle-outline" title="Support" body="Account, payments, tasks, disputes — we’re here 24/7." />
      <MarketingFeature icon="megaphone-outline" title="Press" body="Logos, fact sheets, executive bios, interviews." />
      <MarketingFeature icon="shield-checkmark-outline" title="Trust & safety" body="Report fraud, scams, or anything that doesn’t feel right." />
      <MarketingCTA title="Prefer email?" subtitle="Reach us at support@tasksphere.app — we usually reply within a few hours." primaryLabel="Open help center" onPrimary={() => nav.navigate('Help')} />
    </Screen>
  );
}

export function ReportScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <Screen>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <MarketingHero eyebrow="Report" title="See something off? Tell us." subtitle="We review every report. Most are responded to within 24 hours." primaryLabel="Contact support" onPrimary={() => nav.navigate('Contact')} secondaryLabel="Read the safety guide" onSecondary={() => nav.navigate('SafetyGuide')} />
      <MarketingSectionHeader eyebrow="What to report" title="We take all of these seriously" />
      <MarketingFeature icon="warning-outline" title="Suspicious messages" body="Anyone asking for off-platform payments, gift cards, or financial details." />
      <MarketingFeature icon="person-outline" title="Fake profiles" body="Stolen photos, fake reviews, or misrepresentation of skills or identity." />
      <MarketingFeature icon="document-outline" title="Bad tasks" body="Tasks that are illegal, unsafe, or break our community guidelines." />
      <MarketingFeature icon="cash-outline" title="Fraud or scams" body="If you’ve been asked to pay a ‘release fee’, ‘verification fee’ or similar." />
      <MarketingCTA title="Need urgent help?" primaryLabel="Contact support" onPrimary={() => nav.navigate('Contact')} />
    </Screen>
  );
}

export function CookiesScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <Screen>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <MarketingHero eyebrow="Cookies" title="A simple, honest cookie policy." subtitle="We use cookies to keep you signed in, remember your preferences, and make TaskSphere work." primaryLabel="Read privacy policy" onPrimary={() => nav.navigate('Privacy')} secondaryLabel="About TaskSphere" onSecondary={() => nav.navigate('About')} />
      <MarketingSectionHeader eyebrow="What we use" title="Cookies on TaskSphere" />
      <Card><Text style={typography.h3}>Strictly necessary</Text><Text style={[typography.small, { marginTop: 4 }]}>Keep you signed in, protect against fraud, route traffic. These can’t be switched off.</Text></Card>
      <Card><Text style={typography.h3}>Preferences</Text><Text style={[typography.small, { marginTop: 4 }]}>Remember your language, currency, and notification settings.</Text></Card>
      <Card><Text style={typography.h3}>Analytics</Text><Text style={[typography.small, { marginTop: 4 }]}>Help us understand which features are most useful. Aggregated and anonymised.</Text></Card>
    </Screen>
  );
}

export function PrivacyScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <Screen>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <MarketingHero eyebrow="Privacy" title="Your data, your rules." subtitle="A clear, plain-English summary of what we collect, why, and how you can control it." primaryLabel="Read terms" onPrimary={() => nav.navigate('Terms')} secondaryLabel="Cookies" onSecondary={() => nav.navigate('Cookies')} />
      <MarketingSectionHeader eyebrow="What we collect" title="The short version" />
      <Card><Text style={typography.h3}>Account data</Text><Text style={[typography.small, { marginTop: 4 }]}>Name, email, phone, country, currency. Used to create and protect your account.</Text></Card>
      <Card><Text style={typography.h3}>KYC data</Text><Text style={[typography.small, { marginTop: 4 }]}>Government ID and selfie for verification. Encrypted at rest. Never sold.</Text></Card>
      <Card><Text style={typography.h3}>Usage data</Text><Text style={[typography.small, { marginTop: 4 }]}>Pages visited, features used, device and browser. Used to improve the product.</Text></Card>
      <MarketingCTA title="Questions?" primaryLabel="Contact us" onPrimary={() => nav.navigate('Contact')} />
    </Screen>
  );
}

export function TermsScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <Screen>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <MarketingHero eyebrow="Terms" title="The rules of the road." subtitle="Plain-English terms of service for using TaskSphere. Last updated 1 January 2026." primaryLabel="Read privacy" onPrimary={() => nav.navigate('Privacy')} secondaryLabel="About" onSecondary={() => nav.navigate('About')} />
      <MarketingSectionHeader eyebrow="In short" title="You agree to:" />
      <Card><Text style={typography.h3}>Be honest</Text><Text style={[typography.small, { marginTop: 4 }]}>Provide accurate information about yourself, your tasks, and your skills.</Text></Card>
      <Card><Text style={typography.h3}>Stay safe</Text><Text style={[typography.small, { marginTop: 4 }]}>Follow our community guidelines, and don’t ask for or offer off-platform payments.</Text></Card>
      <Card><Text style={typography.h3}>Respect others</Text><Text style={[typography.small, { marginTop: 4 }]}>No harassment, hate speech, or discrimination. We have zero tolerance.</Text></Card>
      <MarketingCTA title="Got a question?" primaryLabel="Contact us" onPrimary={() => nav.navigate('Contact')} />
    </Screen>
  );
}

