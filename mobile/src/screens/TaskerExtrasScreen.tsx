import React, { useEffect, useState } from 'react';
import { ScrollView, Pressable, Alert, View, Text } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Button, Card, ErrorText, Input, Pill, Spacer } from '../ui/components';
import { ImageUploader } from '../ui/ImageUploader';
import { colors, spacing, typography } from '../ui/theme';
import { api } from '../lib/api';
import { RootStackParamList } from '../App';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TaskerExtrasScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [bio, setBio] = useState('');
  const [headline, setHeadline] = useState('');
  const [experience, setExperience] = useState('');
  const [radius, setRadius] = useState('10');
  const [remoteOk, setRemoteOk] = useState(true);
  const [kycStatus, setKycStatus] = useState<string>('NOT_STARTED');
  const [kycDocUrl, setKycDocUrl] = useState<string | null>(null);
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [windows, setWindows] = useState<{ weekday: number; startMinute: number; endMinute: number }[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const r: any = await api.get('/api/profile/me');
      const tp = r.profile?.taskerProfile;
      if (tp) {
        setBio(tp.bio || ''); setHeadline(tp.headline || ''); setExperience(String(tp.experienceYears || 0));
        setRadius(String(tp.travelRadiusKm || 10)); setRemoteOk(tp.remoteOk ?? true);
        setSkills(tp.skills?.map((s: any) => s.skill.name) || []);
        setWindows(tp.availability || []);
        setCerts(tp.certifications || []);
        setPortfolio(tp.portfolioItems || []);
        setKycStatus(tp.kycStatus || 'NOT_STARTED');
      }
    } catch (e: any) { setErr(e.message); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setErr(null); setBusy(true);
    try {
      await api.patch('/api/profile/tasker', { bio, headline, experienceYears: Number(experience) || 0, travelRadiusKm: Number(radius) || 10, remoteOk });
      await api.put('/api/profile/tasker/skills', { skills });
      await api.put('/api/profile/tasker/availability', { windows });
      Alert.alert('Saved', 'Profile updated.');
      nav.goBack();
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  };

  const addSkill = () => { const t = skillInput.trim(); if (t && !skills.includes(t)) setSkills([...skills, t]); setSkillInput(''); };

  const addCert = async () => {
    Alert.prompt('Add certification', 'Title (e.g. Licensed Plumber):', async (title) => {
      if (!title) return;
      Alert.prompt('Issuer (optional)', 'e.g. Lagos State:', async (issuer) => {
        try { const c: any = await api.post('/api/profile/tasker/certifications', { title, issuer: issuer || undefined }); setCerts([...certs, c]); } catch (e: any) { setErr(e.message); }
      });
    });
  };

  const addPortfolio = async () => {
    Alert.prompt('Add portfolio item', 'Title:', async (title) => {
      if (!title) return;
      try { const p: any = await api.post('/api/profile/tasker/portfolio', { title, description: '' }); setPortfolio([...portfolio, p]); } catch (e: any) { setErr(e.message); }
    });
  };

  const removePortfolio = async (id: string) => {
    try { await api.delete('/api/profile/tasker/portfolio/' + id); setPortfolio(portfolio.filter((p) => p.id !== id)); } catch (e: any) { setErr(e.message); }
  };

  const removeCert = async (id: string) => {
    try { await api.delete('/api/profile/tasker/certifications/' + id); setCerts(certs.filter((c) => c.id !== id)); } catch (e: any) { setErr(e.message); }
  };

  const submitKyc = async () => {
    if (!kycDocUrl) return;
    setKycSubmitting(true);
    try { await api.post('/api/kyc/submit', { documentUrl: kycDocUrl }); setKycStatus('PENDING'); Alert.alert('Submitted', 'Your ID is now under review. Most verifications finish in a few hours.'); }
    catch (e: any) { Alert.alert('Submission failed', e.message); }
    finally { setKycSubmitting(false); }
  };

  const toggleWindow = (day: number) => {
    const has = windows.find((w) => w.weekday === day);
    if (has) setWindows(windows.filter((w) => w.weekday !== day));
    else setWindows([...windows, { weekday: day, startMinute: 540, endMinute: 1080 }]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 64 }}>
      <ErrorText message={err} />
      <Card>
        <Text style={typography.h3}>Tasker profile</Text>
        <Spacer h={8} />
        <Input label="Headline" value={headline} onChangeText={setHeadline} placeholder="e.g. Master Carpenter & Builder" />
        <Input label="Bio" value={bio} onChangeText={setBio} placeholder="About you" multiline style={{ minHeight: 80, textAlignVertical: 'top' }} />
        <Input label="Years of experience" value={experience} onChangeText={setExperience} keyboardType="numeric" />
        <Input label="Travel radius (km)" value={radius} onChangeText={setRadius} keyboardType="numeric" />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <Pressable onPress={() => setRemoteOk(!remoteOk)}><Pill label={remoteOk ? 'Available remote' : 'Tap to offer remote'} tone={remoteOk ? 'success' : 'default'} /></Pressable>
        </View>
      </Card>

      <Card>
        <Text style={typography.h3}>Skills</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.sm }}>
          {skills.map((s) => (
            <Pressable key={s} onPress={() => setSkills(skills.filter((x) => x !== s))}><Pill label={`${s}  ×`} tone="brand" /></Pressable>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <View style={{ flex: 1 }}><Input value={skillInput} onChangeText={setSkillInput} placeholder="Add a skill" /></View>
          <View style={{ justifyContent: 'flex-end' }}><Button title="Add" onPress={addSkill} variant="secondary" /></View>
        </View>
      </Card>

      <Card>
        <Text style={typography.h3}>Availability</Text>
        <Spacer h={8} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {WEEKDAYS.map((d, i) => (
            <Pressable key={i} onPress={() => toggleWindow(i)}><Pill label={d} tone={windows.find((w) => w.weekday === i) ? 'success' : 'default'} /></Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={typography.h3}>Certifications</Text>
        <Spacer h={8} />
        {certs.length === 0 ? <Text style={typography.small}>None yet.</Text> : null}
        {certs.map((c) => (
          <View key={c.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
            <Text style={typography.body}>• {c.title}{c.issuer ? ` (${c.issuer})` : ''}</Text>
            <Pressable onPress={() => removeCert(c.id)}><Text style={{ color: colors.error || '#C5221F', fontSize: 12, fontWeight: '600' }}>Remove</Text></Pressable>
          </View>
        ))}
        <Button title="+ Add certification" variant="secondary" onPress={addCert} />
      </Card>

      <Card>
        <Text style={typography.h3}>Portfolio</Text>
        <Spacer h={8} />
        {portfolio.length === 0 ? <Text style={typography.small}>None yet.</Text> : null}
        {portfolio.map((p) => (
          <View key={p.id} style={{ paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={typography.body}>• {p.title}</Text>
              <Pressable onPress={() => removePortfolio(p.id)}><Text style={{ color: colors.error || '#C5221F', fontSize: 12, fontWeight: '600' }}>Remove</Text></Pressable>
            </View>
            {p.description ? <Text style={typography.small}>{p.description}</Text> : null}
            {p.mediaUrl ? (
              <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[typography.tiny, { color: colors.accent }]}>Image uploaded ✓</Text>
                <Pressable onPress={async () => { await api.patch('/api/profile/tasker/portfolio/' + p.id, { mediaUrl: null }); setPortfolio(portfolio.map((x) => x.id === p.id ? { ...x, mediaUrl: null } : x)); }}>
                  <Text style={[typography.tiny, { color: colors.subtle }]}>Replace</Text>
                </Pressable>
              </View>
            ) : (
              <View style={{ marginTop: 8 }}>
                <ImageUploader
                  kind="portfolio"
                  value={null}
                  onChange={async (url) => {
                    try {
                      await api.patch('/api/profile/tasker/portfolio/' + p.id, { mediaUrl: url });
                      setPortfolio(portfolio.map((x) => x.id === p.id ? { ...x, mediaUrl: url } : x));
                    } catch (e: any) { Alert.alert('Save failed', e.message); }
                  }}
                  shape="wide"
                />
              </View>
            )}
          </View>
        ))}
        <Button title="+ Add portfolio item" variant="secondary" onPress={addPortfolio} />
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={typography.h3}>Identity verification (KYC)</Text>
          <Pill label={kycStatus} tone={kycStatus === 'VERIFIED' ? 'success' : kycStatus === 'PENDING' ? 'warning' : 'default'} />
        </View>
        <Spacer h={8} />
        <Text style={typography.small}>Upload a clear photo of your government-issued ID (passport, driver’s licence or national ID).</Text>
        <Spacer h={8} />
        {kycStatus === 'PENDING' ? (
          <View>
            <Text style={[typography.body, { color: colors.accent }]}>Your documents are under review.</Text>
            <Text style={[typography.small, { marginTop: 4 }]}>Most verifications finish in a few hours. We’ll email you when you’re verified.</Text>
          </View>
        ) : kycStatus === 'VERIFIED' ? (
          <View>
            <Text style={[typography.body, { color: colors.accent }]}>You’re verified ✓</Text>
            <Text style={[typography.small, { marginTop: 4 }]}>You can bid on high-value tasks and get paid through Escrow.</Text>
          </View>
        ) : (
          <View>
            <ImageUploader
              kind="kyc"
              value={kycDocUrl}
              onChange={(url) => setKycDocUrl(url)}
              shape="wide"
            />
            <Spacer h={8} />
            <Button title="Submit for review" onPress={submitKyc} loading={kycSubmitting} disabled={!kycDocUrl} />
          </View>
        )}
      </Card>

      <Button title="Save profile" onPress={save} loading={busy} icon="checkmark" />
    </ScrollView>
  );
}
