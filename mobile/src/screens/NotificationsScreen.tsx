import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, EmptyState, Logo, Pill, Row, Screen, Spacer } from '../ui/components';
import { colors, spacing, typography } from '../ui/theme';
import { api } from '../lib/api';
import { RootStackParamList } from '../App';

export default function NotificationsScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r: any = await api.get('/api/notifications'); setItems(r.items || []); } catch {}
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const markRead = async (id: string) => {
    try { await api.post(`/api/notifications/${id}/read`); load(); } catch {}
  };

  const markAll = async () => { try { await api.post('/api/notifications/read-all'); load(); } catch {} };

  const filtered = items.filter((n) => filter === 'ALL' ? true : filter === 'UNREAD' ? !n.readAt : !!n.readAt);
  const unread = items.filter((n) => !n.readAt).length;

  return (
    <Screen refreshing={loading} onRefresh={load}>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <Row style={{ marginBottom: spacing.lg }}>
        <View style={{ flex: 1 }}>
          <Text style={typography.h1}>Notifications</Text>
          <Text style={[typography.small, { marginTop: 2 }]}>{unread} unread of {items.length}</Text>
        </View>
        {unread > 0 ? <Button title="Mark all" variant="secondary" onPress={markAll} icon="checkmark-done" /> : null}
      </Row>

      <View style={{ flexDirection: 'row', gap: 6, marginBottom: spacing.md }}>
        {(['ALL', 'UNREAD', 'READ'] as const).map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)} style={({ pressed }) => ({ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: filter === f ? colors.accentFixed : colors.card, borderWidth: 1, borderColor: filter === f ? colors.accentFixed : colors.border, opacity: pressed ? 0.7 : 1 })}>
            <Text style={{ color: filter === f ? colors.accent : colors.text, fontWeight: '600', fontSize: 12 }}>{f}</Text>
          </Pressable>
        ))}
      </View>

      {filtered.length === 0 ? (
        <EmptyState icon="notifications-off-outline" title="No notifications" body={filter === 'UNREAD' ? 'Nothing new right now.' : 'We’ll let you know when something important happens.'} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(n) => n.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <Pressable onPress={() => markRead(item.id)} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
              <View style={{ backgroundColor: item.readAt ? colors.card : colors.accentFixed, borderRadius: 12, borderWidth: 1, borderColor: item.readAt ? colors.border : colors.accent, padding: 12 }}>
                <Row style={{ marginBottom: 6 }}>
                  <Pill label={item.type.replace(/_/g, ' ')} tone={item.readAt ? 'default' : 'accent'} />
                  {!item.readAt ? <Pill label="New" tone="success" /> : null}
                  <View style={{ flex: 1 }} />
                  <Ionicons name={item.readAt ? 'mail-open-outline' : 'mail-unread-outline'} size={16} color={item.readAt ? colors.subtle : colors.accent} />
                </Row>
                <Text style={{ ...typography.body, fontWeight: '700' }}>{item.title}</Text>
                {item.body ? <Text style={{ ...typography.small, marginTop: 4 }}>{item.body}</Text> : null}
                <Text style={{ ...typography.tiny, marginTop: 6 }}>{new Date(item.createdAt).toLocaleString()}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}
