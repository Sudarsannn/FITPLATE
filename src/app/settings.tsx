import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Notice, ScreenTop } from '../components/vendors/kit';
import { FadeIn, Glass, GradientButton, PressableScale } from '../components/ui';
import { hasPaidFeatures, PLUS_PREVIEW_TOGGLE, planFromToggles } from '../config/entitlements';
import { BUNDLED_RESEARCH_VERSION, researchDishes, researchExercises, researchIngredients, researchInfo, researchNutrients } from '../data/research';
import { useStore } from '../lib/store';
import { deliverExport } from '../lib/shareExport';
import { colors, type } from '../theme';

/** Day 32: units, notifications, data export and reset, privacy, disclaimers and about. */
export default function Settings() {
  const { settings, updateSettings, exportMyData } = useStore();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const info = researchInfo();
  const plan = planFromToggles(settings.featureToggles);

  const exportData = async () => {
    setBusy(true);
    setNote(null);
    try {
      const ok = await deliverExport(await exportMyData());
      setNote(ok ? 'Your data was exported.' : 'Export cancelled.');
    } catch {
      setNote('Could not export. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title="Settings" fallback="/profile" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60, gap: 14 }} showsVerticalScrollIndicator={false}>
        <Block title="Units" i={0}>
          <Text style={body}>Metric: kilograms, centimetres, millilitres, kilocalories and rupees.</Text>
          <Text style={small}>Other units may come later. Nothing to set for now.</Text>
        </Block>

        <Block title="Notifications" i={1}>
          <Link title="Water reminders" sub="Times, quiet hours and turning them off" onPress={() => router.push('/water')} />
          <Text style={small}>Leftover reminders are set on the Done screen after cooking. All reminders will be gathered on one screen soon.</Text>
        </Block>

        <Block title="Your data" i={2}>
          <Text style={body}>Export everything saved on this device as a file, or see where your data lives and delete it.</Text>
          <View style={{ marginTop: 12 }}>
            <GradientButton title={busy ? 'Exporting...' : 'Export my data'} onPress={exportData} disabled={busy} />
          </View>
          {note ? <Text style={[small, { marginTop: 8 }]}>{note}</Text> : null}
          <Link title="Your data and delete" sub="What we save, where, and how to erase it" onPress={() => router.push('/your-data')} />
        </Block>

        <Block title="Privacy" i={3}>
          <Text style={body}>Your meals, water, workouts, health answers and body details stay private to you. Health answers and pregnancy flags are never shown to anyone else and are used only to keep advice safe. Signed in, your data is saved to your own account space and no one else can read it. As a guest it stays on this phone.</Text>
          <Text style={[small, { marginTop: 8 }]}>Workout clips you record are kept only on this phone and are deleted with your data.</Text>
        </Block>

        <Block title="Disclaimers" i={4}>
          <Text style={body}>FitPlate is not medical advice. Calories, nutrients and prices are estimates from research, not measurements or live shop prices. If you have a health condition, are pregnant or take medicine, follow your doctor&apos;s advice first. Stop exercising and get help if something feels wrong.</Text>
        </Block>

        <Block title="How FitPlate's data is researched and updated" i={5}>
          <Text style={body}>Dishes, ingredient prices, nutrients and exercises come from daily research that reads published sources (such as ICMR-NIN, USDA, and recipe and shop listings) and notes where each number came from. Items marked estimated or unverified are said so on screen. The research is merged into the app on a schedule, newer readings are weighed more, and unusual jumps are flagged instead of trusted.</Text>
          <Text style={[small, { marginTop: 8 }]}>
            In the app now: {researchDishes.length} dishes, {researchIngredients.length} ingredients, {researchNutrients.length} nutrition topics, {researchExercises.length} exercise items. Research version {info.version.slice(0, 12)} ({info.source === 'server' ? 'updated from the server' : 'bundled with this app'}; bundled {BUNDLED_RESEARCH_VERSION.slice(0, 12)}).
          </Text>
        </Block>

        <Block title="Plan" i={6}>
          <Text style={body}>{hasPaidFeatures() ? 'Some features belong to FitPlate Plus.' : 'Everything in FitPlate is free for now.'}</Text>
          <Link title="See FitPlate Plus" sub="How a paid plan could look. No payment is set up." onPress={() => router.push('/upgrade')} />
          {hasPaidFeatures() ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
              <Text style={{ color: colors.text, flex: 1 }}>Preview Plus (test switch, no payment)</Text>
              <Switch value={plan === 'plus'} onValueChange={(v) => updateSettings({ featureToggles: { ...settings.featureToggles, [PLUS_PREVIEW_TOGGLE]: v } })} accessibilityLabel="Preview Plus" />
            </View>
          ) : null}
        </Block>

        <Block title="About" i={7}>
          <Text style={body}>FitPlate helps you eat well, cook at home and move more, with tasty food first.</Text>
          <Text style={[small, { marginTop: 6 }]}>Version 1.0.0</Text>
        </Block>
        <Notice tone="info">Questions about your data? Open Your data above. You can delete everything at any time.</Notice>
      </ScrollView>
    </SafeAreaView>
  );
}

const body = { color: colors.text, lineHeight: 20 } as const;
const small = { color: colors.muted, fontSize: 13, marginTop: 6 } as const;

function Block({ title, i, children }: { title: string; i: number; children: ReactNode }) {
  return (
    <FadeIn i={i}>
      <Glass>
        <Text style={[type.h2, { color: colors.text, marginBottom: 8 }]}>{title}</Text>
        {children}
      </Glass>
    </FadeIn>
  );
}

function Link({ title, sub, onPress }: { title: string; sub: string; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} scaleTo={0.98} style={{ marginTop: 12 }} accessibilityLabel={title}>
      <Text style={{ color: colors.accent, fontWeight: '800' }}>{title}</Text>
      <Text style={small}>{sub}</Text>
    </PressableScale>
  );
}
