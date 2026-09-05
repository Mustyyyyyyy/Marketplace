import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRoute, RouteProp, NavigationProp, useNavigation } from '@react-navigation/native';
import { Avatar, Button, Card, EmptyState, Logo, Pill, Row, Screen, Spacer, StarRating } from '../../ui/components';
import { colors, spacing, typography } from '../../ui/theme';
import { api } from '../../lib/api';
import { RootStackParamList } from '../../App';

export default function OffersScreen() {
  const route = useRoute<RouteProp<any, any>>();
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const taskId = (route.params as any)?.taskId;
  const [offers, setOffers] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setErr(null);
    if (!taskId) {
      try { const r: any = await api.get('/api/offers/mine'); setOffers(r.offers || []); } catch (e: any) { setErr(e.message); }
      return;
    }
    try { const r: any = await api.get(`/api/tasks/${taskId}/offers`); setOffers(r.offers || []); } catch (e: any) { setErr(e.message); }
  };

  useEffect(() => { load(); }, [taskId]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const act = async (id: string, endpoint: 'accept' | 'reject') => {
    setBusyId(id);
    try { await api.post(`/api/offers/${id}/${endpoint}`); await load(); }
    catch (e: any) { setErr(e.message); }
    finally { setBusyId(null); }
  };

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <Text style={typography.h1}>{taskId ? 'Task offers' : 'My offers'}</Text>
      <Text style={[typography.small, { marginTop: 2, marginBottom: spacing.lg }]}>{offers.length} {offers.length === 1 ? 'offer' : 'offers'}</Text>

      {err ? <Text style={{ color: colors.danger, marginBottom: spacing.sm }}>{err}</Text> : null}

      {offers.length === 0 ? (
        <EmptyState icon="document-text-outline" title="No offers" body={taskId ? 'No taskers have offered yet.' : 'You haven’t sent any offers.'} />
      ) : (
        <View style={{ gap: 10 }}>
          {offers.map((o) => (
            <Card key={o.id}>
              <Row>
                <Avatar name={o.tasker?.displayName || o.task?.title} size={40} />
                <View style={{ flex: 1 }}>
                  <Text style={typography.h3} numberOfLines={1}>{o.tasker?.displayName || o.tasker?.email || 'Tasker'}</Text>
                  {o.tasker?.taskerProfile?.headline ? <Text style={[typography.small, { marginTop: 2 }]} numberOfLines={1}>{o.tasker.taskerProfile.headline}</Text> : null}
                  {o.tasker?.taskerProfile?.ratingAvg ? <View style={{ marginTop: 4 }}><StarRating value={o.tasker.taskerProfile.ratingAvg} /></View> : null}
                </View>
                <Pill label={o.status} tone={o.status === 'ACCEPTED' ? 'success' : o.status === 'REJECTED' ? 'danger' : 'default'} />
              </Row>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                <Pill label={`${o.currency} ${Number(o.price).toLocaleString()}`} tone="brand" />
                <Pill label={`${o.timelineDays} days`} />
                {o.task ? <Pill label={o.task.title} /> : null}
              </View>
              <Text style={[typography.body, { marginTop: spacing.sm }]}>{o.proposal}</Text>
              {o.status === 'PENDING' && !taskId ? (
                <View style={{ marginTop: spacing.md }}>
                  <Button title="View task" variant="secondary" onPress={() => o.task?.id && nav.navigate('TaskDetail', { id: o.task.id })} />
                </View>
              ) : null}
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

