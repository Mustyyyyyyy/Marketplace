import React, { useEffect, useState } from 'react';
import { Pressable, Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { colors, radius, spacing, typography } from './theme';
import { loadFirebaseConfig, isGoogleOAuthEnabled, startServerGoogleOAuth } from '../lib/firebase';

type Mode = 'loading' | 'firebase' | 'serverOAuth' | 'unconfigured';

export function GoogleButton({ onPress, label = 'Continue with Google', disabled, role = 'CUSTOMER' }: { onPress: () => void; label?: string; disabled?: boolean; role?: 'CUSTOMER' | 'TASKER' }) {
  const [mode, setMode] = useState<Mode>('loading');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cfg = await loadFirebaseConfig();
      if (cancelled) return;
      if (cfg.enabled) setMode('firebase');
      else if (isGoogleOAuthEnabled()) setMode('serverOAuth');
      else setMode('unconfigured');
    })();
    return () => { cancelled = true; };
  }, []);

  const handle = async () => {
    if (mode === 'serverOAuth') {
      const url = startServerGoogleOAuth(role);
      // Open in the system browser; the backend redirects to <app-scheme>://auth/callback
      // (configured in app.json). Our App.tsx will handle the deep link.
      const res = await WebBrowser.openAuthSessionAsync(url, 'marketplace://auth/callback');
      // The deep-link handler in App.tsx picks up the result and updates the auth store.
    } else {
      onPress();
    }
  };

  if (mode === 'loading') {
    return <View style={[styles.btn, { opacity: 0.5 }]}><ActivityIndicator color={colors.text} /></View>;
  }
  const enabled = mode !== 'unconfigured';
  return (
    <Pressable onPress={enabled ? handle : undefined} disabled={!enabled || disabled} style={({ pressed }) => [styles.btn, { opacity: !enabled || disabled ? 0.5 : pressed ? 0.85 : 1 }]}>
      <View style={styles.gIcon}>
        <Text style={{ fontWeight: '800', color: '#4285F4' }}>G</Text>
      </View>
      <Text style={styles.label}>{enabled ? label : `${label} (not configured)`}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 16, marginBottom: spacing.md },
  gIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  label: { ...typography.body, fontWeight: '600' },
});
