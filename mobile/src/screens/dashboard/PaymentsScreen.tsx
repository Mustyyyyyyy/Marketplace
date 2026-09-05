import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Logo, Pill, Row, Screen, Spacer, Button } from '../../ui/components';
import { colors, spacing, typography } from '../../ui/theme';
import { api } from '../../lib/api';
import { authStore } from '../../lib/auth';

export default function PaymentsScreen() {
  const auth = authStore.use();
  const [methods, setMethods] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>({ available: 0, pending: 0, currency: 'USD' });

  useEffect(() => {
    api.get('/api/payments/methods').then((r: any) => setMethods(r.methods || [])).catch(() => {});
    api.get('/api/payments/wallet').then((r: any) => setBalance(r.wallet || { available: 0, pending: 0, currency: 'USD' })).catch(() => {});
  }, []);

  return (
    <Screen>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <Text style={typography.h1}>Payments</Text>
      <Text style={[typography.small, { marginTop: 2, marginBottom: spacing.lg }]}>Manage your wallet, methods and payouts.</Text>

      <Card>
        <Text style={typography.h3}>Wallet</Text>
        <Spacer h={8} />
        <Row>
          <View style={{ flex: 1 }}>
            <Text style={[typography.tiny, { textTransform: 'uppercase' }]}>Available</Text>
            <Text style={[typography.h1, { fontSize: 28, marginTop: 2 }]}>{balance.currency} {Number(balance.available).toLocaleString()}</Text>
          </View>
          <View>
            <Text style={[typography.tiny, { textTransform: 'uppercase' }]}>Pending</Text>
            <Text style={[typography.h2, { fontSize: 22, marginTop: 2 }]}>{balance.currency} {Number(balance.pending).toLocaleString()}</Text>
          </View>
        </Row>
        <Spacer h={8} />
        <Button title="Withdraw" onPress={() => Alert.alert('Withdraw', 'Choose a method to withdraw to.')} icon="wallet-outline" />
      </Card>

      <Card>
        <Row>
          <Text style={[typography.h3, { flex: 1 }]}>Payment methods</Text>
          <Pressable onPress={() => Alert.alert('Add method', 'Choose a method to add.')}><Text style={{ color: colors.accent, fontWeight: '600' }}>+ Add</Text></Pressable>
        </Row>
        <Spacer h={8} />
        {methods.length === 0 ? (
          <Text style={typography.small}>No payment methods yet. Add a card or bank account to make or receive payments.</Text>
        ) : methods.map((m) => (
          <View key={m.id} style={{ paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
            <Row>
              <Ionicons name={m.type === 'card' ? 'card-outline' : m.type === 'bank' ? 'business-outline' : 'wallet-outline'} size={20} color={colors.accent} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={typography.body}>{m.brand || m.bankName || 'Method'}</Text>
                <Text style={typography.tiny}>•••• {m.last4 || ''} · {m.country || ''}</Text>
              </View>
              {m.isDefault ? <Pill label="Default" tone="success" /> : null}
            </Row>
          </View>
        ))}
      </Card>

      <Card>
        <Text style={typography.h3}>Statements</Text>
        <Spacer h={8} />
        <Text style={typography.small}>Download monthly statements for your records.</Text>
        <Spacer h={8} />
        <Button title="Download latest statement" variant="secondary" onPress={() => Alert.alert('Statement', 'Your statement is being generated.')} icon="download-outline" />
      </Card>
    </Screen>
  );
}

