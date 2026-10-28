import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReactNode } from 'react';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { featureFlags } from '../../config/featureFlags';
import { researchDishes } from '../../data/research';
import { useStore } from '../../lib/store';
import type { Dish } from '../../models/research';
import { byNumber, COMING_SORTS, DIET_OPTIONS, dishDoc, dishFilterGroups, DISH_SORTS } from '../../services/dishLibrary';
import { worksWithKitchen } from '../../services/kitchen';
import { loadExcludedAllergens, saveExcludedAllergens } from '../../services/rememberedFilters';
import { GUEST_OWNER } from '../../services/storage';
import { activeCount, optionCounts, runSearch, toggle, type FilterGroup, type Selection } from '../../services/search';
import { colors, radius, type } from '../../theme';
import { IconBadge, type IconName } from '../Icon';
import { GradientButton, PressableScale, TopGlow } from '../ui';
import { RecentRows } from './RecentRows';
import { SelectChip } from './parts';
import { ResearchDishCard } from './ResearchDishCard';

/** One-tap chips above the list: the filters people reach for most. */
const QUICK: { group: string; option: string; label: string }[] = [
  { group: 'diet', option: 'veg', label: 'Veg' },
  { group: 'nutrition', option: 'high-protein', label: 'High protein' },
  { group: 'time', option: 'under-30', label: 'Under 30 min' },
  { group: 'meal', option: 'breakfast', label: 'Breakfast' },
];

const RELEVANCE = 'relevance';

/**
 * Day 6: the Cook tab's dish library on the research data (SPEC-ADDENDA §9).
 * Search covers every dish; the person narrows it with filters. Nothing here
 * is filtered by the survey.
 */
