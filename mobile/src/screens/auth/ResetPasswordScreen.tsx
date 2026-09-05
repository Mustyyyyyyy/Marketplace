import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { Button, ErrorText, Input } from '../../ui/components';
import { Logo } from '../../ui/Logo';
import { colors, spacing, typography } from '../../ui/theme';
import { resetPassword, login } from '../../lib/auth';
import { RootStackParamList } from '../../App';

type Route = RouteProp<RootStackParamList & { ResetPassword: { token: string } }, 'ResetPassword'>;

export default function ResetPasswordScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<Route>();
  const token = (route.params as any)?.token || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, padding: spacing.lg, justifyContent: 'center' }}>
        <View style={{ backgroundColor: colors.dangerContainer, padding: spacing.md, borderRadius: 12 }}>
          <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 15 }}>Invalid or missing link</Text>
          <Text style={{ color: colors.danger, marginTop: 4, fontSize: 13 }}>This password reset link is invalid or has expired.</Text>
          <Text style={{ color: colors.danger, marginTop: 8, fontSize: 13, textDecorationLine: 'underline' }} onPress={() => nav.navigate('ForgotPassword')}>Request a new one →</Text>
        </View>
      </View>
    );
  }

  const submit = async () => {
    setErr(null);
    if (password.length < 8) return setErr('Password must be at least 8 characters.');
    if (password !== confirm) return setErr('Passwords do not match.');
    setLoading(true);
    try { await resetPassword(token, password); setDone(true); setTimeout(() => nav.navigate('Login'), 1500); }
    catch (e: any) { setErr(e.message || 'Reset failed'); }
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
          <Text style={[typography.h1, { marginTop: 8 }]}>Choose a new password</Text>
          <Text style={[typography.small, { marginTop: 4, marginBottom: spacing.lg }]}>
            Once you set a new password, you can sign in.
          </Text>

          {done ? (
            <View style={{ backgroundColor: '#CCFBF1', padding: spacing.md, borderRadius: 12 }}>
              <Text style={{ color: '#0F766E', fontWeight: '700', fontSize: 15 }}>Password updated</Text>
              <Text style={{ color: '#0F766E', marginTop: 4, fontSize: 13 }}>Redirecting to sign in…</Text>
            </View>
          ) : (
            <>
              {err ? <ErrorText message={err} /> : null}
              <View>
                <Input label="New password" value={password} onChangeText={setPassword} secureTextEntry={!show} autoComplete="password" />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: -spacing.sm, marginBottom: spacing.md }}>
                  <Text style={{ ...typography.small, color: colors.accent, fontWeight: '600' }} onPress={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</Text>
                </View>
              </View>
              <Input label="Confirm new password" value={confirm} onChangeText={setConfirm} secureTextEntry={!show} autoComplete="password" />
              <Button title={loading ? 'Updating…' : 'Update password'} onPress={submit} loading={loading} />
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

