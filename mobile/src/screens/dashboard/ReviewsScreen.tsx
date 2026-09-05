import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Card, EmptyState, Logo, Row, Screen, Spacer, StarRating } from '../../ui/components';
import { colors, spacing, typography } from '../../ui/theme';
import { api } from '../../lib/api';
import { authStore } from '../../lib/auth';

export default function ReviewsScreen() {
  const auth = authStore.use();
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState<{ ratingAvg: number; ratingCount: number }>({ ratingAvg: 0, ratingCount: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!auth.user?.id) return;
    try { const r: any = await api.get(`/api/reviews/users/${auth.user.id}`); setItems(r.reviews || []); setStats({ ratingAvg: r.ratingAvg || 0, ratingCount: r.ratingCount || 0 }); } catch {}
  }, [auth.user?.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const distribution = [0, 0, 0, 0, 0];
  for (const r of items) { if (r.rating >= 1 && r.rating <= 5) distribution[5 - r.rating]++; }

  return (
    <Screen refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }}>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <Text style={typography.h1}>Reviews & reputation</Text>
      <Text style={[typography.small, { marginTop: 2, marginBottom: spacing.lg }]}>What customers and taskers are saying about you.</Text>

      <Card>
        <Row>
          <View style={{ alignItems: 'center', width: 120 }}>
            <Text style={{ fontSize: 48, fontWeight: '800', color: colors.text }}>{stats.ratingAvg ? stats.ratingAvg.toFixed(1) : '—'}</Text>
            <StarRating value={stats.ratingAvg || 0} size={18} />
            <Text style={{ ...typography.tiny, marginTop: 4 }}>{stats.ratingCount} {stats.ratingCount === 1 ? 'review' : 'reviews'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            {[5, 4, 3, 2, 1].map((s, i) => {
              const c = distribution[5 - s] || 0;
              const pct = stats.ratingCount ? Math.round((c / stats.ratingCount) * 100) : 0;
              return (
                <Row key={s} gap={6} style={{ marginBottom: 4 }}>
                  <Text style={{ ...typography.tiny, width: 12 }}>{s}</Text>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.surfaceHigh, overflow: 'hidden' }}>
                    <View style={{ width: `${pct}%`, height: 8, backgroundColor: '#F59E0B' }} />
                  </View>
                  <Text style={{ ...typography.tiny, width: 28, textAlign: 'right' }}>{c}</Text>
                </Row>
              );
            })}
          </View>
        </Row>
      </Card>

      {items.length === 0 ? (
        <EmptyState icon="star-outline" title="No reviews yet" body="Complete a task to start building your reputation." />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(r) => r.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 12 }}>
              <Row>
                <Avatar name={item.reviewer?.displayName || item.reviewer?.email} size={36} />
                <View style={{ flex: 1 }}>
                  <Text style={{ ...typography.body, fontWeight: '600' }}>{item.reviewer?.displayName || item.reviewer?.email || 'Anonymous'}</Text>
                  <StarRating value={item.rating} />
                </View>
                <Text style={{ ...typography.tiny }}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </Row>
              {item.body ? <Text style={{ ...typography.body, marginTop: 8 }}>{item.body}</Text> : null}
            </View>
          )}
        />
      )}
    </Screen>
  );
}

