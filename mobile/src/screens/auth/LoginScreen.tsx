import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Button, ErrorText, Input, Screen } from '../../ui/components';
import { Logo } from '../../ui/Logo';
import { GoogleButton } from '../../ui/GoogleButton';
import { colors, spacing, typography } from '../../ui/theme';
import { login, signInWithGoogle } from '../../lib/auth';
import { RootStackParamList } from '../../App';

export default function LoginScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr(null); setLoading(true);
    try { await login(email.trim(), password); }
    catch (e: any) { setErr(e.message || 'Sign in failed'); }
    finally { setLoading(false); }
  };

  const onGoogle = async () => {
    setErr(null); setLoading(true);
    try { await signInWithGoogle('CUSTOMER'); }
    catch (e: any) { setErr(e.message || 'Google sign-in failed'); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: spacing.lg, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
          <Logo size="lg" />
        </View>
        <View style={{ backgroundColor: colors.card, borderRadius: 20, padding: spacing.xl, borderWidth: 1, borderColor: colors.border }}>
          <Text style={typography.h1}>Welcome back</Text>
          <Text style={[typography.small, { marginTop: 4, marginBottom: spacing.lg }]}>Sign in to post a task or apply to work</Text>

          {err ? <ErrorText message={err} /> : null}

          <GoogleButton onPress={onGoogle} disabled={loading} />

          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: spacing.md }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            <Text style={{ paddingHorizontal: 10, ...typography.tiny, textTransform: 'uppercase' }}>or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          </View>

          <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="you@example.com" />
          <View>
            <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry={!show} autoComplete="password" placeholder="Your password" />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: -spacing.sm, marginBottom: spacing.md }}>
              <Text style={{ ...typography.small, color: colors.accent, fontWeight: '600' }} onPress={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</Text>
              <Text style={{ ...typography.small, color: colors.accent, fontWeight: '600' }} onPress={() => nav.navigate('ForgotPassword')}>Forgot?</Text>
            </View>
          </View>
          <Button title="Sign in" onPress={submit} loading={loading} />
          <Text style={{ textAlign: 'center', marginTop: spacing.lg, ...typography.small }}>
            New to TaskSphere? <Text style={{ color: colors.accent, fontWeight: '600' }} onPress={() => nav.navigate('Register')}>Create an account</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

