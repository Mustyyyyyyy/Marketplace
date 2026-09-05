import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, ScrollView, Pressable, RefreshControl, TextInput } from 'react-native';
import { useNavigation, useRoute, NavigationProp, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, EmptyState, Logo, Pill, Row, Screen, Spacer } from '../ui/components';
import { colors, radius, spacing, typography } from '../ui/theme';
import { api } from '../lib/api';
import { fetchCategories, fetchPublicStats, PublicStats } from '../lib/marketplace';
import { RootStackParamList } from '../App';

type R = RouteProp<RootStackParamList, 'Browse'>;

export default function BrowseScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<R>();
  const initialQ = (route.params as any)?.q as string | undefined;
  const initialCat = (route.params as any)?.categoryId as string | undefined;
  const [q, setQ] = useState(initialQ || '');
  const [categoryId, setCategoryId] = useState(initialCat || '');
  const [city, setCity] = useState('');
  const [mode, setMode] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState<PublicStats>({ tasksTotal: 0, completedTasks: 0, taskersTotal: 0, categoriesTotal: 0, openTasks: 0, ratingAvg: 0, reviewCount: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (categoryId) params.set('categoryId', categoryId);
    if (city) params.set('city', city);
    if (mode) params.set('mode', mode);
    params.set('pageSize', '20');
    try { const j: any = await api.get(`/api/tasks?${params.toString()}`); setItems(j.items || []); setTotal(j.total || 0); } catch { setItems([]); setTotal(0); }
    const [s, cats] = await Promise.all([fetchPublicStats(), fetchCategories()]);
    setStats(s); setCategories(cats);
    setLoading(false);
  }, [q, categoryId, city, mode]);

  useEffect(() => { load(); }, [load]);

  return (
    <Screen refreshing={loading} onRefresh={load}>
      <Logo size="md" />
      <Spacer h={16} />
      <Text style={typography.h1}>Browse marketplace</Text>
      <Text style={[typography.small, { marginTop: 4 }]}>{stats.openTasks.toLocaleString()} open · {stats.taskersTotal.toLocaleString()} taskers · {stats.ratingAvg ? stats.ratingAvg.toFixed(1) + '★' : '—'} avg</Text>

      <Spacer h={16} />
      <Row gap={8}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surfaceLowest, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10 }}>
          <Ionicons name="search" size={18} color={colors.subtle} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search tasks" placeholderTextColor={colors.subtle} style={{ flex: 1, color: colors.text }} onSubmitEditing={load} returnKeyType="search" />
        </View>
        <Pressable onPress={load} style={({ pressed }) => ({ backgroundColor: colors.accent, paddingHorizontal: 14, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.85 : 1 })}>
          <Ionicons name="search" size={18} color="#fff" />
        </Pressable>
      </Row>

      <Spacer h={12} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surfaceLowest, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 6 }}>
          <Ionicons name="location-outline" size={16} color={colors.subtle} />
          <TextInput value={city} onChangeText={setCity} placeholder="City" placeholderTextColor={colors.subtle} style={{ flex: 1, color: colors.text }} onSubmitEditing={load} />
        </View>
        <Pressable onPress={() => setMode(mode === 'LOCAL' ? '' : 'LOCAL')} style={({ pressed }) => ({ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: mode === 'LOCAL' ? colors.accentFixed : colors.surfaceLowest, borderWidth: 1, borderColor: mode === 'LOCAL' ? colors.accentFixed : colors.border, opacity: pressed ? 0.7 : 1 })}>
          <Text style={{ color: mode === 'LOCAL' ? colors.accent : colors.text, fontWeight: '600', fontSize: 13 }}>Local</Text>
        </Pressable>
        <Pressable onPress={() => setMode(mode === 'REMOTE' ? '' : 'REMOTE')} style={({ pressed }) => ({ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: mode === 'REMOTE' ? colors.accentFixed : colors.surfaceLowest, borderWidth: 1, borderColor: mode === 'REMOTE' ? colors.accentFixed : colors.border, opacity: pressed ? 0.7 : 1 })}>
          <Text style={{ color: mode === 'REMOTE' ? colors.accent : colors.text, fontWeight: '600', fontSize: 13 }}>Remote</Text>
        </Pressable>
      </View>

      <Spacer h={12} />
      <Text style={{ ...typography.tiny, marginBottom: 6, textTransform: 'uppercase' }}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
        <Pressable onPress={() => { setCategoryId(''); load(); }} style={({ pressed }) => ({ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: !categoryId ? colors.accentFixed : colors.surfaceLowest, borderWidth: 1, borderColor: !categoryId ? colors.accentFixed : colors.border, opacity: pressed ? 0.7 : 1 })}>
          <Text style={{ color: !categoryId ? colors.accent : colors.text, fontWeight: '600', fontSize: 13 }}>All</Text>
        </Pressable>
        {categories.map((c) => (
          <Pressable key={c.id} onPress={() => { setCategoryId(c.id); load(); }} style={({ pressed }) => ({ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: categoryId === c.id ? colors.accentFixed : colors.surfaceLowest, borderWidth: 1, borderColor: categoryId === c.id ? colors.accentFixed : colors.border, opacity: pressed ? 0.7 : 1 })}>
            <Text style={{ color: categoryId === c.id ? colors.accent : colors.text, fontWeight: '600', fontSize: 13 }}>{c.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Spacer h={16} />
      <Text style={[typography.small, { marginBottom: 8 }]}>{loading ? 'Loading…' : `${total} ${total === 1 ? 'task' : 'tasks'} found`}</Text>
      {items.length === 0 && !loading ? (
        <EmptyState icon="search-outline" title="No matching tasks" body="Try a different search term or category." actionLabel="Post a task" onAction={() => nav.navigate('CreateTask')} />
      ) : (
        <View style={{ gap: 10 }}>
          {items.map((t) => (
            <Pressable key={t.id} onPress={() => nav.navigate('TaskDetail', { id: t.id })}>
              <Card>
                <Row>
                  <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: colors.accentFixed, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="briefcase" size={18} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={typography.h3} numberOfLines={2}>{t.title}</Text>
                    <Text style={[typography.small, { marginTop: 2 }]} numberOfLines={1}>{t.description}</Text>
                  </View>
                </Row>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  <Pill label={`${t.currency} ${Number(t.budgetAmount || 0).toLocaleString()}`} tone="brand" />
                  <Pill label={t.status} tone={t.status === 'COMPLETED' ? 'success' : t.status === 'CANCELLED' ? 'danger' : 'default'} />
                  {t.mode ? <Pill label={t.mode} /> : null}
                  {t.city ? <Pill label={t.city} /> : null}
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}
