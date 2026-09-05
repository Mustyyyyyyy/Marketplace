import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { Button, Card, ErrorText, Input, Pill, Spacer } from '../../ui/components';
import { ImageUploader } from '../../ui/ImageUploader';
import { colors, radius, spacing, typography } from '../../ui/theme';
import { api } from '../../lib/api';
import { RootStackParamList } from '../../App';

const CURRENCIES = ['NGN', 'USD', 'EUR', 'GBP'];

export default function CreateTaskScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CreateTask'>>();
  const editingId = route.params?.id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<'LOCAL' | 'REMOTE'>('REMOTE');
  const [budgetType, setBudgetType] = useState<'FIXED' | 'HOURLY'>('FIXED');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [city, setCity] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(editingId || null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [coverImage, setCoverImage] = useState<string | null>(null);

  useEffect(() => { api.get('/api/categories').then((r: any) => setCategories(r.categories || [])); }, []);

  const save = async (publish: boolean) => {
    setErr(null);
    if (!title.trim() || title.length < 3) { setStep(1); return setErr('Title must be at least 3 characters'); }
    if (!description.trim() || description.length < 10) { setStep(1); return setErr('Description must be at least 10 characters'); }
    const amt = Number(amount);
    if (!amt || amt <= 0) { setStep(2); return setErr('Budget must be a positive number'); }
    setLoading(true);
    try {
      const body: any = { title: title.trim(), description: description.trim(), mode, budgetType, budgetAmount: amt, currency, categoryId: categoryId || undefined, city: city.trim() || undefined, country: 'NG' };
      const id = createdId;
      const t: any = id ? await api.patch(`/api/tasks/${id}`, body) : await api.post('/api/tasks', body);
      if (!id) setCreatedId(t.id);
      if (coverImage) {
        try { await api.post(`/api/tasks/${t.id}/media`, { url: coverImage, kind: 'IMAGE' }); } catch { /* ignore */ }
      }
      if (publish) {
        await api.post(`/api/tasks/${t.id}/publish`);
        Alert.alert('Published', 'Your task is live and taskers can submit offers.');
        nav.goBack();
      } else {
        Alert.alert('Saved', 'Your task was saved as a draft.');
      }
    } catch (e: any) { setErr(e.message || 'Save failed'); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 64 }} keyboardShouldPersistTaps="handled">
        <Text style={typography.h1}>{editingId ? 'Edit task' : 'New task'}</Text>
        <Text style={[typography.small, { marginTop: 4 }]}>Step {step} of 3</Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: spacing.md, marginBottom: spacing.lg }}>
          {[1, 2, 3].map((n) => (
            <View key={n} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: n <= step ? colors.accent : colors.surfaceHigh }} />
          ))}
        </View>
        <ErrorText message={err} />

        {step === 1 ? (
          <Card>
            <Text style={typography.h3}>What do you need done?</Text>
            <Spacer h={8} />
            <Input label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Fix leaking kitchen sink" />
            <Input label="Description" value={description} onChangeText={setDescription} placeholder="Describe the task in detail" multiline numberOfLines={5} style={{ minHeight: 100, textAlignVertical: 'top' }} />
            <Button title="Continue" onPress={() => setStep(2)} icon="arrow-forward" />
          </Card>
        ) : null}

        {step === 2 ? (
          <Card>
            <Text style={typography.h3}>Budget &amp; mode</Text>
            <Spacer h={8} />
            <Text style={[typography.label, { marginBottom: 6 }]}>Mode</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: spacing.md }}>
              {(['LOCAL', 'REMOTE'] as const).map((m) => (
                <Pressable key={m} onPress={() => setMode(m)} style={{ flex: 1, paddingVertical: 12, borderRadius: radius.md, borderWidth: 2, borderColor: mode === m ? colors.accent : colors.border, backgroundColor: mode === m ? colors.accentFixed : colors.card, alignItems: 'center' }}>
                  <Text style={{ color: mode === m ? colors.accent : colors.text, fontWeight: '600' }}>{m}</Text>
                </Pressable>
              ))}
            </View>
            <Input label="Amount" value={amount} onChangeText={setAmount} placeholder="0" keyboardType="numeric" />
            <Text style={[typography.label, { marginBottom: 6, marginTop: 4 }]}>Currency</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.md }}>
              {CURRENCIES.map((c) => (
                <Pressable key={c} onPress={() => setCurrency(c)}><Pill label={c} tone={currency === c ? 'brand' : 'default'} /></Pressable>
              ))}
            </View>
            <Text style={[typography.label, { marginBottom: 6 }]}>Pricing type</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.md }}>
              {(['FIXED', 'HOURLY'] as const).map((b) => (
                <Pressable key={b} onPress={() => setBudgetType(b)}><Pill label={b} tone={budgetType === b ? 'brand' : 'default'} /></Pressable>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}><Button title="Back" variant="secondary" onPress={() => setStep(1)} /></View>
              <View style={{ flex: 1 }}><Button title="Continue" onPress={() => setStep(3)} icon="arrow-forward" /></View>
            </View>
          </Card>
        ) : null}

        {step === 3 ? (
          <Card>
            <Text style={typography.h3}>Location &amp; category</Text>
            <Spacer h={8} />
            <Input label="City (optional)" value={city} onChangeText={setCity} placeholder="Lagos" />
            <Text style={[typography.label, { marginBottom: 6, marginTop: 4 }]}>Category</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.lg }}>
              <Pressable onPress={() => setCategoryId(null)}><Pill label="None" tone={!categoryId ? 'brand' : 'default'} /></Pressable>
              {categories.map((c) => <Pressable key={c.id} onPress={() => setCategoryId(c.id)}><Pill label={c.name} tone={categoryId === c.id ? 'brand' : 'default'} /></Pressable>)}
            </View>
            <Text style={[typography.label, { marginBottom: 6 }]}>Cover image (optional)</Text>
            <ImageUploader kind="task-media" value={coverImage} onChange={(url) => setCoverImage(url)} shape="wide" />
            <Spacer h={8} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}><Button title="Back" variant="secondary" onPress={() => setStep(2)} /></View>
              <View style={{ flex: 1 }}><Button title="Save draft" variant="secondary" onPress={() => save(false)} loading={loading} /></View>
            </View>
            <Spacer />
            <Button title="Publish task" onPress={() => save(true)} loading={loading} icon="send-outline" />
          </Card>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

