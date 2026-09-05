import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, EmptyState, Logo, Pill, Row, Screen, Spacer } from '../../ui/components';
import { colors, spacing, typography } from '../../ui/theme';
import { api } from '../../lib/api';
import { authStore } from '../../lib/auth';
import { RootStackParamList } from '../../App';

export default function MessagesListScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const auth = authStore.use();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r: any = await api.get('/api/conversations'); setConversations(r.conversations || []); } catch {}
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const other = (c: any) => (c.userAId === auth.user?.id ? c.userB : c.userA);

  return (
    <Screen refreshing={loading} onRefresh={load}>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <Text style={typography.h1}>Messages</Text>
      <Text style={[typography.small, { marginTop: 2, marginBottom: spacing.lg }]}>{conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}</Text>

      {conversations.length === 0 ? (
        <EmptyState icon="chatbubble-outline" title="No conversations yet" body="When you message a tasker or customer it’ll appear here." />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(c) => c.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => {
            const last = (item.messages || [])[0];
            const o = other(item);
            return (
              <Pressable onPress={() => nav.navigate('Chat', { conversationId: item.id, title: item.task?.title || o?.displayName || 'Chat' })} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                <View style={{ backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Avatar name={o?.displayName || o?.email} size={44} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <Text style={{ ...typography.body, fontWeight: '700' }} numberOfLines={1}>{o?.displayName || o?.email || 'Conversation'}</Text>
                      {item.task ? <Pill label={item.task.status?.replace('_', ' ')} tone="accent" /> : null}
                    </View>
                    {item.task ? <Text style={{ ...typography.tiny, color: colors.accent, marginTop: 2 }} numberOfLines={1}>{item.task.title}</Text> : null}
                    {last ? <Text style={{ ...typography.small, marginTop: 2 }} numberOfLines={1}>{last.body}</Text> : <Text style={{ ...typography.small, marginTop: 2, color: colors.subtle }}>No messages yet</Text>}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.subtle} />
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </Screen>
  );
}

