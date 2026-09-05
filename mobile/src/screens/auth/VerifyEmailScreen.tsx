import React, { useState } from 'react';
import { Text, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { Button, Input, ErrorText, Screen } from '../../ui/components';
import { Logo } from '../../ui/Logo';
import { colors, spacing, typography } from '../../ui/theme';
import { confirmEmailVerification, requestEmailVerification } from '../../lib/auth';
import { RootStackParamList } from '../../App';

export default function VerifyEmailScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'VerifyEmail'>>();
  const [token, setToken] = useState(route.params?.devToken || '');
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestToken = async () => {
    setErr(null); setMsg(null);
    try { const r: any = await requestEmailVerification(); if (r?.devToken) { setToken(r.devToken); setMsg('Dev token generated below. In production, this would be emailed.'); } }
    catch (e: any) { setErr(e.message || 'Failed'); }
  };

  const confirm = async () => {
    setErr(null); setMsg(null); setLoading(true);
    try { await confirmEmailVerification(token); setMsg('Email verified!'); setTimeout(() => nav.navigate('Tabs'), 1200); }
    catch (e: any) { setErr(e.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: spacing.lg, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
          <Logo size="lg" />
        </View>
        <View style={{ backgroundColor: colors.card, borderRadius: 20, padding: spacing.xl, borderWidth: 1, borderColor: colors.border }}>
          <Text style={typography.h1}>Verify your email</Text>
          <Text style={[typography.small, { marginTop: 4, marginBottom: spacing.lg }]}>
            Tap below to request a verification token, then paste it here. In production, this arrives by email.
          </Text>
          <ErrorText message={err} />
          {msg ? <View style={{ backgroundColor: '#CCFBF1', padding: 12, borderRadius: 8, marginBottom: spacing.md }}><Text style={{ color: '#0F766E' }}>{msg}</Text></View> : null}
          <Button title="Request token" onPress={requestToken} variant="secondary" />
          <View style={{ height: spacing.md }} />
          <Input label="Verification token" value={token} onChangeText={setToken} placeholder="Paste the token here" autoCapitalize="none" />
          <Button title="Verify" onPress={confirm} loading={loading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

