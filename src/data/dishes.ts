// Hard-coded demo dishes. Every price and nutrition number here is an ESTIMATE
// (Mumbai, Oct 2026) for the faked demo. Replace with checked values before
// showing anyone numbers as fact.

export type Brand = { name: string; pack: string; price: number };

export type Ingredient = {
  name: string;
  qty: number; // for baseServings
  unit: string;
  cost: number; // ₹ of the pack actually used, for baseServings
  brands: Brand[];
  look?: string; // what it looks like, for unfamiliar items
};

export type Step = {
  text: string;
  amount?: { qty: number; unit: string; item: string }; // scaled with servings
  minutes?: number;
  equipment?: string;
};

export type Dish = {
  id: string;
  name: string;
  emoji: string;
  category: 'Breakfast' | 'Main';
  tagline: string;
  baseServings: number;
  timeMins: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  kcal: number; // per serving, home-made
  restaurantKcal: number; // per serving, typical restaurant version
  proteinG: number; // per serving
  healthScore: number; // 0–10, home-made
  restaurantHealthScore: number;
  healthNotes: string[];
  orderPrice: number; // ₹ for baseServings on a delivery app, incl. typical fees
  ingredients: Ingredient[];
  equipment: { name: string; alternative?: string }[];
  steps: Step[];
  finish: { eat: string; store: string; remix: string; healthier: string };
};

