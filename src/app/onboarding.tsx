import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Bar, GradientButton, PressableScale, VideoBackground } from '../components/ui';
import type { Diet } from '../data/dishes';
import { select, success } from '../lib/haptics';
import { setReminders } from '../lib/reminders';
import { GOALS, useStore, type Goal, type Level } from '../lib/store';
import { colors, radius, type } from '../theme';

function Option({ emoji, title, sub, on, onPress }: { emoji: string; title: string; sub?: string; on: boolean; onPress: () => void }) {
  return (
    <PressableScale
      onPress={() => {
        select();
        onPress();
      }}
      haptic={false}
      style={[styles.option, on && styles.optionOn]}
    >
      <Text style={{ fontSize: 30 }}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.optTitle}>{title}</Text>
        {sub ? <Text style={styles.optSub}>{sub}</Text> : null}
      </View>
      <View style={[styles.radio, on && styles.radioOn]}>{on ? <Text style={styles.tick}>✓</Text> : null}</View>
    </PressableScale>
  );
}

export default function Onboarding() {
  const { profile, user, updateProfile } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.name || user?.name || '');
  const [goal, setGoal] = useState<Goal>(profile.goal);
  const [diet, setDiet] = useState<Diet>(profile.diet);
  const [level, setLevel] = useState<Level>(profile.level);
  const [nudge, setNudge] = useState(profile.breakfastReminder);
  const total = 4;

  const next = async () => {
    if (step < total - 1) return setStep(step + 1);
    success();
    updateProfile({ name: name.trim(), goal, diet, level, breakfastReminder: nudge, onboarded: true });
    setReminders(nudge).catch(() => {});
    router.replace('/(tabs)');
  };

  const screens = [
    <View key="name">
      <Text style={styles.q}>First, what should we call you?</Text>
      <Text style={styles.hint}>So FitPlate feels like yours.</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Your first name"
        placeholderTextColor={colors.faint}
        style={styles.input}
        autoFocus
        returnKeyType="next"
        onSubmitEditing={next}
      />
    </View>,
    <View key="goal">
      <Text style={styles.q}>What’s your goal?</Text>
      <Text style={styles.hint}>We’ll pick dishes that get you there and still taste great.</Text>
      {(Object.keys(GOALS) as Goal[]).map((g) => (
        <Option key={g} emoji={GOALS[g].emoji} title={GOALS[g].label} sub={GOALS[g].blurb} on={goal === g} onPress={() => setGoal(g)} />
      ))}
    </View>,
    <View key="diet">
      <Text style={styles.q}>How do you eat?</Text>
      <Text style={styles.hint}>We’ll only recommend what fits. You can still browse everything.</Text>
      <Option emoji="🥦" title="Vegetarian" on={diet === 'veg'} onPress={() => setDiet('veg')} />
      <Option emoji="🥚" title="Eggetarian" sub="Vegetarian plus eggs" on={diet === 'egg'} onPress={() => setDiet('egg')} />
      <Option emoji="🍗" title="Non-vegetarian" on={diet === 'non-veg'} onPress={() => setDiet('non-veg')} />
    </View>,
    <View key="level">
      <Text style={styles.q}>How confident are you in the kitchen?</Text>
      <Text style={styles.hint}>Beginners get extra tips and “what it looks like” help at every step.</Text>
      <Option emoji="🌱" title="Beginner" sub="Explain everything, I'm learning" on={level === 'beginner'} onPress={() => setLevel('beginner')} />
      <Option emoji="👨‍🍳" title="I know my way around" sub="Just the steps and measurements" on={level === 'expert'} onPress={() => setLevel('expert')} />
      <View style={[styles.option, { marginTop: 18 }]}>
        <Text style={{ fontSize: 30 }}>🌙</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.optTitle}>Night-before breakfast nudge</Text>
          <Text style={styles.optSub}>A 9 pm reminder to prep tomorrow’s breakfast in 5 minutes.</Text>
        </View>
        <Switch value={nudge} onValueChange={setNudge} trackColor={{ true: colors.accent, false: '#333' }} thumbColor="#fff" />
      </View>
    </View>,
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <VideoBackground source={require('../../assets/videos/ambient.mp4')} dim={0.55} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.top}>
          <Text style={[type.label, { color: colors.muted }]}>
            Step {step + 1} of {total}
          </Text>
          <View style={{ marginTop: 10 }}>
            <Bar progress={(step + 1) / total} color={colors.accent} height={6} />
          </View>
        </View>
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 12 }} keyboardShouldPersistTaps="handled">
          <Animated.View key={step} entering={FadeInRight.duration(380)} exiting={FadeOutLeft.duration(220)}>
            {screens[step]}
          </Animated.View>
        </ScrollView>
        <View style={styles.footer}>
          {step > 0 ? <GradientButton title="Back" variant="glass" onPress={() => setStep(step - 1)} style={{ flex: 1 }} /> : null}
          <GradientButton
            title={step === total - 1 ? "Let's cook 🔥" : 'Continue'}
            onPress={next}
            disabled={step === 0 && !name.trim()}
            style={{ flex: 2 }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { paddingHorizontal: 24, paddingTop: 12 },
  q: { ...type.h1, color: colors.text, fontSize: 30, lineHeight: 36, marginTop: 12 },
  hint: { color: colors.muted, fontSize: 15, lineHeight: 21, marginTop: 8, marginBottom: 22 },
  input: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
    paddingVertical: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 10,
  },
  optionOn: { borderColor: colors.accent, backgroundColor: 'rgba(61,220,132,0.12)' },
  optTitle: { color: colors.text, fontSize: 16.5, fontWeight: '800' },
  optSub: { color: colors.muted, fontSize: 13, marginTop: 2, lineHeight: 18 },
  radio: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: colors.faint, alignItems: 'center', justifyContent: 'center' },
  radioOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  tick: { color: '#06210F', fontWeight: '900' },
  footer: { flexDirection: 'row', gap: 10, padding: 20 },
});
