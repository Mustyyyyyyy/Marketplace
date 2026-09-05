import React, { useState } from 'react';
import { View, Image, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from './theme';
import { checkUploadsConfigured, uploadFile, UploadKind } from '../lib/upload';

interface ImageUploaderProps {
  kind: UploadKind;
  value?: string | null;
  onChange: (url: string, publicId?: string) => void;
  label?: string;
  shape?: 'square' | 'wide';
  size?: number;
}

export function ImageUploader({ kind, value, onChange, label, shape = 'square', size = 96 }: ImageUploaderProps) {
  const [busy, setBusy] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);

  React.useEffect(() => { checkUploadsConfigured().then(setConfigured); }, []);

  const pick = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Alert.alert('Permission needed', 'Please allow access to your photos to upload an image.'); return; }
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: shape === 'square' ? [1, 1] : [16, 9], quality: 0.85 });
      if (res.canceled || !res.assets?.[0]?.uri) return;
      setBusy(true);
      const uploaded = await uploadFile(res.assets[0].uri, kind, res.assets[0].fileName || undefined, res.assets[0].mimeType || undefined);
      onChange(uploaded.url, uploaded.publicId);
    } catch (e: any) {
      Alert.alert('Upload failed', e.message || 'Try again');
    } finally { setBusy(false); }
  };

  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={typography.label}>{label}</Text> : null}
      <Pressable onPress={pick} disabled={busy} style={({ pressed }) => ({
        width: shape === 'wide' ? '100%' : size, height: shape === 'wide' ? 160 : size,
        borderRadius: shape === 'square' ? size / 2 : radius.lg,
        backgroundColor: value ? 'transparent' : colors.surfaceLowest,
        borderWidth: 2, borderStyle: 'dashed', borderColor: colors.outlineVariant,
        overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
        opacity: busy ? 0.6 : pressed ? 0.7 : 1,
      })}>
        {value ? (
          <Image source={{ uri: value }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Ionicons name="add-a-photo" size={shape === 'wide' ? 32 : 24} color={colors.subtle} />
            <Text style={{ ...typography.tiny, color: colors.subtle }}>{busy ? 'Uploading…' : shape === 'wide' ? 'Add image' : 'Add'}</Text>
          </View>
        )}
        {busy ? <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.accent} /></View> : null}
      </Pressable>
      {configured === false ? (
        <Text style={{ ...typography.tiny, color: colors.subtle }}>Uploads not configured. Set CLOUDINARY_* in backend .env.</Text>
      ) : null}
    </View>
  );
}
