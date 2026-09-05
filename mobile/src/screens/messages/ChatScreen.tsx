import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Pressable, Alert, Image, Linking } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { io, Socket } from 'socket.io-client';
import { Button, ErrorText } from '../../ui/components';
import { colors, radius, spacing, typography } from '../../ui/theme';
import { api, API_BASE } from '../../lib/api';
import { uploadFile } from '../../lib/upload';
import { authStore } from '../../lib/auth';
import { RootStackParamList } from '../../App';

export default function ChatScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const auth = authStore.use();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [conv, setConv] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const listRef = useRef<FlatList<any>>(null);

  useEffect(() => {
    api.get<any>(`/api/conversations/${route.params.conversationId}/messages`).then((r) => setMessages(r.messages || []));
    api.get<any>(`/api/conversations`).then((r) => {
      const c = (r.conversations || []).find((x: any) => x.id === route.params.conversationId);
      if (c) setConv(c);
    });
  }, [route.params.conversationId]);

  useEffect(() => {
    if (!auth.user) return;
    const baseUrl = API_BASE.replace(/\/api\/?$/, '');
    const s = io(baseUrl, { transports: ['websocket'] });
    s.on('connect', () => { s.emit('conversation:join', route.params.conversationId); });
    s.on('message:new', (m: any) => { if (m.conversationId === route.params.conversationId) setMessages((prev) => [...prev, m]); });
    s.on('connect_error', (e) => setErr(`Socket: ${e.message}`));
    socketRef.current = s;
    return () => { s.disconnect(); };
  }, [auth.user?.id, route.params.conversationId]);

  const send = async () => {
    const body = text.trim();
    if (!body) return;
    setSending(true);
    try {
      const m: any = await api.post(`/api/conversations/${route.params.conversationId}/messages`, { body });
      setMessages((prev) => [...prev, m]);
      setText('');
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    } catch (e: any) { setErr(e.message); }
    finally { setSending(false); }
  };

  const attach = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Alert.alert('Permission needed', 'Please allow access to your photos.'); return; }
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
      if (res.canceled || !res.assets?.[0]?.uri) return;
      setSending(true);
      const uploaded = await uploadFile(res.assets[0].uri, 'message-attachment', res.assets[0].fileName || undefined, res.assets[0].mimeType || undefined);
      const m: any = await api.post(`/api/conversations/${route.params.conversationId}/messages`, { body: ' ', mediaUrl: uploaded.url, mediaType: 'IMAGE' }).catch(async () => api.post(`/api/conversations/${route.params.conversationId}/messages`, { body: uploaded.url }));
      setMessages((prev) => [...prev, m]);
    } catch (e: any) { Alert.alert('Upload failed', e.message || 'Try again'); }
    finally { setSending(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {conv ? (
        <View style={{ backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, padding: 12 }}>
          <Text style={{ ...typography.small, fontWeight: '600' }} numberOfLines={1}>{conv.task?.title || 'Conversation'}</Text>
          <Text style={{ ...typography.tiny, marginTop: 2 }} numberOfLines={1}>{conv.task?.status?.replace('_', ' ')}</Text>
        </View>
      ) : null}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 8 }}
        ListEmptyComponent={<View style={{ padding: 40, alignItems: 'center' }}><ActivityIndicator color={colors.accent} /></View>}
        renderItem={({ item }) => {
          const mine = item.senderId === auth.user?.id;
          const isImage = item.mediaType === 'IMAGE' || (typeof item.body === 'string' && /^https?:\/\/.*\.(png|jpe?g|webp|gif)/i.test(item.body));
          return (
            <View style={{ alignItems: mine ? 'flex-end' : 'flex-start', marginVertical: 4 }}>
              <View style={{ maxWidth: '82%', padding: 12, borderRadius: radius.lg, backgroundColor: mine ? colors.accent : colors.card, borderWidth: mine ? 0 : 1, borderColor: colors.border }}>
                {isImage ? (
                  <Pressable onPress={() => Linking.openURL(item.body)}>
                    <Image source={{ uri: item.body }} style={{ width: 200, height: 200, borderRadius: 10 }} resizeMode="cover" />
                  </Pressable>
                ) : (
                  <Text style={{ color: mine ? colors.onAccent : colors.text, fontSize: 15 }}>{item.body}</Text>
                )}
                <Text style={{ color: mine ? 'rgba(255,255,255,.8)' : colors.subtle, fontSize: 10, marginTop: 4 }}>
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          );
        }}
      />
      <ErrorText message={err} />
      <View style={{ flexDirection: 'row', gap: 8, padding: spacing.md, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, alignItems: 'center' }}>
        <Pressable onPress={attach} disabled={sending} style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceLowest, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}>
          <Ionicons name="image-outline" size={20} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.input, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 12 }}>
          <Ionicons name="chatbubble-outline" size={16} color={colors.subtle} />
          <TextInput value={text} onChangeText={setText} placeholder="Type a message…" placeholderTextColor={colors.subtle} style={{ flex: 1, paddingVertical: 10, color: colors.text }} />
        </View>
        <Pressable onPress={send} disabled={sending || !text.trim()} style={({ pressed }) => ({ backgroundColor: text.trim() ? colors.accent : colors.outlineVariant, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.85 : 1 })}>
          {sending ? <ActivityIndicator color="#fff" /> : <Ionicons name="send" size={18} color="#fff" />}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

