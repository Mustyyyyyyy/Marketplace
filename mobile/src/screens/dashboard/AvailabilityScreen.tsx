import React, { useState } from 'react';
import { View, Text, Pressable, Switch } from 'react-native';
import { Card, Logo, Row, Screen, Spacer, Button } from '../../ui/components';
import { colors, spacing, typography } from '../../ui/theme';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AvailabilityScreen() {
  const [hours, setHours] = useState<Record<string, { on: boolean; start: string; end: string }>>(() => {
    const o: any = {};
    DAYS.forEach((d) => { o[d] = { on: d !== 'Sunday', start: '09:00', end: '18:00' }; });
    return o;
  });
  const [maxJobs, setMaxJobs] = useState(3);
  const [autoAccept, setAutoAccept] = useState(false);

  return (
    <Screen>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <Text style={typography.h1}>Availability</Text>
      <Text style={[typography.small, { marginTop: 2, marginBottom: spacing.lg }]}>Let customers know when you’re open for work.</Text>

      <Card>
        <Text style={typography.h3}>Weekly hours</Text>
        <Spacer h={8} />
        {DAYS.map((d) => (
          <View key={d} style={{ paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
            <Row>
              <View style={{ width: 100 }}>
                <Text style={{ ...typography.body, fontWeight: '600' }}>{d}</Text>
              </View>
              <Switch
                value={hours[d].on}
                onValueChange={(v) => setHours({ ...hours, [d]: { ...hours[d], on: v } })}
                trackColor={{ false: colors.outlineVariant, true: colors.accent }}
                thumbColor="#fff"
              />
              {hours[d].on ? (
                <Row gap={6} style={{ marginLeft: 'auto' }}>
                  <Pressable onPress={() => setHours({ ...hours, [d]: { ...hours[d], start: hours[d].start === '09:00' ? '06:00' : hours[d].start === '06:00' ? '12:00' : '09:00' } })}>
                    <View style={{ backgroundColor: colors.surfaceLowest, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                      <Text style={{ ...typography.body, fontWeight: '600' }}>{hours[d].start}</Text>
                    </View>
                  </Pressable>
                  <Text style={{ ...typography.body }}>–</Text>
                  <Pressable onPress={() => setHours({ ...hours, [d]: { ...hours[d], end: hours[d].end === '18:00' ? '22:00' : hours[d].end === '22:00' ? '14:00' : '18:00' } })}>
                    <View style={{ backgroundColor: colors.surfaceLowest, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                      <Text style={{ ...typography.body, fontWeight: '600' }}>{hours[d].end}</Text>
                    </View>
                  </Pressable>
                </Row>
              ) : null}
            </Row>
          </View>
        ))}
      </Card>

      <Card>
        <Text style={typography.h3}>Workload</Text>
        <Spacer h={8} />
        <Row>
          <View style={{ flex: 1 }}>
            <Text style={typography.body}>Max active jobs</Text>
            <Text style={[typography.tiny, { marginTop: 2 }]}>We won’t show you more than this at once.</Text>
          </View>
          <Pressable onPress={() => setMaxJobs(Math.max(1, maxJobs - 1))}><View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceHigh, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 18, fontWeight: '700' }}>−</Text></View></Pressable>
          <Text style={{ ...typography.h2, width: 32, textAlign: 'center' }}>{maxJobs}</Text>
          <Pressable onPress={() => setMaxJobs(Math.min(20, maxJobs + 1))}><View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceHigh, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 18, fontWeight: '700' }}>+</Text></View></Pressable>
        </Row>
        <Spacer h={12} />
        <Row>
          <View style={{ flex: 1 }}>
            <Text style={typography.body}>Auto-accept repeat customers</Text>
            <Text style={[typography.tiny, { marginTop: 2 }]}>Skip the offer step for trusted customers.</Text>
          </View>
          <Switch value={autoAccept} onValueChange={setAutoAccept} trackColor={{ false: colors.outlineVariant, true: colors.accent }} thumbColor="#fff" />
        </Row>
      </Card>

      <Button title="Save availability" icon="checkmark" onPress={() => {}} />
    </Screen>
  );
}

