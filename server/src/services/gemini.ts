/**
 * AI service via Groq — uses the REST API directly via fetch (no extra package needed).
 * Model: llama-3.3-70b-versatile (free tier, ~14.400 req/day via groq.com).
 *
 * Docs: https://console.groq.com/docs/openai
 */

const GROQ_MODEL   = 'llama-3.3-70b-versatile';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GeminiIngredient {
  id:     string;
  name:   string;
  qty:    number;
  unit:   string;
  cat:    string;
  expiry: number;
}

export interface GeminiRecipeCandidate {
  id:          string;
  name:        string;
  tag:         string;
  time:        number;
  difficulty:  string;
  rating:      number;
  servings?:   number;
  ingredients: Array<{ name: string; qty: number; unit: string }>;
}

export interface GeminiSuggestInput {
  pantry:         GeminiIngredient[];
  recipes:        GeminiRecipeCandidate[];
  userPrompt:     string;
  timeLimit:      number;
  tags:           string[];
  useWhatWeHave?: boolean;  // se false, a IA não fica restrita à despensa
}

export interface RecipeSuggestion {
  recipeId: string;
  why:      string;
}

export interface GeminiSuggestOutput {
  suggestions: RecipeSuggestion[];
}

export interface GeneratedStep {
  title: string;
  desc:  string;
  mins:  number;
}

export interface GeneratedIngredient {
  name: string;
  qty:  number;
  unit: string;
}

export interface GeminiGeneratedRecipe {
  name:        string;
  tag:         'Brunch' | 'Lunch' | 'Dinner' | 'Snack' | 'Weekday' | 'AI';
  time:        number;
  difficulty:  'Easy' | 'Medium' | 'Hard';
  servings:    number;
  why:         string;
  bg:          string;
  accent:      string;
  sprites:     string[];
  nutrition:   { kcal: number; protein: number; carbs: number; fat: number; fiber: number };
  ingredients: GeneratedIngredient[];
  steps:       GeneratedStep[];
}

export interface GeminiGenerateOutput {
  recipe: GeminiGeneratedRecipe;
}

// ─── Typed error ─────────────────────────────────────────────────────────────

export class GeminiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'GeminiError';
  }
}

// ─── Core fetch helper ────────────────────────────────────────────────────────

