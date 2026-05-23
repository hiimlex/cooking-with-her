import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Couple ────────────────────────────────────────────────────────────────
  const couple = await prisma.couple.upsert({
    where: { code: 'mochi' },
    update: {},
    create: {
      code: 'mochi',
      startedDate: new Date('2024-03-14'),
      weekGoal: 5,
    },
  });

  // ─── Users ─────────────────────────────────────────────────────────────────
  const alex = await prisma.user.upsert({
    where: { personId: 'alex' },
    update: {},
    create: {
      personId: 'alex',
      name: 'Alex',
      color: '#7c3aed',
      coupleId: couple.id,
    },
  });

  const yuka = await prisma.user.upsert({
    where: { personId: 'yuka' },
    update: {},
    create: {
      personId: 'yuka',
      name: 'Yuka',
      color: '#db2777',
      coupleId: couple.id,
    },
  });

  console.log('✓ Couple & users');

  // ─── Ingredients ───────────────────────────────────────────────────────────
  const ingredientData = [
    { id: 'tomato',      name: 'Tomato',         qty: 6,   unit: 'pcs',  cat: 'Produce', sprite: 'Tomato',  expiry: 4  },
    { id: 'onion',       name: 'Onion',           qty: 3,   unit: 'pcs',  cat: 'Produce', sprite: 'Onion',   expiry: 14 },
    { id: 'garlic',      name: 'Garlic',          qty: 1,   unit: 'head', cat: 'Produce', sprite: 'Garlic',  expiry: 21 },
    { id: 'carrot',      name: 'Carrots',         qty: 4,   unit: 'pcs',  cat: 'Produce', sprite: 'Carrot',  expiry: 10 },
    { id: 'bellpepper',  name: 'Bell Pepper',     qty: 2,   unit: 'pcs',  cat: 'Produce', sprite: 'Pepper',  expiry: 5  },
    { id: 'lemon',       name: 'Lemon',           qty: 2,   unit: 'pcs',  cat: 'Produce', sprite: 'Lemon',   expiry: 7  },
    { id: 'salmon',      name: 'Salmon fillet',   qty: 300, unit: 'g',    cat: 'Protein', sprite: 'Fish',    expiry: 1  },
    { id: 'chicken',     name: 'Chicken breast',  qty: 500, unit: 'g',    cat: 'Protein', sprite: 'Chicken', expiry: 2  },
    { id: 'eggs',        name: 'Eggs',            qty: 6,   unit: 'pcs',  cat: 'Protein', sprite: 'Egg',     expiry: 14 },
    { id: 'milk',        name: 'Whole milk',      qty: 1,   unit: 'L',    cat: 'Dairy',   sprite: 'Milk',    expiry: 6  },
    { id: 'parmesan',    name: 'Parmesan',        qty: 100, unit: 'g',    cat: 'Dairy',   sprite: 'Cheese',  expiry: 30 },
    { id: 'pasta',       name: 'Pasta',           qty: 400, unit: 'g',    cat: 'Pantry',  sprite: 'Pasta',   expiry: 365},
    { id: 'rice',        name: 'Rice',            qty: 500, unit: 'g',    cat: 'Pantry',  sprite: 'Rice',    expiry: 365},
    { id: 'freshbasil',  name: 'Fresh Basil',     qty: 1,   unit: 'pack', cat: 'Spice',   sprite: 'Herb',    expiry: 3  },
    { id: 'oliveoil',    name: 'Olive oil',       qty: 500, unit: 'ml',   cat: 'Pantry',  sprite: 'Bread',   expiry: 365},
  ];

  for (const ing of ingredientData) {
    await prisma.ingredient.upsert({
      where: { id: ing.id },
      update: ing,
      create: ing,
    });
  }

  console.log('✓ Ingredients');

  // ─── Utensils ──────────────────────────────────────────────────────────────
  const utensilData = [
    { id: 'nonstickpan',   name: 'Non-stick pan',    have: true,  emoji: '🍳' },
    { id: 'mediumpot',     name: 'Medium pot',        have: true,  emoji: '🥘' },
    { id: 'oven',          name: 'Oven',              have: true,  emoji: '♨️' },
    { id: 'bakingsheet',   name: 'Baking sheet',      have: true,  emoji: '🍪' },
    { id: 'chefknife',     name: 'Chef knife',        have: true,  emoji: '🔪' },
    { id: 'cuttingboard',  name: 'Cutting board',     have: true,  emoji: '🟫' },
    { id: 'blender',       name: 'Blender',           have: true,  emoji: '🫙' },
    { id: 'whisk',         name: 'Whisk',             have: true,  emoji: '🥄' },
    { id: 'wok',           name: 'Wok',               have: true,  emoji: '🥡' },
    { id: 'kitchenscale',  name: 'Kitchen scale',     have: false, emoji: '⚖️' },
    { id: 'meatthermo',    name: 'Meat thermometer',  have: false, emoji: '🌡️' },
    { id: 'mandoline',     name: 'Mandoline slicer',  have: false, emoji: '🔪' },
  ];

  for (const ut of utensilData) {
    await prisma.utensil.upsert({
      where: { id: ut.id },
      update: ut,
      create: ut,
    });
  }

  console.log('✓ Utensils');

  // ─── Recipes ───────────────────────────────────────────────────────────────
  const shakshuka = await prisma.recipe.upsert({
    where: { id: 'shakshuka' },
    update: {},
    create: {
      id: 'shakshuka',
      name: 'Sunday Shakshuka',
      tag: 'Brunch',
      time: 25,
      difficulty: 'Easy',
      cookedCount: 12,
      rating: 5.0,
      bg: '#fde8e8',
      accent: '#e63946',
      servings: 2,
      why: 'A one-pan wonder with eggs poached in rich tomato sauce. Perfect lazy Sunday vibes.',
      byId: alex.id,
      sprites: { create: [{ sprite: 'Tomato' }, { sprite: 'Egg' }] },
      nutrition: {
        create: { kcal: 380, protein: 18, carbs: 22, fat: 24, fiber: 5 },
      },
      steps: {
        create: [
          { order: 1, title: 'Chop the vegetables',  desc: 'Dice onion, mince garlic, chop bell pepper into small cubes.', mins: 5 },
          { order: 2, title: 'Sauté the base',        desc: 'Heat olive oil in a wide pan over medium heat. Cook onion and pepper until soft, about 5 min. Add garlic and cook 1 min more.', mins: 6 },
          { order: 3, title: 'Add tomatoes',          desc: 'Pour in crushed tomatoes, season with cumin, paprika, salt and pepper. Simmer for 10 min until sauce thickens.', mins: 10 },
          { order: 4, title: 'Crack in the eggs',     desc: 'Make 4 wells in the sauce. Crack an egg into each. Cover and cook until whites are set but yolks still runny — about 5 min.', mins: 5 },
          { order: 5, title: 'Serve',                 desc: 'Top with fresh basil and a pinch of chili flakes. Serve straight from the pan with crusty bread.', mins: 1 },
        ],
      },
    },
  });

  const salmon = await prisma.recipe.upsert({
    where: { id: 'salmon' },
    update: {},
    create: {
      id: 'salmon',
      name: 'Lemon Butter Salmon',
      tag: 'Dinner',
      time: 20,
      difficulty: 'Easy',
      cookedCount: 9,
      rating: 5.0,
      bg: '#e8f0fe',
      accent: '#1a73e8',
      servings: 2,
      why: 'A 20-minute weeknight star. Crispy-skin salmon basted in browned butter, garlic, and lemon. Tastes restaurant-fancy.',
      byId: yuka.id,
      sprites: { create: [{ sprite: 'Fish' }, { sprite: 'Lemon' }] },
      nutrition: {
        create: { kcal: 420, protein: 38, carbs: 4, fat: 28, fiber: 1 },
      },
      steps: {
        create: [
          { order: 1, title: 'Pat salmon dry',       desc: 'Pat the salmon fillets dry with paper towels. Season both sides with salt and pepper.', mins: 2 },
          { order: 2, title: 'Sear skin side',       desc: 'Heat oil in a skillet over high heat. Place salmon skin-side down. Press gently with a spatula. Cook 4 min without moving.', mins: 4 },
          { order: 3, title: 'Flip and baste',       desc: 'Flip the salmon. Add butter, garlic cloves, and lemon slices. Tilt the pan and baste continuously for 2 min.', mins: 2 },
          { order: 4, title: 'Rest and serve',       desc: 'Transfer to a plate. Squeeze fresh lemon over the top. Serve with steamed vegetables or rice.', mins: 2 },
        ],
      },
    },
  });

  const carbonara = await prisma.recipe.upsert({
    where: { id: 'carbonara' },
    update: {},
    create: {
      id: 'carbonara',
      name: 'Real Carbonara',
      tag: 'Dinner',
      time: 30,
      difficulty: 'Medium',
      cookedCount: 7,
      rating: 4.0,
      bg: '#fef9e8',
      accent: '#d4a017',
      servings: 2,
      why: 'No cream, no shortcuts. Just eggs, Pecorino, guanciale, and black pepper — the way Romans make it.',
      byId: alex.id,
      sprites: { create: [{ sprite: 'Pasta' }, { sprite: 'Egg' }] },
      nutrition: {
        create: { kcal: 580, protein: 28, carbs: 65, fat: 22, fiber: 3 },
      },
      steps: {
        create: [
          { order: 1, title: 'Boil pasta',            desc: 'Bring salted water to a boil. Cook pasta until al dente, reserve 1 cup pasta water before draining.', mins: 10 },
          { order: 2, title: 'Crisp the guanciale',   desc: 'Cook guanciale (or pancetta) in a dry pan over medium heat until golden and crispy. Remove from heat.', mins: 8 },
          { order: 3, title: 'Make the sauce',        desc: 'Whisk together egg yolks, grated Pecorino Romano, and a generous amount of black pepper in a bowl.', mins: 3 },
          { order: 4, title: 'Combine off heat',      desc: 'Add hot pasta to the pan with guanciale (off heat). Add egg mixture, tossing quickly. Add pasta water a splash at a time until creamy.', mins: 4 },
          { order: 5, title: 'Plate',                 desc: 'Serve immediately with extra Pecorino and black pepper on top.', mins: 1 },
        ],
      },
    },
  });

  const stirfry = await prisma.recipe.upsert({
    where: { id: 'stirfry' },
    update: {},
    create: {
      id: 'stirfry',
      name: 'Garlic Chicken Stir-fry',
      tag: 'Weekday',
      time: 18,
      difficulty: 'Easy',
      cookedCount: 8,
      rating: 4.0,
      bg: '#fef0e8',
      accent: '#ea580c',
      servings: 2,
      why: 'High heat, fast cook, bold garlic flavor. Ready in under 20 minutes on a weeknight.',
      byId: yuka.id,
      sprites: { create: [{ sprite: 'Chicken' }, { sprite: 'Garlic' }] },
      nutrition: {
        create: { kcal: 350, protein: 42, carbs: 18, fat: 12, fiber: 3 },
      },
      steps: {
        create: [
          { order: 1, title: 'Prep ingredients',     desc: 'Slice chicken into thin strips. Mince garlic. Chop vegetables into bite-sized pieces.', mins: 5 },
          { order: 2, title: 'Heat the wok',         desc: 'Heat wok over maximum heat until smoking. Add oil and swirl to coat.', mins: 2 },
          { order: 3, title: 'Cook chicken',         desc: 'Add chicken in a single layer. Let it sear for 2 min without stirring, then stir-fry 3 more min until cooked through.', mins: 5 },
          { order: 4, title: 'Add garlic and veg',   desc: 'Push chicken to the side. Add garlic and cook 30 seconds. Add vegetables and toss everything together.', mins: 4 },
          { order: 5, title: 'Sauce and serve',      desc: 'Pour in soy sauce, oyster sauce, and a dash of sesame oil. Toss to coat. Serve over steamed rice.', mins: 2 },
        ],
      },
    },
  });

  const tomatosoup = await prisma.recipe.upsert({
    where: { id: 'tomatosoup' },
    update: {},
    create: {
      id: 'tomatosoup',
      name: 'Cozy Tomato Soup',
      tag: 'Lunch',
      time: 35,
      difficulty: 'Easy',
      cookedCount: 5,
      rating: 5.0,
      bg: '#fde8e8',
      accent: '#e63946',
      servings: 3,
      why: 'Roasted tomatoes blended silky smooth. The kind of soup that makes you feel looked after.',
      byId: alex.id,
      sprites: { create: [{ sprite: 'Tomato' }] },
      nutrition: {
        create: { kcal: 210, protein: 5, carbs: 28, fat: 9, fiber: 6 },
      },
      steps: {
        create: [
          { order: 1, title: 'Roast tomatoes',       desc: 'Halve tomatoes and place cut-side up on a baking sheet with garlic cloves and onion. Drizzle with olive oil and roast at 200°C for 25 min.', mins: 25 },
          { order: 2, title: 'Blend',                desc: 'Transfer everything to a blender with vegetable stock. Blend until completely smooth.', mins: 3 },
          { order: 3, title: 'Season and serve',     desc: 'Pour into a pot, warm through, and season with salt, pepper, and a pinch of sugar. Serve with a drizzle of cream and crusty bread.', mins: 5 },
        ],
      },
    },
  });

  const fishtacos = await prisma.recipe.upsert({
    where: { id: 'fishtacos' },
    update: {},
    create: {
      id: 'fishtacos',
      name: 'Crispy Fish Tacos',
      tag: 'Dinner',
      time: 25,
      difficulty: 'Medium',
      cookedCount: 6,
      rating: 5.0,
      bg: '#e8f4fe',
      accent: '#0284c7',
      servings: 2,
      why: 'Beer-battered fish, crunchy slaw, lime crema. Taco Tuesday any day.',
      byId: yuka.id,
      sprites: { create: [{ sprite: 'Fish' }, { sprite: 'Lemon' }] },
      nutrition: {
        create: { kcal: 480, protein: 32, carbs: 45, fat: 18, fiber: 4 },
      },
      steps: {
        create: [
          { order: 1, title: 'Make the batter',      desc: 'Whisk flour, cornstarch, baking powder, salt, and beer together until smooth. Rest for 5 min.', mins: 6 },
          { order: 2, title: 'Make the slaw',        desc: 'Toss shredded cabbage with lime juice, salt, and a pinch of sugar. Set aside.', mins: 4 },
          { order: 3, title: 'Fry the fish',         desc: 'Dip fish strips into batter and fry in hot oil at 180°C for 3-4 min per side until golden and crispy.', mins: 10 },
          { order: 4, title: 'Assemble',             desc: 'Warm tortillas in a dry pan. Layer fish, slaw, chipotle crema, and fresh cilantro. Serve with lime wedges.', mins: 3 },
        ],
      },
    },
  });

  console.log('✓ Recipes');

  // ─── Recipe Ingredients (links) ────────────────────────────────────────────
  const recipeIngredients = [
    { recipeId: shakshuka.id,  ingredientId: 'tomato',     qty: 6,   unit: 'pcs'  },
    { recipeId: shakshuka.id,  ingredientId: 'eggs',       qty: 4,   unit: 'pcs'  },
    { recipeId: shakshuka.id,  ingredientId: 'onion',      qty: 1,   unit: 'pcs'  },
    { recipeId: shakshuka.id,  ingredientId: 'garlic',     qty: 3,   unit: 'cloves'},
    { recipeId: shakshuka.id,  ingredientId: 'bellpepper', qty: 1,   unit: 'pcs'  },
    { recipeId: salmon.id,     ingredientId: 'salmon',     qty: 300, unit: 'g'    },
    { recipeId: salmon.id,     ingredientId: 'lemon',      qty: 1,   unit: 'pcs'  },
    { recipeId: salmon.id,     ingredientId: 'garlic',     qty: 2,   unit: 'cloves'},
    { recipeId: carbonara.id,  ingredientId: 'pasta',      qty: 200, unit: 'g'    },
    { recipeId: carbonara.id,  ingredientId: 'eggs',       qty: 3,   unit: 'pcs'  },
    { recipeId: carbonara.id,  ingredientId: 'parmesan',   qty: 60,  unit: 'g'    },
    { recipeId: stirfry.id,    ingredientId: 'chicken',    qty: 400, unit: 'g'    },
    { recipeId: stirfry.id,    ingredientId: 'garlic',     qty: 4,   unit: 'cloves'},
    { recipeId: stirfry.id,    ingredientId: 'bellpepper', qty: 1,   unit: 'pcs'  },
    { recipeId: tomatosoup.id, ingredientId: 'tomato',     qty: 8,   unit: 'pcs'  },
    { recipeId: tomatosoup.id, ingredientId: 'onion',      qty: 1,   unit: 'pcs'  },
    { recipeId: tomatosoup.id, ingredientId: 'garlic',     qty: 3,   unit: 'cloves'},
    { recipeId: fishtacos.id,  ingredientId: 'salmon',     qty: 300, unit: 'g'    },
    { recipeId: fishtacos.id,  ingredientId: 'lemon',      qty: 2,   unit: 'pcs'  },
  ];

  for (const ri of recipeIngredients) {
    await prisma.recipeIngredient.create({ data: ri });
  }

  console.log('✓ Recipe ingredients');

  // ─── History ───────────────────────────────────────────────────────────────
  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000);

  const historyData = [
    { recipeId: stirfry.id,    byId: yuka.id, cookedAt: daysAgo(1),  rating: 5.0, note: 'Best one yet ⭐ extra garlic was the move'  },
    { recipeId: salmon.id,     byId: alex.id, cookedAt: daysAgo(2),  rating: 4.5, note: null                                        },
    { recipeId: shakshuka.id,  byId: alex.id, cookedAt: daysAgo(7),  rating: 5.0, note: null                                        },
    { recipeId: stirfry.id,    byId: yuka.id, cookedAt: daysAgo(12), rating: 4.0, note: null                                        },
    { recipeId: fishtacos.id,  byId: yuka.id, cookedAt: daysAgo(18), rating: 5.0, note: 'The slaw made it 🐟'                       },
    { recipeId: tomatosoup.id, byId: alex.id, cookedAt: daysAgo(23), rating: 5.0, note: null                                        },
    { recipeId: carbonara.id,  byId: alex.id, cookedAt: daysAgo(30), rating: 4.0, note: 'Need to work on the sauce creaminess'      },
  ];

  for (const h of historyData) {
    await prisma.historyEntry.create({ data: h });
  }

  console.log('✓ History');

  // ─── Shopping ──────────────────────────────────────────────────────────────
  const shoppingData = [
    { name: 'Avocados',    qty: '3 pcs',    cat: 'Produce', done: false, byId: yuka.id },
    { name: 'Cilantro',    qty: '1 bunch',  cat: 'Produce', done: false, byId: yuka.id },
    { name: 'Greek yogurt',qty: '500g',     cat: 'Dairy',   done: false, byId: alex.id },
    { name: 'Black beans', qty: '2 cans',   cat: 'Pantry',  done: false, byId: alex.id },
    { name: 'Lime',        qty: '4 pcs',    cat: 'Produce', done: true,  byId: yuka.id },
  ];

  for (const s of shoppingData) {
    await prisma.shoppingEntry.create({ data: s });
  }

  console.log('✓ Shopping list');

  // ─── Memories ──────────────────────────────────────────────────────────────
  const memoriesData = [
    { recipeId: carbonara.id,  byId: alex.id, date: daysAgo(4),  bg: '#fef9e8' },
    { recipeId: salmon.id,     byId: yuka.id, date: daysAgo(6),  bg: '#e8f0fe' },
    { recipeId: shakshuka.id,  byId: alex.id, date: daysAgo(7),  bg: '#fde8e8' },
    { recipeId: stirfry.id,    byId: yuka.id, date: daysAgo(10), bg: '#fef0e8' },
    { recipeId: fishtacos.id,  byId: yuka.id, date: daysAgo(14), bg: '#e8f4fe' },
    { recipeId: tomatosoup.id, byId: alex.id, date: daysAgo(13), bg: '#fde8e8' },
  ];

  for (const m of memoriesData) {
    await prisma.memory.create({ data: m });
  }

  console.log('✓ Memories');
  console.log('\n🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
