import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Image, ActivityIndicator, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Button, Card, ErrorText, Pill, Row, Spacer, StarRating } from '../ui/components';
import { colors, spacing, typography } from '../ui/theme';
import { api } from '../lib/api';
import { RootStackParamList } from '../App';

export default function PublicTaskerScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'PublicTasker'>>();
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/api/public/taskers/${route.params.id}`).then(setData).catch((e: any) => setErr(e.message));
  }, [route.params.id]);

  if (err) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg, padding: spacing.lg }}><ErrorText message={err} /></View>;
  if (!data) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}><ActivityIndicator color={colors.accent} /></View>;

  const u = data.user; const tp = data.taskerProfile; const reviews = data.reviews || [];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 64 }}>
      <Card>
        <Row>
          <Avatar name={u.displayName || u.email} size={64} src={u.avatarUrl} />
          <View style={{ flex: 1 }}>
            <Text style={typography.h2}>{u.displayName || 'Tasker'}</Text>
            <Text style={typography.small}>{u.country}</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              <Pill label={`${(tp.ratingAvg || 0).toFixed(1)}★ (${tp.ratingCount || 0})`} tone="success" />
              <Pill label={`KYC: ${tp.kycStatus}`} tone={tp.kycStatus === 'APPROVED' ? 'success' : 'warning'} />
              {tp.completedCount ? <Pill label={`${tp.completedCount} completed`} tone="accent" /> : null}
            </View>
          </View>
        </Row>
        {tp.headline ? <Text style={[typography.body, { marginTop: spacing.md, fontWeight: '600' }]}>{tp.headline}</Text> : null}
        {tp.bio ? <Text style={[typography.small, { marginTop: 4 }]}>{tp.bio}</Text> : null}
      </Card>

      {tp.skills?.length ? (
        <Card>
          <Text style={typography.h3}>Skills</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm }}>
            {tp.skills.map((s: any) => <Pill key={s.skillId} label={s.skill.name} tone="brand" />)}
          </View>
        </Card>
      ) : null}

      {tp.portfolioItems?.length ? (
        <Card>
          <Text style={typography.h3}>Portfolio</Text>
          <Spacer h={8} />
          {tp.portfolioItems.map((p: any) => (
            <View key={p.id} style={{ paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.border }}>
              <Text style={typography.body}>• {p.title}</Text>
              {p.description ? <Text style={typography.small}>{p.description}</Text> : null}
            </View>
          ))}
        </Card>
      ) : null}

      {reviews.length ? (
        <Card>
          <Text style={typography.h3}>Reviews ({reviews.length})</Text>
          <Spacer h={8} />
          {reviews.map((r: any) => (
            <View key={r.id} style={{ paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
              <Row>
                <Avatar name={r.author?.displayName || r.author?.email} size={32} />
                <View style={{ flex: 1 }}>
                  <Text style={typography.body}>{r.author?.displayName || r.author?.email || 'Anonymous'}</Text>
                  <StarRating value={r.rating} />
                </View>
                <Text style={typography.tiny}>{new Date(r.createdAt).toLocaleDateString()}</Text>
              </Row>
              {r.body ? <Text style={[typography.body, { marginTop: 6 }]}>{r.body}</Text> : null}
            </View>
          ))}
        </Card>
      ) : null}

      <Button title="Message" onPress={async () => {
        try { const c: any = await api.post('/api/conversations/direct', { userId: u.id }); nav.navigate('Chat', { conversationId: c.id, title: u.displayName }); }
        catch (e: any) { Alert.alert('Error', e.message); }
      }} icon="chatbubble-outline" />
      <Button title="Report this user" variant="danger" onPress={() => Alert.prompt('Report', 'Reason:', async (reason) => {
        if (!reason) return;
        await api.post('/api/reports', { targetType: 'USER', targetId: u.id, reason }).catch(() => {});
        Alert.alert('Reported', 'Thanks, we will look into it.');
      })} icon="flag-outline" />
    </ScrollView>
  );
}