async function callAI(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch(GROQ_API_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model:           GROQ_MODEL,
      temperature:     0.7,
      max_tokens:      2048,
      response_format: { type: 'json_object' },
      messages: [
        {
          role:    'system',
          content: [
            'Você é a Nonna, assistente culinária de um casal brasileiro.',
            'Sua especialidade é culinária brasileira: arroz, feijão, churrasco, moqueca, strogonoff, feijoada, cuscuz nordestino, tapioca, frango assado, macarronada e afins.',
            'Quando a receita for internacional (italiana, japonesa, mexicana, árabe etc.), adapte os temperos e a base ao paladar brasileiro.',
            'REGRA NUTRICIONAL INEGOCIÁVEL: toda receita criada ou melhorada deve ter uma base sólida de carboidratos (arroz, macarrão, batata, mandioca, pão, cuscuz, tapioca, inhame) E proteínas (frango, carne bovina, peixe, camarão, ovos, queijo, feijão, lentilha, grão-de-bico).',
            'Nunca crie receita sem ao menos uma fonte de carbo e uma fonte de proteína.',
            'Responda sempre em JSON válido.',
          ].join(' '),
        },
        {
          role:    'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    const friendly = response.status === 429
      ? 'A Nonna está descansando — limite de requisições atingido. Tente em alguns segundos.'
      : response.status === 401 || response.status === 403
      ? 'Chave do Groq inválida. Verifique o GROQ_API_KEY no .env.'
      : `Groq API error ${response.status}`;
    throw new GeminiError(response.status, friendly + (body ? `\n${body}` : ''));
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Groq returned an empty response');
  return text;
}

// ─── Suggest from existing recipes ───────────────────────────────────────────

export async function suggestRecipes(
  apiKey: string,
  input: GeminiSuggestInput,
): Promise<GeminiSuggestOutput> {
  const expiringItems = input.pantry
    .filter((i) => i.expiry <= 4)
    .map((i) => `${i.name} (${i.expiry}d restantes)`)
    .join(', ') || 'nenhum';

  const pantryNames = input.pantry.map((i) => i.name).join(', ');

  const recipeList = input.recipes
    .map((r) => {
      const ings = r.ingredients.map((i) => i.name).join(', ');
      return `- ID: "${r.id}" | Nome: "${r.name}" | Tempo: ${r.time}min | Tag: ${r.tag} | Ingredientes: ${ings}`;
    })
    .join('\n');

  const prompt = `
Analise o contexto e sugira as melhores receitas em ordem de prioridade.

## Contexto da despensa
Itens disponíveis: ${pantryNames}
Itens vencendo em breve: ${expiringItems}

## Preferências do usuário
Tempo máximo: ${input.timeLimit} minutos
Tags escolhidas: ${input.tags.join(', ') || 'nenhuma'}
Pedido em texto: "${input.userPrompt || 'sem pedido específico'}"

## Receitas candidatas
${recipeList}

## Instrução
Retorne JSON com as receitas mais adequadas (máximo 3), priorizando nesta ordem:
1. Receitas brasileiras ou com forte influência brasileira
2. Receitas com boa base de carboidratos (arroz, macarrão, batata, pão, mandioca) E proteínas (frango, carne, peixe, ovos, feijão)
3. Ingredientes que estão vencendo em breve
4. Aderência às tags e pedido do usuário
5. Tempo dentro do limite

Para cada sugestão, escreva um "why" curto (1-2 frases) em português, específico e útil.

Formato obrigatório:
{"suggestions":[{"recipeId":"<id exato>","why":"<motivo em pt-BR>"}]}
`;

  const raw    = await callAI(apiKey, prompt);
  const parsed = JSON.parse(raw) as GeminiSuggestOutput;

  if (!Array.isArray(parsed.suggestions)) {
    throw new Error('AI returned unexpected shape for suggestions');
  }

  return parsed;
}

// ─── Generate a brand-new recipe ─────────────────────────────────────────────

export async function generateRecipe(
  apiKey: string,
  input: GeminiSuggestInput,
): Promise<GeminiGenerateOutput> {
  const pantryNames    = input.pantry.map((i) => `${i.name} (${i.qty} ${i.unit})`).join(', ');
  const expiringItems  = input.pantry
    .filter((i) => i.expiry <= 4)
    .map((i) => i.name)
    .join(', ') || 'nenhum';

  const hasSpecificRequest = input.userPrompt && input.userPrompt.trim().length > 0;
  const useOnlyPantry      = input.useWhatWeHave !== false; // true por padrão
  const requestBlock = hasSpecificRequest
    ? `## ⭐ OBJETIVO PRINCIPAL — PRIORIDADE MÁXIMA
O casal pediu especificamente: "${input.userPrompt.trim()}"
Crie EXATAMENTE essa receita (ou a variação mais fiel possível ao pedido).
${useOnlyPantry
  ? 'Use ingredientes da despensa quando compatíveis. Se faltarem itens essenciais para o prato pedido (ex: farinha, chocolate, queijo), INCLUA-OS MESMO ASSIM na lista de ingredientes — eles serão marcados como "fora do estoque" para compra futura.'
  : 'Inclua todos os ingredientes necessários para o prato, independentemente do que há na despensa.'
}
NÃO substitua o prato por outro "parecido". Se pediram bolo de chocolate, entregue bolo de chocolate.
`
    : `## Objetivo
${useOnlyPantry ? 'Crie uma receita usando principalmente os ingredientes disponíveis na despensa.' : 'Crie uma receita saborosa para o casal.'} Me surpreenda com algo gostoso dentro das preferências abaixo.
`;

  const prompt = `
${requestBlock}
## Despensa
Disponível: ${pantryNames}
${expiringItems !== 'nenhum' ? `Vencendo em breve (use se compatível): ${expiringItems}` : ''}

## Restrições
Tempo máximo: ${input.timeLimit} minutos
Tags / clima: ${input.tags.filter((t) => t !== 'usepantry').join(', ') || 'nenhuma'}

## Foco culinário${hasSpecificRequest ? ' (secundário ao pedido acima)' : ''}
- Prefira receitas brasileiras ou adaptadas ao paladar brasileiro
- OBRIGATÓRIO: toda receita deve ter ao menos UMA fonte de carboidrato (arroz, macarrão, batata, farinha, pão, mandioca, aveia) E ao menos UMA fonte de proteína (frango, carne, peixe, ovos, queijo, feijão, leite) — EXCETO se o pedido for explicitamente uma sobremesa ou prato sem proteína
- Mínimo 20 g de proteína e 35 g de carboidratos por porção (adapte para sobremesas: foco em carbo, proteína via ovos/leite)

## Regras de unidades — USE APENAS ESTAS, exatamente como escritas
unid · g · ml · kg · L · xícara · col. sopa · col. chá · dente · fatia · ramo

PROIBIDO: "a gosto", "pitada", "pé de", "caixa de", "maço", "porção", "punhado" ou qualquer outra unidade.
Se um ingrediente é usado "a gosto" (sal, pimenta), expresse a quantidade real: "1 col. chá de sal", "0.5 col. chá de pimenta".

## Proporções de referência para EXATAMENTE 2 porções
- Proteína (frango, carne, peixe): 300-400g total
- Arroz cru: 160g (≈ 1 xícara) — rende 2 porções
- Macarrão seco: 180-200g
- Batata: 2 unidades médias
- Legume como acompanhamento (cenoura, brócolis): 150-200g
- Cebola: 1 unidade
- Alho: 2-4 dentes
- Sal: 1 col. chá (no máximo)
- Azeite/óleo: 2 col. sopa
- Manteiga: 1 col. sopa
- Temperos secos: 0.5–1 col. chá cada
- Leite: 200 ml; Creme de leite: 100-200 ml

## Regras gerais
- Use apenas ingredientes da despensa
- Comida simples, prática, sabores brasileiros
- Máximo 6 passos
- TODOS os nomes de ingredientes em português brasileiro
- Todos os títulos e descrições dos passos em português
- Sprites válidos: Tomato, Carrot, Egg, Pepper, Garlic, Bread, Chicken, Fish, Rice, Cheese, Milk, Herb, Onion, Lemon, Pasta
- difficulty deve ser "Easy", "Medium" ou "Hard" (em inglês)

Formato obrigatório:
{"recipe":{"name":"","tag":"Weekday","time":0,"difficulty":"Easy","servings":2,"why":"","bg":"#FFF3CD","accent":"#E8A000","sprites":["Rice"],"nutrition":{"kcal":0,"protein":0,"carbs":0,"fat":0,"fiber":0},"ingredients":[{"name":"","qty":0,"unit":""}],"steps":[{"title":"","desc":"","mins":0}]}}
`;

  const raw    = await callAI(apiKey, prompt);
  const parsed = JSON.parse(raw) as GeminiGenerateOutput;

  if (!parsed.recipe?.name) {
    throw new Error('AI returned unexpected shape for generated recipe');
  }

  return parsed;
}

// ─── Improve full recipe (ingredients + steps) ───────────────────────────────

export interface ImproveRecipePantryItem {
  name: string;
  qty:  number;
  unit: string;
  cat:  string;
}

export interface ImproveRecipeInput {
  recipeName: string;
  pantry:     ImproveRecipePantryItem[];
}

export interface AIRecipeIngredient {
  name: string;
  qty:  number;
  unit: string;
}

export interface AIImprovedRecipe {
  tag:         'Brunch' | 'Lunch' | 'Dinner' | 'Snack' | 'Weekday' | 'AI';
  time:        number;
  difficulty:  'Easy' | 'Medium' | 'Hard';
  servings:    number;
  why:         string;
  ingredients: AIRecipeIngredient[];
  steps:       GeneratedStep[];
}

export interface ImproveRecipeOutput {
  recipe: AIImprovedRecipe;
}

export async function improveRecipe(
  apiKey: string,
  input:  ImproveRecipeInput,
): Promise<ImproveRecipeOutput> {
  const pantryList = input.pantry.length > 0
    ? input.pantry.map((i) => `- ${i.name}: ${i.qty} ${i.unit} (${i.cat})`).join('\n')
    : 'Despensa vazia';

  const prompt = `Você é a Nonna, especialista culinária de um casal brasileiro. Crie uma receita completa para "${input.recipeName}".

## Identidade culinária
- Se a receita for brasileira, mantenha os sabores autênticos (temperos, técnicas, acompanhamentos típicos como arroz e feijão quando couber)
- Se for internacional, adapte ao paladar brasileiro quando possível (ex: acrescente uma base de alho e cebola, use pimentão, adicione acompanhamento de arroz)
- OBRIGATÓRIO: a receita final deve conter ao menos UMA fonte de carboidrato (arroz, macarrão, batata, mandioca, pão, cuscuz, tapioca, inhame, aveia) E ao menos UMA fonte de proteína (frango, carne, peixe, camarão, ovos, queijo, feijão, lentilha, grão-de-bico)

## Despensa disponível
${pantryList}

## Regras de ingredientes
- Priorize ingredientes da despensa acima (use os nomes EXATAMENTE como estão listados)
- Para ingredientes essenciais que NÃO estão na despensa, inclua mesmo assim com o nome em português (serão sinalizados para compra futura)
- Quantidades para EXATAMENTE 2 porções

## Unidades — USE APENAS ESTAS, exatamente como escritas
unid · g · ml · kg · L · xícara · col. sopa · col. chá · dente · fatia · ramo

PROIBIDO: "a gosto", "pitada", "pé de", "caixa de", "maço", "porção" ou qualquer outra unidade.
Se um ingrediente é usado "a gosto" (sal, pimenta), expresse a quantidade real: "1 col. chá de sal", "0.5 col. chá de pimenta".

## Proporções de referência para 2 porções
- Proteína (frango, carne, peixe): 300-400g total
- Arroz cru: 160g (≈ 1 xícara) — rende 2 porções
- Macarrão seco: 180-200g
- Batata: 2 unidades médias
- Legume como acompanhamento: 150-200g
- Cebola: 1 unidade · Alho: 2-4 dentes
- Sal: 1 col. chá · Azeite/óleo: 2 col. sopa
- Manteiga: 1 col. sopa · Temperos secos: 0.5–1 col. chá

## Regras de passos
- Cada passo = EXATAMENTE UMA ação (ex: "Picar a cebola" ≠ "Refogar a cebola" — são dois passos)
- Os passos devem referenciar os ingredientes pelos mesmos nomes usados na lista acima
- Ordem lógica: mise en place → pré-preparo → cozimento → montagem
- Entre 4 e 8 passos; títulos curtos com verbo no infinitivo
- Descrição com dica sensorial (cor, textura, temperatura, sinal de conclusão)
- A SOMA dos mins dos passos deve ser próxima ao campo "time"
- Tom caloroso da Nonna, tudo em português

## Regras gerais
- tag: Brunch, Lunch, Dinner, Snack ou Weekday (em inglês)
- difficulty: Easy, Medium ou Hard (em inglês)
- why: 1 frase afetuosa explicando por que essa receita é especial para o casal

Formato obrigatório (JSON válido):
{"recipe":{"tag":"Weekday","time":30,"difficulty":"Easy","servings":2,"why":"","ingredients":[{"name":"","qty":0,"unit":""}],"steps":[{"title":"","desc":"","mins":0}]}}`;

  const raw    = await callAI(apiKey, prompt);
  const parsed = JSON.parse(raw) as ImproveRecipeOutput;

  if (!parsed.recipe?.ingredients?.length || !parsed.recipe?.steps?.length) {
    throw new Error('AI returned unexpected shape for improved recipe');
  }

  return parsed;
}

// ─── Improve existing steps ───────────────────────────────────────────────────

export interface ImproveStepsInput {
  recipeName:  string;
  steps?:      Array<{ title: string; desc: string; mins: number }>;
  ingredients?: Array<{ name: string; qty: number; unit: string }>;
  tag?:        string;
  time?:       number;
  difficulty?: string;
  servings?:   number;
}

export interface ImproveStepsOutput {
  steps: GeneratedStep[];
}

export async function improveSteps(
  apiKey: string,
  input: ImproveStepsInput,
): Promise<ImproveStepsOutput> {
  const hasSteps   = input.steps && input.steps.length > 0;
  const stepsList  = hasSteps
    ? input.steps!.map((s, i) => `${i + 1}. [${s.title}] (${s.mins}min): ${s.desc}`).join('\n')
    : 'Nenhum passo definido ainda.';

  const ingList = input.ingredients && input.ingredients.length > 0
    ? input.ingredients.map((i) => `${i.qty} ${i.unit} de ${i.name}`).join(', ')
    : 'não especificados';

  const context = [
    input.tag        && `Tipo: ${input.tag}`,
    input.time       && `Tempo total: ${input.time} min`,
    input.difficulty && `Dificuldade: ${input.difficulty}`,
    input.servings   && `Porções: ${input.servings}`,
  ].filter(Boolean).join(' · ');

  const action = hasSteps ? 'Quebre e melhore os passos abaixo' : 'Crie um passo a passo detalhado';

  const prompt = `Você é a Nonna, uma cozinheira experiente. ${action} para a receita "${input.recipeName}".

## Informações da receita
${context || 'Sem informações adicionais'}
Ingredientes: ${ingList}

${hasSteps ? `## Passos atuais\n${stepsList}` : ''}

## Regras OBRIGATÓRIAS de separação de passos
- Cada passo = EXATAMENTE UMA ação física de preparo. Exemplos CORRETOS: "Picar a cebola", "Refogar o alho", "Temperar o frango", "Grelhar o peixe". Exemplos ERRADOS: "Picar a cebola e refogar" (duas ações = proibido).
- Separe SEMPRE: preparar/cortar ingrediente ≠ cozinhar ingrediente ≠ montar/finalizar prato
- Ordem lógica: mise en place → pré-preparo → cozimento base → montagem → finalização
- Entre 4 e 8 passos bem distribuídos

## Regras de conteúdo
- Título: verbo no infinitivo + objeto direto, máximo 4 palavras (ex: "Refogar a cebola", "Cozinhar o macarrão")
- Descrição: 1-3 frases com dica sensorial (cor, textura, cheiro, som), temperatura, ponto de cozimento e quantidade exata usada neste passo
- Indique o sinal visual ou sensorial que indica que o passo está concluído (ex: "até dourar", "até a água ferver", "até ficar macio ao garfo")

## Regras de tempo
- Tempo de cada passo deve ser realista e individual (não repita o mesmo valor para passos diferentes)
- Considere: corte de legume firme ~2-3min, refogar ~3-5min, grelhar proteína ~5-8min, cozinhar massa ~8-12min, ferver água ~5min, descanso ~2-3min
- A SOMA de todos os mins deve ser igual a ${input.time ?? 30} min (±2 min de tolerância)
- Tudo em português brasileiro, tom caloroso e acolhedor da Nonna

Formato obrigatório:
{"steps":[{"title":"","desc":"","mins":0}]}`;

  const raw    = await callAI(apiKey, prompt);
  const parsed = JSON.parse(raw) as ImproveStepsOutput;

  if (!Array.isArray(parsed.steps) || parsed.steps.length === 0) {
    throw new Error('AI returned unexpected shape for improved steps');
  }

  return parsed;
}
