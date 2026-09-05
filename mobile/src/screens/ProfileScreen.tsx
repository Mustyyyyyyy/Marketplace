import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Button, Card, EmptyState, ErrorText, Greeting, Logo, Pill, Row, Screen, Spacer, StarRating } from '../ui/components';
import { colors, spacing, typography } from '../ui/theme';
import { api } from '../lib/api';
import { authStore, logout } from '../lib/auth';
import { RootStackParamList } from '../App';

export default function ProfileScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const auth = authStore.use();
  const [profile, setProfile] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setErr(null);
    try { const r: any = await api.get('/api/profile/me'); setProfile(r.profile); } catch (e: any) { setErr(e.message); }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const rating = profile?.taskerProfile?.ratingAvg || profile?.customerProfile?.ratingAvg || 0;
  const reviews = profile?.taskerProfile?.ratingCount || profile?.customerProfile?.ratingCount || 0;
  const isTasker = auth.user?.role === 'TASKER';

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <Row style={{ marginBottom: spacing.md }}>
        <Logo size="md" />
      </Row>

      <Card>
        <Row>
          <Avatar name={auth.user?.displayName || auth.user?.email} size={56} src={auth.user?.avatarUrl} />
          <View style={{ flex: 1 }}>
            <Text style={typography.h2}>{auth.user?.displayName || 'Anonymous'}</Text>
            <Text style={typography.small}>{auth.user?.email}</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              <Pill label={auth.user?.role || 'CUSTOMER'} tone="accent" />
              <Pill label={auth.user?.country || 'GB'} />
              {auth.user?.emailVerified ? <Pill label="Email verified" tone="success" /> : <Pill label="Email unverified" tone="warning" />}
            </View>
          </View>
        </Row>
      </Card>

      {(rating > 0 || reviews > 0) ? (
        <Card>
          <Text style={typography.h3}>Reputation</Text>
          <Spacer h={8} />
          <Row>
            <View style={{ flex: 1 }}>
              <Text style={[typography.h1, { fontSize: 32 }]}>{rating.toFixed(1)}</Text>
              <StarRating value={rating} />
              <Text style={[typography.tiny, { marginTop: 2 }]}>{reviews} {reviews === 1 ? 'review' : 'reviews'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              {isTasker && profile?.taskerProfile ? (
                <>
                  <Pill label={`KYC: ${profile.taskerProfile.kycStatus || 'NOT_STARTED'}`} tone={profile.taskerProfile.kycStatus === 'APPROVED' || profile.taskerProfile.kycStatus === 'VERIFIED' ? 'success' : 'warning'} />
                  {profile.taskerProfile.completedCount ? <Pill label={`${profile.taskerProfile.completedCount} completed`} tone="success" /> : null}
                </>
              ) : null}
            </View>
          </Row>
        </Card>
      ) : null}

      <Text style={[typography.h2, { marginTop: spacing.md, marginBottom: spacing.sm }]}>Account</Text>
      <View style={{ gap: 8 }}>
        <ActionRow icon="create-outline" label="Edit profile" onPress={() => nav.navigate('EditProfile')} />
        {isTasker ? <ActionRow icon="settings-outline" label="Tasker settings" onPress={() => nav.navigate('TaskerExtras')} /> : null}
        <ActionRow icon="briefcase-outline" label={isTasker ? 'My jobs' : 'My tasks'} onPress={() => nav.navigate(isTasker ? 'MyJobs' : 'MyTasks')} />
        {isTasker ? <ActionRow icon="search-outline" label="Find tasks" onPress={() => nav.navigate('FindTasks')} /> : <ActionRow icon="search-outline" label="Find taskers" onPress={() => nav.navigate('Taskers')} />}
        <ActionRow icon="people-outline" label={isTasker ? 'Offers I sent' : 'Browse marketplace'} onPress={() => nav.navigate(isTasker ? 'Offers' : 'Browse')} />
        <ActionRow icon="star-outline" label="Reviews & reputation" onPress={() => nav.navigate('Reviews')} />
        {isTasker ? <ActionRow icon="calendar-outline" label="Availability" onPress={() => nav.navigate('Availability')} /> : null}
        <ActionRow icon="notifications-outline" label="Notifications" onPress={() => nav.navigate('Notifications')} />
        <ActionRow icon="card-outline" label="Payments" onPress={() => nav.navigate('Payments')} />
        <ActionRow icon="settings-outline" label="Settings" onPress={() => nav.navigate('Settings')} />
        <ActionRow icon="help-circle-outline" label="Help & support" onPress={() => nav.navigate('Help')} />
        <ActionRow icon="shield-checkmark-outline" label="Trust & safety" onPress={() => nav.navigate('TrustSafety')} />
        <ActionRow icon="information-circle-outline" label="About" onPress={() => nav.navigate('About')} />
      </View>

      <Spacer h={16} />
      <Button title="Sign out" variant="danger" onPress={() => Alert.alert('Sign out', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Sign out', style: 'destructive', onPress: () => logout() }])} />
    </Screen>
  );
}

function ActionRow({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pressed ? 0.7 : 1 })}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.accentFixed, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <Text style={{ flex: 1, ...typography.body, fontWeight: '600' }}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.subtle} />
    </Pressable>
  );
}