export function DishLibrary({ dishes = researchDishes }: { dishes?: readonly Dish[] }) {
  const insets = useSafeAreaInsets();
  // The survey never filters the library; it only swaps the first one-tap chip to the person's own diet.
  const { profile, equipmentOwned } = useStore();
  // Day 10: "Works with my kitchen" uses the survey's kitchen answers; off until tapped.
  const [myKitchen, setMyKitchen] = useState(false);
  const myDiet = profile.diet !== 'non-veg' && profile.diet !== 'veg' ? DIET_OPTIONS.find((o) => o.id === profile.diet) : undefined;
  const quick = myDiet ? [{ group: 'diet', option: myDiet.id, label: myDiet.label }, ...QUICK] : QUICK;
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [selection, setSelection] = useState<Selection>({});
  const [sortId, setSortId] = useState<string>(RELEVANCE);
  const [sheet, setSheet] = useState<'filters' | 'sort' | null>(null);
  useRememberedAllergens(selection, setSelection);

  const groups = useMemo(() => dishFilterGroups(dishes), [dishes]);
  const sort = DISH_SORTS.find((s) => s.id === sortId) ?? RELEVANCE;
  const results = useMemo(() => {
    const found = runSearch(dishes, { toDoc: dishDoc, query: deferredQuery, groups, selection, sort, tieBreak: byNumber }).map((r) => r.item);
    return myKitchen && equipmentOwned.length ? found.filter((d) => worksWithKitchen(d, equipmentOwned)) : found;
  }, [dishes, deferredQuery, groups, selection, sort, myKitchen, equipmentOwned]);
  const counts = useMemo(() => (sheet === 'filters' ? optionCounts(dishes, groups, selection) : {}), [sheet, dishes, groups, selection]);
  const nActive = activeCount(selection);
  const activeChips = groups.flatMap((g) => g.options.filter((o) => selection[g.id]?.includes(o.id)).map((o) => ({ g, o })));
  const sortLabel = sort === RELEVANCE ? 'Best match' : sort.label;
  const excludesAllergens = (selection.allergen ?? []).length > 0;

  const header = (
    <View>
      <Text style={[type.h1, { color: colors.text }]} accessibilityRole="header">
        Cook
      </Text>
      <Text style={[type.small, { color: colors.muted, marginTop: 2 }]}>
        {dishes.filter((d) => !d.ai).length} researched dishes, and more every day. Search by name, ingredient or diet.
      </Text>
      {featureFlags.recentDishes && !query.trim() ? <RecentRows /> : null}

      <PressableScale
        onPress={() => router.push({ pathname: '/create-dish', params: query.trim() ? { name: query.trim() } : {} })}
        style={styles.aiCard}
        scaleTo={0.98}
        accessibilityLabel="Create your own dish with AI"
      >
        <IconBadge name="sparkles-outline" color={colors.violet} size={42} />
        <View style={{ flex: 1 }}>
          <Text style={styles.aiTitle}>Create your own dish with AI</Text>
          <Text style={styles.aiSub}>Not on the list? Describe it and get the full recipe, ingredients and step-by-step cooking.</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </PressableScale>

      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Biryani, paneer, jeera, Jain…"
          placeholderTextColor={colors.faint}
          style={styles.input}
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel="Search dishes"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={12} accessibilityRole="button" accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRow} contentContainerStyle={styles.quickContent} keyboardShouldPersistTaps="handled">
        <SelectChip
          label={nActive ? `Filters · ${nActive}` : 'Filters'}
          selected={nActive > 0}
          onPress={() => setSheet('filters')}
          icon={<Ionicons name="options-outline" size={16} color={nActive ? '#06210F' : colors.text} />}
        />
        <SelectChip label={sortLabel} selected={sort !== RELEVANCE} onPress={() => setSheet('sort')} icon={<Ionicons name="swap-vertical" size={16} color={sort !== RELEVANCE ? '#06210F' : colors.text} />} />
        <SelectChip
          label="Works with my kitchen"
          selected={myKitchen && equipmentOwned.length > 0}
          onPress={() => (equipmentOwned.length ? setMyKitchen((on) => !on) : router.push({ pathname: '/survey', params: { page: 'kitchen' } }))}
          icon={<Ionicons name="flame-outline" size={16} color={myKitchen && equipmentOwned.length ? '#06210F' : colors.text} />}
        />
        {quick.filter((q) => groups.some((g) => g.id === q.group && g.options.some((o) => o.id === q.option))).map((q) => (
          <SelectChip key={q.label} label={q.label} selected={!!selection[q.group]?.includes(q.option)} onPress={() => setSelection((s) => toggle(s, q.group, q.option))} />
        ))}
      </ScrollView>

      {activeChips.length ? (
        <View style={styles.active}>
          {activeChips.map(({ g, o }) => (
            <Pressable
              key={`${g.id}:${o.id}`}
              onPress={() => setSelection((s) => toggle(s, g.id, o.id))}
              style={styles.activeChip}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={`Remove filter ${g.mode === 'exclude' ? `no ${o.label}` : o.label}`}
            >
              <Text style={styles.activeText}>{g.mode === 'exclude' ? `No ${o.label.toLowerCase()}` : o.label}</Text>
              <Ionicons name="close" size={14} color={colors.text} />
            </Pressable>
          ))}
          <Pressable onPress={() => setSelection({})} hitSlop={10} accessibilityRole="button" style={styles.clearAll}>
            <Text style={styles.clearText}>Clear all</Text>
          </Pressable>
        </View>
      ) : null}

      <Text style={[type.label, { color: colors.muted, marginTop: 16 }]} accessibilityLiveRegion="polite">
        {results.length} {results.length === 1 ? 'dish' : 'dishes'}
      </Text>
      {myKitchen && equipmentOwned.length ? (
        <Text style={styles.note}>
          Only dishes your kitchen can make, from the {equipmentOwned.length} {equipmentOwned.length === 1 ? 'item' : 'items'} you ticked.{' '}
          <Text style={{ color: colors.accent, fontWeight: '800' }} onPress={() => router.push({ pathname: '/survey', params: { page: 'kitchen' } })} accessibilityRole="link">
            Edit your kitchen
          </Text>
        </Text>
      ) : null}
      <Text style={styles.note}>
        Allergens are worked out from each recipe&apos;s ingredients. Check labels if you have an allergy
        {excludesAllergens ? ', because packaged spice mixes can contain allergens their names don’t show.' : '.'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <TopGlow color={colors.accent} />
      <FlatList
        data={results}
        keyExtractor={(d) => d.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 55).duration(420)}>
            <ResearchDishCard dish={item} />
          </Animated.View>
        )}
        ListHeaderComponent={header}
        ListHeaderComponentStyle={{ marginBottom: 10 }}
        ListEmptyComponent={
          dishes.length === 0 ? (
            <Empty icon="restaurant-outline" title="Dishes are on their way" body="The first researched dishes arrive with the next app update." />
          ) : (
            <Empty
              icon="search-outline"
              title="No results"
              body={query ? `Nothing for “${query.trim()}” with these filters. Try fewer filters or another word.` : 'Try removing a filter.'}
              action={nActive || query ? { label: 'Clear search and filters', onPress: () => (setSelection({}), setQuery('')) } : undefined}
              extra={
                <GradientButton
                  title="Why stop here? Cook whatever is in your mind"
                  onPress={() => router.push({ pathname: '/create-dish', params: query.trim() ? { name: query.trim() } : {} })}
                  style={{ marginTop: 14 }}
                />
              }
            />
          )
        }
        contentContainerStyle={{ padding: 18, paddingBottom: 140 + insets.bottom }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={8}
        windowSize={7}
        showsVerticalScrollIndicator={false}
      />

      <Sheet visible={sheet === 'filters'} title="Filters" onClose={() => setSheet(null)} footer={{ label: `Show ${results.length} ${results.length === 1 ? 'dish' : 'dishes'}`, onPress: () => setSheet(null) }} onClear={nActive ? () => setSelection({}) : undefined}>
        {groups.map((g) => (
          <FilterSection key={g.id} group={g} selection={selection} counts={counts} onToggle={(o) => setSelection((s) => toggle(s, g.id, o))} />
        ))}
        <Text style={styles.note}>“Jain”, “Vegan”, “Gluten-free” and “Dairy-free” include dishes with a researched version (shown as “… option” on the card).</Text>
      </Sheet>

      <Sheet visible={sheet === 'sort'} title="Sort by" onClose={() => setSheet(null)}>
        <View style={styles.wrap}>
          <SelectChip label="Best match" selected={sort === RELEVANCE} onPress={() => (setSortId(RELEVANCE), setSheet(null))} />
          {DISH_SORTS.map((s) => (
            <SelectChip key={s.id} label={s.label} selected={sortId === s.id} onPress={() => (setSortId(s.id), setSheet(null))} />
          ))}
        </View>
        <Text style={[type.label, { color: colors.muted, marginTop: 18, marginBottom: 8 }]}>Coming soon</Text>
        <View style={styles.wrap}>
          {COMING_SORTS.map((s) => (
            <SelectChip key={s.label} label={s.label} selected={false} disabled onPress={() => undefined} />
          ))}
        </View>
        <Text style={styles.note}>These need {[...new Set(COMING_SORTS.map((s) => s.when))].join(' and ')}, which arrive in the next updates.</Text>
      </Sheet>
    </SafeAreaView>
  );
}

