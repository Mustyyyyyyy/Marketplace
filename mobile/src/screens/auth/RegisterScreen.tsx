import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Button, ErrorText, Input, Screen } from '../../ui/components';
import { Logo } from '../../ui/Logo';
import { GoogleButton } from '../../ui/GoogleButton';
import { colors, radius, spacing, typography } from '../../ui/theme';
import { login, register, signInWithGoogle, authStore } from '../../lib/auth';
import { RootStackParamList } from '../../App';

const COUNTRIES = [
  { code: 'US', name: 'United States', currency: 'USD', phone: '+1' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', phone: '+44' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', phone: '+234' },
  { code: 'IE', name: 'Ireland', currency: 'EUR', phone: '+353' },
  { code: 'DE', name: 'Germany', currency: 'EUR', phone: '+49' },
  { code: 'FR', name: 'France', currency: 'EUR', phone: '+33' },
  { code: 'NL', name: 'Netherlands', currency: 'EUR', phone: '+31' },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', phone: '+27' },
  { code: 'KE', name: 'Kenya', currency: 'KES', phone: '+254' },
  { code: 'GH', name: 'Ghana', currency: 'GHS', phone: '+233' },
  { code: 'IN', name: 'India', currency: 'INR', phone: '+91' },
];

export default function RegisterScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const [role, setRole] = useState<'CUSTOMER' | 'TASKER'>('CUSTOMER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+44');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [country, setCountry] = useState('GB');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const c = COUNTRIES.find((x) => x.code === country);
    if (c) setPhone(c.phone);
  }, [country]);

  const submit = async () => {
    setErr(null); setLoading(true);
    const c = COUNTRIES.find((x) => x.code === country)!;
    try {
      await register({ email: email.trim(), password, phone, role, displayName: name.trim(), country, currency: c.currency, locale: 'en' });
      await login(email.trim(), password);
      // After login, gate kicks in: PostAuthNav will route to VerifyIdentity.
    } catch (e: any) { setErr(e.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  const onGoogle = async () => {
    setErr(null); setLoading(true);
    try { await signInWithGoogle(role); }
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
          <View style={{ alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, backgroundColor: colors.accentFixed, borderRadius: 999 }}>
            <Text style={{ color: colors.accent, ...typography.tiny }}>STEP 1 OF 2</Text>
          </View>
          <Text style={[typography.h1, { marginTop: 8 }]}>Create your account</Text>
          <Text style={[typography.small, { marginTop: 4, marginBottom: spacing.lg }]}>Next we&apos;ll verify your identity based on your country.</Text>

          {err ? <ErrorText message={err} /> : null}

          <GoogleButton onPress={onGoogle} label={role === 'TASKER' ? 'Sign up with Google' : 'Continue with Google'} disabled={loading} role={role} />

          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: spacing.md }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            <Text style={{ paddingHorizontal: 10, ...typography.tiny, textTransform: 'uppercase' }}>or with email</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
            {(['CUSTOMER', 'TASKER'] as const).map((r) => (
              <View key={r} style={{ flex: 1 }}>
                <Button
                  title={r === 'CUSTOMER' ? 'I need a tasker' : 'I want to earn'}
                  variant={role === r ? 'accent' : 'secondary'}
                  onPress={() => setRole(r)}
                />
              </View>
            ))}
          </View>

          <Input label="Full name" value={name} onChangeText={setName} autoComplete="name" />
          <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
          <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" />
          <View>
            <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry={!show} autoComplete="password" />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: -spacing.sm, marginBottom: spacing.sm }}>
              <Text style={{ ...typography.tiny }}>Minimum 8 characters</Text>
              <Text style={{ ...typography.small, color: colors.accent, fontWeight: '600' }} onPress={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</Text>
            </View>
          </View>
          <Text style={{ ...typography.label, marginBottom: 6 }}>Country</Text>
          <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: '#F8FAFC', marginBottom: spacing.md }}>
            <PickerInline value={country} onChange={setCountry} options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))} />
          </View>
          <Button title={loading ? 'Creating…' : 'Continue to verification →'} onPress={submit} loading={loading} />
          <Text style={{ textAlign: 'center', marginTop: spacing.md, ...typography.tiny }}>
            By creating an account you agree to our Terms and Privacy Policy.
          </Text>
          <Text style={{ textAlign: 'center', marginTop: spacing.lg, ...typography.small }}>
            Already have an account? <Text style={{ color: colors.accent, fontWeight: '600' }} onPress={() => nav.navigate('Login')}>Sign in</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function PickerInline({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  // Simple Picker that uses TextInput trick — for now use a button row to avoid picker deps
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 8 }}>
      {options.map((o) => (
        <Text key={o.value} onPress={() => onChange(o.value)} style={{
          paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, fontSize: 13,
          backgroundColor: value === o.value ? colors.accentFixed : 'transparent',
          color: value === o.value ? colors.accent : colors.text, fontWeight: '600',
        }}>{o.label}</Text>
      ))}
    </View>
  );
}
