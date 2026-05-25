import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Populando banco de dados...");

  // ─── Casal ─────────────────────────────────────────────────────────────────
  const couple = await prisma.couple.upsert({
    where: { code: "chico" },
    update: {},
    create: { code: "chico", startedDate: new Date("2024-03-14"), weekGoal: 5 },
  });

  const alex = await prisma.user.upsert({
    where: { personId: "alex" },
    update: { coupleId: couple.id },
    create: {
      personId: "alex",
      name: "Alex",
      color: "#7c3aed",
      coupleId: couple.id,
    },
  });

  const yuka = await prisma.user.upsert({
    where: { personId: "yuka" },
    update: { coupleId: couple.id },
    create: {
      personId: "yuka",
      name: "Yuka",
      color: "#db2777",
      coupleId: couple.id,
    },
  });

  console.log("✓ Casal e usuários");

  // ─── Limpeza ───────────────────────────────────────────────────────────────
  await prisma.memory.deleteMany();
  await prisma.historyEntry.deleteMany();
  await prisma.shoppingEntry.deleteMany();
  await prisma.recipeIngredient.deleteMany();
  await prisma.recipeSprite.deleteMany();
  await prisma.recipeStep.deleteMany();
  await prisma.nutrition.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.ingredient.deleteMany();

  console.log("✓ Banco limpo");

  // ─── Ingredientes ──────────────────────────────────────────────────────────
  const ings = await prisma.ingredient.createMany({
    data: [
      // Mercearia
      {
        id: "acucar",
        name: "Açúcar",
        qty: 1,
        unit: "kg",
        cat: "Pantry",
        expiry: 365,
        monthlyBuy: 1,
      },
      {
        id: "ovos",
        name: "Ovos",
        qty: 12,
        unit: "unid",
        cat: "Protein",
        expiry: 14,
        monthlyBuy: 30,
      },
      {
        id: "macarrao",
        name: "Macarrão",
        qty: 500,
        unit: "g",
        cat: "Pantry",
        expiry: 365,
        monthlyBuy: 1000,
      },
      {
        id: "creme-leite",
        name: "Creme de leite",
        qty: 6,
        unit: "unid",
        cat: "Dairy",
        expiry: 60,
        monthlyBuy: 6,
      },
      {
        id: "molho-tomate",
        name: "Molho de tomate",
        qty: 3,
        unit: "unid",
        cat: "Pantry",
        expiry: 180,
        monthlyBuy: 3,
      },
      {
        id: "sardinha",
        name: "Sardinha",
        qty: 2,
        unit: "unid",
        cat: "Protein",
        expiry: 730,
        monthlyBuy: 2,
      },
      {
        id: "arroz",
        name: "Arroz",
        qty: 5,
        unit: "kg",
        cat: "Pantry",
        expiry: 365,
        monthlyBuy: 5,
      },
      {
        id: "feijao",
        name: "Feijão",
        qty: 2,
        unit: "kg",
        cat: "Pantry",
        expiry: 365,
        monthlyBuy: 2,
      },
      {
        id: "pao-forma",
        name: "Pão de forma",
        qty: 1,
        unit: "unid",
        cat: "Pantry",
        expiry: 7,
        monthlyBuy: 2,
      },
      {
        id: "doce-leite",
        name: "Doce de leite",
        qty: 1,
        unit: "unid",
        cat: "Pantry",
        expiry: 180,
        monthlyBuy: 1,
      },
      {
        id: "cuscuz",
        name: "Cuscuz",
        qty: 500,
        unit: "g",
        cat: "Pantry",
        expiry: 180,
        monthlyBuy: 500,
      },
      {
        id: "pipoca",
        name: "Pipoca",
        qty: 1,
        unit: "unid",
        cat: "Pantry",
        expiry: 365,
        monthlyBuy: 1,
      },
      {
        id: "oleo",
        name: "Óleo",
        qty: 900,
        unit: "ml",
        cat: "Pantry",
        expiry: 365,
        monthlyBuy: 900,
      },
      {
        id: "azeite",
        name: "Azeite",
        qty: 500,
        unit: "ml",
        cat: "Pantry",
        expiry: 365,
        monthlyBuy: 500,
      },
      {
        id: "suco",
        name: "Suco",
        qty: 1,
        unit: "unid",
        cat: "Pantry",
        expiry: 30,
        monthlyBuy: 4,
      },
      {
        id: "farinha",
        name: "Farinha de trigo",
        qty: 1,
        unit: "kg",
        cat: "Pantry",
        expiry: 365,
        monthlyBuy: 1,
      },
      {
        id: "leite",
        name: "Leite",
        qty: 1,
        unit: "L",
        cat: "Dairy",
        expiry: 7,
        monthlyBuy: 4,
      },
      {
        id: "bolacha",
        name: "Bolacha",
        qty: 1,
        unit: "unid",
        cat: "Pantry",
        expiry: 180,
      },
      {
        id: "queijo",
        name: "Queijo",
        qty: 200,
        unit: "g",
        cat: "Dairy",
        expiry: 21,
        monthlyBuy: 400,
      },
      {
        id: "mortadela",
        name: "Mortadela",
        qty: 200,
        unit: "g",
        cat: "Protein",
        expiry: 7,
        monthlyBuy: 200,
      },
      {
        id: "requeijao",
        name: "Requeijão",
        qty: 1,
        unit: "unid",
        cat: "Dairy",
        expiry: 30,
        monthlyBuy: 1,
      },
      {
        id: "cha",
        name: "Chá",
        qty: 1,
        unit: "unid",
        cat: "Pantry",
        expiry: 365,
      },
      {
        id: "manteiga",
        name: "Manteiga",
        qty: 200,
        unit: "g",
        cat: "Dairy",
        expiry: 30,
        monthlyBuy: 200,
      },
      {
        id: "sal",
        name: "Sal",
        qty: 0,
        alwaysAvailable: true,
        cat: "Spice",
        expiry: 3650,
        unit: "g",
      },
      {
        id: "po-royal",
        name: "Pó Royal",
        qty: 1,
        unit: "unid",
        cat: "Pantry",
        expiry: 365,
      },
      // Temperos
      {
        id: "pimenta",
        name: "Pimenta do reino",
        qty: 0,
        unit: "g",
        cat: "Spice",
        alwaysAvailable: true,
        expiry: 365,
      },
      {
        id: "paprica",
        name: "Páprica",
        qty: 0,
        unit: "g",
        cat: "Spice",
        expiry: 365,
        alwaysAvailable: true,
      },
      {
        id: "lemon-pepper",
        name: "Lemon pepper",
        qty: 0,
        unit: "g",
        cat: "Spice",
        expiry: 365,
        alwaysAvailable: true,
      },
      // Carnes
      {
        id: "frango",
        name: "Frango",
        qty: 1,
        unit: "kg",
        cat: "Protein",
        expiry: 3,
        monthlyBuy: 2,
      },
      {
        id: "calabresa",
        name: "Calabresa",
        qty: 500,
        unit: "g",
        cat: "Protein",
        expiry: 7,
        monthlyBuy: 500,
      },
      {
        id: "bacon",
        name: "Bacon",
        qty: 200,
        unit: "g",
        cat: "Protein",
        expiry: 7,
        monthlyBuy: 200,
      },
      {
        id: "carne-moida",
        name: "Carne moída",
        qty: 500,
        unit: "g",
        cat: "Protein",
        expiry: 2,
        monthlyBuy: 500,
      },
      {
        id: "linguica",
        name: "Linguiça",
        qty: 400,
        unit: "g",
        cat: "Protein",
        expiry: 5,
        monthlyBuy: 400,
      },
      {
        id: "peixe",
        name: "Peixe",
        qty: 400,
        unit: "g",
        cat: "Protein",
        expiry: 2,
        monthlyBuy: 400,
      },
      // Legumes, verduras e frutas
      {
        id: "alho",
        name: "Alho",
        qty: 20,
        unit: "unid",
        cat: "Produce",
        expiry: 21,
        monthlyBuy: 20,
      },
      {
        id: "alface",
        name: "Alface",
        qty: 1,
        unit: "unid",
        cat: "Produce",
        expiry: 5,
      },
      {
        id: "cebola",
        name: "Cebola",
        qty: 4,
        unit: "unid",
        cat: "Produce",
        expiry: 21,
        monthlyBuy: 6,
      },
      {
        id: "cebola-roxa",
        name: "Cebola roxa",
        qty: 2,
        unit: "unid",
        cat: "Produce",
        expiry: 21,
      },
      {
        id: "repolho",
        name: "Repolho",
        qty: 1,
        unit: "unid",
        cat: "Produce",
        expiry: 14,
      },
      {
        id: "brocolis",
        name: "Brócolis",
        qty: 1,
        unit: "unid",
        cat: "Produce",
        expiry: 5,
      },
      {
        id: "cenoura",
        name: "Cenoura",
        qty: 5,
        unit: "unid",
        cat: "Produce",
        expiry: 14,
      },
      {
        id: "tomate",
        name: "Tomate",
        qty: 6,
        unit: "unid",
        cat: "Produce",
        expiry: 7,
      },
      {
        id: "batata",
        name: "Batata",
        qty: 1,
        unit: "kg",
        cat: "Produce",
        expiry: 21,
      },
      {
        id: "uva",
        name: "Uva",
        qty: 500,
        unit: "g",
        cat: "Produce",
        expiry: 7,
      },
      {
        id: "maca",
        name: "Maçã",
        qty: 4,
        unit: "unid",
        cat: "Produce",
        expiry: 14,
      },
      {
        id: "batata-doce",
        name: "Batata doce",
        qty: 1,
        unit: "kg",
        cat: "Produce",
        expiry: 14,
      },
      {
        id: "macaxeira",
        name: "Macaxeira",
        qty: 1,
        unit: "kg",
        cat: "Produce",
        expiry: 7,
      },
      {
        id: "cheiro-verde",
        name: "Cheiro verde",
        qty: 1,
        unit: "unid",
        cat: "Produce",
        expiry: 5,
      },
      {
        id: "beterraba",
        name: "Beterraba",
        qty: 3,
        unit: "unid",
        cat: "Produce",
        expiry: 14,
      },
      {
        id: "limao",
        name: "Limão",
        qty: 6,
        unit: "unid",
        cat: "Produce",
        expiry: 14,
      },
    ],
  });

  console.log(`✓ ${ings.count} ingredientes`);

  // ─── Utensílios ────────────────────────────────────────────────────────────
  await prisma.utensil.deleteMany();
  await prisma.utensil.createMany({
    data: [
      { id: "frigideira", name: "Frigideira", have: true, emoji: "🍳" },
      { id: "panela", name: "Panela média", have: true, emoji: "🥘" },
      { id: "pressao", name: "Panela de pressão", have: true, emoji: "♨️" },
      { id: "forno", name: "Forno", have: true, emoji: "🔥" },
      { id: "assadeira", name: "Assadeira", have: true, emoji: "🍪" },
      { id: "faca", name: "Faca de chef", have: true, emoji: "🔪" },
      { id: "tabua", name: "Tábua de corte", have: true, emoji: "🟫" },
      { id: "liquidificador", name: "Liquidificador", have: true, emoji: "🫙" },
      { id: "ralador", name: "Ralador", have: true, emoji: "🥄" },
      { id: "cuscuzeira", name: "Cuscuzeira", have: true, emoji: "🧺" },
      {
        id: "escorredor",
        name: "Escorredor de massa",
        have: true,
        emoji: "🍜",
      },
      { id: "balanca", name: "Balança de cozinha", have: false, emoji: "⚖️" },
    ],
  });

  console.log("✓ Utensílios");

  // ─── Receitas ──────────────────────────────────────────────────────────────
  const r1 = await prisma.recipe.create({
    data: {
      id: "arroz-brocolis-frango",
      name: "Arroz com Brócolis e Frango",
      tag: "Weekday",
      time: 35,
      difficulty: "Easy",
      cookedCount: 0,
      rating: 0,
      bg: "#D4EDDA",
      accent: "#28A745",
      servings: 2,
      why: "Refeição completa e nutritiva num só prato. Frango grelhado com brócolis levemente refogado sobre arroz soltinho.",
      byId: alex.id,
      sprites: {
        create: [{ sprite: "Rice" }, { sprite: "Chicken" }, { sprite: "Herb" }],
      },
      nutrition: {
        create: { kcal: 480, protein: 38, carbs: 52, fat: 10, fiber: 5 },
      },
      steps: {
        create: [
          {
            order: 1,
            title: "Cozinhar o arroz",
            desc: "Refogue 2 dentes de alho amassados no óleo. Adicione o arroz e frite 2 minutos. Coloque 4 xícaras de água quente e sal. Tampe e cozinhe em fogo baixo por 18 minutos.",
            mins: 20,
          },
          {
            order: 2,
            title: "Temperar o frango",
            desc: "Corte o frango em cubos médios. Tempere com sal, pimenta do reino e lemon pepper.",
            mins: 5,
          },
          {
            order: 3,
            title: "Selar o frango",
            desc: "Numa frigideira quente com fio de óleo, sele o frango em fogo alto até dourar dos dois lados. Reserve.",
            mins: 8,
          },
          {
            order: 4,
            title: "Refogar o brócolis",
            desc: "Na mesma frigideira, doure a cebola picada. Adicione o brócolis em floretes pequenos e refogue 3 minutos. Junte o frango, misture bem.",
            mins: 5,
          },
          {
            order: 5,
            title: "Montar e servir",
            desc: "Sirva o arroz com o frango e brócolis por cima. Finalize com um fio de azeite e suco de limão.",
            mins: 2,
          },
        ],
      },
    },
  });

  const r2 = await prisma.recipe.create({
    data: {
      id: "baiao-de-dois",
      name: "Baião de Dois",
      tag: "Weekday",
      time: 45,
      difficulty: "Easy",
      cookedCount: 0,
      rating: 0,
      bg: "#FFF3CD",
      accent: "#E8A000",
      servings: 4,
      why: "Clássico nordestino de arroz com feijão verde, queijo coalho e calabresa. Comida de alma.",
      byId: yuka.id,
      sprites: {
        create: [{ sprite: "Rice" }, { sprite: "Cheese" }, { sprite: "Herb" }],
      },
      nutrition: {
        create: { kcal: 420, protein: 18, carbs: 68, fat: 10, fiber: 8 },
      },
      steps: {
        create: [
          {
            order: 1,
            title: "Cozinhar o feijão",
            desc: "Coloque o feijão na pressão com água e sal. Cozinhe por 15 minutos após pegar pressão. O grão deve ficar cozido mas inteiro. Escorra e reserve o caldo.",
            mins: 20,
          },
          {
            order: 2,
            title: "Refogar a base",
            desc: "Na manteiga, refogue a cebola picada e o alho até dourar. Adicione a calabresa em rodelas e deixe fritar 3 minutos.",
            mins: 6,
          },
          {
            order: 3,
            title: "Juntar arroz e feijão",
            desc: "Adicione o arroz e misture bem no refogado por 2 minutos. Acrescente o feijão cozido e o caldo suficiente para cozinhar o arroz. Acerte o sal.",
            mins: 3,
          },
          {
            order: 4,
            title: "Cozinhar juntos",
            desc: "Tampe e cozinhe em fogo baixo por 18 minutos até o arroz absorver todo o líquido.",
            mins: 18,
          },
          {
            order: 5,
            title: "Finalizar com queijo",
            desc: "Desligue o fogo, misture o queijo em cubinhos e o cheiro verde picado. Tampe e aguarde 2 minutos para o queijo começar a derreter. Sirva.",
            mins: 3,
          },
        ],
      },
    },
  });

  const r3 = await prisma.recipe.create({
    data: {
      id: "cuscuz-com-ovo",
      name: "Cuscuz com Ovo",
      tag: "Brunch",
      time: 15,
      difficulty: "Easy",
      cookedCount: 0,
      rating: 0,
      bg: "#FFF8E1",
      accent: "#FFA000",
      servings: 2,
      why: "O café da manhã nordestino mais rápido e satisfatório. Cuscuz fofinho com ovo frito e manteiga derretendo.",
      byId: alex.id,
      sprites: { create: [{ sprite: "Egg" }, { sprite: "Herb" }] },
      nutrition: {
        create: { kcal: 320, protein: 14, carbs: 44, fat: 10, fiber: 3 },
      },
      steps: {
        create: [
          {
            order: 1,
            title: "Preparar o cuscuz",
            desc: "Coloque o cuscuz em um bowl, adicione sal e borrife água aos poucos mexendo com um garfo até ficar úmido e soltinho sem empelotar.",
            mins: 3,
          },
          {
            order: 2,
            title: "Cozinhar no vapor",
            desc: "Coloque o cuscuz na cuscuzeira (ou peneira sobre panela com água fervente). Tampe e cozinhe no vapor por 8 minutos até firmar.",
            mins: 8,
          },
          {
            order: 3,
            title: "Fritar os ovos",
            desc: "Na manteiga em fogo médio, frite os ovos no ponto desejado. Tempere com sal.",
            mins: 4,
          },
          {
            order: 4,
            title: "Servir",
            desc: "Desenforme o cuscuz no prato, coloque uma colherinha de manteiga por cima para derreter. Sirva com os ovos fritos e cheiro verde picado.",
            mins: 1,
          },
        ],
      },
    },
  });

  const r4 = await prisma.recipe.create({
    data: {
      id: "macarrao-molho-branco",
      name: "Macarrão ao Molho Branco",
      tag: "Dinner",
      time: 25,
      difficulty: "Easy",
      cookedCount: 0,
      rating: 0,
      bg: "#F0F4FF",
      accent: "#5B7FFF",
      servings: 2,
      why: "Molho branco cremoso feito na hora com manteiga, leite e queijo. Rápido e reconfortante.",
      byId: yuka.id,
      sprites: {
        create: [{ sprite: "Pasta" }, { sprite: "Milk" }, { sprite: "Cheese" }],
      },
      nutrition: {
        create: { kcal: 560, protein: 18, carbs: 72, fat: 22, fiber: 3 },
      },
      steps: {
        create: [
          {
            order: 1,
            title: "Cozinhar o macarrão",
            desc: "Ferva bastante água com sal. Cozinhe o macarrão al dente conforme o pacote. Escorra e reserve.",
            mins: 10,
          },
          {
            order: 2,
            title: "Fazer o roux",
            desc: "Em panela média, derreta a manteiga e doure o alho picado. Adicione a farinha de trigo e mexa bem por 2 minutos até formar uma pasta lisa e levemente dourada.",
            mins: 4,
          },
          {
            order: 3,
            title: "Incorporar o molho",
            desc: "Adicione o leite aos poucos, mexendo sem parar com um fouet para não empelotar. Quando engrossar, acrescente o creme de leite. Tempere com sal e pimenta do reino.",
            mins: 5,
          },
          {
            order: 4,
            title: "Finalizar",
            desc: "Junte o macarrão ao molho, adicione o queijo ralado e misture bem. Sirva imediatamente com mais queijo por cima.",
            mins: 3,
          },
        ],
      },
    },
  });

  const r5 = await prisma.recipe.create({
    data: {
      id: "macarrao-bolonhesa",
      name: "Macarrão ao Molho Bolonhesa",
      tag: "Dinner",
      time: 40,
      difficulty: "Easy",
      cookedCount: 0,
      rating: 0,
      bg: "#FFE4D9",
      accent: "#E63946",
      servings: 3,
      why: "Carne moída bem refogada com molho de tomate encorpado. O clássico que nunca decepciona.",
      byId: alex.id,
      sprites: {
        create: [
          { sprite: "Pasta" },
          { sprite: "Tomato" },
          { sprite: "Onion" },
        ],
      },
      nutrition: {
        create: { kcal: 580, protein: 32, carbs: 68, fat: 18, fiber: 5 },
      },
      steps: {
        create: [
          {
            order: 1,
            title: "Cozinhar o macarrão",
            desc: "Ferva água com bastante sal. Cozinhe o macarrão al dente. Escorra reservando meia xícara da água.",
            mins: 12,
          },
          {
            order: 2,
            title: "Dourar a carne",
            desc: "Em fogo alto, refogue cebola e alho picados no óleo por 3 minutos. Adicione a carne moída e quebre bem com uma colher até dourar e secar toda a água.",
            mins: 10,
          },
          {
            order: 3,
            title: "Montar o molho",
            desc: "Adicione o tomate picado e o molho de tomate. Tempere com sal e pimenta do reino. Tampe e cozinhe em fogo médio por 15 minutos mexendo de vez em quando.",
            mins: 15,
          },
          {
            order: 4,
            title: "Juntar tudo",
            desc: "Misture o macarrão no molho com um pouco da água do cozimento. Finalize com um fio de azeite. Sirva com queijo ralado.",
            mins: 3,
          },
        ],
      },
    },
  });

  const r6 = await prisma.recipe.create({
    data: {
      id: "pf-completo",
      name: "PF Completo",
      tag: "Weekday",
      time: 50,
      difficulty: "Easy",
      cookedCount: 0,
      rating: 0,
      bg: "#E8F5E9",
      accent: "#4CAF50",
      servings: 2,
      why: "Arroz, feijão, proteína grelhada e salada. O prato do dia a dia brasileiro, feito com carinho.",
      byId: yuka.id,
      sprites: {
        create: [{ sprite: "Rice" }, { sprite: "Chicken" }, { sprite: "Herb" }],
      },
      nutrition: {
        create: { kcal: 520, protein: 34, carbs: 65, fat: 12, fiber: 9 },
      },
      steps: {
        create: [
          {
            order: 1,
            title: "Cozinhar o feijão",
            desc: "Cozinhe o feijão na pressão com água por 20 minutos. Em outra panela, refogue alho e cebola no óleo, adicione o feijão cozido, acerte o sal e deixe apurar 5 minutos.",
            mins: 28,
          },
          {
            order: 2,
            title: "Cozinhar o arroz",
            desc: "Frite 2 dentes de alho amassados no óleo, adicione o arroz e refogue 2 minutos. Coloque água quente (proporção 1:2), sal, tampe e cozinhe em fogo baixo por 18 minutos.",
            mins: 20,
          },
          {
            order: 3,
            title: "Grelhar o frango",
            desc: "Tempere o frango com sal, pimenta e alho amassado. Grelhe na frigideira quente até dourar bem dos dois lados, cerca de 6 minutos de cada lado.",
            mins: 12,
          },
          {
            order: 4,
            title: "Salada simples",
            desc: "Rasgue as folhas de alface, corte o tomate em rodelas. Tempere com sal e um fio de azeite.",
            mins: 3,
          },
          {
            order: 5,
            title: "Montar o prato",
            desc: "Monte com arroz e feijão de um lado, frango grelhado ao centro e a saladinha ao lado. Simples e gostoso.",
            mins: 2,
          },
        ],
      },
    },
  });

  const r7 = await prisma.recipe.create({
    data: {
      id: "strogonoff",
      name: "Strogonoff de Frango",
      tag: "Dinner",
      time: 30,
      difficulty: "Easy",
      cookedCount: 0,
      rating: 0,
      bg: "#FFF0D9",
      accent: "#FF8C42",
      servings: 3,
      why: "Frango em cubinhos num molho cremoso de creme de leite e molho de tomate. Serve com arroz e batata palha.",
      byId: alex.id,
      sprites: {
        create: [{ sprite: "Chicken" }, { sprite: "Milk" }, { sprite: "Rice" }],
      },
      nutrition: {
        create: { kcal: 490, protein: 36, carbs: 30, fat: 24, fiber: 2 },
      },
      steps: {
        create: [
          {
            order: 1,
            title: "Preparar o frango",
            desc: "Corte o frango em cubinhos ou tirinhas. Tempere com sal, pimenta do reino e alho amassado. Deixe marinar 5 minutos.",
            mins: 5,
          },
          {
            order: 2,
            title: "Dourar o frango",
            desc: "Na manteiga quente, refogue a cebola picada por 2 minutos. Adicione o frango e cozinhe em fogo alto mexendo até dourar por todos os lados.",
            mins: 8,
          },
          {
            order: 3,
            title: "Montar o molho",
            desc: "Adicione o molho de tomate e misture bem. Cozinhe por 5 minutos em fogo médio. Desligue o fogo, acrescente o creme de leite e misture delicadamente.",
            mins: 7,
          },
          {
            order: 4,
            title: "Finalizar e servir",
            desc: "Prove e ajuste o sal. Não ferva após adicionar o creme senão talha. Sirva com arroz branco e batata palha por cima.",
            mins: 2,
          },
        ],
      },
    },
  });

  const r8 = await prisma.recipe.create({
    data: {
      id: "batata-recheada",
      name: "Batata Recheada com Calabresa e Bacon",
      tag: "Dinner",
      time: 65,
      difficulty: "Medium",
      cookedCount: 0,
      rating: 0,
      bg: "#FBE9E7",
      accent: "#D84315",
      servings: 2,
      why: "Batata assada recheada com calabresa, bacon crocante, requeijão e queijo gratinado. Jantar especial.",
      byId: yuka.id,
      sprites: { create: [{ sprite: "Cheese" }, { sprite: "Herb" }] },
      nutrition: {
        create: { kcal: 620, protein: 24, carbs: 58, fat: 34, fiber: 5 },
      },
      steps: {
        create: [
          {
            order: 1,
            title: "Assar as batatas",
            desc: "Lave bem as batatas, espete com garfo e embrulhe em papel alumínio. Leve ao forno a 200°C por 45 minutos ou até inserir um garfo e ele entrar sem resistência.",
            mins: 45,
          },
          {
            order: 2,
            title: "Refogar o recheio",
            desc: "Frite o bacon em cubinhos até ficar crocante. Adicione a calabresa em rodelas e a cebola picada. Refogue até tudo dourar bem.",
            mins: 8,
          },
          {
            order: 3,
            title: "Abrir as batatas",
            desc: "Faça um corte em cruz na parte de cima de cada batata. Aperte as laterais com cuidado para abrir. Tempere com sal.",
            mins: 2,
          },
          {
            order: 4,
            title: "Rechear e servir",
            desc: "Coloque uma colher generosa de requeijão, depois o recheio de calabresa e bacon, o queijo ralado por cima e finalize com cheiro verde picado. Sirva imediatamente.",
            mins: 3,
          },
        ],
      },
    },
  });

  const r9 = await prisma.recipe.create({
    data: {
      id: "macarrao-alho-oleo",
      name: "Macarrão Alho e Óleo",
      tag: "Weekday",
      time: 20,
      difficulty: "Easy",
      cookedCount: 0,
      rating: 0,
      bg: "#FFFFF0",
      accent: "#B8860B",
      servings: 2,
      why: "O macarrão mais simples e mais gostoso. Alho dourado no azeite e a água do cozimento fazem toda a diferença.",
      byId: alex.id,
      sprites: { create: [{ sprite: "Pasta" }, { sprite: "Garlic" }] },
      nutrition: {
        create: { kcal: 480, protein: 14, carbs: 72, fat: 16, fiber: 3 },
      },
      steps: {
        create: [
          {
            order: 1,
            title: "Cozinhar o macarrão",
            desc: "Ferva bastante água com sal generoso. Cozinhe o macarrão al dente. Antes de escorrer, guarde 1 xícara da água do cozimento.",
            mins: 12,
          },
          {
            order: 2,
            title: "Dourar o alho",
            desc: "No azeite em fogo médio-baixo, doure o alho fatiado bem devagar até ficar douradinho e levemente crocante. Cuidado para não queimar!",
            mins: 5,
          },
          {
            order: 3,
            title: "Emulsionar o molho",
            desc: "Adicione o macarrão escorrido ao azeite com alho. Jogue 2 colheres da água do cozimento e mexa vigorosamente para criar um molhinho cremoso e sedoso.",
            mins: 2,
          },
          {
            order: 4,
            title: "Finalizar",
            desc: "Ajuste sal e pimenta do reino a gosto. Sirva com queijo ralado por cima. Simples assim.",
            mins: 1,
          },
        ],
      },
    },
  });

  console.log("✓ 9 receitas");

  // ─── Ingredientes das receitas ─────────────────────────────────────────────
  const recipeIngredients = [
    // Arroz com Brócolis e Frango
    { recipeId: r1.id, ingredientId: "arroz", qty: 300, unit: "g" },
    { recipeId: r1.id, ingredientId: "frango", qty: 400, unit: "g" },
    { recipeId: r1.id, ingredientId: "brocolis", qty: 1, unit: "unid" },
    { recipeId: r1.id, ingredientId: "alho", qty: 4, unit: "unid" },
    { recipeId: r1.id, ingredientId: "cebola", qty: 1, unit: "unid" },
    { recipeId: r1.id, ingredientId: "oleo", qty: 30, unit: "ml" },
    { recipeId: r1.id, ingredientId: "sal", qty: 5, unit: "g" },
    { recipeId: r1.id, ingredientId: "pimenta", qty: 2, unit: "g" },
    // Baião de Dois
    { recipeId: r2.id, ingredientId: "arroz", qty: 300, unit: "g" },
    { recipeId: r2.id, ingredientId: "feijao", qty: 300, unit: "g" },
    { recipeId: r2.id, ingredientId: "queijo", qty: 150, unit: "g" },
    { recipeId: r2.id, ingredientId: "calabresa", qty: 200, unit: "g" },
    { recipeId: r2.id, ingredientId: "cebola", qty: 1, unit: "unid" },
    { recipeId: r2.id, ingredientId: "alho", qty: 3, unit: "unid" },
    { recipeId: r2.id, ingredientId: "manteiga", qty: 15, unit: "g" },
    { recipeId: r2.id, ingredientId: "cheiro-verde", qty: 1, unit: "unid" },
    { recipeId: r2.id, ingredientId: "sal", qty: 5, unit: "g" },
    // Cuscuz com Ovo
    { recipeId: r3.id, ingredientId: "cuscuz", qty: 200, unit: "g" },
    { recipeId: r3.id, ingredientId: "ovos", qty: 2, unit: "unid" },
    { recipeId: r3.id, ingredientId: "manteiga", qty: 10, unit: "g" },
    { recipeId: r3.id, ingredientId: "sal", qty: 3, unit: "g" },
    { recipeId: r3.id, ingredientId: "cheiro-verde", qty: 1, unit: "unid" },
    // Macarrão ao Molho Branco
    { recipeId: r4.id, ingredientId: "macarrao", qty: 300, unit: "g" },
    { recipeId: r4.id, ingredientId: "creme-leite", qty: 1, unit: "unid" },
    { recipeId: r4.id, ingredientId: "leite", qty: 200, unit: "ml" },
    { recipeId: r4.id, ingredientId: "manteiga", qty: 30, unit: "g" },
    { recipeId: r4.id, ingredientId: "farinha", qty: 20, unit: "g" },
    { recipeId: r4.id, ingredientId: "queijo", qty: 100, unit: "g" },
    { recipeId: r4.id, ingredientId: "alho", qty: 2, unit: "unid" },
    { recipeId: r4.id, ingredientId: "sal", qty: 5, unit: "g" },
    { recipeId: r4.id, ingredientId: "pimenta", qty: 2, unit: "g" },
    // Macarrão Bolonhesa
    { recipeId: r5.id, ingredientId: "macarrao", qty: 400, unit: "g" },
    { recipeId: r5.id, ingredientId: "carne-moida", qty: 400, unit: "g" },
    { recipeId: r5.id, ingredientId: "molho-tomate", qty: 1, unit: "unid" },
    { recipeId: r5.id, ingredientId: "tomate", qty: 2, unit: "unid" },
    { recipeId: r5.id, ingredientId: "cebola", qty: 1, unit: "unid" },
    { recipeId: r5.id, ingredientId: "alho", qty: 3, unit: "unid" },
    { recipeId: r5.id, ingredientId: "oleo", qty: 30, unit: "ml" },
    { recipeId: r5.id, ingredientId: "sal", qty: 5, unit: "g" },
    { recipeId: r5.id, ingredientId: "pimenta", qty: 2, unit: "g" },
    // PF Completo
    { recipeId: r6.id, ingredientId: "arroz", qty: 300, unit: "g" },
    { recipeId: r6.id, ingredientId: "feijao", qty: 300, unit: "g" },
    { recipeId: r6.id, ingredientId: "frango", qty: 400, unit: "g" },
    { recipeId: r6.id, ingredientId: "alface", qty: 1, unit: "unid" },
    { recipeId: r6.id, ingredientId: "tomate", qty: 1, unit: "unid" },
    { recipeId: r6.id, ingredientId: "alho", qty: 4, unit: "unid" },
    { recipeId: r6.id, ingredientId: "cebola", qty: 1, unit: "unid" },
    { recipeId: r6.id, ingredientId: "oleo", qty: 30, unit: "ml" },
    { recipeId: r6.id, ingredientId: "sal", qty: 5, unit: "g" },
    // Strogonoff
    { recipeId: r7.id, ingredientId: "frango", qty: 500, unit: "g" },
    { recipeId: r7.id, ingredientId: "creme-leite", qty: 1, unit: "unid" },
    { recipeId: r7.id, ingredientId: "molho-tomate", qty: 1, unit: "unid" },
    { recipeId: r7.id, ingredientId: "cebola", qty: 1, unit: "unid" },
    { recipeId: r7.id, ingredientId: "alho", qty: 2, unit: "unid" },
    { recipeId: r7.id, ingredientId: "manteiga", qty: 15, unit: "g" },
    { recipeId: r7.id, ingredientId: "sal", qty: 5, unit: "g" },
    { recipeId: r7.id, ingredientId: "pimenta", qty: 2, unit: "g" },
    { recipeId: r7.id, ingredientId: "arroz", qty: 300, unit: "g" },
    // Batata Recheada
    { recipeId: r8.id, ingredientId: "batata", qty: 2, unit: "unid" },
    { recipeId: r8.id, ingredientId: "calabresa", qty: 200, unit: "g" },
    { recipeId: r8.id, ingredientId: "bacon", qty: 150, unit: "g" },
    { recipeId: r8.id, ingredientId: "requeijao", qty: 1, unit: "unid" },
    { recipeId: r8.id, ingredientId: "queijo", qty: 100, unit: "g" },
    { recipeId: r8.id, ingredientId: "cebola", qty: 1, unit: "unid" },
    { recipeId: r8.id, ingredientId: "sal", qty: 5, unit: "g" },
    { recipeId: r8.id, ingredientId: "cheiro-verde", qty: 1, unit: "unid" },
    // Macarrão Alho e Óleo
    { recipeId: r9.id, ingredientId: "macarrao", qty: 300, unit: "g" },
    { recipeId: r9.id, ingredientId: "alho", qty: 6, unit: "unid" },
    { recipeId: r9.id, ingredientId: "azeite", qty: 60, unit: "ml" },
    { recipeId: r9.id, ingredientId: "queijo", qty: 50, unit: "g" },
    { recipeId: r9.id, ingredientId: "sal", qty: 5, unit: "g" },
    { recipeId: r9.id, ingredientId: "pimenta", qty: 2, unit: "g" },
  ];

  await prisma.recipeIngredient.createMany({ data: recipeIngredients });
  console.log(`✓ ${recipeIngredients.length} ingredientes das receitas`);

  console.log("\n🎉 Banco populado com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
