import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ACTIVITY,
  ALLERGIES,
  BUDGETS,
  CUISINES,
  DIETS,
  EXPERIENCE,
  EXTRA_GOALS,
  KITCHEN,
  LIMITS,
  SESSION_MIN,
  TRAIN_WHERE,
  WORKOUT_GEAR,
  WORKOUT_TYPES,
  type Choice,
} from '../../config/survey';
import { researchConditions } from '../../data/research';
import { IconBadge, type IconName } from '../Icon';
import { select, success } from '../../lib/haptics';
import { GOALS, useStore, type Goal, type Level } from '../../lib/store';
import type { Survey } from '../../models/survey';
import type { ActivityLevel, DietType, Sex } from '../../models/user';
import { colors, radius, type } from '../../theme';
import { Bar, GradientButton, PressableScale, VideoBackground } from '../ui';

export const SURVEY_PAGES = ['name', 'goals', 'health', 'body', 'diet', 'food', 'kitchen', 'training'] as const;
export type SurveyPage = (typeof SURVEY_PAGES)[number];
export const PAGE_TITLE: Record<SurveyPage, string> = {
  name: 'Your name',
  goals: 'Goals',
  health: 'Health',
  body: 'About you',
  diet: 'Diet and allergies',
  food: 'Eating habits',
  kitchen: 'Kitchen',
  training: 'Training',
};

function Option({ icon, title, sub, on, onPress, multi = false }: { icon?: IconName; title: string; sub?: string; on: boolean; onPress: () => void; multi?: boolean }) {
  return (
    <PressableScale
      onPress={() => {
        select();
        onPress();
      }}
      haptic={false}
      style={[styles.option, on && styles.optionOn]}
      accessibilityLabel={`${title}${on ? ', selected' : ''}`}
    >
      {icon ? <IconBadge name={icon} size={40} color={on ? colors.accent : colors.muted} /> : null}
      <View style={{ flex: 1 }}>
        <Text style={styles.optTitle}>{title}</Text>
        {sub ? <Text style={styles.optSub}>{sub}</Text> : null}
      </View>
      <View style={[multi ? styles.box : styles.radio, on && styles.radioOn]}>{on ? <Ionicons name="checkmark" size={14} color="#06210F" /> : null}</View>
    </PressableScale>
  );
}

