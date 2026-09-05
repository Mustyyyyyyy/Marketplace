import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Button, ErrorText, Input } from '../../ui/components';
import { Logo } from '../../ui/Logo';
import { colors, spacing, typography } from '../../ui/theme';
import { requestPasswordReset } from '../../lib/auth';
import { RootStackParamList } from '../../App';

export default function ForgotPasswordScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setErr(null); setLoading(true);
    try { await requestPasswordReset(email.trim()); setDone(true); }
    catch (e: any) { setErr(e.message || 'Request failed'); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: spacing.lg, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
          <Logo size="lg" />
        </View>
        <View style={{ backgroundColor: colors.card, borderRadius: 20, padding: spacing.xl, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.accent, fontWeight: '600', ...typography.tiny }} onPress={() => nav.navigate('Login')}>← Back to sign in</Text>
          <Text style={[typography.h1, { marginTop: 8 }]}>Forgot your password?</Text>
          <Text style={[typography.small, { marginTop: 4, marginBottom: spacing.lg }]}>
            Enter the email address you use to sign in. We&apos;ll send you a secure link to reset your password.
          </Text>

          {done ? (
            <View style={{ backgroundColor: '#CCFBF1', padding: spacing.md, borderRadius: 12 }}>
              <Text style={{ color: '#0F766E', fontWeight: '700', fontSize: 15 }}>Check your inbox</Text>
              <Text style={{ color: '#0F766E', marginTop: 4, fontSize: 13 }}>
                If an account exists for <Text style={{ fontWeight: '700' }}>{email}</Text>, we just sent a password reset link. The link expires in 30 minutes.
              </Text>
              <Text style={{ color: '#0F766E', marginTop: 8, fontSize: 13 }}>Didn&apos;t get it? Check your spam folder, or{' '}
                <Text style={{ textDecorationLine: 'underline', fontWeight: '600' }} onPress={() => setDone(false)}>try again</Text>.
              </Text>
            </View>
          ) : (
            <>
              {err ? <ErrorText message={err} /> : null}
              <Input label="Email address" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />
              <Button title={loading ? 'Sending…' : 'Send reset link'} onPress={submit} loading={loading} />
            </>
          )}

          <Text style={{ textAlign: 'center', marginTop: spacing.lg, ...typography.small }}>
            Remembered it? <Text style={{ color: colors.accent, fontWeight: '600' }} onPress={() => nav.navigate('Login')}>Sign in</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

