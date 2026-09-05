import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from '../ui/Logo';
import { colors, spacing, typography } from '../ui/theme';
import { RootStackParamList } from '../App';

interface NavItem { label: string; icon: keyof typeof Ionicons.glyphMap; route: keyof RootStackParamList; group?: string; }

const TASKER_NAV: NavItem[] = [
  { group: 'Work', label: 'Dashboard', icon: 'grid-outline', route: 'Tabs' },
  { label: 'Find tasks', icon: 'search-outline', route: 'FindTasks' },
  { label: 'My jobs', icon: 'briefcase-outline', route: 'MyJobs' },
  { label: 'My offers', icon: 'document-text-outline', route: 'Offers' },
  { label: 'Availability', icon: 'calendar-outline', route: 'Availability' },
  { group: 'Profile', label: 'Reviews', icon: 'star-outline', route: 'Reviews' },
  { label: 'Payments', icon: 'card-outline', route: 'Payments' },
  { label: 'Settings', icon: 'settings-outline', route: 'Settings' },
];

const CUSTOMER_NAV: NavItem[] = [
  { group: 'Work', label: 'Dashboard', icon: 'grid-outline', route: 'Tabs' },
  { label: 'My tasks', icon: 'briefcase-outline', route: 'MyTasks' },
  { label: 'Find taskers', icon: 'people-outline', route: 'Taskers' },
  { label: 'Messages', icon: 'chatbubble-outline', route: 'Tabs' },
  { group: 'Account', label: 'Payments', icon: 'card-outline', route: 'Payments' },
  { label: 'Settings', icon: 'settings-outline', route: 'Settings' },
];

export function SideDrawer({ role, current, onClose }: { role: 'TASKER' | 'CUSTOMER'; current?: string; onClose?: () => void }) {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const items = role === 'TASKER' ? TASKER_NAV : CUSTOMER_NAV;
  return (
    <View style={{ flex: 1, backgroundColor: colors.brand, paddingTop: 24 }}>
      <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.lg }}>
        <Logo size="md" />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}>
        {items.map((item, i) => (
          <View key={i}>
            {item.group ? <Text style={{ color: colors.accentFixed, ...typography.tiny, textTransform: 'uppercase', marginTop: spacing.md, marginBottom: 6, paddingHorizontal: 12 }}>{item.group}</Text> : null}
            <Pressable onPress={() => { nav.navigate(item.route as any); onClose?.(); }} style={({ pressed }) => ({ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: current === item.label ? 'rgba(255,255,255,.1)' : 'transparent', flexDirection: 'row', alignItems: 'center', gap: 10, opacity: pressed ? 0.7 : 1 })}>
              <Ionicons name={item.icon} size={18} color={current === item.label ? colors.accentFixed : 'rgba(255,255,255,0.8)'} />
              <Text style={{ color: current === item.label ? '#fff' : 'rgba(255,255,255,0.9)', fontWeight: current === item.label ? '700' : '500', fontSize: 14 }}>{item.label}</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