function Pill({ label, on, onPress, icon }: { label: string; on: boolean; onPress: () => void; icon?: IconName }) {
  return (
    <Pressable
      onPress={() => {
        select();
        onPress();
      }}
      style={[styles.pill, on && styles.pillOn]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: on }}
      accessibilityLabel={label}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {on ? <Ionicons name="checkmark" size={14} color="#06210F" /> : icon ? <Ionicons name={icon} size={14} color={colors.muted} /> : null}
        <Text style={[styles.pillText, on && { color: '#06210F' }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

function Group({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <View style={{ marginTop: 18 }}>
      <Text style={styles.groupTitle}>{title}</Text>
      {hint ? <Text style={styles.groupHint}>{hint}</Text> : null}
      <View style={{ marginTop: 10 }}>{children}</View>
    </View>
  );
}

const Pills = ({ children }: { children: ReactNode }) => <View style={styles.pills}>{children}</View>;

function toggle<T>(list: readonly T[], v: T, exclusive: readonly T[] = []): T[] {
  if (list.includes(v)) return list.filter((x) => x !== v);
  // "None" and "Prefer not to say" clear the rest, and picking anything clears them.
  if (exclusive.includes(v)) return [v];
  return [...list.filter((x) => !exclusive.includes(x)), v];
}

const num = (s: string) => {
  const n = Number(s.replace(',', '.'));
  return s.trim() && Number.isFinite(n) && n > 0 ? n : null;
};

function NumberField({ label, unit, value, onChange }: { label: string; unit: string; value: number | null; onChange: (n: number | null) => void }) {
  const [text, setText] = useState(value != null ? String(value) : '');
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldRow}>
        <TextInput
          value={text}
          onChangeText={(t) => {
            setText(t);
            onChange(num(t));
          }}
          keyboardType="numeric"
          placeholder="–"
          placeholderTextColor={colors.faint}
          style={styles.fieldInput}
          accessibilityLabel={label}
        />
        <Text style={styles.fieldUnit}>{unit}</Text>
      </View>
    </View>
  );
}

type Draft = {
  name: string;
  goal: Goal;
  diet: DietType;
  level: Level;
  survey: Survey;
  sex: Sex | null;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  activityLevel: ActivityLevel | null;
  kitchen: string[];
};

/**
 * The profile survey (SPEC-ADDENDA §8): one topic per page, progress bar,
 * Back and Skip on every page, multi-select wherever more than one answer can
 * be true. Used for onboarding and, from Profile, to edit any page later.
 * Answers save as you go. Reminders are not part of it.
 */
export function SurveyFlow({ mode, start = 'name' }: { mode: 'onboarding' | 'edit'; start?: SurveyPage }) {
  const store = useStore();
  const { profile, user, body, sex, updateProfile, updateBody, equipmentOwned, setEquipmentOwned } = store;
  // Editing from Profile opens just the one page, with Save.
  const pages: readonly SurveyPage[] = mode === 'onboarding' ? SURVEY_PAGES : [start];
  const [step, setStep] = useState(Math.max(0, pages.indexOf(start)));
  const [d, setD] = useState<Draft>({
    name: profile.name || user?.name || '',
    goal: profile.goal,
    diet: profile.diet,
    level: profile.level,
    survey: profile.survey,
    sex,
    age: body.age,
    heightCm: body.heightCm,
    weightKg: body.weightKg,
    activityLevel: body.activityLevel,
    kitchen: equipmentOwned,
  });
  const s = d.survey;
  const set = (patch: Partial<Draft>) => setD((x) => ({ ...x, ...patch }));
  const setS = (patch: Partial<Survey>) => setD((x) => ({ ...x, survey: { ...x.survey, ...patch } }));
  const page = pages[step];
  const last = step === pages.length - 1;

  const save = (finish: boolean) => {
    updateProfile({ name: d.name.trim(), goal: d.goal, diet: d.diet, level: d.level, survey: d.survey, ...(finish && mode === 'onboarding' ? { onboarded: true } : {}) });
    updateBody({ sex: d.sex, age: d.age, heightCm: d.heightCm, weightKg: d.weightKg, activityLevel: d.activityLevel });
    setEquipmentOwned(d.kitchen);
  };
  const next = () => {
    save(last);
    if (!last) return setStep(step + 1);
    success();
    if (mode === 'onboarding') router.replace('/(tabs)');
    else if (router.canGoBack()) router.back();
    else router.replace('/profile');
  };

  const conditions = researchConditions.map((c) => ({ id: c.id, label: c.name }));
  const choose = <T extends string>(list: Choice<T>[], value: T | null, onPick: (v: T) => void) =>
    list.map((c) => <Option key={c.id} icon={c.icon} title={c.label} sub={c.sub} on={value === c.id} onPress={() => onPick(c.id)} />);

  const screens: Record<SurveyPage, ReactNode> = {
    name: (
      <View>
        <Text style={styles.q}>First, what should we call you?</Text>
        <Text style={styles.hint}>A few quick pages so FitPlate fits you. Skip anything you like and change it later in Profile.</Text>
        <TextInput value={d.name} onChangeText={(name) => set({ name })} placeholder="Your first name" placeholderTextColor={colors.faint} style={styles.input} autoFocus returnKeyType="next" onSubmitEditing={next} />
      </View>
    ),
    goals: (
      <View>
        <Text style={styles.q}>What are you working towards?</Text>
        <Text style={styles.hint}>Your main goal sets today&apos;s calorie and protein target. Pick as many extras as you like.</Text>
        <Text style={styles.groupTitle}>Main goal</Text>
        <View style={{ marginTop: 10 }}>
          {(Object.keys(GOALS) as Goal[]).map((g) => (
            <Option key={g} icon={GOALS[g].icon} title={GOALS[g].label} sub={GOALS[g].blurb} on={d.goal === g} onPress={() => set({ goal: g })} />
          ))}
        </View>
        <Group title="Also want to" hint="Select all that apply">
          <Pills>
            {EXTRA_GOALS.map((g) => (
              <Pill key={g.id} label={g.label} icon={g.icon} on={s.goals.includes(g.id)} onPress={() => setS({ goals: toggle(s.goals, g.id) })} />
            ))}
          </Pills>
        </Group>
      </View>
    ),
    health: (
      <View>
        <Text style={styles.q}>Any health conditions?</Text>
        <Text style={styles.hint}>Optional and private: saved only to your account, never shared. FitPlate uses it to flag dishes and, as research comes in, to adjust targets. Always follow your doctor&apos;s advice.</Text>
        {conditions.map((c) => (
          <Option key={c.id} multi title={c.label} on={s.healthIssues.includes(c.id)} onPress={() => setS({ healthIssues: toggle(s.healthIssues, c.id, ['none', 'prefer-not']) })} />
        ))}
        <Option multi title="None" on={s.healthIssues.includes('none')} onPress={() => setS({ healthIssues: toggle(s.healthIssues, 'none', ['none', 'prefer-not']) })} />
        <Option multi title="Prefer not to say" on={s.healthIssues.includes('prefer-not')} onPress={() => setS({ healthIssues: toggle(s.healthIssues, 'prefer-not', ['none', 'prefer-not']) })} />
        <Group title="Something else?" hint="More conditions are added as FitPlate's research covers them.">
          <TextInput value={s.healthOther} onChangeText={(healthOther) => setS({ healthOther })} placeholder="e.g. thyroid, PCOS" placeholderTextColor={colors.faint} style={styles.text} />
        </Group>
      </View>
    ),
    body: (
      <View>
        <Text style={styles.q}>A little about you</Text>
        <Text style={styles.hint}>Used for calories burnt and, later, your personal targets. Leave anything blank.</Text>
        <Group title="Targets for">
          <Pills>
            {(
              [
                ['female', 'Women'],
                ['male', 'Men'],
                ['other', 'Prefer not to say'],
              ] as [Sex, string][]
            ).map(([id, l]) => (
              <Pill key={id} label={l} on={d.sex === id} onPress={() => set({ sex: d.sex === id ? null : id })} />
            ))}
          </Pills>
        </Group>
        <View style={styles.fields}>
          <NumberField label="Age" unit="years" value={d.age} onChange={(age) => set({ age })} />
          <NumberField label="Height" unit="cm" value={d.heightCm} onChange={(heightCm) => set({ heightCm })} />
          <NumberField label="Weight" unit="kg" value={d.weightKg} onChange={(weightKg) => set({ weightKg })} />
        </View>
        <Group title="How active is a normal day?">{choose(ACTIVITY, d.activityLevel, (activityLevel) => set({ activityLevel: d.activityLevel === activityLevel ? null : activityLevel }))}</Group>
      </View>
    ),
    diet: (
      <View>
        <Text style={styles.q}>How do you eat?</Text>
        <Text style={styles.hint}>We recommend only what fits. You can still browse everything.</Text>
        {choose(DIETS, d.diet, (diet) => set({ diet }))}
        <Group title="Allergies" hint="Dishes with these ingredients won't be recommended. Always check labels.">
          <Pills>
            {ALLERGIES.map((a) => (
              <Pill key={a.id} label={a.label} on={s.allergies.includes(a.id)} onPress={() => setS({ allergies: toggle(s.allergies, a.id) })} />
            ))}
          </Pills>
        </Group>
      </View>
    ),
    food: (
      <View>
        <Text style={styles.q}>Your eating habits</Text>
        <Text style={styles.hint}>So meal ideas match your day and your wallet.</Text>
        <Group title="Meals a day">
          <Pills>
            {[2, 3, 4, 5].map((n) => (
              <Pill key={n} label={n === 5 ? '5+' : String(n)} on={s.mealsPerDay === n} onPress={() => setS({ mealsPerDay: s.mealsPerDay === n ? null : n })} />
            ))}
          </Pills>
        </Group>
        <Group title="Cuisines you love" hint="Select all that apply">
          <Pills>
            {CUISINES.map((c) => (
              <Pill key={c} label={c} on={s.cuisines.includes(c)} onPress={() => setS({ cuisines: toggle(s.cuisines, c) })} />
            ))}
          </Pills>
        </Group>
        <Group title="Budget per meal">
          <Pills>
            {BUDGETS.map((b) => (
              <Pill key={b.id} label={b.label} on={s.budgetPerMeal === b.id} onPress={() => setS({ budgetPerMeal: s.budgetPerMeal === b.id ? null : b.id })} />
            ))}
          </Pills>
        </Group>
        <Group title="Foods you don't like">
          <TextInput value={s.dislikes} onChangeText={(dislikes) => setS({ dislikes })} placeholder="e.g. karela, mushrooms" placeholderTextColor={colors.faint} style={styles.text} />
        </Group>
      </View>
    ),
    kitchen: (
      <View>
        <Text style={styles.q}>Your kitchen</Text>
        <Text style={styles.hint}>Beginners get extra tips and &ldquo;what it looks like&rdquo; help at every step.</Text>
        <Option icon="leaf-outline" title="Beginner" sub="Explain everything, I'm learning" on={d.level === 'beginner'} onPress={() => set({ level: 'beginner' })} />
        <Option icon="ribbon-outline" title="I know my way around" sub="Just the steps and measurements" on={d.level === 'expert'} onPress={() => set({ level: 'expert' })} />
        <Group title="What you have" hint="Select all that apply">
          <Pills>
            {KITCHEN.map((k) => (
              <Pill key={k} label={k} on={d.kitchen.includes(k)} onPress={() => set({ kitchen: toggle(d.kitchen, k) })} />
            ))}
          </Pills>
        </Group>
      </View>
    ),
    training: (
      <View>
        <Text style={styles.q}>How do you like to move?</Text>
        <Text style={styles.hint}>Workouts and &ldquo;See ways to balance this&rdquo; are picked from these answers.</Text>
        <Group title="Where you train" hint="Select all that apply">
          <Pills>
            {TRAIN_WHERE.map((w) => (
              <Pill key={w.id} label={w.label} icon={w.icon} on={s.trainWhere.includes(w.id)} onPress={() => setS({ trainWhere: toggle(s.trainWhere, w.id) })} />
            ))}
          </Pills>
        </Group>
        <Group title="Experience">{choose(EXPERIENCE, s.experience, (experience) => setS({ experience }))}</Group>
        <Group title="Days a week">
          <Pills>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <Pill key={n} label={String(n)} on={s.daysPerWeek === n} onPress={() => setS({ daysPerWeek: s.daysPerWeek === n ? null : n })} />
            ))}
          </Pills>
        </Group>
        <Group title="Time per session">
          <Pills>
            {SESSION_MIN.map((n) => (
              <Pill key={n} label={n === 60 ? '60+ min' : `${n} min`} on={s.sessionMin === n} onPress={() => setS({ sessionMin: s.sessionMin === n ? null : n })} />
            ))}
          </Pills>
        </Group>
        <Group title="Equipment you can use" hint="Select all that apply">
          <Pills>
            {WORKOUT_GEAR.map((g) => (
              <Pill key={g} label={g} on={s.workoutEquipment.includes(g)} onPress={() => setS({ workoutEquipment: toggle(s.workoutEquipment, g, ['Nothing']) })} />
            ))}
          </Pills>
        </Group>
        <Group title="Workouts you enjoy" hint="Select all that apply">
          <Pills>
            {WORKOUT_TYPES.map((t) => (
              <Pill key={t} label={t} on={s.workoutTypes.includes(t)} onPress={() => setS({ workoutTypes: toggle(s.workoutTypes, t) })} />
            ))}
          </Pills>
        </Group>
        <Group title="Go easy on" hint="Injuries or limits. Check with a doctor before new exercise.">
          <Pills>
            {[...LIMITS, 'None'].map((l) => (
              <Pill key={l} label={l} on={s.limits.includes(l)} onPress={() => setS({ limits: toggle(s.limits, l, ['None']) })} />
            ))}
          </Pills>
          <TextInput value={s.limitsOther} onChangeText={(limitsOther) => setS({ limitsOther })} placeholder="Anything else?" placeholderTextColor={colors.faint} style={[styles.text, { marginTop: 10 }]} />
        </Group>
      </View>
    ),
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {mode === 'onboarding' ? <VideoBackground source={require('../../../assets/videos/ambient.mp4')} dim={0.6} /> : null}
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.top}>
          <View style={styles.topRow}>
            {mode === 'edit' ? (
              <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/profile'))} hitSlop={10} accessibilityRole="button" accessibilityLabel="Cancel">
                <Text style={styles.skip}>Cancel</Text>
              </Pressable>
            ) : null}
            <Text style={[type.label, { color: colors.muted }]}>{mode === 'edit' ? PAGE_TITLE[page] : `${PAGE_TITLE[page]} · ${step + 1} of ${pages.length}`}</Text>
            {!last ? (
              <Pressable onPress={() => setStep(step + 1)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Skip this page">
                <Text style={styles.skip}>Skip</Text>
              </Pressable>
            ) : null}
          </View>
          <View style={{ marginTop: 10, opacity: mode === 'edit' ? 0 : 1 }}>
            <Bar progress={(step + 1) / pages.length} color={colors.accent} height={6} />
          </View>
        </View>
        <ScrollView contentContainerStyle={{ padding: 22, paddingTop: 8, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Animated.View key={page} entering={FadeInRight.duration(340)} exiting={FadeOutLeft.duration(200)}>
            {screens[page]}
          </Animated.View>
        </ScrollView>
        <View style={styles.footer}>
          {step > 0 ? <GradientButton title="Back" variant="glass" onPress={() => setStep(step - 1)} style={{ flex: 1 }} /> : null}
          <GradientButton title={last ? (mode === 'onboarding' ? "Let's cook" : 'Save') : 'Continue'} onPress={next} style={{ flex: 2 }} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { paddingHorizontal: 22, paddingTop: 12 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skip: { color: colors.muted, fontWeight: '800', fontSize: 14 },
  q: { ...type.h1, color: colors.text, fontSize: 28, lineHeight: 34, marginTop: 12 },
  hint: { color: colors.muted, fontSize: 14.5, lineHeight: 20, marginTop: 8, marginBottom: 18 },
  input: { fontSize: 22, fontWeight: '700', color: colors.text, borderBottomWidth: 2, borderBottomColor: colors.accent, paddingVertical: 12 },
  text: { color: colors.text, fontSize: 15, minHeight: 46, paddingHorizontal: 14, borderRadius: radius.md, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: colors.border },
  option: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: radius.md, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1.5, borderColor: colors.border, marginBottom: 9 },
  optionOn: { borderColor: colors.accent, backgroundColor: 'rgba(61,220,132,0.12)' },
  optTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  optSub: { color: colors.muted, fontSize: 12.5, marginTop: 2, lineHeight: 17 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.faint, alignItems: 'center', justifyContent: 'center' },
  box: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: colors.faint, alignItems: 'center', justifyContent: 'center' },
  radioOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  tick: { color: '#06210F', fontWeight: '900', fontSize: 13 },
  groupTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  groupHint: { color: colors.muted, fontSize: 12.5, marginTop: 2 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 14, minHeight: 40, justifyContent: 'center', borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1.5, borderColor: colors.border },
  pillOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  pillText: { color: colors.text, fontWeight: '700', fontSize: 13.5 },
  fields: { flexDirection: 'row', gap: 10, marginTop: 18 },
  field: { flex: 1, minWidth: 0 },
  fieldLabel: { color: colors.muted, fontSize: 12.5, fontWeight: '700', marginBottom: 6 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, height: 48, borderRadius: radius.md, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: colors.border },
  fieldInput: { flex: 1, minWidth: 0, color: colors.text, fontSize: 18, fontWeight: '800' },
  fieldUnit: { color: colors.muted, fontSize: 12.5 },
  footer: { flexDirection: 'row', gap: 10, padding: 18 },
});
