import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, TextInput } from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, EmptyState, Logo, Row, Screen, Spacer, StarRating } from '../../ui/components';
import { colors, radius, spacing, typography } from '../../ui/theme';
import { api } from '../../lib/api';
import { RootStackParamList } from '../../App';

export default function TaskersScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const [q, setQ] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { const r: any = await api.get(`/api/users?role=TASKER&q=${encodeURIComponent(q)}&pageSize=20`); setItems(r.users || r.items || []); } catch {}
  }, [q]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <Screen refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }}>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <Text style={typography.h1}>Find taskers</Text>
      <Text style={[typography.small, { marginTop: 2, marginBottom: spacing.lg }]}>Verified taskers ready to work.</Text>

      <Row gap={8} style={{ marginBottom: spacing.md }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surfaceLowest, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10 }}>
          <Ionicons name="search" size={18} color={colors.subtle} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search by name or skill" placeholderTextColor={colors.subtle} style={{ flex: 1, color: colors.text }} onSubmitEditing={load} returnKeyType="search" />
        </View>
        <Pressable onPress={load} style={({ pressed }) => ({ backgroundColor: colors.accent, paddingHorizontal: 14, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.85 : 1 })}>
          <Ionicons name="search" size={18} color="#fff" />
        </Pressable>
      </Row>

      {items.length === 0 ? (
        <EmptyState icon="people-outline" title="No taskers found" body="Try a different search." />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(t) => t.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <Pressable onPress={() => nav.navigate('PublicTasker', { id: item.id })} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
              <View style={{ backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Avatar name={item.displayName || item.email} size={48} src={item.avatarUrl} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ ...typography.body, fontWeight: '700' }} numberOfLines={1}>{item.displayName || item.email}</Text>
                  {item.taskerProfile?.headline ? <Text style={{ ...typography.small, marginTop: 2 }} numberOfLines={1}>{item.taskerProfile.headline}</Text> : null}
                  {item.taskerProfile?.ratingAvg ? (
                    <Row gap={6} style={{ marginTop: 4 }}>
                      <StarRating value={item.taskerProfile.ratingAvg} />
                      <Text style={{ ...typography.tiny }}>{item.taskerProfile.ratingAvg.toFixed(1)} ({item.taskerProfile.ratingCount || 0})</Text>
                    </Row>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.subtle} />
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