export const dishes: Dish[] = [
  {
    id: 'poha',
    name: 'Kanda Poha',
    emoji: '🍛',
    category: 'Breakfast',
    tagline: 'A 20-minute Maharashtrian breakfast that beats skipping one.',
    baseServings: 2,
    timeMins: 20,
    difficulty: 'Easy',
    kcal: 300,
    restaurantKcal: 380,
    proteinG: 7,
    healthScore: 7,
    restaurantHealthScore: 5,
    healthNotes: [
      'Restaurants often use reused palm or blended oil; at home you control the oil and use half as much.',
      'Peanuts add protein and good fats.',
      'Lemon at the end adds vitamin C, which helps you absorb the iron in poha.',
    ],
    orderPrice: 260,
    ingredients: [
      { name: 'Thick poha (flattened rice)', qty: 120, unit: 'g', cost: 14, brands: [
        { name: 'Tata Sampann', pack: '500 g', price: 62 },
        { name: 'Rajdhani', pack: '500 g', price: 55 },
        { name: 'Local loose', pack: '500 g', price: 45 },
      ] },
      { name: 'Onion', qty: 1, unit: 'medium', cost: 6, brands: [{ name: 'Fresh', pack: '1 kg', price: 45 }] },
      { name: 'Potato', qty: 1, unit: 'small', cost: 5, brands: [{ name: 'Fresh', pack: '1 kg', price: 40 }] },
      { name: 'Raw peanuts', qty: 30, unit: 'g', cost: 6, brands: [
        { name: 'Tata Sampann', pack: '500 g', price: 110 },
        { name: 'Local loose', pack: '500 g', price: 90 },
      ] },
      { name: 'Green chillies', qty: 2, unit: 'pcs', cost: 2, brands: [{ name: 'Fresh', pack: '100 g', price: 15 }] },
      { name: 'Curry leaves', qty: 10, unit: 'leaves', cost: 3, brands: [{ name: 'Fresh', pack: '1 bunch', price: 10 }], look: 'Small, glossy dark-green leaves on a thin stem.' },
      { name: 'Mustard seeds', qty: 1, unit: 'tsp', cost: 1, brands: [{ name: 'Catch', pack: '100 g', price: 40 }], look: 'Tiny round dark-brown seeds.' },
      { name: 'Turmeric powder', qty: 0.5, unit: 'tsp', cost: 1, brands: [{ name: 'Everest', pack: '100 g', price: 38 }, { name: 'MDH', pack: '100 g', price: 40 }] },
      { name: 'Cooking oil', qty: 1.5, unit: 'tbsp', cost: 5, brands: [
        { name: 'Fortune groundnut', pack: '1 L', price: 210 },
        { name: 'Saffola Gold', pack: '1 L', price: 195 },
      ] },
      { name: 'Lemon', qty: 1, unit: 'pc', cost: 5, brands: [{ name: 'Fresh', pack: '4 pcs', price: 20 }] },
      { name: 'Coriander leaves', qty: 1, unit: 'handful', cost: 4, brands: [{ name: 'Fresh', pack: '1 bunch', price: 15 }] },
      { name: 'Salt and sugar', qty: 1, unit: 'tsp each', cost: 1, brands: [{ name: 'Tata Salt', pack: '1 kg', price: 28 }] },
    ],
    equipment: [
      { name: 'Kadhai or deep pan', alternative: 'Any wide non-stick pan' },
      { name: 'Sieve / colander', alternative: 'A plate tilted over the sink' },
      { name: 'Spatula' },
    ],
    steps: [
      { text: 'Put the poha in a sieve.', amount: { qty: 120, unit: 'g', item: 'poha' }, equipment: 'Sieve' },
      { text: 'Rinse it under the tap for 10 seconds, tossing gently. Do not soak it.' },
      { text: 'Sprinkle salt and sugar on the wet poha and leave it to soften.', amount: { qty: 1, unit: 'tsp each', item: 'salt and sugar' }, minutes: 5 },
      { text: 'Finely chop the onion.', amount: { qty: 1, unit: 'medium', item: 'onion' } },
      { text: 'Peel and cut the potato into small cubes.', amount: { qty: 1, unit: 'small', item: 'potato' } },
      { text: 'Slit the green chillies lengthwise.', amount: { qty: 2, unit: 'pcs', item: 'green chillies' } },
      { text: 'Heat the oil in the kadhai on medium flame.', amount: { qty: 1.5, unit: 'tbsp', item: 'oil' }, minutes: 1, equipment: 'Kadhai' },
      { text: 'Add the peanuts and fry until they turn golden.', amount: { qty: 30, unit: 'g', item: 'peanuts' }, minutes: 2 },
      { text: 'Add the mustard seeds and wait until they crackle.', amount: { qty: 1, unit: 'tsp', item: 'mustard seeds' } },
      { text: 'Add the curry leaves and green chillies. Stir for 10 seconds.' },
      { text: 'Add the potato cubes, cover and cook until soft.', minutes: 5 },
      { text: 'Add the onion and cook until it turns see-through.', minutes: 2 },
      { text: 'Add the turmeric and stir once.', amount: { qty: 0.5, unit: 'tsp', item: 'turmeric' } },
      { text: 'Add the softened poha and mix gently so it does not break.' },
      { text: 'Cover and steam on low flame.', minutes: 2 },
      { text: 'Turn off the flame. Squeeze the lemon over and add the coriander.', amount: { qty: 1, unit: 'pc', item: 'lemon' } },
    ],
    finish: {
      eat: 'Eat it warm. Add a spoon of curd on the side for extra protein.',
      store: 'Best fresh. Keeps 1 day in the fridge in a closed box; sprinkle water before reheating.',
      remix: 'Leftover poha becomes poha cutlets: mash with a boiled potato, shape and shallow-fry.',
      healthier: 'Add a handful of peas and grated carrot, and swap half the potato for sprouts.',
    },
  },
  {
    id: 'masala-oats',
    name: 'Masala Oats',
    emoji: '🥣',
    category: 'Breakfast',
    tagline: 'Savoury, filling, and on the table in 15 minutes.',
    baseServings: 2,
    timeMins: 15,
    difficulty: 'Easy',
    kcal: 260,
    restaurantKcal: 320,
    proteinG: 9,
    healthScore: 8,
    restaurantHealthScore: 6,
    healthNotes: [
      'Oats are high in soluble fibre, which keeps you full until lunch.',
      'Packaged masala-oats sachets are high in salt; making your own masala cuts that in half.',
      'The vegetables add vitamins you miss when you skip breakfast.',
    ],
    orderPrice: 220,
    ingredients: [
      { name: 'Rolled oats', qty: 80, unit: 'g', cost: 16, brands: [
        { name: 'Quaker', pack: '1 kg', price: 199 },
        { name: 'Saffola', pack: '1 kg', price: 190 },
        { name: 'True Elements', pack: '1 kg', price: 230 },
      ] },
      { name: 'Onion', qty: 1, unit: 'small', cost: 4, brands: [{ name: 'Fresh', pack: '1 kg', price: 45 }] },
      { name: 'Tomato', qty: 1, unit: 'medium', cost: 5, brands: [{ name: 'Fresh', pack: '1 kg', price: 50 }] },
      { name: 'Carrot', qty: 1, unit: 'small', cost: 4, brands: [{ name: 'Fresh', pack: '500 g', price: 35 }] },
      { name: 'Green peas (frozen)', qty: 50, unit: 'g', cost: 8, brands: [{ name: 'Safal', pack: '500 g', price: 80 }] },
      { name: 'Ginger', qty: 1, unit: 'inch', cost: 2, brands: [{ name: 'Fresh', pack: '100 g', price: 20 }] },
      { name: 'Cumin seeds', qty: 0.5, unit: 'tsp', cost: 1, brands: [{ name: 'Catch', pack: '100 g', price: 70 }] },
      { name: 'Turmeric, red chilli and garam masala', qty: 0.5, unit: 'tsp each', cost: 2, brands: [{ name: 'Everest', pack: '100 g each', price: 40 }] },
      { name: 'Cooking oil', qty: 1, unit: 'tbsp', cost: 3, brands: [{ name: 'Saffola Gold', pack: '1 L', price: 195 }] },
      { name: 'Salt', qty: 0.75, unit: 'tsp', cost: 0, brands: [{ name: 'Tata Salt', pack: '1 kg', price: 28 }] },
    ],
    equipment: [
      { name: 'Saucepan', alternative: 'Pressure cooker without the lid' },
      { name: 'Spatula' },
    ],
    steps: [
      { text: 'Finely chop the onion, tomato and carrot.' },
      { text: 'Grate the ginger.', amount: { qty: 1, unit: 'inch', item: 'ginger' } },
      { text: 'Heat the oil in the saucepan on medium flame.', amount: { qty: 1, unit: 'tbsp', item: 'oil' }, equipment: 'Saucepan' },
      { text: 'Add the cumin seeds and let them sizzle.', amount: { qty: 0.5, unit: 'tsp', item: 'cumin seeds' } },
      { text: 'Add the onion and ginger. Cook until soft.', minutes: 2 },
      { text: 'Add the carrot and peas. Cook, stirring.', amount: { qty: 50, unit: 'g', item: 'peas' }, minutes: 2 },
      { text: 'Add the tomato and cook until mushy.', minutes: 2 },
      { text: 'Add turmeric, red chilli, garam masala and salt. Stir for 20 seconds.' },
      { text: 'Add the oats and stir to coat them in the masala.', amount: { qty: 80, unit: 'g', item: 'oats' } },
      { text: 'Pour in water and stir.', amount: { qty: 400, unit: 'ml', item: 'water' } },
      { text: 'Simmer on low flame, stirring now and then, until thick.', minutes: 4 },
    ],
    finish: {
      eat: 'Eat hot. It thickens as it cools, so add a splash of hot water if needed.',
      store: 'Best fresh. Keeps 1 day in the fridge; loosen with hot water when reheating.',
      remix: 'Cold leftover oats make a quick chilla batter: add besan and water, then make pancakes.',
      healthier: 'Stir in a beaten egg or crumbled paneer at the end to double the protein.',
    },
  },
  {
    id: 'egg-bhurji',
    name: 'Egg Bhurji Pav',
    emoji: '🍳',
    category: 'Main',
    tagline: 'Mumbai street-style bhurji with half the butter.',
    baseServings: 2,
    timeMins: 15,
    difficulty: 'Easy',
    kcal: 380,
    restaurantKcal: 560,
    proteinG: 18,
    healthScore: 7,
    restaurantHealthScore: 4,
    healthNotes: [
      'Street bhurji is often finished with a big block of butter; at home one teaspoon is enough.',
      'Four eggs give about 24 g of protein across two plates.',
      'Use whole-wheat pav to add fibre.',
    ],
    orderPrice: 320,
    ingredients: [
      { name: 'Eggs', qty: 4, unit: 'pcs', cost: 30, brands: [
        { name: 'Eggoz', pack: '6 pcs', price: 66 },
        { name: 'Local', pack: '6 pcs', price: 45 },
      ] },
      { name: 'Onion', qty: 1, unit: 'medium', cost: 6, brands: [{ name: 'Fresh', pack: '1 kg', price: 45 }] },
      { name: 'Tomato', qty: 1, unit: 'medium', cost: 5, brands: [{ name: 'Fresh', pack: '1 kg', price: 50 }] },
      { name: 'Green chillies', qty: 2, unit: 'pcs', cost: 2, brands: [{ name: 'Fresh', pack: '100 g', price: 15 }] },
      { name: 'Pav bhaji masala', qty: 1, unit: 'tsp', cost: 2, brands: [{ name: 'Everest', pack: '100 g', price: 75 }, { name: 'MDH', pack: '100 g', price: 80 }] },
      { name: 'Turmeric and red chilli powder', qty: 0.5, unit: 'tsp each', cost: 1, brands: [{ name: 'Everest', pack: '100 g each', price: 40 }] },
      { name: 'Butter', qty: 1, unit: 'tsp', cost: 3, brands: [{ name: 'Amul', pack: '100 g', price: 60 }] },
      { name: 'Cooking oil', qty: 1, unit: 'tbsp', cost: 3, brands: [{ name: 'Fortune', pack: '1 L', price: 180 }] },
      { name: 'Pav', qty: 4, unit: 'pcs', cost: 20, brands: [{ name: 'Britannia', pack: '6 pcs', price: 35 }, { name: 'Local bakery', pack: '6 pcs', price: 30 }] },
      { name: 'Coriander leaves', qty: 1, unit: 'handful', cost: 4, brands: [{ name: 'Fresh', pack: '1 bunch', price: 15 }] },
    ],
    equipment: [
      { name: 'Non-stick pan', alternative: 'Iron tawa on medium-low flame' },
      { name: 'Bowl and fork for beating eggs' },
      { name: 'Spatula' },
    ],
    steps: [
      { text: 'Crack the eggs into a bowl.', amount: { qty: 4, unit: 'pcs', item: 'eggs' }, equipment: 'Bowl' },
      { text: 'Add a pinch of salt and beat with a fork until smooth.' },
      { text: 'Finely chop the onion, tomato and green chillies.' },
      { text: 'Heat the oil in the pan on medium flame.', amount: { qty: 1, unit: 'tbsp', item: 'oil' }, equipment: 'Pan' },
      { text: 'Add the onion and chillies. Cook until light golden.', minutes: 3 },
      { text: 'Add the tomato and cook until soft.', minutes: 2 },
      { text: 'Add turmeric, red chilli and pav bhaji masala. Stir for 20 seconds.' },
      { text: 'Turn the flame to low. Pour in the eggs.' },
      { text: 'Let it sit for 20 seconds, then scramble slowly with the spatula.', minutes: 2 },
      { text: 'Turn off the flame while the eggs are still slightly soft. Stir in the butter.', amount: { qty: 1, unit: 'tsp', item: 'butter' } },
      { text: 'Slit the pav and toast it on the same pan for 30 seconds each side.', amount: { qty: 4, unit: 'pcs', item: 'pav' } },
      { text: 'Top the bhurji with coriander and serve with the pav.' },
    ],
    finish: {
      eat: 'Eat immediately while the eggs are soft. A few onion rings and lemon on the side go well.',
      store: 'Eat the same day. Cooked eggs keep up to 1 day in the fridge but turn rubbery.',
      remix: 'Roll leftover bhurji in a roti with some chutney for an office lunch wrap.',
      healthier: 'Use 2 whole eggs + 3 whites, and add spinach with the tomato.',
    },
  },
  {
    id: 'paneer-butter-masala',
    name: 'Paneer Butter Masala',
    emoji: '🧈',
    category: 'Main',
    tagline: 'The restaurant favourite, at a third of the price.',
    baseServings: 2,
    timeMins: 40,
    difficulty: 'Medium',
    kcal: 450,
    restaurantKcal: 680,
    proteinG: 20,
    healthScore: 6,
    restaurantHealthScore: 3,
    healthNotes: [
      'Restaurant versions often use vanaspati or cheap blended oil and lots of cream.',
      'Cashew paste gives the same creaminess with far less cream.',
      'Paneer is a strong vegetarian protein source: about 18 g per 100 g.',
    ],
    orderPrice: 650,
    ingredients: [
      { name: 'Paneer', qty: 200, unit: 'g', cost: 90, brands: [
        { name: 'Amul', pack: '200 g', price: 95 },
        { name: 'Gowardhan', pack: '200 g', price: 90 },
        { name: 'Milky Mist', pack: '200 g', price: 100 },
      ] },
      { name: 'Tomatoes', qty: 4, unit: 'medium', cost: 20, brands: [{ name: 'Fresh', pack: '1 kg', price: 50 }] },
      { name: 'Onion', qty: 1, unit: 'medium', cost: 6, brands: [{ name: 'Fresh', pack: '1 kg', price: 45 }] },
      { name: 'Cashews', qty: 12, unit: 'pcs', cost: 15, brands: [{ name: 'Happilo', pack: '200 g', price: 230 }, { name: 'Local loose', pack: '250 g', price: 220 }] },
      { name: 'Ginger-garlic paste', qty: 1, unit: 'tbsp', cost: 4, brands: [{ name: 'Smith & Jones', pack: '200 g', price: 55 }] },
      { name: 'Butter', qty: 25, unit: 'g', cost: 15, brands: [{ name: 'Amul', pack: '100 g', price: 60 }] },
      { name: 'Fresh cream', qty: 50, unit: 'ml', cost: 15, brands: [{ name: 'Amul', pack: '200 ml', price: 65 }] },
      { name: 'Kashmiri red chilli powder', qty: 1, unit: 'tsp', cost: 2, brands: [{ name: 'Everest', pack: '100 g', price: 70 }] },
      { name: 'Garam masala', qty: 0.5, unit: 'tsp', cost: 2, brands: [{ name: 'MDH', pack: '100 g', price: 85 }] },
      { name: 'Kasuri methi (dried fenugreek)', qty: 1, unit: 'tsp', cost: 2, brands: [{ name: 'MDH', pack: '25 g', price: 30 }], look: 'Crumbly dried greenish-brown leaves with a strong smell.' },
      { name: 'Cooking oil', qty: 1, unit: 'tbsp', cost: 3, brands: [{ name: 'Fortune', pack: '1 L', price: 180 }] },
      { name: 'Salt and sugar', qty: 1, unit: 'tsp each', cost: 1, brands: [{ name: 'Tata Salt', pack: '1 kg', price: 28 }] },
    ],
    equipment: [
      { name: 'Kadhai or deep pan' },
      { name: 'Mixer-grinder', alternative: 'Hand blender in a deep vessel' },
      { name: 'Spatula' },
    ],
    steps: [
      { text: 'Soak the cashews in hot water.', amount: { qty: 12, unit: 'pcs', item: 'cashews' }, minutes: 10 },
      { text: 'Roughly chop the tomatoes and onion.' },
      { text: 'Cut the paneer into bite-size cubes.', amount: { qty: 200, unit: 'g', item: 'paneer' } },
      { text: 'Heat the oil in the kadhai on medium flame.', amount: { qty: 1, unit: 'tbsp', item: 'oil' }, equipment: 'Kadhai' },
      { text: 'Add the onion and cook until soft.', minutes: 3 },
      { text: 'Add the ginger-garlic paste and stir until the raw smell goes.', amount: { qty: 1, unit: 'tbsp', item: 'ginger-garlic paste' }, minutes: 1 },
      { text: 'Add the tomatoes and drained cashews. Cook until the tomatoes are mushy.', minutes: 6 },
      { text: 'Turn off the flame and let it cool.', minutes: 5 },
      { text: 'Blend it into a smooth paste.', equipment: 'Mixer-grinder' },
      { text: 'Melt the butter in the same kadhai on low flame.', amount: { qty: 25, unit: 'g', item: 'butter' } },
      { text: 'Add the Kashmiri chilli powder and stir for 10 seconds.', amount: { qty: 1, unit: 'tsp', item: 'Kashmiri chilli' } },
      { text: 'Pour in the blended paste and some water. Simmer, stirring.', amount: { qty: 150, unit: 'ml', item: 'water' }, minutes: 5 },
      { text: 'Add salt, sugar and garam masala.' },
      { text: 'Crush the kasuri methi between your palms and add it.', amount: { qty: 1, unit: 'tsp', item: 'kasuri methi' } },
      { text: 'Add the paneer cubes and simmer gently.', minutes: 3 },
      { text: 'Turn off the flame and stir in the cream.', amount: { qty: 50, unit: 'ml', item: 'cream' } },
    ],
    finish: {
      eat: 'Serve with roti or jeera rice. Roti keeps it lighter than naan.',
      store: 'Keeps 2 days in the fridge in a closed box. Reheat gently with a splash of water.',
      remix: 'Leftover gravy + leftover rice = paneer makhani rice bowl, or use it as a wrap filling.',
      healthier: 'Use milk instead of cream and add capsicum or peas with the paneer.',
    },
  },
  {
    id: 'chicken-biryani',
    name: 'Chicken Biryani',
    emoji: '🍗',
    category: 'Main',
    tagline: 'India’s most-ordered dish, made in one pot.',
    baseServings: 2,
    timeMins: 75,
    difficulty: 'Medium',
    kcal: 650,
    restaurantKcal: 850,
    proteinG: 35,
    healthScore: 6,
    restaurantHealthScore: 4,
    healthNotes: [
      'Delivery biryani often has a layer of oil on top; one spoon of ghee is plenty at home.',
      'You can choose leaner cuts and skip the extra fried onions.',
      'Curd marinade tenderises the chicken and adds protein.',
    ],
    orderPrice: 700,
    ingredients: [
      { name: 'Chicken (curry cut)', qty: 400, unit: 'g', cost: 130, brands: [
        { name: 'Licious', pack: '500 g', price: 180 },
        { name: 'FreshToHome', pack: '500 g', price: 170 },
        { name: 'Local butcher', pack: '500 g', price: 150 },
      ] },
      { name: 'Basmati rice', qty: 250, unit: 'g', cost: 38, brands: [
        { name: 'India Gate Classic', pack: '1 kg', price: 170 },
        { name: 'Daawat Biryani', pack: '1 kg', price: 185 },
        { name: 'Fortune', pack: '1 kg', price: 140 },
      ] },
      { name: 'Curd', qty: 150, unit: 'g', cost: 15, brands: [{ name: 'Amul Masti', pack: '400 g', price: 40 }] },
      { name: 'Onions', qty: 2, unit: 'large', cost: 14, brands: [{ name: 'Fresh', pack: '1 kg', price: 45 }] },
      { name: 'Tomato', qty: 1, unit: 'medium', cost: 5, brands: [{ name: 'Fresh', pack: '1 kg', price: 50 }] },
      { name: 'Ginger-garlic paste', qty: 1.5, unit: 'tbsp', cost: 5, brands: [{ name: 'Smith & Jones', pack: '200 g', price: 55 }] },
      { name: 'Biryani masala', qty: 2, unit: 'tbsp', cost: 12, brands: [{ name: 'Shan', pack: '50 g', price: 70 }, { name: 'Everest', pack: '50 g', price: 60 }] },
      { name: 'Whole spices (bay leaf, cardamom, cloves, cinnamon)', qty: 1, unit: 'set', cost: 8, brands: [{ name: 'Catch', pack: 'assorted', price: 60 }], look: 'Cinnamon looks like rolled brown bark; green cardamom is a small pale-green pod.' },
      { name: 'Mint and coriander leaves', qty: 1, unit: 'handful each', cost: 10, brands: [{ name: 'Fresh', pack: '1 bunch each', price: 15 }] },
      { name: 'Ghee', qty: 1, unit: 'tbsp', cost: 10, brands: [{ name: 'Amul', pack: '200 ml', price: 140 }, { name: 'Gowardhan', pack: '200 ml', price: 135 }] },
      { name: 'Cooking oil', qty: 2, unit: 'tbsp', cost: 6, brands: [{ name: 'Fortune', pack: '1 L', price: 180 }] },
      { name: 'Salt', qty: 1.5, unit: 'tsp', cost: 1, brands: [{ name: 'Tata Salt', pack: '1 kg', price: 28 }] },
    ],
    equipment: [
      { name: 'Heavy-bottom pot with a tight lid', alternative: 'Pressure cooker used without the whistle' },
      { name: 'Large saucepan for boiling rice' },
      { name: 'Mixing bowl' },
      { name: 'Tawa (to rest the pot on for dum)', alternative: 'Skip it and use the lowest flame' },
    ],
    steps: [
      { text: 'Wash the rice 3 times until the water runs clear.', amount: { qty: 250, unit: 'g', item: 'rice' } },
      { text: 'Soak the rice in water.', minutes: 20 },
      { text: 'Put the chicken in the bowl.', amount: { qty: 400, unit: 'g', item: 'chicken' }, equipment: 'Mixing bowl' },
      { text: 'Add curd, ginger-garlic paste, biryani masala and 1 tsp salt. Mix well.', amount: { qty: 150, unit: 'g', item: 'curd' } },
      { text: 'Cover and let it marinate while the rice soaks.', minutes: 20 },
      { text: 'Thinly slice the onions.', amount: { qty: 2, unit: 'large', item: 'onions' } },
      { text: 'Heat the oil in the heavy pot on medium flame.', amount: { qty: 2, unit: 'tbsp', item: 'oil' }, equipment: 'Heavy pot' },
      { text: 'Fry the onions until deep golden. Take out a third for the top.', minutes: 10 },
      { text: 'Add the whole spices and stir for 20 seconds.' },
      { text: 'Add the chopped tomato and cook until soft.', minutes: 2 },
      { text: 'Add the marinated chicken. Cook on medium, stirring.', minutes: 8 },
      { text: 'Cover and cook on low until the chicken is done.', minutes: 10 },
      { text: 'Meanwhile, boil water in the saucepan with ½ tsp salt.', amount: { qty: 1.5, unit: 'L', item: 'water' }, equipment: 'Saucepan' },
      { text: 'Drain the rice and add it to the boiling water.' },
      { text: 'Boil until the rice is about 70% cooked: it should still break with a bite in the centre.', minutes: 5 },
      { text: 'Drain the rice.' },
      { text: 'Spread the mint and coriander over the chicken.' },
      { text: 'Layer the rice evenly on top. Do not mix.' },
      { text: 'Top with the reserved onions and drizzle the ghee.', amount: { qty: 1, unit: 'tbsp', item: 'ghee' } },
      { text: 'Close the lid tightly. Put the pot on the tawa on the lowest flame (dum).', minutes: 15, equipment: 'Tawa' },
      { text: 'Turn off the flame and leave it closed.', minutes: 5 },
      { text: 'Open and mix gently from the side, bringing chicken up with the rice.' },
    ],
    finish: {
      eat: 'Serve with plain curd or cucumber raita; it balances the spice and adds protein.',
      store: 'Cool within an hour, then fridge up to 2 days. Reheat until steaming hot; don’t reheat rice more than once.',
      remix: 'Turn leftovers into biryani fried rice with a fried egg on top, or stuff into a paratha.',
      healthier: 'Use skinless chicken, half the ghee, and serve with a big salad.',
    },
  },
];

export const getDish = (id: string) => dishes.find((d) => d.id === id);

export const costToMake = (dish: Dish, servings: number) =>
  Math.round((dish.ingredients.reduce((sum, i) => sum + i.cost, 0) * servings) / dish.baseServings);

export const costToOrder = (dish: Dish, servings: number) =>
  Math.round((dish.orderPrice * servings) / dish.baseServings);

// Rough running cost: ~60 kcal per km for a 70 kg adult.
export const kmToBurn = (kcal: number) => Math.round((kcal / 60) * 10) / 10;

export const scaleQty = (qty: number, dish: Dish, servings: number) => {
  const v = (qty * servings) / dish.baseServings;
  if (v >= 10) return String(Math.round(v));
  return String(Math.round(v * 4) / 4).replace(/\.0$/, '');
};
