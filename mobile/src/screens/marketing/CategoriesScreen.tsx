import React, { useEffect, useState } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, EmptyState, Logo, Row, Screen, Spacer } from '../../ui/components';
import { colors, radius, spacing, typography } from '../../ui/theme';
import { fetchCategories } from '../../lib/marketplace';
import { RootStackParamList } from '../../App';

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  'web-development': 'laptop-outline', 'mobile-development': 'phone-portrait-outline', 'design': 'color-palette-outline',
  'writing': 'create-outline', 'marketing': 'megaphone-outline', 'translation': 'language-outline',
  'video': 'videocam-outline', 'audio': 'musical-notes-outline', 'photography': 'camera-outline',
  'data': 'bar-chart-outline', 'consulting': 'briefcase-outline', 'admin': 'document-text-outline',
  'customer-service': 'headset-outline', 'sales': 'trending-up-outline', 'finance': 'wallet-outline',
  'engineering': 'construct-outline', 'architecture': 'business-outline', 'legal': 'shield-outline',
  'home-repair': 'home-outline', 'cleaning': 'sparkles-outline', 'moving': 'cube-outline', 'delivery': 'car-outline',
  'tutoring': 'school-outline', 'fitness': 'fitness-outline', 'beauty': 'flower-outline', 'events': 'calendar-outline',
};

export default function CategoriesScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCategories().then((c) => { setCats(c); setLoading(false); }); }, []);

  // Group by parent
  const grouped: Record<string, any[]> = {};
  const top = cats.filter((c) => !c.parentId);
  for (const t of top) grouped[t.id] = cats.filter((c) => c.parentId === t.id);
  const flat = top.flatMap((t) => [{ ...t, isParent: true }, ...(grouped[t.id] || []).map((c) => ({ ...c, isParent: false }))]);

  return (
    <Screen refreshing={loading} onRefresh={async () => { setLoading(true); setCats(await fetchCategories()); setLoading(false); }}>
      <Row style={{ marginBottom: spacing.md }}><Logo size="md" /></Row>
      <Text style={typography.h1}>Categories</Text>
      <Text style={[typography.small, { marginTop: 2, marginBottom: spacing.lg }]}>{top.length} categories · {cats.length - top.length} subcategories</Text>

      {top.length === 0 ? (
        <EmptyState icon="grid-outline" title="No categories yet" body="Categories will appear once the platform is set up." />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {flat.map((c) => (
            <Card key={c.id} onPress={() => nav.navigate('Browse', { categoryId: c.id })} style={{ flexBasis: '48%', flexGrow: 1, minWidth: 0 }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: c.isParent ? colors.accentFixed : colors.surfaceHigh, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={ICON_MAP[c.slug] || (c.isParent ? 'grid-outline' : 'ellipsis-horizontal')} size={18} color={c.isParent ? colors.accent : colors.text} />
              </View>
              <Text style={{ ...typography.h3, marginTop: 10, fontSize: 15 }} numberOfLines={2}>{c.name}</Text>
              {c.isParent && grouped[c.id]?.length ? <Text style={{ ...typography.tiny, marginTop: 2 }}>{grouped[c.id].length} subcategories</Text> : null}
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

