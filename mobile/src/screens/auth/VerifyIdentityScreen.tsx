import React, { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../lib/api';
import { authStore } from '../../lib/auth';
import { uploadFile } from '../../lib/upload';
import { Button, ErrorText, Screen } from '../../ui/components';
import { colors, radius, spacing, typography } from '../../ui/theme';

type KycMode =
  | 'ID_DOCUMENT' | 'NATIONAL_ID_NUMBER' | 'TAX_ID' | 'BANK_VERIFICATION'
  | 'ADDRESS_PROOF' | 'DRIVER_LICENSE' | 'PASSPORT'
  | 'PHONE_OTP' | 'EMAIL_OTP' | 'SELFIE' | 'SANCTIONS_SCREEN';

interface KycModeProgress {
  mode: KycMode;
  label: string;
  helpText: string;
  required: boolean;
  order: number;
  fileBased: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED';
  value?: string | null;
  fileUrl?: string | null;
  submittedAt?: string | null;
}

interface ProgressResponse {
  kycStatus: 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  signupStep: 'PROFILE' | 'KYC' | 'COMPLETE';
  kycCountry: string;
  countryName: string;
  description: string;
  modes: KycModeProgress[];
}

const ICON: Record<string, string> = {
  EMAIL_OTP: '✉️', PHONE_OTP: '📱', SANCTIONS_SCREEN: '🛡️',
  ID_DOCUMENT: '🪪', ADDRESS_PROOF: '🧾', SELFIE: '🤳',
  NATIONAL_ID_NUMBER: '🔢', TAX_ID: '🔢', BANK_VERIFICATION: '🏦',
  DRIVER_LICENSE: '🚗', PASSPORT: '🛂',
};

export default function VerifyIdentityScreen() {
  const nav = useNavigation<any>();
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<KycMode | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  async function load() {
    try {
      const j = await api.get<ProgressResponse>('/api/auth/kyc/progress');
      setProgress(j);
      if (j.kycStatus === 'APPROVED') {
        // refresh auth state and bounce to home
        const me = await api.get<any>('/api/auth/me');
        authStore.setState({ user: me.user });
        setTimeout(() => nav.reset({ index: 0, routes: [{ name: 'Tabs' }] }), 400);
      }
    } catch (e: any) { setErr(e.message || 'Failed to load progress'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function submitText(mode: KycMode) {
    const v = (values[mode] || '').trim();
    if (!v) { setErr('Please fill in this field first.'); return; }
    setBusy(mode); setErr(null);
    try {
      await api.post('/api/auth/kyc/submit', { mode, value: v });
      await load();
    } catch (e: any) { setErr(e.message || 'Submit failed'); }
    finally { setBusy(null); }
  }

  async function submitOtp(mode: KycMode) {
    setBusy(mode); setErr(null);
    try {
      await api.post('/api/auth/kyc/submit', { mode, value: mode === 'PHONE_OTP' ? authStore.getState().user?.phone || '' : authStore.getState().user?.email || '' });
      await load();
    } catch (e: any) { setErr(e.message || 'Submit failed'); }
    finally { setBusy(null); }
  }

  async function submitFile(mode: KycMode) {
    setBusy(mode); setErr(null);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { setErr('Please allow access to your photos.'); return; }
      const pick = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85, allowsEditing: false });
      if (pick.canceled || !pick.assets?.[0]) return;
      const a = pick.assets[0];
      const up = await uploadFile(a.uri, 'kyc');
      await api.post('/api/auth/kyc/submit', { mode, fileUrl: up.url, filePublicId: up.publicId });
      await load();
    } catch (e: any) { setErr(e.message || 'Upload failed'); }
    finally { setBusy(null); }
  }

  async function devApprove() {
    setBusy('SANCTIONS_SCREEN' as any); setErr(null);
    try {
      await api.post('/api/auth/kyc/dev-approve', {});
      await load();
    } catch (e: any) { setErr(e.message || 'Dev approve failed'); }
    finally { setBusy(null); }
  }

  if (loading || !progress) {
    return <Screen><Text style={{ padding: spacing.lg }}>Loading…</Text></Screen>;
  }

  const required = progress.modes.filter((m) => m.required);
  const done = required.filter((m) => m.status === 'APPROVED').length;
  const pct = required.length === 0 ? 100 : Math.round((done / required.length) * 100);
  const allDone = progress.kycStatus === 'APPROVED';

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl * 2 }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
          <Text style={typography.h1}>Verify your identity</Text>
          <Text style={[typography.small, { color: colors.subtle, marginTop: 4 }]}>
            {progress.countryName} · {done} of {required.length} required
          </Text>
        </View>

        <View style={{ backgroundColor: colors.card, borderRadius: 20, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: spacing.md }}>
            <View style={{ height: '100%', width: `${pct}%`, backgroundColor: colors.accent }} />
          </View>
          <Text style={{ ...typography.tiny, color: colors.subtle, marginBottom: spacing.md }}>{progress.description}</Text>
          {err ? <ErrorText message={err} /> : null}

          {progress.modes.sort((a, b) => a.order - b.order).map((m) => {
            const isDone = m.status === 'APPROVED';
            return (
              <View key={m.mode} style={{ marginTop: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: isDone ? colors.accent : colors.border, backgroundColor: isDone ? colors.accentFixed : colors.bg }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 22, marginRight: spacing.sm }}>{ICON[m.mode] || '✓'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...typography.label, fontWeight: '700' }}>{m.label}{m.required ? '  *' : ''}</Text>
                    <Text style={{ ...typography.tiny, color: colors.subtle, marginTop: 2 }}>{m.helpText}</Text>
                  </View>
                  {isDone ? <Text style={{ ...typography.label, color: colors.accent, fontWeight: '700' }}>✓</Text> : null}
                </View>
                {isDone ? null : m.fileBased ? (
                  <View style={{ marginTop: spacing.sm }}>
                    {m.fileUrl ? (
                      <Image source={{ uri: m.fileUrl }} style={{ width: 80, height: 80, borderRadius: 8, marginBottom: spacing.sm }} />
                    ) : null}
                    <Button title={busy === m.mode ? 'Uploading…' : 'Upload file'} variant="accent" onPress={() => submitFile(m.mode)} loading={busy === m.mode} />
                  </View>
                ) : m.mode === 'EMAIL_OTP' ? (
                  <View style={{ marginTop: spacing.sm }}>
                    <Button title={busy === m.mode ? 'Sending…' : 'Send verification link'} variant="accent" onPress={() => submitOtp(m.mode)} loading={busy === m.mode} />
                  </View>
                ) : m.mode === 'PHONE_OTP' ? (
                  <View style={{ marginTop: spacing.sm, flexDirection: 'row', gap: spacing.sm }}>
                    <TextInput
                      placeholder={m.placeholder || '+15551234567'}
                      value={values[m.mode] || authStore.getState().user?.phone || ''}
                      onChangeText={(t) => setValues((v) => ({ ...v, [m.mode]: t }))}
                      keyboardType="phone-pad"
                      style={{ flex: 1, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.sm }}
                    />
                    <Button title={busy === m.mode ? '…' : 'Send'} variant="accent" onPress={() => {
                      const phone = values[m.mode] || authStore.getState().user?.phone || '';
                      setBusy(m.mode); setErr(null);
                      api.post('/api/auth/kyc/submit', { mode: m.mode, value: phone })
                        .then(() => load())
                        .catch((e) => setErr(e.message || 'Submit failed'))
                        .finally(() => setBusy(null));
                    }} loading={busy === m.mode} />
                  </View>
                ) : (
                  <View style={{ marginTop: spacing.sm, flexDirection: 'row', gap: spacing.sm }}>
                    <TextInput
                      placeholder={m.placeholder || ''}
                      value={values[m.mode] || ''}
                      onChangeText={(t) => setValues((v) => ({ ...v, [m.mode]: t }))}
                      autoCapitalize="characters"
                      style={{ flex: 1, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.sm, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}
                    />
                    <Button title={busy === m.mode ? '…' : 'Submit'} variant="accent" onPress={() => submitText(m.mode)} loading={busy === m.mode} />
                  </View>
                )}
              </View>
            );
          })}

          {allDone ? (
            <Button title="Open the app →" variant="accent" onPress={() => nav.reset({ index: 0, routes: [{ name: 'Tabs' }] })} />
          ) : (
            <View style={{ marginTop: spacing.lg }}>
              <Button title="Skip for now (dev only)" variant="secondary" onPress={devApprove} loading={busy === ('SANCTIONS_SCREEN' as any)} />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
