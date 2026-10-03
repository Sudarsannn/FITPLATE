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
  tip?: string; // extra help shown in beginner mode
};

export type Diet = 'veg' | 'egg' | 'non-veg';
export type Tag = 'quick' | 'high-protein' | 'night-before' | 'zero-energy' | 'batch-cook' | 'light';

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
  fibreG: number; // per serving
  diet: Diet;
  tags: Tag[];
  palette: [string, string]; // gradient for the dish art
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
    fibreG: 4,
    diet: 'veg',
    tags: ['quick', 'zero-energy', 'light'],
    palette: ['#FFB547', '#E8590C'],
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
      { text: 'Rinse it under the tap for 10 seconds, tossing gently. Do not soak it.', tip: 'Soaked poha turns mushy. It should feel soft but still hold its shape when pressed.' },
      { text: 'Sprinkle salt and sugar on the wet poha and leave it to soften.', amount: { qty: 1, unit: 'tsp each', item: 'salt and sugar' }, minutes: 5 },
      { text: 'Finely chop the onion.', amount: { qty: 1, unit: 'medium', item: 'onion' } },
      { text: 'Peel and cut the potato into small cubes.', amount: { qty: 1, unit: 'small', item: 'potato' } },
      { text: 'Slit the green chillies lengthwise.', amount: { qty: 2, unit: 'pcs', item: 'green chillies' } },
      { text: 'Heat the oil in the kadhai on medium flame.', amount: { qty: 1.5, unit: 'tbsp', item: 'oil' }, minutes: 1, equipment: 'Kadhai' },
      { text: 'Add the peanuts and fry until they turn golden.', amount: { qty: 30, unit: 'g', item: 'peanuts' }, minutes: 2 },
      { text: 'Add the mustard seeds and wait until they crackle.', tip: 'Crackling means the oil is hot enough. Keep a lid handy; the seeds can jump.', amount: { qty: 1, unit: 'tsp', item: 'mustard seeds' } },
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
    fibreG: 6,
    diet: 'veg',
    tags: ['quick', 'zero-energy', 'light'],
    palette: ['#A3E635', '#15803D'],
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
      { text: 'Add the cumin seeds and let them sizzle.', tip: 'If they turn black, the oil is too hot. Lower the flame and start again with fresh seeds.', amount: { qty: 0.5, unit: 'tsp', item: 'cumin seeds' } },
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
    fibreG: 2,
    diet: 'egg',
    tags: ['quick', 'high-protein'],
    palette: ['#FDE047', '#EA580C'],
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
      { text: 'Let it sit for 20 seconds, then scramble slowly with the spatula.', tip: 'Low flame and slow stirring keep the eggs soft. High heat makes them dry and rubbery.', minutes: 2 },
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
    fibreG: 3,
    diet: 'veg',
    tags: ['high-protein'],
    palette: ['#FB923C', '#B91C1C'],
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
      { text: 'Add the ginger-garlic paste and stir until the raw smell goes.', tip: 'The raw smell is sharp; once cooked it smells sweet and nutty.', amount: { qty: 1, unit: 'tbsp', item: 'ginger-garlic paste' }, minutes: 1 },
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
    fibreG: 3,
    diet: 'non-veg',
    tags: ['high-protein', 'batch-cook'],
    palette: ['#F59E0B', '#7C2D12'],
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
      { text: 'Boil until the rice is about 70% cooked: it should still break with a bite in the centre.', tip: 'Press a grain between your fingers: it should break into 2–3 pieces with a hard white centre.', minutes: 5 },
      { text: 'Drain the rice.' },
      { text: 'Spread the mint and coriander over the chicken.' },
      { text: 'Layer the rice evenly on top. Do not mix.' },
      { text: 'Top with the reserved onions and drizzle the ghee.', amount: { qty: 1, unit: 'tbsp', item: 'ghee' } },
      { text: 'Close the lid tightly. Put the pot on the tawa on the lowest flame (dum).', tip: 'Seal the lid edge with a strip of dough or foil so the steam stays in.', minutes: 15, equipment: 'Tawa' },
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

  {
    id: 'moong-chilla',
    name: 'Moong Dal Chilla',
    emoji: '🥞',
    category: 'Breakfast',
    tagline: 'A protein-packed savoury pancake. Soak the dal the night before.',
    baseServings: 2,
    timeMins: 20,
    difficulty: 'Easy',
    kcal: 290,
    restaurantKcal: 380,
    proteinG: 16,
    healthScore: 8,
    restaurantHealthScore: 5,
    fibreG: 7,
    diet: 'veg',
    tags: ['high-protein', 'night-before', 'quick'],
    palette: ['#86EFAC', '#0F766E'],
    healthNotes: [
      'Moong dal is one of the easiest dals to digest and is high in plant protein.',
      'A non-stick pan needs only a few drops of oil per chilla.',
      'Adding grated vegetables makes it a full breakfast in one plate.',
    ],
    orderPrice: 240,
    ingredients: [
      { name: 'Yellow moong dal', qty: 120, unit: 'g', cost: 17, brands: [
        { name: 'Tata Sampann', pack: '500 g', price: 75 },
        { name: 'Local loose', pack: '500 g', price: 65 },
      ] },
      { name: 'Ginger', qty: 1, unit: 'inch', cost: 2, brands: [{ name: 'Fresh', pack: '100 g', price: 20 }] },
      { name: 'Green chillies', qty: 2, unit: 'pcs', cost: 2, brands: [{ name: 'Fresh', pack: '100 g', price: 15 }] },
      { name: 'Onion', qty: 1, unit: 'small', cost: 4, brands: [{ name: 'Fresh', pack: '1 kg', price: 45 }] },
      { name: 'Carrot', qty: 1, unit: 'small', cost: 4, brands: [{ name: 'Fresh', pack: '500 g', price: 35 }] },
      { name: 'Cumin seeds', qty: 0.5, unit: 'tsp', cost: 1, brands: [{ name: 'Catch', pack: '100 g', price: 70 }] },
      { name: 'Cooking oil', qty: 2, unit: 'tsp', cost: 2, brands: [{ name: 'Saffola Gold', pack: '1 L', price: 195 }] },
      { name: 'Coriander leaves', qty: 1, unit: 'handful', cost: 4, brands: [{ name: 'Fresh', pack: '1 bunch', price: 15 }] },
      { name: 'Salt', qty: 0.75, unit: 'tsp', cost: 0, brands: [{ name: 'Tata Salt', pack: '1 kg', price: 28 }] },
    ],
    equipment: [
      { name: 'Mixer-grinder', alternative: 'Hand blender in a deep vessel' },
      { name: 'Non-stick tawa', alternative: 'Any flat non-stick pan' },
      { name: 'Ladle' },
    ],
    steps: [
      { text: 'The night before: rinse the dal twice and soak it in water.', amount: { qty: 120, unit: 'g', item: 'moong dal' }, tip: 'Short on time? Soak in hot water for 1 hour instead.' },
      { text: 'Drain the dal.' },
      { text: 'Blend the dal with ginger, green chillies and a little water into a smooth batter.', amount: { qty: 80, unit: 'ml', item: 'water' }, equipment: 'Mixer-grinder' },
      { text: 'Pour it into a bowl. Add salt and cumin seeds and mix.', tip: 'It should flow like dosa batter, thick but pourable.' },
      { text: 'Finely chop the onion and grate the carrot. Stir them into the batter.' },
      { text: 'Heat the tawa on medium flame and wipe a few drops of oil over it.', equipment: 'Tawa' },
      { text: 'Pour one ladle of batter in the centre and spread it in circles into a thin round.', tip: 'Spread from the centre outwards with the back of the ladle.' },
      { text: 'Drizzle a few drops of oil around the edge. Cook until the bottom is golden.', minutes: 2 },
      { text: 'Flip and cook the other side.', minutes: 1 },
      { text: 'Repeat with the rest of the batter. Top with coriander.' },
    ],
    finish: {
      eat: 'Eat hot with green chutney or curd.',
      store: 'Batter keeps 2 days in the fridge; cooked chillas are best fresh.',
      remix: 'Roll a chilla around paneer bhurji for a high-protein lunch wrap.',
      healthier: 'Stuff with crumbled paneer or add spinach to the batter.',
    },
  },
  {
    id: 'overnight-oats',
    name: 'Mango Overnight Oats',
    emoji: '🥭',
    category: 'Breakfast',
    tagline: 'Five minutes tonight, zero effort tomorrow morning.',
    baseServings: 2,
    timeMins: 5,
    difficulty: 'Easy',
    kcal: 320,
    restaurantKcal: 420,
    proteinG: 13,
    healthScore: 8,
    restaurantHealthScore: 5,
    fibreG: 6,
    diet: 'veg',
    tags: ['night-before', 'zero-energy', 'quick'],
    palette: ['#FDE68A', '#F97316'],
    healthNotes: [
      'Café overnight oats are often loaded with sugar syrup; ripe mango sweetens it naturally.',
      'Curd and milk add protein and calcium.',
      'Chia seeds add fibre and omega-3s.',
    ],
    orderPrice: 380,
    ingredients: [
      { name: 'Rolled oats', qty: 80, unit: 'g', cost: 16, brands: [
        { name: 'Quaker', pack: '1 kg', price: 199 },
        { name: 'Saffola', pack: '1 kg', price: 190 },
      ] },
      { name: 'Milk', qty: 200, unit: 'ml', cost: 14, brands: [{ name: 'Amul Taaza', pack: '500 ml', price: 34 }, { name: 'Gokul', pack: '500 ml', price: 33 }] },
      { name: 'Curd', qty: 100, unit: 'g', cost: 10, brands: [{ name: 'Amul Masti', pack: '400 g', price: 40 }] },
      { name: 'Chia seeds', qty: 2, unit: 'tsp', cost: 6, brands: [{ name: 'True Elements', pack: '250 g', price: 180 }], look: 'Tiny grey-black oval seeds, smaller than sesame.' },
      { name: 'Ripe mango', qty: 1, unit: 'pc', cost: 40, brands: [{ name: 'Alphonso (seasonal)', pack: '1 pc', price: 60 }, { name: 'Frozen mango chunks', pack: '400 g', price: 180 }] },
      { name: 'Honey', qty: 1, unit: 'tsp', cost: 3, brands: [{ name: 'Dabur', pack: '250 g', price: 120 }] },
    ],
    equipment: [{ name: '2 jars or boxes with lids', alternative: 'Any bowl covered with a plate' }],
    steps: [
      { text: 'Put the oats into the jars, split evenly.', amount: { qty: 80, unit: 'g', item: 'oats' } },
      { text: 'Add the milk and curd.', amount: { qty: 200, unit: 'ml', item: 'milk' } },
      { text: 'Add the chia seeds and honey and stir well.', amount: { qty: 2, unit: 'tsp', item: 'chia seeds' } },
      { text: 'Close the lids and put the jars in the fridge overnight.', tip: 'At least 6 hours, so the oats soften completely.' },
      { text: 'In the morning: chop the mango and put it on top.' },
    ],
    finish: {
      eat: 'Eat cold straight from the jar, or warm it for 1 minute if you prefer.',
      store: 'Keeps 2 days in the fridge, so make a few jars at once.',
      remix: 'Blend leftover oats with a banana and milk for a breakfast smoothie.',
      healthier: 'Add a spoon of peanut butter or a scoop of protein powder.',
    },
  },
  {
    id: 'rajma-chawal',
    name: 'Rajma Chawal',
    emoji: '🫘',
    category: 'Main',
    tagline: 'Sunday comfort food that covers three weekday lunches.',
    baseServings: 2,
    timeMins: 50,
    difficulty: 'Medium',
    kcal: 520,
    restaurantKcal: 680,
    proteinG: 19,
    healthScore: 7,
    restaurantHealthScore: 4,
    fibreG: 14,
    diet: 'veg',
    tags: ['batch-cook', 'high-protein', 'night-before'],
    palette: ['#F87171', '#7F1D1D'],
    healthNotes: [
      'Rajma is very high in fibre, which keeps blood sugar steady after lunch.',
      'Rajma with rice gives a complete protein, like meat.',
      'Restaurants finish it with extra butter and cream; at home it is just as good without.',
    ],
    orderPrice: 480,
    ingredients: [
      { name: 'Rajma (kidney beans)', qty: 150, unit: 'g', cost: 27, brands: [
        { name: 'Tata Sampann Chitra', pack: '500 g', price: 95 },
        { name: 'Local Jammu rajma', pack: '500 g', price: 110 },
      ] },
      { name: 'Basmati rice', qty: 150, unit: 'g', cost: 23, brands: [{ name: 'India Gate', pack: '1 kg', price: 150 }] },
      { name: 'Onions', qty: 2, unit: 'medium', cost: 10, brands: [{ name: 'Fresh', pack: '1 kg', price: 45 }] },
      { name: 'Tomatoes', qty: 3, unit: 'medium', cost: 15, brands: [{ name: 'Fresh', pack: '1 kg', price: 50 }] },
      { name: 'Ginger-garlic paste', qty: 1, unit: 'tbsp', cost: 4, brands: [{ name: 'Smith & Jones', pack: '200 g', price: 55 }] },
      { name: 'Rajma masala', qty: 1.5, unit: 'tbsp', cost: 6, brands: [{ name: 'MDH', pack: '100 g', price: 75 }, { name: 'Everest', pack: '100 g', price: 70 }] },
      { name: 'Cooking oil', qty: 1.5, unit: 'tbsp', cost: 5, brands: [{ name: 'Fortune', pack: '1 L', price: 180 }] },
      { name: 'Ghee', qty: 1, unit: 'tsp', cost: 3, brands: [{ name: 'Amul', pack: '200 ml', price: 140 }] },
      { name: 'Salt', qty: 1.5, unit: 'tsp', cost: 1, brands: [{ name: 'Tata Salt', pack: '1 kg', price: 28 }] },
    ],
    equipment: [
      { name: 'Pressure cooker', alternative: 'Heavy pot, but boil the rajma for 1.5 hours' },
      { name: 'Saucepan for rice', alternative: 'Electric rice cooker' },
    ],
    steps: [
      { text: 'The night before: rinse the rajma and soak it in plenty of water.', amount: { qty: 150, unit: 'g', item: 'rajma' }, tip: 'Rajma doubles in size, so use at least 3 times as much water.' },
      { text: 'Drain the rajma and put it in the pressure cooker with fresh water and ½ tsp salt.', amount: { qty: 600, unit: 'ml', item: 'water' }, equipment: 'Pressure cooker' },
      { text: 'Cook for 6 whistles, then on low flame.', minutes: 10, tip: 'Never eat undercooked rajma. A bean should mash easily between two fingers.' },
      { text: 'Let the pressure release on its own.', minutes: 10 },
      { text: 'Meanwhile, wash the rice and cook it with twice the water.', amount: { qty: 150, unit: 'g', item: 'rice' }, minutes: 15, equipment: 'Saucepan' },
      { text: 'Finely chop the onions and purée the tomatoes.' },
      { text: 'Heat the oil in a pan on medium flame. Fry the onions until golden.', amount: { qty: 1.5, unit: 'tbsp', item: 'oil' }, minutes: 6 },
      { text: 'Add the ginger-garlic paste and stir for 1 minute.' },
      { text: 'Add the tomato purée and rajma masala. Cook until oil separates at the edges.', minutes: 6, tip: 'Small drops of oil appear around the edge of the masala when it is done.' },
      { text: 'Add the cooked rajma with its water. Mash a few beans against the side.' },
      { text: 'Simmer until thick and creamy.', minutes: 10 },
      { text: 'Finish with the ghee and serve over the rice.', amount: { qty: 1, unit: 'tsp', item: 'ghee' } },
    ],
    finish: {
      eat: 'Serve with sliced onion, lemon and curd.',
      store: 'Rajma keeps 3 days in the fridge and freezes for a month, so make a double batch.',
      remix: 'Mash leftover rajma into tikkis, or use it as a burrito-bowl filling with rice and salad.',
      healthier: 'Use brown rice or half rice, half salad.',
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
