import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, EmptyState, Pill, Row, Spacer } from '../../ui/components';
import { colors, spacing, typography } from '../../ui/theme';
import { api } from '../../lib/api';
import { RootStackParamList } from '../../App';

const STATUS_TONES: Record<string, any> = { COMPLETED: 'success', CANCELLED: 'danger', IN_PROGRESS: 'accent', PUBLISHED: 'brand', RECEIVING_OFFERS: 'warning' };

export default function MyTasksScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { const r: any = await api.get('/api/tasks/mine'); setItems(r.tasks || []); } catch {}
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filters = ['ALL', 'DRAFT', 'PUBLISHED', 'RECEIVING_OFFERS', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  const filtered = filter === 'ALL' ? items : items.filter((t) => t.status === filter);

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: 64 }}
      data={filtered}
      keyExtractor={(t) => t.id}
      onRefresh={onRefresh}
      refreshing={refreshing}
      ListHeaderComponent={
        <View style={{ marginBottom: spacing.md }}>
          <Row style={{ marginBottom: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Text style={typography.h1}>My tasks</Text>
              <Text style={[typography.small, { marginTop: 2 }]}>{items.length} total</Text>
            </View>
            <Button title="+ New" onPress={() => nav.navigate('CreateTask')} icon="add" />
          </Row>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {filters.map((f) => (
              <Pressable key={f} onPress={() => setFilter(f)} style={({ pressed }) => ({ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: filter === f ? colors.accentFixed : colors.card, borderWidth: 1, borderColor: filter === f ? colors.accentFixed : colors.border, opacity: pressed ? 0.7 : 1 })}>
                <Text style={{ color: filter === f ? colors.accent : colors.text, fontWeight: '600', fontSize: 12 }}>{f.replace('_', ' ')}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      }
      ListEmptyComponent={<EmptyState icon="briefcase-outline" title="No tasks yet" body="Post your first task to start receiving offers." actionLabel="Post a task" onAction={() => nav.navigate('CreateTask')} />}
      renderItem={({ item }) => (
        <Pressable onPress={() => nav.navigate('TaskDetail', { id: item.id })}>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: colors.accentFixed, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="briefcase" size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={typography.h3} numberOfLines={2}>{item.title}</Text>
                <Text style={[typography.small, { marginTop: 2 }]} numberOfLines={1}>{item.description}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              <Pill label={item.status.replace('_', ' ')} tone={STATUS_TONES[item.status] || 'default'} />
              <Pill label={`${item.currency} ${Number(item.budgetAmount || 0).toLocaleString()}`} tone="brand" />
              {item.city ? <Pill label={item.city} /> : null}
            </View>
          </Card>
        </Pressable>
      )}
    />
  );
}