/** Innovation (Day 06, flag rememberAllergens): keep "Leave out dishes that contain" between visits, on this device. */
function useRememberedAllergens(selection: Selection, setSelection: (f: (s: Selection) => Selection) => void) {
  const { user } = useStore();
  const owner = user && !user.guest && user.uid ? user.uid : GUEST_OWNER;
  const loadedFor = useRef<string | null>(null);
  const allergens = selection.allergen ?? [];
  const key = allergens.join(',');

  useEffect(() => {
    if (!featureFlags.rememberAllergens) return;
    let alive = true;
    loadedFor.current = null;
    loadExcludedAllergens(AsyncStorage, owner).then((ids) => {
      if (!alive) return;
      setSelection((s) => ({ ...s, allergen: ids }));
      loadedFor.current = owner;
    });
    return () => {
      alive = false;
    };
  }, [owner, setSelection]);

  useEffect(() => {
    // Save only after this owner's saved choice has been read, so it is never overwritten by the empty start.
    if (!featureFlags.rememberAllergens || loadedFor.current !== owner) return;
    void saveExcludedAllergens(AsyncStorage, owner, key ? key.split(',') : []);
  }, [owner, key]);
}

function FilterSection({ group, selection, counts, onToggle }: { group: FilterGroup<Dish>; selection: Selection; counts: Record<string, number>; onToggle: (id: string) => void }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={[type.label, { color: colors.muted, marginBottom: 8 }]} accessibilityRole="header">
        {group.label}
      </Text>
      <View style={styles.wrap}>
        {group.options.map((o) => {
          const selected = !!selection[group.id]?.includes(o.id);
          const n = counts[`${group.id}:${o.id}`];
          return <SelectChip key={o.id} label={o.label} selected={selected} count={n} disabled={!selected && n === 0 && group.mode === 'any'} onPress={() => onToggle(o.id)} />;
        })}
      </View>
    </View>
  );
}

