import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, RouteProp, NavigationProp } from '@react-navigation/native';
import { Button, Card, EmptyState, ErrorText, Input, Logo, Pill, Row, Spacer, StarRating } from '../../ui/components';
import { colors, radius, spacing, typography } from '../../ui/theme';
import { api } from '../../lib/api';
import { authStore } from '../../lib/auth';
import { RootStackParamList } from '../../App';

export default function TaskDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'TaskDetail'>>();
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const auth = authStore.use();
  const [task, setTask] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerDays, setOfferDays] = useState('1');
  const [offerProposal, setOfferProposal] = useState('');
  const [busy, setBusy] = useState(false);
  const [evidence, setEvidence] = useState('');

  const load = useCallback(async () => {
    setErr(null);
    try { const t: any = await api.get(`/api/tasks/${route.params.id}`); setTask(t); }
    catch (e: any) { setErr(e.message); }
  }, [route.params.id]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (err && !task) return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: spacing.lg, justifyContent: 'center' }}>
      <EmptyState icon="alert-circle-outline" title="Couldn’t load task" body={err} actionLabel="Try again" onAction={load} />
    </View>
  );
  if (!task) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}><ActivityIndicator color={colors.accent} /></View>;

  const isOwner = task.customerId === auth.user?.id;
  const isTasker = auth.user?.role === 'TASKER';
  const me = auth.user;
  const myHire = (task.hires || []).find((h: any) => h.taskerId === me?.id);
  const hiredTasker = (task.hires || [])[0];

  const act = async (fn: () => Promise<any>, msg = 'Done') => {
    setBusy(true); setErr(null);
    try { await fn(); await load(); Alert.alert('Success', msg); }
    catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 64 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <ErrorText message={err} />
      <Card>
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
          <Pill label={task.status.replace('_', ' ')} tone={task.status === 'COMPLETED' ? 'success' : task.status === 'CANCELLED' ? 'danger' : 'accent'} />
          <Pill label={task.mode} />
          <Pill label={`${task.currency} ${Number(task.budgetAmount || 0).toLocaleString()}`} tone="brand" />
          <Pill label={task.budgetType} />
        </View>
        <Text style={typography.h1}>{task.title}</Text>
        <Text style={[typography.body, { marginTop: spacing.md }]}>{task.description}</Text>
        <Spacer h={12} />
        {task.city ? <Text style={typography.small}>📍 {task.city}, {task.country}</Text> : null}
        {task.expiresAt ? <Text style={typography.small}>⏰ Expires {new Date(task.expiresAt).toLocaleString()}</Text> : null}
      </Card>

      {isOwner ? (
        <Card>
          <Text style={typography.h3}>Manage</Text>
          <Spacer h={8} />
          {task.status === 'DRAFT' || task.status === 'PUBLISHED' ? <Button title="Edit" variant="secondary" onPress={() => nav.navigate('CreateTask', { id: task.id })} /> : null}
          {task.status === 'DRAFT' ? <Button title="Publish" onPress={() => act(() => api.post(`/api/tasks/${task.id}/publish`), 'Task published')} loading={busy} /> : null}
          {['DRAFT', 'PUBLISHED', 'RECEIVING_OFFERS', 'OFFER_SELECTED', 'ACCEPTED'].includes(task.status) ? <Button title="Cancel task" variant="danger" onPress={() => act(() => api.post(`/api/tasks/${task.id}/cancel`), 'Cancelled')} /> : null}
          {task.status === 'SUBMITTED' || task.status === 'CUSTOMER_REVIEW' ? <Button title="Mark as reviewed" onPress={() => act(() => api.post(`/api/tasks/${task.id}/confirm`), 'Marked for review')} /> : null}
          {task.status === 'CUSTOMER_REVIEW' || task.status === 'COMPLETED' ? <Button title="Leave a review" onPress={() => nav.navigate('LeaveReview', { taskId: task.id, revieweeName: hiredTasker?.taskerId })} /> : null}
        </Card>
      ) : null}

      {isTasker && !isOwner ? (
        <Card>
          <Text style={typography.h3}>Submit an offer</Text>
          <Spacer h={8} />
          <Input label={`Your price (${task.currency})`} value={offerPrice} onChangeText={setOfferPrice} placeholder="0" keyboardType="numeric" />
          <Input label="Timeline (days)" value={offerDays} onChangeText={setOfferDays} keyboardType="numeric" />
          <Input label="Proposal" value={offerProposal} onChangeText={setOfferProposal} placeholder="Why are you a great fit?" multiline style={{ minHeight: 80, textAlignVertical: 'top' }} />
          <Button title="Submit offer" onPress={() => act(async () => {
            if (!offerPrice || !offerProposal) throw new Error('Price and proposal required');
            return api.post(`/api/tasks/${task.id}/offers`, { price: Number(offerPrice), currency: task.currency, timelineDays: Number(offerDays) || 1, proposal: offerProposal });
          }, 'Offer submitted')} loading={busy} />
          {myHire && task.status === 'OFFER_SELECTED' ? <Button title="Start work" onPress={() => act(() => api.post(`/api/tasks/${task.id}/start`), 'Started')} /> : null}
          {myHire && task.status === 'IN_PROGRESS' ? (
            <>
              <Input label="Completion evidence" value={evidence} onChangeText={setEvidence} placeholder="Describe what you delivered" multiline style={{ minHeight: 80, textAlignVertical: 'top' }} />
              <Button title="Submit for review" onPress={() => act(() => api.post(`/api/tasks/${task.id}/submit`, { evidence }), 'Submitted')} />
            </>
          ) : null}
        </Card>
      ) : null}

      {isOwner && task.offers ? (
        <Card>
          <Text style={typography.h3}>Offers ({task.offers.length})</Text>
          <Spacer h={8} />
          {task.offers.length === 0 ? <Text style={typography.small}>No offers yet.</Text> : null}
          {task.offers.map((o: any) => (
            <View key={o.id} style={{ paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
              <Text style={typography.body}>{o.tasker?.displayName || o.tasker?.email}</Text>
              {o.tasker?.taskerProfile?.headline ? <Text style={typography.small}>{o.tasker.taskerProfile.headline}</Text> : null}
              {o.tasker?.taskerProfile?.ratingAvg ? <View style={{ marginTop: 4 }}><StarRating value={o.tasker.taskerProfile.ratingAvg} /></View> : null}
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                <Pill label={`${o.currency} ${Number(o.price).toLocaleString()}`} tone="brand" />
                <Pill label={`${o.timelineDays} days`} />
                <Pill label={o.status} tone={o.status === 'ACCEPTED' ? 'success' : o.status === 'REJECTED' ? 'danger' : 'default'} />
              </View>
              <Text style={[typography.body, { marginTop: 6 }]}>{o.proposal}</Text>
              {o.status === 'PENDING' ? (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <View style={{ flex: 1 }}><Button title="Accept" onPress={() => act(() => api.post(`/api/offers/${o.id}/accept`), 'Offer accepted')} /></View>
                  <View style={{ flex: 1 }}><Button title="Reject" variant="danger" onPress={() => act(() => api.post(`/api/offers/${o.id}/reject`), 'Rejected')} /></View>
                </View>
              ) : null}
            </View>
          ))}
        </Card>
      ) : null}

      <Card>
        <Button title="Message customer/tasker" variant="secondary" onPress={async () => {
          try { const r: any = await api.post('/api/conversations/task', { taskId: task.id }); nav.navigate('Chat', { conversationId: r.id }); }
          catch (e: any) { Alert.alert('Error', e.message); }
        }} icon="chatbubble-outline" />
      </Card>

      <Card>
        <Text style={typography.h3}>Trust & safety</Text>
        <Spacer h={8} />
        <Button title="Open a dispute" variant="danger" onPress={() => act(async () => {
          Alert.prompt?.('Dispute reason', 'Briefly describe the issue.', async (text) => {
            if (!text) return;
            await api.post(`/api/disputes/tasks/${task.id}`, { reason: 'unresolved', details: text });
          });
        }, 'Dispute opened')} icon="shield-outline" />
      </Card>
    </ScrollView>
  );
}

