import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, TextInput } from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Button, Card, EmptyState, Logo, Pill, Row, Screen, Spacer, StarRating } from '../../ui/components';
import { colors, radius, spacing, typography } from '../../ui/theme';
import { api } from '../../lib/api';
import { RootStackParamList } from '../../App';

export default function FindTasksScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const [q, setQ] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { const r: any = await api.get(`/api/tasks?pageSize=20&q=${encodeURIComponent(q)}`); setItems(r.items || []); } catch {}
  }, [q]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <Screen refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }}>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <Text style={typography.h1}>Find tasks</Text>
      <Text style={[typography.small, { marginTop: 2, marginBottom: spacing.lg }]}>Open tasks you can apply to right now.</Text>

      <Row gap={8} style={{ marginBottom: spacing.md }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surfaceLowest, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10 }}>
          <Ionicons name="search" size={18} color={colors.subtle} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search open tasks" placeholderTextColor={colors.subtle} style={{ flex: 1, color: colors.text }} onSubmitEditing={load} returnKeyType="search" />
        </View>
        <Pressable onPress={load} style={({ pressed }) => ({ backgroundColor: colors.accent, paddingHorizontal: 14, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.85 : 1 })}>
          <Ionicons name="search" size={18} color="#fff" />
        </Pressable>
      </Row>

      {items.length === 0 ? (
        <EmptyState icon="search-outline" title="No matching tasks" body="Try a different search term." />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(t) => t.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <Pressable onPress={() => nav.navigate('TaskDetail', { id: item.id })} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
              <Card>
                <Text style={typography.h3} numberOfLines={2}>{item.title}</Text>
                <Text style={[typography.small, { marginTop: 2 }]} numberOfLines={2}>{item.description}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  <Pill label={`${item.currency} ${Number(item.budgetAmount || 0).toLocaleString()}`} tone="brand" />
                  {item.mode ? <Pill label={item.mode} /> : null}
                  {item.city ? <Pill label={item.city} /> : null}
                </View>
              </Card>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

