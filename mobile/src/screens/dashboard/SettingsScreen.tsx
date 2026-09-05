import React, { useState } from 'react';
import { View, Text, Pressable, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Logo, Row, Screen, Spacer, Button } from '../../ui/components';
import { colors, spacing, typography } from '../../ui/theme';
import { api } from '../../lib/api';
import { authStore, logout } from '../../lib/auth';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

const TYPES = [
  { key: 'NEW_OFFER', label: 'New offers on my tasks', desc: 'When a tasker sends you an offer.' },
  { key: 'OFFER_ACCEPTED', label: 'Offer accepted', desc: 'When your offer is accepted.' },
  { key: 'TASK_STATUS', label: 'Task status updates', desc: 'When the task moves through states.' },
  { key: 'NEW_MESSAGE', label: 'New messages', desc: 'When someone messages you.' },
  { key: 'REVIEW', label: 'Reviews', desc: 'When someone leaves you a review.' },
  { key: 'DISPUTE', label: 'Disputes', desc: 'When a dispute is opened or updated.' },
];

export default function SettingsScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const auth = authStore.use();
  const [prefs, setPrefs] = useState<Record<string, { inApp: boolean; email: boolean; sms: boolean }>>({});
  const [dark, setDark] = useState(false);
  const [haptic, setHaptic] = useState(true);

  React.useEffect(() => {
    api.get('/api/notifications/preferences').then((r: any) => {
      const o: any = {};
      for (const p of (r.preferences || [])) o[p.type] = p;
      setPrefs(o);
    }).catch(() => {});
  }, []);

  const toggle = (type: string, channel: 'inApp' | 'email' | 'sms') => {
    const cur = prefs[type] || { inApp: true, email: true, sms: false };
    const next = { ...prefs, [type]: { ...cur, [channel]: !cur[channel] } };
    setPrefs(next);
    api.put('/api/notifications/preferences', { type, ...next[type] }).catch(() => {});
  };

  return (
    <Screen>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <Text style={typography.h1}>Settings</Text>
      <Text style={[typography.small, { marginTop: 2, marginBottom: spacing.lg }]}>Manage your notifications, security and account.</Text>

      <Card>
        <Text style={typography.h3}>Notifications</Text>
        <Spacer h={8} />
        {TYPES.map((t) => {
          const p = prefs[t.key] || { inApp: true, email: true, sms: false };
          return (
            <View key={t.key} style={{ paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
              <Text style={typography.body}>{t.label}</Text>
              <Text style={[typography.tiny, { marginTop: 2 }]}>{t.desc}</Text>
              <Row gap={12} style={{ marginTop: 8 }}>
                <ToggleRow label="In-app" value={p.inApp} onChange={() => toggle(t.key, 'inApp')} />
                <ToggleRow label="Email" value={p.email} onChange={() => toggle(t.key, 'email')} />
                <ToggleRow label="SMS" value={p.sms} onChange={() => toggle(t.key, 'sms')} />
              </Row>
            </View>
          );
        })}
      </Card>

      <Card>
        <Text style={typography.h3}>App</Text>
        <Spacer h={8} />
        <Row>
          <View style={{ flex: 1 }}>
            <Text style={typography.body}>Dark mode</Text>
            <Text style={[typography.tiny, { marginTop: 2 }]}>Use the dark theme across TaskSphere.</Text>
          </View>
          <Switch value={dark} onValueChange={setDark} trackColor={{ false: colors.outlineVariant, true: colors.accent }} thumbColor="#fff" />
        </Row>
        <Spacer h={8} />
        <Row>
          <View style={{ flex: 1 }}>
            <Text style={typography.body}>Haptic feedback</Text>
            <Text style={[typography.tiny, { marginTop: 2 }]}>Vibrate on actions.</Text>
          </View>
          <Switch value={haptic} onValueChange={setHaptic} trackColor={{ false: colors.outlineVariant, true: colors.accent }} thumbColor="#fff" />
        </Row>
      </Card>

      <Card>
        <Text style={typography.h3}>Security</Text>
        <Spacer h={8} />
        <Button title="Change password" variant="secondary" onPress={() => nav.navigate('ForgotPassword')} icon="lock-closed-outline" />
        <Spacer h={6} />
        <Button title="Two-factor authentication" variant="secondary" onPress={() => Alert.alert('2FA', 'Two-factor authentication setup')} icon="shield-checkmark-outline" />
      </Card>

      <Card>
        <Text style={typography.h3}>Account</Text>
        <Spacer h={8} />
        <Text style={typography.small}>{auth.user?.email}</Text>
        <Spacer h={6} />
        <Button title="Sign out" variant="danger" onPress={() => logout()} icon="log-out-outline" />
      </Card>

      <Text style={[typography.tiny, { textAlign: 'center', marginTop: spacing.lg }]}>TaskSphere v1.0.0</Text>
    </Screen>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) {
  return (
    <Row gap={4}>
      <Text style={{ ...typography.tiny }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: colors.outlineVariant, true: colors.accent }} thumbColor="#fff" />
    </Row>
  );
}

