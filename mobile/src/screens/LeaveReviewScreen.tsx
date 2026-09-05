import React, { useState } from 'react';
import { View, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, ErrorText, Input, Spacer, StarRating } from '../ui/components';
import { colors, spacing, typography } from '../ui/theme';
import { api } from '../lib/api';
import { RootStackParamList } from '../App';

export default function LeaveReviewScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'LeaveReview'>>();
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr(null); setBusy(true);
    try { await api.post(`/api/tasks/${route.params.taskId}/review`, { rating, body }); Alert.alert('Thanks', 'Your review has been published.'); nav.goBack(); }
    catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ padding: spacing.lg, paddingBottom: 64 }}>
        <Card>
          <StarRating value={rating} size={28} />
          <View style={{ flexDirection: 'row', gap: 4, marginTop: spacing.md, marginBottom: spacing.md }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setRating(n)}>
                <Ionicons name={n <= rating ? 'star' : 'star-outline'} size={36} color="#F59E0B" />
              </Pressable>
            ))}
          </View>
          <Input label="Your review" value={body} onChangeText={setBody} multiline style={{ minHeight: 120, textAlignVertical: 'top' }} placeholder="What went well? Anything to improve?" />
          <ErrorText message={err} />
          <Button title="Submit review" onPress={submit} loading={busy} icon="send-outline" />
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}
