import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, EmptyState, Logo, Pill, Row, Screen, Spacer } from '../../ui/components';
import { colors, spacing, typography } from '../../ui/theme';
import { api } from '../../lib/api';
import { RootStackParamList } from '../../App';

const STATUS_TONES: Record<string, any> = { COMPLETED: 'success', CANCELLED: 'danger', IN_PROGRESS: 'accent', OFFER_SELECTED: 'warning', SUBMITTED: 'warning' };

export default function MyJobsScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { const r: any = await api.get('/api/tasks/hired'); setItems(r.tasks || []); } catch {}
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filters = ['ALL', 'ACCEPTED', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'CANCELLED'];
  const filtered = filter === 'ALL' ? items : items.filter((t) => t.status === filter);

  return (
    <Screen refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }}>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <Text style={typography.h1}>My jobs</Text>
      <Text style={[typography.small, { marginTop: 2, marginBottom: spacing.lg }]}>{items.length} total</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.md }}>
        {filters.map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)} style={({ pressed }) => ({ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: filter === f ? colors.accentFixed : colors.card, borderWidth: 1, borderColor: filter === f ? colors.accentFixed : colors.border, opacity: pressed ? 0.7 : 1 })}>
            <Text style={{ color: filter === f ? colors.accent : colors.text, fontWeight: '600', fontSize: 12 }}>{f.replace('_', ' ')}</Text>
          </Pressable>
        ))}
      </View>

      {filtered.length === 0 ? (
        <EmptyState icon="briefcase-outline" title="No jobs yet" body="Once a customer hires you, your jobs will appear here." actionLabel="Find tasks" onAction={() => nav.navigate('FindTasks')} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(t) => t.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <Pressable onPress={() => nav.navigate('TaskDetail', { id: item.id })} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
              <View style={{ backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 12 }}>
                <Row>
                  <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: colors.accentFixed, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="briefcase" size={18} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={typography.h3} numberOfLines={2}>{item.title}</Text>
                    <Text style={[typography.small, { marginTop: 2 }]} numberOfLines={1}>{item.description}</Text>
                  </View>
                </Row>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  <Pill label={item.status.replace('_', ' ')} tone={STATUS_TONES[item.status] || 'default'} />
                  <Pill label={`${item.currency} ${Number(item.budgetAmount || 0).toLocaleString()}`} tone="brand" />
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

