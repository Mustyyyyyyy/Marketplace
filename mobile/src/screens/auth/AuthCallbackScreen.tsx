import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { setTokens, fetchMe } from '../lib/api';
import { authStore } from '../lib/auth';
import { colors } from '../ui/theme';
import { RootStackParamList } from '../App';

export default function AuthCallbackScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'AuthCallback'>>();
  const nav = useNavigation<any>();

  useEffect(() => {
    const { access, refresh } = route.params || ({} as any);
    if (!access) {
      // No tokens? Bounce back to login.
      nav.reset({ index: 0, routes: [{ name: 'Login' as never }] });
      return;
    }
    setTokens(access, refresh || null);
    fetchMe(true)
      .then((u: any) => {
        authStore.setState({ user: u });
        // KYC gate in PostAuthNav will pick the right screen
        if (u?.kycStatus === 'APPROVED') {
          nav.reset({ index: 0, routes: [{ name: 'Tabs' as never }] });
        } else {
          nav.reset({ index: 0, routes: [{ name: 'VerifyIdentity' as never }] });
        }
      })
      .catch(() => {
        nav.reset({ index: 0, routes: [{ name: 'Login' as never }] });
      });
  }, [route.params, nav]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator color={colors.accent} size="large" />
    </View>
  );
}
