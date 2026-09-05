import React, { useEffect, useState } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, Pressable, View, Text, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Button, Card, ErrorText, Input, Pill, Spacer } from '../ui/components';
import { ImageUploader } from '../ui/ImageUploader';
import { colors, spacing, typography } from '../ui/theme';
import { api } from '../lib/api';
import { authStore } from '../lib/auth';
import { RootStackParamList } from '../App';

const COUNTRIES = ['NG', 'GB', 'US', 'DE', 'FR', 'IE', 'NL', 'CA', 'AU', 'KE', 'GH', 'ZA'];
const CURRENCIES = ['NGN', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'KES', 'GHS', 'ZAR'];
const LOCALES = ['en', 'fr', 'es', 'de', 'ha', 'yo', 'ig', 'ar', 'zh'];

export default function EditProfileScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const auth = authStore.use();
  const [name, setName] = useState(auth.user?.displayName || '');
  const [country, setCountry] = useState(auth.user?.country || 'NG');
  const [currency, setCurrency] = useState(auth.user?.currency || 'USD');
  const [locale, setLocale] = useState(auth.user?.locale || 'en');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(auth.user?.avatarUrl || null);
  const [avatarPublicId, setAvatarPublicId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/api/profile/me').then((r: any) => {
      setBio(r.profile?.customerProfile?.bio || r.profile?.taskerProfile?.bio || '');
      if (r.profile?.avatarUrl) setAvatarUrl(r.profile.avatarUrl);
      if (r.profile?.avatarPublicId) setAvatarPublicId(r.profile.avatarPublicId);
    }).catch(() => {});
  }, []);

  const save = async () => {
    setErr(null); setBusy(true);
    try {
      await api.patch('/api/profile/me', { displayName: name.trim() || undefined, country, currency, locale, bio: bio.trim() || undefined });
      if (avatarUrl && avatarPublicId) {
        await api.patch('/api/profile/me/avatar', { avatarUrl, avatarPublicId });
      }
      Alert.alert('Saved', 'Profile updated.'); nav.goBack();
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 64 }}>
        <ErrorText message={err} />
        <Card>
          <Text style={typography.h3}>Profile photo</Text>
          <Spacer h={8} />
          <View style={{ alignItems: 'center' }}>
            <ImageUploader
              kind="avatar"
              value={avatarUrl}
              onChange={(url, publicId) => { setAvatarUrl(url); if (publicId) setAvatarPublicId(publicId); }}
              shape="square"
              size={120}
            />
          </View>
        </Card>
        <Card>
          <Text style={typography.h3}>Profile</Text>
          <Spacer h={8} />
          <Input label="Display name" value={name} onChangeText={setName} placeholder="How others see you" />
          {auth.user?.role === 'CUSTOMER' ? <Input label="Bio" value={bio} onChangeText={setBio} placeholder="Tell taskers about yourself" multiline style={{ minHeight: 80, textAlignVertical: 'top' }} /> : null}
          <Text style={[typography.label, { marginBottom: 6, marginTop: 4 }]}>Country</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.md }}>
            {COUNTRIES.map((c) => <Pressable key={c} onPress={() => setCountry(c)}><Pill label={c} tone={country === c ? 'brand' : 'default'} /></Pressable>)}
          </View>
          <Text style={[typography.label, { marginBottom: 6 }]}>Currency</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.md }}>
            {CURRENCIES.map((c) => <Pressable key={c} onPress={() => setCurrency(c)}><Pill label={c} tone={currency === c ? 'brand' : 'default'} /></Pressable>)}
          </View>
          <Text style={[typography.label, { marginBottom: 6 }]}>Language</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {LOCALES.map((l) => <Pressable key={l} onPress={() => setLocale(l)}><Pill label={l} tone={locale === l ? 'brand' : 'default'} /></Pressable>)}
          </View>
        </Card>
        <Button title="Save changes" onPress={save} loading={busy} icon="checkmark" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
