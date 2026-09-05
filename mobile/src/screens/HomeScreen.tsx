import React, { useEffect, useState, useCallback } from 'react';
import { Text, View, Pressable, ScrollView, RefreshControl } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Greeting, Logo, Pill, Row, Screen, Spacer, StatCard, TrustCallout, EmptyState } from '../ui/components';
import { colors, spacing, typography } from '../ui/theme';
import { api } from '../lib/api';
import { authStore, logout } from '../lib/auth';
import { fetchCategories, fetchPublicStats, PublicStats } from '../lib/marketplace';
import { RootStackParamList } from '../App';

export default function HomeScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const auth = authStore.use();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<PublicStats>({ tasksTotal: 0, completedTasks: 0, taskersTotal: 0, categoriesTotal: 0, openTasks: 0, ratingAvg: 0, reviewCount: 0 });
  const [categories, setCategories] = useState<any[]>([]);
  const [unread, setUnread] = useState<number>(0);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);

  const load = useCallback(async () => {
    const [s, cats] = await Promise.all([fetchPublicStats(), fetchCategories()]);
    setStats(s); setCategories(cats.filter((c: any) => !cats.find((p: any) => p.id === c.parentId)).slice(0, 12));
    try {
      if (auth.user?.id) {
        const n: any = await api.get('/api/notifications').catch(() => ({ unread: 0 }));
        setUnread(n.unread || 0);
        if (auth.user.role === 'TASKER') {
          const r: any = await api.get(`/api/recommendations/taskers/${auth.user.id}/recommendations`).catch(() => ({ tasks: [] }));
          setRecommended(r.tasks || []);
        } else {
          const r: any = await api.get('/api/tasks?pageSize=6').catch(() => ({ items: [] }));
          setRecommended(r.items || []);
        }
        const t: any = await api.get('/api/tasks/mine').catch(() => ({ tasks: [] }));
        setMyTasks((t.tasks || []).slice(0, 4));
      }
    } catch {}
  }, [auth.user?.id, auth.user?.role]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
        <Logo size="md" />
        <Row gap={6}>
          <Pressable onPress={() => nav.navigate('Notifications')} style={({ pressed }) => ({ padding: 8, borderRadius: 10, backgroundColor: colors.surfaceLowest, borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.7 : 1 })}>
            <View>
              <Ionicons name="notifications-outline" size={20} color={colors.text} />
              {unread > 0 ? <View style={{ position: 'absolute', top: -2, right: -2, minWidth: 14, height: 14, borderRadius: 7, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>{unread > 9 ? '9+' : unread}</Text>
              </View> : null}
            </View>
          </Pressable>
          <Pressable onPress={() => nav.navigate('Profile')} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accentFixed, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.accent, fontWeight: '700' }}>{(auth.user?.displayName || auth.user?.email || '?')[0]?.toUpperCase()}</Text>
            </View>
          </Pressable>
        </Row>
      </View>

      <Greeting
        name={`Hi ${(auth.user?.displayName || auth.user?.email?.split('@')[0] || 'there').split(' ')[0]} 👋`}
        subtitle={`${stats.openTasks.toLocaleString()} open tasks · ${stats.taskersTotal.toLocaleString()} taskers on TaskSphere`}
        right={<Pill label={auth.user?.role || 'GUEST'} tone="accent" />}
      />

      {!auth.user?.emailVerified ? (
        <Card>
          <Row>
            <Ionicons name="mail-unread-outline" size={22} color={colors.warning} />
            <View style={{ flex: 1 }}>
              <Text style={typography.h3}>Verify your email</Text>
              <Text style={[typography.small, { marginTop: 2 }]}>Get full access and priority matching.</Text>
            </View>
          </Row>
          <View style={{ height: spacing.md }} />
          <Button title="Verify now" onPress={() => nav.navigate('VerifyEmail', {})} icon="shield-checkmark-outline" />
        </Card>
      ) : null}

      {auth.user?.role === 'CUSTOMER' ? (
        <Card>
          <Row>
            <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: colors.accentFixed, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="add-circle" size={22} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={typography.h3}>Post a new task</Text>
              <Text style={[typography.small, { marginTop: 2 }]}>Get offers from verified taskers in minutes.</Text>
            </View>
          </Row>
          <View style={{ height: spacing.md }} />
          <Button title="Create task" onPress={() => nav.navigate('CreateTask')} icon="add" />
        </Card>
      ) : null}

      <SectionHeader eyebrow="Browse" title="Categories" right={<Text style={{ color: colors.accent, fontWeight: '600' }} onPress={() => nav.navigate('Browse')}>See all</Text>} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {categories.slice(0, 8).map((c) => (
          <Pressable key={c.id} onPress={() => nav.navigate('Browse', { categoryId: c.id })} style={({ pressed }) => ({ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.surfaceLowest, borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.7 : 1 })}>
            <Text style={{ ...typography.small, fontWeight: '600' }}>{c.name}</Text>
          </Pressable>
        ))}
      </View>

      <Spacer h={20} />
      <SectionHeader eyebrow="Marketplace" title={auth.user?.role === 'TASKER' ? 'Recommended for you' : 'Recently posted'} right={<Text style={{ color: colors.accent, fontWeight: '600' }} onPress={() => nav.navigate('Browse')}>See all</Text>} />
      {recommended.length === 0 ? (
        <EmptyState icon="briefcase-outline" title="No tasks yet" body="Check back soon — new tasks are posted every day." />
      ) : (
        <View style={{ gap: 8 }}>
          {recommended.slice(0, 4).map((t) => (
            <Pressable key={t.id || t.taskId} onPress={() => nav.navigate('TaskDetail', { id: t.id || t.taskId })}>
              <Card>
                <Text style={typography.h3} numberOfLines={2}>{t.title}</Text>
                <Text style={[typography.small, { marginTop: 4 }]} numberOfLines={2}>{t.description}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  <Pill label={`${t.currency} ${Number(t.budgetAmount || 0).toLocaleString()}`} tone="brand" />
                  {t.mode ? <Pill label={t.mode} /> : null}
                  {t.city ? <Pill label={t.city} /> : null}
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      )}

      <Spacer h={20} />
      <TrustCallout
        title="TaskSphere Escrow Protection"
        body="Every contract dollar is secured in segregated Escrow before work begins."
        primaryLabel="How escrow works"
        onPrimary={() => nav.navigate('Help')}
      />

      <Spacer h={20} />
      <SectionHeader eyebrow="More" title="Explore" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {[
          { icon: 'people-outline', label: 'Find taskers', route: 'Taskers' as const },
          { icon: 'briefcase-outline', label: 'My jobs', route: 'MyJobs' as const },
          { icon: 'star-outline', label: 'Reviews', route: 'Reviews' as const },
          { icon: 'calendar-outline', label: 'Availability', route: 'Availability' as const },
          { icon: 'information-circle-outline', label: 'How it works', route: 'HowItWorks' as const },
          { icon: 'shield-checkmark-outline', label: 'Trust & safety', route: 'TrustSafety' as const },
        ].map((item) => (
          <Pressable key={item.label} onPress={() => nav.navigate(item.route as any)} style={({ pressed }) => ({ flex: 1, minWidth: '46%', backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: spacing.md, opacity: pressed ? 0.7 : 1 })}>
            <Ionicons name={item.icon as any} size={20} color={colors.accent} />
            <Text style={{ ...typography.body, fontWeight: '600', marginTop: 6 }}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <Spacer h={20} />
      <Button title="Sign out" variant="danger" onPress={() => logout()} />
    </Screen>
  );
}

function SectionHeader({ eyebrow, title, right }: { eyebrow?: string; title: string; right?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: spacing.md, marginTop: spacing.lg }}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Text style={{ color: colors.accent, ...typography.tiny, textTransform: 'uppercase' }}>{eyebrow}</Text> : null}
        <Text style={[typography.h2, { marginTop: 2 }]}>{title}</Text>
      </View>
      {right}
    </View>
  );
}