function Sheet({
  visible,
  title,
  onClose,
  onClear,
  footer,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  onClear?: () => void;
  footer?: { label: string; onPress: () => void };
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" accessibilityRole="button" />
      <View style={[styles.sheet, { paddingBottom: 12 + insets.bottom }]} accessibilityViewIsModal>
        <View style={styles.grabber} />
        <View style={styles.sheetTop}>
          <Text style={[type.h2, { color: colors.text }]} accessibilityRole="header">
            {title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {onClear ? (
              <Pressable onPress={onClear} hitSlop={10} accessibilityRole="button" style={styles.sheetBtn}>
                <Text style={styles.clearText}>Clear all</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close" style={styles.sheetBtn}>
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>
          </View>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
        {footer ? (
          <Pressable onPress={footer.onPress} style={styles.footerBtn} accessibilityRole="button">
            <Text style={styles.footerText}>{footer.label}</Text>
          </Pressable>
        ) : null}
      </View>
    </Modal>
  );
}

function Empty({ icon, title, body, action, extra }: { icon: IconName; title: string; body: string; action?: { label: string; onPress: () => void }; extra?: ReactNode }) {
  return (
    <View style={styles.empty}>
      <IconBadge name={icon} size={64} color={colors.muted} />
      <Text style={[type.h2, { color: colors.text, marginTop: 8, textAlign: 'center' }]}>{title}</Text>
      <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 6 }}>{body}</Text>
      {action ? (
        <Pressable onPress={action.onPress} style={[styles.footerBtn, { marginTop: 16, alignSelf: 'stretch' }]} accessibilityRole="button">
          <Text style={styles.footerText}>{action.label}</Text>
        </Pressable>
      ) : null}
      {extra ? <View style={{ alignSelf: 'stretch' }}>{extra}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  aiCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14, padding: 14, borderRadius: radius.lg, backgroundColor: 'rgba(167,139,250,0.10)', borderWidth: 1, borderColor: 'rgba(167,139,250,0.30)' },
  aiTitle: { color: colors.text, fontWeight: '800', fontSize: 15 },
  aiSub: { color: colors.muted, fontSize: 12.5, lineHeight: 17, marginTop: 2 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: 13 },
  quickRow: { marginHorizontal: -18, marginTop: 12 },
  quickContent: { paddingHorizontal: 18, gap: 8, paddingVertical: 2 },
  active: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, alignItems: 'center' },
  activeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.cardAlt },
  activeText: { color: colors.text, fontSize: 12.5, fontWeight: '700' },
  clearAll: { paddingHorizontal: 6, paddingVertical: 6 },
  clearText: { color: colors.accent, fontWeight: '800', fontSize: 13.5 },
  note: { color: colors.faint, fontSize: 11.5, lineHeight: 16, marginTop: 4 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    maxHeight: '82%',
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.faint, marginBottom: 8 },
  sheetTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sheetBtn: { minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' },
  footerBtn: { minHeight: 50, borderRadius: radius.pill, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  footerText: { color: '#06210F', fontWeight: '900', fontSize: 16 },
  empty: { alignItems: 'center', padding: 30 },
});
